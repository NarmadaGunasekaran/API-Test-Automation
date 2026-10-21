import { expect, test } from '@playwright/test';

import { GitHubPullRequestsPage } from '../pages/githubPullRequests.page';

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

