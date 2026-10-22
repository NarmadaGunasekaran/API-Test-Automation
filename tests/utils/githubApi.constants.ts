const GITHUB_REPOSITORY = 'appwrite/appwrite';
const PULL_REQUESTS_PER_PAGE = 100;

export const OPEN_PULL_REQUESTS_URL =
  `/repos/${GITHUB_REPOSITORY}/pulls` +
  `?state=open&per_page=${PULL_REQUESTS_PER_PAGE}`;
