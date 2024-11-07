import { getCookies } from '$std/http/cookie.ts';

function wrappedFetch(url: RequestInfo | URL, options: RequestInit = {}) {
  const auth = localStorage.getItem('auth');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${auth}`);
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Authenticated fetch
 * @param req The user request object to get cookies from
 *
 * @returns A wrapped fetch function that adds the auth token to the request headers
 */
export function authenticatedFetch(
  req: Request,
): (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
) => Promise<Response>;

/**
 * Authenticated fetch
 * @param url The url to fetch
 * @param options The options to pass to the fetch function
 * @returns The response from the fetch function
 */
export function authenticatedFetch(
  url: RequestInfo | URL,
  options: RequestInit,
): Promise<Response>;

export function authenticatedFetch(
  req: Request | RequestInfo | URL,
  options: RequestInit = {},
) {
  if (req instanceof Request) {
    const cookies = getCookies(req.headers);
    return (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${cookies.auth}`);

      if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
          headers.set(key, value);
        }
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };
  }

  return wrappedFetch(req, options);
}
