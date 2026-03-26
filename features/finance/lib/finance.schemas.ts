import { z } from 'zod';

const accountTypeSchema = z.enum(['CASH', 'BANK_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'OTHER']);
const categoryTypeSchema = z.enum(['EXPENSE', 'INCOME']);

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

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
