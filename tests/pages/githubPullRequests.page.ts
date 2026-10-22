import type { APIRequestContext, APIResponse } from '@playwright/test';

import { OPEN_PULL_REQUESTS_URL } from '../utils/githubApi.constants';
import { getNextPageUrl } from '../utils/linkHeader';
import {
  pullRequestPageSchema,
  type PullRequest,
} from '../utils/pullRequest.schema';

export interface PullRequestFetchResult {
  pullRequests: PullRequest[];
  pageCount: number;
}

export class GitHubPullRequestsPage {
  constructor(private readonly request: APIRequestContext) {}

  async fetchAllOpenPullRequests(): Promise<PullRequestFetchResult> {
    const pullRequests: PullRequest[] = [];
    const visitedUrls = new Set<string>();

    let nextPageUrl: string | null = OPEN_PULL_REQUESTS_URL;
    let pageCount = 0;

    while (nextPageUrl) {
      this.checkForPaginationLoop(nextPageUrl, visitedUrls);
      pageCount += 1;

      const response = await this.request.get(nextPageUrl);
      this.validateResponseStatus(response);
      const responseBody: unknown = await response.json();
      const pullRequest = this.validateResponseSchema(responseBody);
      pullRequests.push(...pullRequest);
      nextPageUrl = getNextPageUrl(response.headers().link);
    }

    return {
      pullRequests,
      pageCount,
    };
  }


  private validateResponseStatus(
    response: APIResponse,
  ): void {
    if (!response.ok()) {
      throw new Error(
        `GitHub request failed with response status: ${response.status()} ${response.statusText()}`,
      );
    }
  }

  private validateResponseSchema(
    responseBody: unknown,
  ): PullRequest[] {
    const validation = pullRequestPageSchema.safeParse(responseBody);

    if (!validation.success) {
      throw new Error(
        `GitHub response schema validation failed: ${validation.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
      );
    }

    return validation.data;
  }

  private checkForPaginationLoop(
    pageUrl: string,
    visitedUrls: Set<string>,
  ): void {
    if (visitedUrls.has(pageUrl)) {
      throw new Error(`Pagination loop detected at ${pageUrl}`);
    }

    visitedUrls.add(pageUrl);
  }

  getPageCount(pullRequestData: PullRequestFetchResult): number {
    return pullRequestData.pageCount;
  }

  getAllOpenPullRequestCount(
    pullRequestData: PullRequestFetchResult,
  ): number {
    return pullRequestData.pullRequests.length;
  }

  getDraftPullRequestCount(pullRequestData: PullRequestFetchResult): number {
    return pullRequestData.pullRequests.filter(
      (pullRequest) => pullRequest.draft,
    ).length;
  }

  getNonDraftPullRequests(
    pullRequestData: PullRequestFetchResult,
  ): PullRequest[] {
    return pullRequestData.pullRequests.filter(
      (pullRequest) => !pullRequest.draft,
    );
  }

  getNonDraftPullRequestCount(
    pullRequestData: PullRequestFetchResult,
  ): number {
    return this.getNonDraftPullRequests(pullRequestData).length;
  }
}
