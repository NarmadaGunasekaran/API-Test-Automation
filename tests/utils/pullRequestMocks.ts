import { createMockApi } from './mockApi';

const firstPageUrl = '/repos/appwrite/appwrite/pulls?state=open&per_page=100';
const secondPageUrl =
  'https://api.github.com/repos/appwrite/appwrite/pulls?state=open&per_page=100&page=2';

function pullRequest(number: number) {
  return {
    id: number,
    number,
    title: `Pull request ${number}`,
    state: 'open',
    draft: false,
    html_url: `https://github.com/appwrite/appwrite/pull/${number}`,
    user: {
      login: `user-${number}`,
    },
  };
}

export function createPaginatedPullRequestsApi() {
  return createMockApi({
    [firstPageUrl]: {
      body: [pullRequest(1)],
      headers: {
        link: `<${secondPageUrl}>; rel="next"`,
      },
    },
    [secondPageUrl]: {
      body: [pullRequest(2)],
    },
  });
}
