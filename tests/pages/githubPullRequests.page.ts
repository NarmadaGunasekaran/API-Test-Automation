import type { APIRequestContext } from '@playwright/test';

import { getNextPageUrl } from '../utils/linkHeader';
import {
  pullRequestPageSchema,
  type PullRequest,
} from '../utils/pullRequest.schema';

const firstPageUrl =
  '/repos/appwrite/appwrite/pulls?state=open&per_page=100';

export interface PullRequestResult {
  allPullRequests: PullRequest[];
  countablePullRequests: PullRequest[];
  draftCount: number;
  pageCount: number;
}

export class GitHubPullRequestsPage {
  constructor(private readonly request: APIRequestContext) {}

  async fetchAllOpenPullRequests(): Promise<PullRequestResult> {
    const pullRequests: PullRequest[] = [];
    const visitedUrls = new Set<string>();
    let nextUrl: string | undefined = firstPageUrl;
    let pageCount = 0;

    while (nextUrl) {
      if (visitedUrls.has(nextUrl)) {
        throw new Error(`Pagination loop detected at ${nextUrl}`);
      }

      visitedUrls.add(nextUrl);
      pageCount += 1;

      const response = await this.request.get(nextUrl);

      if (!response.ok()) {
        throw new Error(
          `GitHub request failed on page ${pageCount}: ${response.status()} ${response.statusText()}`,
        );
      }

      const responseBody: unknown = await response.json();
      const validation = pullRequestPageSchema.safeParse(responseBody);

      if (!validation.success) {
        const issues = validation.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ');

        throw new Error(
          `GitHub response schema validation failed on page ${pageCount}: ${issues}`,
        );
      }

      pullRequests.push(...validation.data);
      nextUrl = getNextPageUrl(response.headers().link);
    }

    const countablePullRequests = pullRequests.filter(
      (pullRequest) => !pullRequest.draft,
    );

    return {
      allPullRequests: pullRequests,
      countablePullRequests,
      draftCount: pullRequests.length - countablePullRequests.length,
      pageCount,
    };
  }
}
