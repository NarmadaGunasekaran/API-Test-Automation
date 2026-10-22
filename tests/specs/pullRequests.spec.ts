import { expect, test } from '@playwright/test';

import { GitHubPullRequestsPage } from '../pages/githubPullRequests.page';


test('verify open non-draft pull request count', { tag: '@live' }, async ({ request }) => {
  const githubPullRequests = new GitHubPullRequestsPage(request);
  const openPullRequestData = await githubPullRequests.fetchAllOpenPullRequests();
  const pageCount = githubPullRequests.getPageCount(openPullRequestData);
  const allOpenPullRequestCount =githubPullRequests.getAllOpenPullRequestCount(openPullRequestData);
  const draftPullRequestCount = githubPullRequests.getDraftPullRequestCount(openPullRequestData);
  const nonDraftPullRequestCount =  githubPullRequests.getNonDraftPullRequestCount(openPullRequestData);
  

  expect(pageCount,'Expected GitHub pagination to fetch at least one page').toBeGreaterThan(0);
  expect(allOpenPullRequestCount,'Expected the total open PR count to equal draft and non-draft PR counts',).toBe(nonDraftPullRequestCount + draftPullRequestCount);

  console.log({
    pagesFetched: pageCount,
    totalOpenPullRequests: allOpenPullRequestCount,
    draftsExcluded: draftPullRequestCount,
    finalCount: nonDraftPullRequestCount,
  });
});

