import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { BloomHash } from './bloom-hash';

@Injectable()
export class RedisBloomFilterService {
  private readonly bloomHash: BloomHash;
  private readonly redisKey = 'bloom-filter:usernames';
  private readonly metadataKey = 'bloom-filter:usernames:metadata';
  private readonly bitSize: number;
  private readonly hashCount: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    const bitSize = Number(
      this.configService.get<string>('BLOOM_FILTER_BIT_SIZE', '958506'),
    );

    const hashCount = Number(
      this.configService.get<string>('BLOOM_FILTER_HASH_COUNT', '7'),
    );

    if (!Number.isSafeInteger(bitSize) || bitSize <= 0) {
      throw new Error('BLOOM_FILTER_BIT_SIZE must be a positive integer');
    }

    if (!Number.isSafeInteger(hashCount) || hashCount <= 0) {
      throw new Error('BLOOM_FILTER_HASH_COUNT must be a positive integer');
    }

    if (hashCount > bitSize) {
      throw new Error(
        'BLOOM_FILTER_HASH_COUNT cannot exceed BLOOM_FILTER_BIT_SIZE',
      );
    }

    this.bitSize = bitSize;
    this.hashCount = hashCount;
    this.bloomHash = new BloomHash(bitSize, hashCount);
  }

  async add(value: string): Promise<void> {
    await this.addMany([value]);
  }

  async addMany(values: string[]): Promise<void> {
    if (values.length === 0) {
      return;
    }

    const client = this.redisService.getClient();
    const pipeline = client.pipeline();

    for (const value of values) {
      const positions = this.bloomHash.getHashPositions(value);

      for (const position of positions) {
        pipeline.setbit(this.redisKey, position, 1);
      }
    }

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    for (const [error] of results) {
      if (error) {
        throw new Error(
          `Failed to add values to Bloom Filter: ${error.message}`,
        );
      }
    }
  }

  async mightContain(value: string): Promise<boolean> {
    if (!(await this.isReady())) {
      throw new Error('Bloom Filter is not ready; use PostgreSQL fallback');
    }

    const positions = this.bloomHash.getHashPositions(value);
    const client = this.redisService.getClient();

    const pipeline = client.pipeline();

    for (const position of positions) {
      pipeline.getbit(this.redisKey, position);
    }

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    const bits: number[] = [];

    for (const [error, result] of results) {
      if (error) {
        throw new Error(`Failed to read Bloom Filter: ${error.message}`);
      }

      if (result !== 0 && result !== 1) {
        throw new Error('Unexpected Redis GETBIT response');
      }

      bits.push(result);
    }

    return bits.every((bit) => bit === 1);
  }

  async isReady(): Promise<boolean> {
    if (this.redisService.hasConnectionBeenLost()) {
      return false;
    }
    const client = this.redisService.getClient();
    const metadata = await client.get(this.metadataKey);

    if (!metadata) {
      return false;
    }

    try {
      const parsed = JSON.parse(metadata);

      return (
        parsed.version === 1 &&
        parsed.bitSize === this.bitSize &&
        parsed.hashCount === this.hashCount &&
        parsed.hashAlgorithm === 'sha256-double-hashing' &&
        parsed.status === 'ready'
      );
    } catch {
      return false;
    }
  }

  async beginRebuild(): Promise<void> {
    const client = this.redisService.getClient();

    await client.set(
      this.metadataKey,
      JSON.stringify({
        version: 1,
        bitSize: this.bitSize,
        hashCount: this.hashCount,
        hashAlgorithm: 'sha256-double-hashing',
        status: 'building',
      }),
    );

    await client.del(this.redisKey);
  }

  async markReady(): Promise<void> {
    const client = this.redisService.getClient();

    await client.set(
      this.metadataKey,
      JSON.stringify({
        version: 1,
        bitSize: this.bitSize,
        hashCount: this.hashCount,
        hashAlgorithm: 'sha256-double-hashing',
        status: 'ready',
      }),
    );
  }

  async invalidate(): Promise<void> {
    const client = this.redisService.getClient();

    await client.set(
      this.metadataKey,
      JSON.stringify({
        version: 1,
        bitSize: this.bitSize,
        hashCount: this.hashCount,
        hashAlgorithm: 'sha256-double-hashing',
        status: 'invalid',
      }),
    );
  }
}
