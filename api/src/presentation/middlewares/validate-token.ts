import { Context, Next } from 'hono';
import { verify } from '@zaubrik/djwt';
import { getPublicSignature } from '../helpers/get-public-signature.ts';

export async function validateToken(c: Context, next: Next) {
  const token = c.req.header('Authorization');

  if (!token) {
    return c.text('Unauthorized', 401);
  }

  const [scheme, payload] = token.split(' ');

  if (scheme !== 'Bearer') {
    return c.text('Unauthorized', 401);
  }

  const publicSignature = await getPublicSignature();

  try {
    const verifiedPayload = await verify(payload, publicSignature);
    c.set('userId', verifiedPayload.userId);
    return next();
  } catch (e) {
    console.log(e);
    return c.text('Unauthorized', 401);
  }
}
