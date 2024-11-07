import { FreshContext } from '$fresh/server.ts';
import { getCookies, setCookie } from '$std/http/cookie.ts';
import { decode } from '@zaubrik/djwt';
import { authenticatedFetch } from '../helpers/authenticated-fetch.ts';
import { join } from '$std/path/mod.ts';
import { type AuthTokenPayloadFragment, type State } from './types.ts';
import { type RefreshResponseBody } from '../types/api-interchange.ts';

export async function refreshToken(
  req: Request,
  ctx: FreshContext<State>,
) {
  const cookies = getCookies(req.headers);
  const headers = new Headers();
  if (cookies.auth) {
    const [_header, payload, _signature] = decode<AuthTokenPayloadFragment>(
      cookies.auth,
    );
    const nowSeconds = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60; // in seconds
    if (
      payload.exp < nowSeconds + fiveMinutes && payload.remainingRefreshes > 0
    ) {
      const authedFetch = authenticatedFetch(req);
      const refreshUrl = join(
        Deno.env.get('BACKEND_API_BASE_URL') as string,
        '/refresh-token',
      );
      const refreshResponse = await authedFetch(refreshUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookies.auth}`,
        },
      });

      if (refreshResponse.status === 200) {
        const tokenExpiry = payload.exp - nowSeconds;
        const authBody = (await refreshResponse.json()) as RefreshResponseBody;
        const url = new URL(req.url);

        setCookie(
          headers,
          {
            name: 'auth',
            value: authBody.token,
            maxAge: tokenExpiry,
            sameSite: 'Strict',
            domain: url.hostname,
            path: '/',
            secure: true,
          },
        );
      }
    }
  }

  const res = await ctx.next();

  headers.keys().forEach((key: string) => {
    console.log(`${key}: ${headers.get(key)}`);
    res.headers.set(key, headers.get(key) as string);
  });
  return res;
}
