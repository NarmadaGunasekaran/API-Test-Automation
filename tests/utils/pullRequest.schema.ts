import { z } from 'zod';

const pullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.literal('open'),
  draft: z.boolean(),
  html_url: z.url(),
  user: z.object({
    login: z.string(),
  }),
});

export const pullRequestPageSchema = z.array(pullRequestSchema);

export type PullRequest = z.infer<typeof pullRequestSchema>;
