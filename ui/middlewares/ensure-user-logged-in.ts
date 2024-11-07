import { FreshContext } from '$fresh/server.ts';
import { getCookies } from '$std/http/cookie.ts';
import { State } from './types.ts';

export function ensureUserLoggedIn(req: Request, ctx: FreshContext<State>) {
  const cookies = getCookies(req.headers);

  if (!cookies.auth) {
    const pathName = new URL(req.url).pathname;
    const navBack = `?navBack=${pathName}`;

    // Redirect to home page if user is already logged in
    const headers = new Headers();
    headers.set('location', `/login${navBack}`);

    return new Response(null, {
      status: 302,
      headers,
    });
  }

  return ctx.next();
}
