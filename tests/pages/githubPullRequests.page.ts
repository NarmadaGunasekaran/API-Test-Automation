import type { APIRequestContext, APIResponse } from '@playwright/test';

import { OPEN_PULL_REQUESTS_URL } from '../utils/githubApi.constants';
import { getNextPageUrl } from '../utils/linkHeader';
import {pullRequestPageSchema,type PullRequest,} from '../utils/pullRequest.schema';

export interface PullRequestFetchResult {
  pullRequests: PullRequest[];
  pageCount: number;
}

interface PullRequestPage {
  pullRequests: PullRequest[];
  nextPageUrl: string | null;
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

      const page = await this.fetchPullRequestPage(nextPageUrl, pageCount);

      pullRequests.push(...page.pullRequests);
      nextPageUrl = page.nextPageUrl;
    }

    return {
      pullRequests,
      pageCount,
    };
  }

  private async fetchPullRequestPage(
    pageUrl: string,
    pageNumber: number,
  ): Promise<PullRequestPage> {
    const response = await this.request.get(pageUrl);

    this.validateResponseStatus(response, pageNumber);

    const responseBody: unknown = await response.json();
    const pullRequests = this.validateResponseSchema(responseBody, pageNumber);

    return {
      pullRequests,
      nextPageUrl: getNextPageUrl(response.headers().link),
    };
  }

  private validateResponseStatus(
    response: APIResponse,
    pageNumber: number,): void {
    if (!response.ok()) {
      throw new Error(
        `GitHub request failed on page ${pageNumber}: ${response.status()} ${response.statusText()}`,
      );
    }
  }

  private validateResponseSchema(
    responseBody: unknown,
    pageNumber: number,): PullRequest[] {
    const validation = pullRequestPageSchema.safeParse(responseBody);

    if (validation.success) {
      return validation.data;
    }

    const issues = validation.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(
      `GitHub response schema validation failed on page ${pageNumber}: ${issues}`,
    );
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
