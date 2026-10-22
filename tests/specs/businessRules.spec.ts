import { test } from '../fixtures/businessRule.fixture';
import { middlewareResponseData } from '../utils/middlewareResponseData';

test('validates the provided middleware response', { tag: '@business-rules-1' }, ({ businessRuleValidator }) => {
  const pullRequestData =
    businessRuleValidator.parseMiddlewareResponse(middlewareResponseData);

  businessRuleValidator.validatePullRequestCount(pullRequestData);
  businessRuleValidator.validateHighPriorityPullRequests(pullRequestData);
});
