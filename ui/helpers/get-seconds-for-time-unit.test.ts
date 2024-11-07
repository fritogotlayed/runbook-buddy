import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { assertThrows } from '@std/assert';
import { getSecondsForTimeUnit } from './get-seconds-for-time-unit.ts';

describe('getSecondsForTimeUnit', () => {
  describe('success cases', () => {
    [
      ['1d', 86400],
      ['2d', 172800],
      ['1h', 3600],
      ['2h', 7200],
      ['1m', 60],
      ['2m', 120],
      ['1s', 1],
      ['2s', 2],
    ].forEach(([timeUnit, expectedSeconds]) => {
      it(`input: ${timeUnit}`, () => {
        expect(getSecondsForTimeUnit(timeUnit as string)).toBe(expectedSeconds);
      });
    });
  });

  describe('error cases', () => {
    [
      [
        null,
        '1x',
        'Invalid time unit. Use h (hours), d (days), m (minutes), or s (seconds)',
      ],
      [
        null,
        '1ms',
        'Invalid time unit. Use h (hours), d (days), m (minutes), or s (seconds)',
      ],
      [
        null,
        'x',
        'Invalid time unit. Format is ddu where d is a digit and u is the unit (h, d, m, or s)',
      ],
      [
        '1 [string]',
        '1',
        'Invalid time unit. Use h (hours), d (days), m (minutes), or s (seconds)',
      ],
      ['1 [number]', 1, 'Argument must be a string'],
      ['object', {}, 'Argument must be a string'],
    ].forEach(([descriptor, timeUnit, errorMessage]) => {
      it(`when input ${descriptor ?? timeUnit} throws error for invalid time unit`, () => {
        assertThrows(
          () => getSecondsForTimeUnit(timeUnit as string),
          Error,
          errorMessage as string,
        );
      });
    });
  });
});
