import { BloomFilter } from './bloom-filter';

describe('BloomFilter', () => {
  let bloomFilter: BloomFilter;

  beforeEach(() => {
    bloomFilter = new BloomFilter(1000, 7);
  });

  describe('add()', () => {
    it('should identify an inserted value', () => {
      bloomFilter.add('shahid');

      expect(bloomFilter.mightContain('shahid')).toBe(true);
    });

    it('should identify multiple inserted values', () => {
      const usernames = ['shahid', 'ahmed', 'ali'];

      usernames.forEach((username) => bloomFilter.add(username));

      usernames.forEach((username) => {
        expect(bloomFilter.mightContain(username)).toBe(true);
      });
    });

    it('should not change the bit array when adding a duplicate', () => {
      bloomFilter.add('shahid');

      const before = bloomFilter.getBitArray();

      bloomFilter.add('shahid');

      const after = bloomFilter.getBitArray();

      expect(after).toEqual(before);
    });
  });

  describe('mightContain()', () => {
    it('should return false for an empty filter', () => {
      expect(bloomFilter.mightContain('unknown_user')).toBe(false);
    });

    it('should return false for an absent value in this test case', () => {
      bloomFilter.add('shahid');

      expect(bloomFilter.mightContain('unknown_user')).toBe(false);
    });
  });

  describe('getBitArray()', () => {
    it('should return a copy instead of exposing internal state', () => {
      bloomFilter.add('shahid');

      const bitArray = bloomFilter.getBitArray();
      bitArray.fill(0);

      expect(bloomFilter.mightContain('shahid')).toBe(true);
    });
  });
});
