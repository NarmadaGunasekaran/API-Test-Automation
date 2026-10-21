# Pull Request API Test Automation

This is a small Playwright and TypeScript suite for checking pull request data. It covers a live GitHub endpoint and a fixed middleware response with product-specific rules. The tests use Playwright's API client only, so no browser installation is needed.

## What is covered

The live check reads open pull requests from `appwrite/appwrite`, follows every page, validates each response, and leaves drafts out of the final count. Separate controlled tests check the expected behavior for an empty response, an invalid response body, and an API error without depending on GitHub.

The middleware checks cover two rules:

- `total_open_prs` must match the number of entries in `pull_requests`.
- A pull request labelled `high-priority` must not be a draft.

There are negative examples for both middleware rules so the failure messages can be checked as well as the passing payload.

## Project layout

```text
tests/
├── pages/    API calls, pagination and business-rule functions
├── specs/    Playwright tests and assertions
└── utils/    Zod schemas, test data and mock API responses
```

Keeping the request code outside the specs makes the rules easier to reuse for another repository or payload. Zod handles runtime response validation; TypeScript alone cannot verify data returned over HTTP.

## Setup

Use Node.js 22 or later.

```bash
npm ci
```

The GitHub repository is public, so a token is optional for local runs. Supplying one gives a higher API rate limit:

```bash
export GITHUB_TOKEN=your_token
```

The token is passed through an authorization header and is not written to test output.

## Running the checks

```bash
npm test                    # complete suite
npm run test:deterministic # controlled tests only
npm run test:live          # live GitHub check only
npm run typecheck          # TypeScript validation
npm run lint               # ESLint static checks
```

After a test run, the HTML report can be opened with:

```bash
npm run test:report
```

## Pagination

The GitHub request asks for 100 items per page. Pagination follows the URL marked `rel="next"` in GitHub's `Link` response header and stops when that relation is absent. It does not predict page numbers from the number of returned items. Previously visited URLs are tracked so an unexpected pagination loop fails with a clear message instead of hanging the run.

A controlled two-page response tests this behavior without relying on the current number of open Appwrite pull requests.

## Validation and failures

Every GitHub page is validated before its entries are added to the result. The schema includes the fields used for filtering and diagnostics and requires the PR state to be `open`. Additional fields returned by GitHub are allowed because they are outside the rules being tested.

An empty array is a valid response and produces a count of zero. A non-successful HTTP response or invalid schema fails the test before a count is reported. Errors include the page number and, for HTTP failures, the response status.

The middleware payload is schema-validated before its business rules run. Count mismatches and high-priority drafts have separate messages that identify the failed rule and relevant values.

## CI

The GitHub Actions workflow runs on pushes and pull requests and can also be started manually. Deterministic tests run first; the live GitHub check has its own job and uses the workflow token. Both jobs keep the Playwright HTML and JUnit reports as artifacts.

The `Jenkinsfile` runs the same install, type-check, lint and test commands. Jenkins publishes the JUnit files and archives the HTML report. Its agent must provide Node.js 22 and npm. A `GITHUB_TOKEN` environment variable is optional but recommended for the live stage.

## Assumptions and limitations

- The live total is not hard-coded because pull requests can be opened, closed or converted to drafts at any time.
- A GitHub outage, rate-limit response or unexpected contract change is treated as a failed monitoring check rather than retried or ignored.
- The supplied middleware payload is local test data; no middleware endpoint was provided.
- The schemas validate the fields needed by these rules rather than attempting to reproduce GitHub's entire API schema.
