import * as z from 'zod';

export const CounterValidation = z.object({
  increment: z.number().int().min(1).max(100),
});

export type CounterInput = z.infer<typeof CounterValidation>;
