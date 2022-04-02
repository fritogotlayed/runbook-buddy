export function buildUrl(part: string): string {
  const { hostname } = window.location;
  return `http://${hostname}:8080${part.startsWith('/') ? part : `/${part}`}`;
}