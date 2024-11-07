import { decodeBase64 } from 'jsr:@std/encoding/base64';
import { unwrapPem } from './unwrap-pem.ts';

export async function getJwtSigningData() {
  const privateKeyPem = Deno.readTextFileSync('./.secrets/private-key.pem');
  const signingKey = await crypto.subtle.importKey(
    'pkcs8',
    decodeBase64(unwrapPem(privateKeyPem)),
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign'],
  );
  return {
    signingKey,
    signingOptions: {
      expiresIn: '4h',
      algorithm: 'ES256',
      issuer: 'runbookbuddy',
    },
  };
}
