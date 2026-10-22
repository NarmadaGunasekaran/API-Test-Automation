const noNextPage = null;

export function getNextPageUrl(linkHeader?: string): string | null {
  if (!linkHeader) {
    return noNextPage;
  }

  for (const link of linkHeader.split(',')) {
    const [urlPart, ...parameters] = link.split(';');
    const isNextPage = parameters.some(
      (parameter) => parameter.trim() === 'rel="next"',
    );

    if (isNextPage) {
      const match = urlPart.trim().match(/^<(.+)>$/);
      return match?.[1] ?? noNextPage;
    }
  }

  return noNextPage;
}
