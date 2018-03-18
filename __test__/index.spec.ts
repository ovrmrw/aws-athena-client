import { flattenUniqOrderBy } from '../src';

describe('flattenUniqOrderBy', () => {
  it('must return expected number array.', () => {
    const expected = [1, 2, 3, 4, 5];
    const list = [1, 2, 3, 2, [5, [4, 1]]];
    const actual = flattenUniqOrderBy(list);
    expect(actual).toEqual(expected);
  });
});
