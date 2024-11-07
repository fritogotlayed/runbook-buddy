import { encodeBase64 } from 'jsr:@std/encoding/base64';

/**
 * Encode a string into a secure string.
 * @param input - The string to encode.
 * @returns A Promise that resolves to the encoded string.
 */
export async function hashSecureString(input: string): Promise<string> {
  // TODO: Look into using https://deno.land/x/argon2@v0.9.2
  const hashedPassword = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  return encodeBase64(hashedPassword);
}
