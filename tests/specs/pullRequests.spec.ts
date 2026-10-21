import { expect, test } from '@playwright/test';

import { GitHubPullRequestsPage } from '../pages/githubPullRequests.page';
import { createPaginatedPullRequestsApi } from '../utils/pullRequestMocks';

test('counts every open non-draft pull request', async ({ request }) => {
  const githubPullRequests = new GitHubPullRequestsPage(request);
  const openPullRequestData = await githubPullRequests.fetchAllOpenPullRequests();

  expect(openPullRequestData.pageCount).toBeGreaterThan(0);
  expect(openPullRequestData.allPullRequests).toHaveLength(
    openPullRequestData.countablePullRequests.length + openPullRequestData.draftCount,
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

