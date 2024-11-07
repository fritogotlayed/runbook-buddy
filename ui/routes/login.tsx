import { Handlers } from '$fresh/server.ts';
import { getCookies } from '$std/http/cookie.ts';
import Login from '../islands/Login.tsx';

export const handler: Handlers = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const headers = new Headers(req.headers);
    const cookies = getCookies(req.headers);
    const navBack = url.searchParams.get('navBack');

    if (cookies.auth) {
      // Redirect to home page if user is already logged in
      headers.set('location', navBack ?? '/');
      return new Response(null, {
        status: 302,
        headers,
      });
    }

    return ctx.render();
  },
};

export default function LoginPage() {
  return <Login />;
}
