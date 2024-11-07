import { decodeBase64 } from '@std/encoding/base64';
import { unwrapPem } from './unwrap-pem.ts';

// TODO: Move this to helper functions and make more robust
export async function getPublicSignature() {
  const secretPath = './.secrets/public-key.pem';
  const fileExists = await Deno.stat(secretPath).then(() => true).catch(() =>
    false
  );
  if (!fileExists) {
    throw new Error('Public signature not found');
  }

  const publicKeyPem = Deno.readTextFileSync(secretPath);
  return await crypto.subtle.importKey(
    'spki',
    decodeBase64(unwrapPem(publicKeyPem)),
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['verify'],
  );
}
