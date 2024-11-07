export function unwrapPem(str: string) {
  return str.replace(
    /-----BEGIN (PRIVATE|PUBLIC) KEY-----\n|-----END (PRIVATE|PUBLIC) KEY-----/g,
    '',
  );
}
