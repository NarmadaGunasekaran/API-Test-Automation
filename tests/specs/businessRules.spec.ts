import { expect, test } from '@playwright/test';

import { PullRequestValidatorPage } from '../pages/pullRequestValidator.page';
import {
  countMismatchResponse,
  highPriorityDraftResponse,
  middlewareResponse,
} from '../utils/middlewareResponseData';

const validator = new PullRequestValidatorPage();

test('validates the middleware pull request response', () => {
  const pullRequestData = validator.validate(middlewareResponse);

  expect(pullRequestData.pull_requests).toHaveLength(
    pullRequestData.total_open_prs,
  );
  expect(
    pullRequestData.pull_requests.every(
      (pullRequest) =>
        !pullRequest.labels.includes('high-priority') ||
        !pullRequest.meta.is_draft,
    ),
  ).toBe(true);
});

test('validate reports a pull request count mismatch', () => {
  expect(() => validator.validate(countMismatchResponse)).toThrow(
    'Pull request count mismatch: expected 2, received 1',
  );
});

test('validate reports a high-priority draft pull request', () => {
  expect(() => validator.validate(highPriorityDraftResponse)).toThrow(
    'High-priority pull request 1024 must not be marked as draft',
  );
});
