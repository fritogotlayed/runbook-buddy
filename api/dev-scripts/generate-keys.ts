import { encodeBase64 } from 'jsr:@std/encoding/base64';

function wrap(str: string, isPrivate: boolean = false) {
  const prefix = isPrivate ? 'PRIVATE KEY' : 'PUBLIC KEY';
  // add line break after 64 characters
  const body = str.replace(/(.{64})/g, '$1\n');
  return `-----BEGIN ${prefix}-----\n${body}\n-----END ${prefix}-----`;
}

async function generateKeySet() {
  const keys = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  );
  const privateKey = await crypto.subtle.exportKey('pkcs8', keys.privateKey);
  const publicKey = await crypto.subtle.exportKey('spki', keys.publicKey);

  return {
    privateKey: wrap(encodeBase64(privateKey)),
    publicKey: wrap(encodeBase64(publicKey)),
  };
}

async function main() {
  const keyDirectory = './.secrets';
  const privateKeyFileName = 'private-key.pem';
  const publicKeyFileName = 'public-key.pem';

  // Remove the keys if they already exist
  try {
    await Deno.remove(`${keyDirectory}/${privateKeyFileName}`);
  } catch {
    // Ignore if the file doesn't exist
  }
  try {
    await Deno.remove(`${keyDirectory}/${publicKeyFileName}`);
  } catch {
    // Ignore if the file doesn't exist
  }

  // Write the keys
  const { privateKey, publicKey } = await generateKeySet();
  await Deno.writeTextFile(
    `${keyDirectory}/${privateKeyFileName}`,
    privateKey,
  );
  await Deno.writeTextFile(
    `${keyDirectory}/${publicKeyFileName}`,
    publicKey,
  );
}

if (import.meta.main) {
  await main();
}
