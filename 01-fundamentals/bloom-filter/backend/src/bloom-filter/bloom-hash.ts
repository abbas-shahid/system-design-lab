import { createHash } from 'node:crypto';

export class BloomHash {
  constructor(
    private readonly bitSize: number,
    private readonly hashCount: number,
  ) {
    if (!Number.isInteger(bitSize) || bitSize <= 0) {
      throw new Error('Bit size must be a positive integer');
    }

    if (!Number.isInteger(hashCount) || hashCount <= 0) {
      throw new Error('Hash count must be a positive integer');
    }

    if (hashCount > bitSize) {
      throw new Error('Hash count cannot exceed bit size');
    }
  }

  private gcd(a: number, b: number): number {
    while (b !== 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }

    return a;
  }

  getHashPositions(value: string): number[] {
    const digest = createHash('sha256').update(value).digest();

    const hash1 = digest.readUInt32BE(0);
    let hash2 = digest.readUInt32BE(4) || 1;

    // Ensure the hash step is relatively prime to bitSize.
    while (this.gcd(hash2, this.bitSize) !== 1) {
      hash2++;
    }

    // Generate positions using double hashing.
    return Array.from({ length: this.hashCount }, (_, i) => {
      return (hash1 + i * hash2) % this.bitSize;
    });
  }
}
