import { generateAppleIntelligenceText } from '@/features/ai/lib/apple-intelligence';
import {
  createAccountSchema,
  createPlannedItemSchema,
  createTransactionSchema,
} from '@/features/finance/lib/finance.schemas';
import type {
  Account,
  AccountType,
  Category,
  CategoryType,
  RecurrenceFrequency,
} from '@/features/finance/lib/finance.types';
import { z } from 'zod';

const parsedCommandSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('create_account'),
    name: z.string().min(1),
    balance: z.string().min(1),
    currency: z.string().optional(),
    accountType: z.string().optional(),
    institutionName: z.string().optional(),
  }),
  z.object({
    intent: z.literal('create_transaction'),
    type: z.enum(['EXPENSE', 'INCOME']),
    title: z.string().min(1),
    amount: z.string().min(1),
    currency: z.string().optional(),
    date: z.string().optional(),
    accountName: z.string().optional(),
    categoryName: z.string().optional(),
    notes: z.string().optional(),
  }),
  z.object({
    intent: z.literal('create_planned_item'),
    type: z.enum(['EXPENSE', 'INCOME']),
    title: z.string().min(1),
    amount: z.string().min(1),
    currency: z.string().optional(),
    startDate: z.string().optional(),
    recurrence: z.string().min(1),
    accountName: z.string().optional(),
    categoryName: z.string().optional(),
    notes: z.string().optional(),
  }),
]);

export type ParsedCommand = z.infer<typeof parsedCommandSchema>;

export type ExecutableCommand =
  | {
      kind: 'create_account';
      previewTitle: string;
      previewLines: string[];
      payload: z.input<typeof createAccountSchema>;
    }
  | {
      kind: 'create_transaction';
      previewTitle: string;
      previewLines: string[];
      payload: z.input<typeof createTransactionSchema>;
    }
  | {
      kind: 'create_planned_item';
      previewTitle: string;
      previewLines: string[];
      payload: z.input<typeof createPlannedItemSchema> & { accountId?: string; categoryId?: string };
    };

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function slugify(value: string) {
  return normalizeWhitespace(value).toLowerCase();
}

function inferAccountType(name: string, rawType?: string): AccountType {
  const source = `${name} ${rawType ?? ''}`.toLowerCase();

  if (source.includes('gcash') || source.includes('maya') || source.includes('wallet')) {
    return 'E_WALLET';
  }
  if (source.includes('cash')) {
    return 'CASH';
  }
  if (
    source.includes('credit') ||
    source.includes('visa') ||
    source.includes('mastercard') ||
    source.includes('amex') ||
    source.includes('shopmore')
  ) {
    return 'CREDIT_CARD';
  }
  if (
    source.includes('bank') ||
    source.includes('bdo') ||
    source.includes('bpi') ||
    source.includes('unionbank') ||
    source.includes('metrobank')
  ) {
    return 'BANK_ACCOUNT';
  }

  return 'OTHER';
}

function inferRecurrence(value: string): RecurrenceFrequency | null {
  const source = value.toLowerCase();
  if (source.includes('week')) return 'WEEKLY';
  if (source.includes('quarter')) return 'QUARTERLY';
  if (source.includes('year') || source.includes('annual')) return 'YEARLY';
  if (source.includes('month')) return 'MONTHLY';
  return null;
}

function coerceIsoDate(value?: string, fallback = new Date()) {
  if (!value || value.trim().length === 0) {
    return fallback.toISOString();
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'today') {
    return fallback.toISOString();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return fallback.toISOString();
}

function extractJson(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Penni could not understand that command yet.');
  }

  return candidate.slice(start, end + 1);
}

function findAccountByName(accounts: Account[], name?: string) {
  if (!name) return null;
  const target = slugify(name);

  return (
    accounts.find((account) => slugify(account.name) === target) ??
    accounts.find((account) => slugify(account.name).includes(target) || target.includes(slugify(account.name))) ??
    null
  );
}

function inferCategoryName(title: string, type: CategoryType) {
  const value = title.toLowerCase();

  if (type === 'EXPENSE') {
    if (
      value.includes('lunch') ||
      value.includes('dinner') ||
      value.includes('breakfast') ||
      value.includes('food') ||
      value.includes('grocery')
    ) {
      return 'Food';
    }
    if (
      value.includes('grab') ||
      value.includes('ride') ||
      value.includes('transport') ||
      value.includes('commute')
    ) {
      return 'Transport';
    }
    if (
      value.includes('internet') ||
      value.includes('rent') ||
      value.includes('bill') ||
      value.includes('postpaid') ||
      value.includes('credit card')
    ) {
      return 'Bills';
    }
    if (
      value.includes('shop') ||
      value.includes('shopee') ||
      value.includes('lazada') ||
      value.includes('mall')
    ) {
      return 'Shopping';
    }
  }

  if (type === 'INCOME') {
    if (value.includes('salary') || value.includes('payday')) return 'Salary';
    if (value.includes('allowance')) return 'Allowance';
    if (value.includes('freelance') || value.includes('side hustle')) return 'Leisure';
  }

  return null;
}

function findCategoryByName(categories: Category[], type: CategoryType, name?: string, titleHint?: string) {
  const candidates = categories.filter((category) => category.type === type);
  const target = name ? slugify(name) : inferCategoryName(titleHint ?? '', type)?.toLowerCase();

  if (!target) {
    return null;
  }

  return (
    candidates.find((category) => slugify(category.name) === target) ??
    candidates.find(
      (category) => slugify(category.name).includes(target) || target.includes(slugify(category.name)),
    ) ??
    null
  );
}

export async function parseCommandAssistant(input: {
  command: string;
  accounts: Account[];
  categories: Category[];
}) {
  const accountsText =
    input.accounts.length > 0
      ? input.accounts.map((account) => `${account.name} [${account.type}]`).join(', ')
      : 'none';
  const categoriesText =
    input.categories.length > 0
      ? input.categories.map((category) => `${category.name} [${category.type}]`).join(', ')
      : 'none';

  const prompt = `
You are Penni's command parser.
Convert the user's finance command into exactly one JSON object and nothing else.

Supported intents:
- create_account
- create_transaction
- create_planned_item

Available accounts: ${accountsText}
Available categories: ${categoriesText}

Rules:
- Choose the single best matching intent.
- Use "EXPENSE" or "INCOME" for transaction/planned item types.
- Use ISO-like date strings when possible.
- For create_planned_item, recurrence must reflect the user's wording like weekly, monthly, quarterly, yearly.
- Prefer concise titles.
- If something is missing, still return your best guess with partial fields.
- No markdown. No explanation. JSON only.

Examples:
{"intent":"create_account","name":"GCash","balance":"2222","currency":"PHP","accountType":"E_WALLET"}
{"intent":"create_transaction","type":"EXPENSE","title":"Lunch","amount":"500","currency":"PHP","date":"today","accountName":"GCash","categoryName":"Food"}
{"intent":"create_planned_item","type":"EXPENSE","title":"Internet bill","amount":"1699","currency":"PHP","startDate":"2026-03-28","recurrence":"MONTHLY"}

User command:
${input.command}
`.trim();

  const raw = await generateAppleIntelligenceText(prompt);
  const json = extractJson(raw);
  const parsed = parsedCommandSchema.parse(JSON.parse(json));
  return parsed;
}

export function buildExecutableCommand(parsed: ParsedCommand, context: { accounts: Account[]; categories: Category[] }) {
  if (parsed.intent === 'create_account') {
    const payload = {
      name: normalizeWhitespace(parsed.name),
      balance: parsed.balance,
      currency: (parsed.currency ?? 'PHP').toUpperCase(),
      type: inferAccountType(parsed.name, parsed.accountType),
      institutionName: parsed.institutionName ? normalizeWhitespace(parsed.institutionName) : undefined,
    };

    const validated = createAccountSchema.safeParse(payload);
    if (!validated.success) {
      throw new Error(validated.error.issues[0]?.message ?? 'Unable to create account from that command.');
    }

    return {
      kind: 'create_account',
      previewTitle: 'Create account',
      previewLines: [
        validated.data.name,
        `${validated.data.type.replaceAll('_', ' ')} · ${validated.data.currency}`,
        `Starting balance ${validated.data.balance}`,
      ],
      payload: validated.data,
    } satisfies ExecutableCommand;
  }

  if (parsed.intent === 'create_transaction') {
    const account = findAccountByName(context.accounts, parsed.accountName);
    if (!account) {
      throw new Error('Penni could not match the account from that command.');
    }

    const category = findCategoryByName(context.categories, parsed.type, parsed.categoryName, parsed.title);
    if (!category) {
      throw new Error('Penni could not match a category for that transaction yet.');
    }

    const payload = {
      accountId: account.id,
      categoryId: category.id,
      type: parsed.type,
      title: normalizeWhitespace(parsed.title),
      notes: parsed.notes ? normalizeWhitespace(parsed.notes) : undefined,
      amount: parsed.amount,
      currency: (parsed.currency ?? account.currency ?? 'PHP').toUpperCase(),
      transactionAt: coerceIsoDate(parsed.date),
    };

    const validated = createTransactionSchema.safeParse(payload);
    if (!validated.success) {
      throw new Error(validated.error.issues[0]?.message ?? 'Unable to create transaction from that command.');
    }

    return {
      kind: 'create_transaction',
      previewTitle: parsed.type === 'EXPENSE' ? 'Create expense' : 'Create income',
      previewLines: [
        `${validated.data.title} · ${validated.data.amount} ${validated.data.currency}`,
        `Account: ${account.name}`,
        `Category: ${category.name}`,
      ],
      payload: validated.data,
    } satisfies ExecutableCommand;
  }

  const recurrence = inferRecurrence(parsed.recurrence);
  if (!recurrence) {
    throw new Error('Penni could not understand the recurrence for that planned item.');
  }

  const account = findAccountByName(context.accounts, parsed.accountName);
  const category = findCategoryByName(context.categories, parsed.type, parsed.categoryName, parsed.title);

  const payload = {
    accountId: account?.id,
    categoryId: category?.id,
    type: parsed.type,
    title: normalizeWhitespace(parsed.title),
    notes: parsed.notes ? normalizeWhitespace(parsed.notes) : undefined,
    amount: parsed.amount,
    currency: (parsed.currency ?? account?.currency ?? 'PHP').toUpperCase(),
    startDate: coerceIsoDate(parsed.startDate),
    recurrence,
  };

  const validated = createPlannedItemSchema.safeParse(payload);
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message ?? 'Unable to create planned item from that command.');
  }

  return {
    kind: 'create_planned_item',
    previewTitle: parsed.type === 'EXPENSE' ? 'Create recurring expense' : 'Create recurring income',
    previewLines: [
      `${validated.data.title} · ${validated.data.amount} ${validated.data.currency}`,
      `Repeats ${validated.data.recurrence.toLowerCase()}`,
      account ? `Account: ${account.name}` : 'Account: optional',
    ],
    payload: {
      ...validated.data,
      accountId: account?.id,
      categoryId: category?.id,
    },
  } satisfies ExecutableCommand;
}
