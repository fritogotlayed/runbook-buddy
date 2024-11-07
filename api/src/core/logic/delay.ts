/**
 * Delay for ms milliseconds
 * @param ms milliseconds to delay
 * @returns Promise that resolves after ms milliseconds
 * @example
 * await delay(1000);
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
