import { z } from 'zod';

const accountTypeSchema = z.enum(['CASH', 'BANK_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'OTHER']);
const categoryTypeSchema = z.enum(['EXPENSE', 'INCOME']);
const recurrenceFrequencySchema = z.enum(['WEEKLY', 'MONTHLY', 'SEMI_MONTHLY', 'QUARTERLY', 'YEARLY']);

export const createAccountSchema = z
  .object({
    name: z.string().trim().min(1, 'Account name is required.').max(120),
    balance: z
      .string()
      .trim()
      .regex(/^-?\d+(\.\d{1,2})?$/, 'Use a valid amount like 1200 or 1200.50.')
      .or(z.literal('')),
    type: accountTypeSchema,
    currency: z.string().trim().length(3, 'Use a 3-letter currency code.'),
    institutionName: z.string().trim().max(120).optional(),
    creditLimit: z
      .string()
      .trim()
      .regex(/^-?\d+(\.\d{1,2})?$/, 'Use a valid amount like 1200 or 1200.50.')
      .optional()
      .or(z.literal('')),
    availableCredit: z
      .string()
      .trim()
      .regex(/^-?\d+(\.\d{1,2})?$/, 'Use a valid amount like 1200 or 1200.50.')
      .optional()
      .or(z.literal('')),
    dueDayOfMonth: z
      .string()
      .trim()
      .regex(/^(?:[1-9]|[12]\d|3[01])$/, 'Use a day between 1 and 31.')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.type !== 'CREDIT_CARD') {
      if (!value.balance.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['balance'],
          message: 'Starting balance is required.',
        });
      }
      return;
    }

    if (!value.creditLimit?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['creditLimit'],
        message: 'Credit limit is required for credit cards.',
      });
    }

    if (!value.availableCredit?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['availableCredit'],
        message: 'Available credit is required for credit cards.',
      });
    }

    if (!value.dueDayOfMonth?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDayOfMonth'],
        message: 'Due day is required for credit cards.',
      });
    }

    if (value.creditLimit?.trim() && value.availableCredit?.trim()) {
      const creditLimit = Number(value.creditLimit);
      const availableCredit = Number(value.availableCredit);

      if (availableCredit > creditLimit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['availableCredit'],
          message: 'Available credit cannot be higher than the total limit.',
        });
      }
    }
  });

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required.').max(80),
  type: categoryTypeSchema,
  colorHex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Choose a valid color.')
    .optional(),
});

export const createTransactionSchema = z.object({
  accountId: z.string().trim().min(1, 'Choose an account.'),
  categoryId: z.string().trim().min(1, 'Choose a category.'),
  type: categoryTypeSchema,
  title: z.string().trim().min(1, 'Add a title or note.').max(160),
  notes: z.string().trim().max(2000).optional(),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required.')
    .regex(/^-?\d+(\.\d{1,2})?$/, 'Use a valid amount like 1200 or 1200.50.'),
  currency: z.string().trim().length(3, 'Use a 3-letter currency code.'),
  transactionAt: z.string().datetime(),
});

export const createPlannedItemSchema = z
  .object({
    accountId: z.string().trim().optional(),
    type: categoryTypeSchema,
    title: z.string().trim().min(1, 'Name is required.').max(160),
    notes: z.string().trim().max(2000).optional(),
    amount: z
      .string()
      .trim()
      .min(1, 'Amount is required.')
      .regex(/^-?\d+(\.\d{1,2})?$/, 'Use a valid amount like 1200 or 1200.50.'),
    currency: z.string().trim().length(3, 'Use a 3-letter currency code.'),
    startDate: z.string().datetime(),
    recurrence: recurrenceFrequencySchema,
    semiMonthlyDays: z.array(z.number().int().min(1).max(31)).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.recurrence !== 'SEMI_MONTHLY') {
      return;
    }

    if (!value.semiMonthlyDays || value.semiMonthlyDays.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['semiMonthlyDays'],
        message: 'Choose two payout days for a semi-monthly item.',
      });
      return;
    }

    if (new Set(value.semiMonthlyDays).size !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['semiMonthlyDays'],
        message: 'The two payout days need to be different.',
      });
    }

    if (value.type === 'INCOME' && !value.accountId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['accountId'],
        message: 'Choose which account this income should land in.',
      });
    }
  });

export const createBudgetSchema = z.object({
  name: z.string().trim().min(1, 'Budget name is required.').max(120),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required.')
    .regex(/^\d+(\.\d{1,2})?$/, 'Use a valid amount like 5000 or 5000.00.'),
  currency: z.string().trim().length(3, 'Use a 3-letter currency code.'),
  alertThreshold: z.number().int().min(1).max(100),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  categoryId: z.string().trim().optional(),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
export type CreatePlannedItemFormValues = z.infer<typeof createPlannedItemSchema>;
export type CreateBudgetFormValues = z.infer<typeof createBudgetSchema>;
