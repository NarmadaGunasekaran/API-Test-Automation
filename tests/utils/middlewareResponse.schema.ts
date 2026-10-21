import { z } from 'zod';

const middlewarePullRequestSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.object({
    username: z.string(),
    role: z.string(),
  }),
  status: z.literal('OPEN'),
  labels: z.array(z.string()),
  meta: z.object({
    is_draft: z.boolean(),
    review_comments: z.number().int().nonnegative(),
  }),
});

export const middlewareResponseSchema = z.object({
  product_id: z.string(),
  total_open_prs: z.number().int().nonnegative(),
  last_updated: z.iso.datetime(),
  pull_requests: z.array(middlewarePullRequestSchema),
});

export type MiddlewareResponse = z.infer<typeof middlewareResponseSchema>;
