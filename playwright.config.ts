import { defineConfig } from '@playwright/test';

const junitOutputFile =
  process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE ?? 'test-results/junit.xml';
const githubToken = process.env.GITHUB_TOKEN;

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: junitOutputFile }],
  ],
  use: {
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
  },
});
