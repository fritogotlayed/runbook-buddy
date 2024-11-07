import { FreshContext } from '$fresh/server.ts';
import { getCookies } from '$std/http/cookie.ts';
import { decode } from '@zaubrik/djwt';
import { AuthTokenPayloadFragment, State } from './types.ts';

export function setContextUserId(req: Request, ctx: FreshContext<State>) {
  const cookies = getCookies(req.headers);
  if (cookies.auth) {
    const [_header, payload] = decode<AuthTokenPayloadFragment>(
      cookies.auth,
    );
    ctx.state.userId = payload.userId;
  }
  return ctx.next();
}
