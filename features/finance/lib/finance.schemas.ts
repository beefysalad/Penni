import { z } from 'zod';

const accountTypeSchema = z.enum(['CASH', 'BANK_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'OTHER']);
const categoryTypeSchema = z.enum(['EXPENSE', 'INCOME']);
const recurrenceFrequencySchema = z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']);

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required.').max(120),
  balance: z
    .string()
    .trim()
    .min(1, 'Starting balance is required.')
    .regex(/^-?\d+(\.\d{1,2})?$/, 'Use a valid amount like 1200 or 1200.50.'),
  type: accountTypeSchema,
  currency: z.string().trim().length(3, 'Use a 3-letter currency code.'),
  institutionName: z.string().trim().max(120).optional(),
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

export const createPlannedItemSchema = z.object({
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
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
export type CreatePlannedItemFormValues = z.infer<typeof createPlannedItemSchema>;
