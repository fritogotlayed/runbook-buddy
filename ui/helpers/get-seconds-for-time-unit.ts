/**
 * Get the multiplier for the expiresIn string.
 * @param expiresIn
 * @returns The multiplier for the expiresIn string.
 *
 * @example
 * getExpiresInMultiplierForSeconds('1h') // 60 * 60
 * getExpiresInMultiplierForSeconds('1d') // 60 * 60 * 24
 * getExpiresInMultiplierForSeconds('1m') // 60
 * getExpiresInMultiplierForSeconds('1s') // 1
 * getExpiresInMultiplierForSeconds('4h') // 60 * 60 * 4
 */
export function getSecondsForTimeUnit(expiresIn: string): number {
  if (!expiresIn || typeof expiresIn !== 'string') {
    throw new Error('Argument must be a string');
  }

  // use regex to extract the value and unit from the expiresIn string
  const regex = /^(\d+)(.*)$/;
  const match = expiresIn.match(regex);
  if (!match) {
    throw new Error(
      'Invalid time unit. Format is ddu where d is a digit and u is the unit (h, d, m, or s)',
    );
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'h':
      return value * 60 * 60; // hours to seconds
    case 'd':
      return value * 60 * 60 * 24; // days to seconds
    case 'm':
      return value * 60; // minutes to seconds
    case 's':
      return value; // seconds
    default:
      throw new Error(
        'Invalid time unit. Use h (hours), d (days), m (minutes), or s (seconds)',
      );
  }
}
