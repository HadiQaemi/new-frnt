import { z } from 'zod';

export const StatementDTO = z.object({
  id: z.string(),
  label: z.string(),
  created_at: z.string(),
  classes: z.array(z.string()),
  shared: z.boolean()
});

export const ORKGResponseDTO = z.object({
  content: z.array(StatementDTO),
  totalElements: z.number(),
  totalPages: z.number(),
  page: z.number(),
  per_page: z.number()
});