import { expect, test } from '../fixtures/businessRule.fixture';
import {middlewareResponse,} from '../utils/middlewareResponseData';

test('validates the provided middleware response', ({businessRuleValidator}) => {
  const pullRequestData = businessRuleValidator.validate(middlewareResponse);
  const isHighPriority = pullRequestData.pull_requests.every(
    (pullRequest) =>
      !pullRequest.labels.includes('high-priority') ||
      !pullRequest.meta.is_draft,
  );

  expect(pullRequestData.pull_requests.length,'Expected pull_requests length to match total_open_prs').toBe(pullRequestData.total_open_prs);
  expect(isHighPriority,'Expected every high-priority pull request to be non-draft').toBe(true);

  console.log({
    actualPullRequestCount: pullRequestData.pull_requests.length,
    expectedPullRequestCount: pullRequestData.total_open_prs,
  });
});
