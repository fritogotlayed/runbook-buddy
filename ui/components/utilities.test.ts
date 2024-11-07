import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { reduceClasses } from './utilities.ts';

describe('reduceClasses', () => {
  describe('success cases', () => {
    [
      ['bg-white bg-white', 'bg-white'],
      ['bg-white bg-red bg-white', 'bg-white'],
      ['bg-white mt-4 p-2 bg-red', 'bg-red mt-4 p-2'],
      ['mt-4 p-2 bg-white bg-red', 'mt-4 p-2 bg-red'],
      [
        'px-2 py-1 border-gray-500 border-2 rounded bg-white hover:bg-gray-200 transition-colors border-gray-900',
        'px-2 py-1 border-gray-900 border-2 rounded bg-white hover:bg-gray-200 transition-colors',
      ],
      [
        'bg-white bg-grey-400',
        'bg-grey-400',
      ],
    ].forEach(([inputString, expectedString]) => {
      it(`input: ${inputString}`, () => {
        expect(reduceClasses(inputString as string)).toBe(expectedString);
      });
    });
  });
});
