import { BloomHash } from './bloom-hash';

export class BloomFilter {
  private readonly bitArray: Uint8Array;
  private readonly bloomHash: BloomHash;

  constructor(
    public readonly bitSize: number,
    public readonly hashCount: number,
  ) {
    this.bloomHash = new BloomHash(bitSize, hashCount);

    // 8 bits are stored in each byte.
    this.bitArray = new Uint8Array(Math.ceil(bitSize / 8));
  }

  add(value: string): void {
    const positions = this.bloomHash.getHashPositions(value);

    for (const position of positions) {
      const byteIndex = Math.floor(position / 8);
      const bitIndex = position % 8;

      this.bitArray[byteIndex] |= 1 << bitIndex;
    }
  }

  mightContain(value: string): boolean {
    const positions = this.bloomHash.getHashPositions(value);

    return positions.every((position) => {
      const byteIndex = Math.floor(position / 8);
      const bitIndex = position % 8;

      return (this.bitArray[byteIndex] & (1 << bitIndex)) !== 0;
    });
  }

  getBitArray(): Uint8Array {
    return this.bitArray.slice();
  }
}
