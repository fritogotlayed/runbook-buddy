import { Handlers } from '$fresh/server.ts';
import { setCookie } from '$std/http/cookie.ts';
import { join } from '$std/url/join.ts';
import { decode } from '@zaubrik/djwt';

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const data = await req.json() as { username: string; password: string };
    const headers = new Headers();

    const { username, password } = data;

    const backendAuthUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/auth',
    );

    const authResponse = await fetch(backendAuthUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (authResponse.status === 200) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const authBody = await authResponse.json();

      // Get the token expiry time from the decoded token
      const [_header, payload, _signature] = decode<{ exp: number }>(
        authBody.token,
      );
      const tokenExpiry = payload.exp - nowSeconds;

      setCookie(
        headers,
        {
          name: 'auth',
          value: authBody.token,
          maxAge: tokenExpiry,
          sameSite: 'Strict',
          domain: url.hostname,
          path: '/',
          secure: false, // TODO: Set to true when we have HTTPS
        },
      );

      // headers.set('location', '/');
      headers.set('content-type', 'application/json');
      const navBack = url.searchParams.get('navBack') ?? '/';
      headers.set('location', navBack);
      const body = JSON.stringify({ location: navBack });
      return new Response(body, {
        status: 200,
        headers,
      });
    }

    if (req.headers.has('referer')) {
      // headers.set('location', req.headers.get('referer') as string);
    }
    return new Response(null, {
      // TODO: update after login component becomes island
      status: 401,
      headers,
    });
  },
};
