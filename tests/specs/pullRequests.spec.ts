import { expect, test } from '@playwright/test';

import { GitHubPullRequestsPage } from '../pages/githubPullRequests.page';
import {
  createEmptyPullRequestsApi,
  createFailedPullRequestsApi,
  createInvalidPullRequestsApi,
  createPaginatedPullRequestsApi,
} from '../utils/pullRequestMocks';

test('@live counts every open non-draft pull request', async ({ request }) => {
  await test.step('returns the count from the live GitHub API', async () => {
    const githubPullRequests = new GitHubPullRequestsPage(request);
    const openPullRequestData = await githubPullRequests.fetchAllOpenPullRequests();

    expect(openPullRequestData.pageCount).toBeGreaterThan(0);
    expect(openPullRequestData.allPullRequests).toHaveLength(
      openPullRequestData.countablePullRequests.length +
        openPullRequestData.draftCount,
    );
    expect(
      openPullRequestData.countablePullRequests.every(
        (pullRequest) => !pullRequest.draft,
      ),
    ).toBe(true);

    console.log({
      pagesFetched: openPullRequestData.pageCount,
      totalOpenPullRequests: openPullRequestData.allPullRequests.length,
      draftsExcluded: openPullRequestData.draftCount,
      finalCount: openPullRequestData.countablePullRequests.length,
    });
  });

  await test.step('returns zero when GitHub has no open pull requests', async () => {
    const githubPullRequests = new GitHubPullRequestsPage(
      createEmptyPullRequestsApi(),
    );
    const openPullRequestData = await githubPullRequests.fetchAllOpenPullRequests();

    expect(openPullRequestData.allPullRequests).toHaveLength(0);
    expect(openPullRequestData.countablePullRequests).toHaveLength(0);
    expect(openPullRequestData.draftCount).toBe(0);
  });

  await test.step('does not return a count for an invalid response schema', async () => {
    const githubPullRequests = new GitHubPullRequestsPage(
      createInvalidPullRequestsApi(),
    );

    await expect(githubPullRequests.fetchAllOpenPullRequests()).rejects.toThrow(
      /schema validation failed on page 1.*draft/i,
    );
  });

  await test.step('does not return a count when the GitHub API fails', async () => {
    const githubPullRequests = new GitHubPullRequestsPage(
      createFailedPullRequestsApi(),
    );

    await expect(githubPullRequests.fetchAllOpenPullRequests()).rejects.toThrow(
      'GitHub request failed on page 1: 500 Internal Server Error',
    );
  });
});

test('fetches pull requests from every page', async () => {
  const githubPullRequests = new GitHubPullRequestsPage(
    createPaginatedPullRequestsApi(),
  );

  const openPullRequestData = await githubPullRequests.fetchAllOpenPullRequests();

  expect(openPullRequestData.pageCount).toBe(2);
  expect(openPullRequestData.allPullRequests.map(({ number }) => number)).toEqual([
    1,
    2,
  ]);
  expect(openPullRequestData.countablePullRequests).toHaveLength(2);
});

