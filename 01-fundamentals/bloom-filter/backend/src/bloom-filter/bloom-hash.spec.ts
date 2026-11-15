import { BloomHash } from './bloom-hash';

describe('BloomHash', () => {
  describe('constructor', () => {
    it('should reject an invalid bit size', () => {
      expect(() => new BloomHash(0, 7)).toThrow(
        'Bit size must be a positive integer',
      );
    });

    it('should reject an invalid hash count', () => {
      expect(() => new BloomHash(1000, 0)).toThrow(
        'Hash count must be a positive integer',
      );
    });

    it('should reject hash count greater than bit size', () => {
      expect(() => new BloomHash(5, 7)).toThrow(
        'Hash count cannot exceed bit size',
      );
    });
  });

  describe('getHashPositions()', () => {
    const bloomHash = new BloomHash(1000, 7);

    it('should generate the configured number of positions', () => {
      const positions = bloomHash.getHashPositions('shahid');

      expect(positions).toHaveLength(7);
    });

    it('should generate positions within bit-array bounds', () => {
      const positions = bloomHash.getHashPositions('shahid');

      positions.forEach((position) => {
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThan(1000);
      });
    });

    it('should generate deterministic positions for the same input', () => {
      const first = bloomHash.getHashPositions('shahid');
      const second = bloomHash.getHashPositions('shahid');

      expect(second).toEqual(first);
    });

    it('should generate different positions for different inputs', () => {
      const first = bloomHash.getHashPositions('shahid');
      const second = bloomHash.getHashPositions('ahmed');

      expect(second).not.toEqual(first);
    });

    it('should generate unique positions within one input', () => {
      const positions = bloomHash.getHashPositions('shahid');

      expect(new Set(positions).size).toBe(7);
    });
  });
});
