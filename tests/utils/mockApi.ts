import type { APIRequestContext, APIResponse } from '@playwright/test';

interface MockResponse {
  body: unknown;
  headers?: Record<string, string>;
  status?: number;
  statusText?: string;
}

export function createMockApi(
  responses: Record<string, MockResponse>,
): APIRequestContext {
  return {
    get: async (url: string) => {
      const mockResponse = responses[url];

      if (!mockResponse) {
        throw new Error(`No mock response configured for ${url}`);
      }

      const status = mockResponse.status ?? 200;

      return {
        headers: () => mockResponse.headers ?? {},
        json: async () => mockResponse.body,
        ok: () => status >= 200 && status < 300,
        status: () => status,
        statusText: () => mockResponse.statusText ?? 'OK',
      } as APIResponse;
    },
  } as APIRequestContext;
}
