import {
  middlewareResponseSchema,
  type MiddlewareResponse,
} from '../utils/middlewareResponse.schema';

export class BusinessRuleValidatorPage {
  parseMiddlewareResponse(response: unknown): MiddlewareResponse {
    return middlewareResponseSchema.parse(response);
  }

  validatePullRequestCount(pullRequestData: MiddlewareResponse): void {
    const expectedCount = pullRequestData.total_open_prs;
    const actualCount = pullRequestData.pull_requests.length;

    if (actualCount !== expectedCount) {
      throw new Error(
        `Pull request count mismatch: expected ${expectedCount}, received ${actualCount}`,
      );
    }
  }

  validateHighPriorityPullRequests(
    pullRequestData: MiddlewareResponse,
  ): void {
    const invalidPullRequest = pullRequestData.pull_requests.find(
      (pullRequest) =>
        pullRequest.labels.includes('high-priority') && pullRequest.meta.is_draft,
    );

    if (invalidPullRequest) {
      throw new Error(
        `High-priority pull request ${invalidPullRequest.id} must not be marked as draft`,
      );
    }
  }
}
