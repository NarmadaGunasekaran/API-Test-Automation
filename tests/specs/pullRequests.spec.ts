import { expect, test } from '@playwright/test';

import { GitHubPullRequestsPage } from '../pages/githubPullRequests.page';


test('verify open non-draft pull request count', { tag: '@live' }, async ({ request }) => {
  const githubPullRequests = new GitHubPullRequestsPage(request);
  const openPullRequestData = await githubPullRequests.fetchAllOpenPullRequests();
  const pageCount = githubPullRequests.getPageCount(openPullRequestData);
  const allOpenPullRequestCount =githubPullRequests.getAllOpenPullRequestCount(openPullRequestData);
  const draftPullRequestCount = githubPullRequests.getDraftPullRequestCount(openPullRequestData);
  const nonDraftPullRequests = githubPullRequests.getNonDraftPullRequests(openPullRequestData);
  const nonDraftPullRequestCount =  githubPullRequests.getNonDraftPullRequestCount(openPullRequestData);
  const isEveryPullRequestNonDraft = nonDraftPullRequests.every( (pullRequest) => !pullRequest.draft,);

  expect(pageCount,'Expected GitHub pagination to fetch at least one page').toBeGreaterThan(0);
  expect(allOpenPullRequestCount,'Expected the total open PR count to equal draft and non-draft PR counts',).toBe(nonDraftPullRequestCount + draftPullRequestCount);
  expect(isEveryPullRequestNonDraft,'Expected the final pull request list to exclude every draft PR',).toBe(true);

  console.log({
    pagesFetched: pageCount,
    totalOpenPullRequests: allOpenPullRequestCount,
    draftsExcluded: draftPullRequestCount,
    finalCount: nonDraftPullRequestCount,
  });
});

