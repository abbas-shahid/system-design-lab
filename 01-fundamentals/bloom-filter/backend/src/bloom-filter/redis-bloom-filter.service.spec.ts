import { jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { RedisBloomFilterService } from './redis-bloom-filter.service';

describe('RedisBloomFilterService', () => {
  let service: RedisBloomFilterService;

  let redisService: {
    getClient: Mock;
    hasConnectionBeenLost: Mock;
  };

  let configService: {
    get: Mock<(key: string, defaultValue?: string) => string>;
  };

  let redisClient: {
    get: Mock;
    set: Mock;
    del: Mock;
    pipeline: Mock;
  };

  let pipeline: {
    setbit: Mock;
    getbit: Mock;
    exec: Mock;
  };

  const readyMetadata = JSON.stringify({
    version: 1,
    bitSize: 1000,
    hashCount: 7,
    hashAlgorithm: 'sha256-double-hashing',
    status: 'ready',
  });

  beforeEach(() => {
    pipeline = {
      setbit: jest.fn().mockReturnThis(),
      getbit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    redisClient = {
      get: jest.fn().mockResolvedValue(readyMetadata),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      pipeline: jest.fn().mockReturnValue(pipeline),
    };

    redisService = {
      getClient: jest.fn().mockReturnValue(redisClient),
      hasConnectionBeenLost: jest.fn().mockReturnValue(false),
    };

    configService = {
      get: jest.fn((key: string, defaultValue: string) => {
        if (key === 'BLOOM_FILTER_BIT_SIZE') return '1000';
        if (key === 'BLOOM_FILTER_HASH_COUNT') return '7';
        return defaultValue;
      }),
    };

    service = new RedisBloomFilterService(
      redisService as unknown as RedisService,
      configService as unknown as ConfigService,
    );
  });

  describe('constructor', () => {
    it('should reject an invalid bit size', () => {
      configService.get.mockImplementation((key: string) =>
        key === 'BLOOM_FILTER_BIT_SIZE' ? '0' : '7',
      );

      expect(
        () =>
          new RedisBloomFilterService(
            redisService as unknown as RedisService,
            configService as unknown as ConfigService,
          ),
      ).toThrow('BLOOM_FILTER_BIT_SIZE must be a positive integer');
    });

    it('should reject an invalid hash count', () => {
      configService.get.mockImplementation((key: string) =>
        key === 'BLOOM_FILTER_BIT_SIZE' ? '1000' : '0',
      );

      expect(
        () =>
          new RedisBloomFilterService(
            redisService as unknown as RedisService,
            configService as unknown as ConfigService,
          ),
      ).toThrow('BLOOM_FILTER_HASH_COUNT must be a positive integer');
    });
  });

  describe('addMany()', () => {
    it('should add values using Redis SETBIT', async () => {
      pipeline.exec.mockResolvedValue(
        Array.from({ length: 14 }, () => [null, 1]),
      );

      await service.addMany(['shahid', 'ahmed']);

      expect(pipeline.setbit).toHaveBeenCalledTimes(14);
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
    });

    it('should do nothing for an empty array', async () => {
      await service.addMany([]);

      expect(redisClient.pipeline).not.toHaveBeenCalled();
    });

    it('should throw when Redis pipeline execution fails', async () => {
      pipeline.exec.mockResolvedValue(null);

      await expect(service.addMany(['shahid'])).rejects.toThrow(
        'Redis pipeline execution failed',
      );
    });

    it('should throw when a Redis SETBIT command fails', async () => {
      pipeline.exec.mockResolvedValue([
        [new Error('Redis write failed'), null],
      ]);

      await expect(service.addMany(['shahid'])).rejects.toThrow(
        'Failed to add values to Bloom Filter: Redis write failed',
      );
    });
  });

  describe('isReady()', () => {
    it('should return true for valid ready metadata', async () => {
      expect(await service.isReady()).toBe(true);
    });

    it('should return false when Redis connection was lost', async () => {
      redisService.hasConnectionBeenLost.mockReturnValue(true);

      expect(await service.isReady()).toBe(false);
      expect(redisClient.get).not.toHaveBeenCalled();
    });

    it('should return false when metadata is missing', async () => {
      redisClient.get.mockResolvedValue(null);

      expect(await service.isReady()).toBe(false);
    });

    it('should return false when metadata status is not ready', async () => {
      redisClient.get.mockResolvedValue(
        readyMetadata.replace('"ready"', '"building"'),
      );

      expect(await service.isReady()).toBe(false);
    });

    it('should return false for invalid JSON metadata', async () => {
      redisClient.get.mockResolvedValue('invalid-json');

      expect(await service.isReady()).toBe(false);
    });
  });

  describe('mightContain()', () => {
    it('should return true when all bits are set', async () => {
      pipeline.exec.mockResolvedValue(
        Array.from({ length: 7 }, () => [null, 1]),
      );

      expect(await service.mightContain('shahid')).toBe(true);
    });

    it('should return false when at least one bit is not set', async () => {
      pipeline.exec.mockResolvedValue([
        [null, 1],
        [null, 1],
        [null, 0],
        [null, 1],
        [null, 1],
        [null, 1],
        [null, 1],
      ]);

      expect(await service.mightContain('unknown_user')).toBe(false);
    });

    it('should reject lookup when the filter is not ready', async () => {
      redisClient.get.mockResolvedValue(null);

      await expect(service.mightContain('shahid')).rejects.toThrow(
        'Bloom Filter is not ready; use PostgreSQL fallback',
      );
    });

    it('should throw when Redis pipeline execution fails', async () => {
      pipeline.exec.mockResolvedValue(null);

      await expect(service.mightContain('shahid')).rejects.toThrow(
        'Redis pipeline execution failed',
      );
    });

    it('should reject unexpected Redis GETBIT responses', async () => {
      pipeline.exec.mockResolvedValue(
        Array.from({ length: 7 }, () => [null, 2]),
      );

      await expect(service.mightContain('shahid')).rejects.toThrow(
        'Unexpected Redis GETBIT response',
      );
    });
  });

  describe('rebuild operations', () => {
    it('should mark the filter as building and delete the old bitmap', async () => {
      await service.beginRebuild();

      expect(redisClient.set).toHaveBeenCalledWith(
        'bloom-filter:usernames:metadata',
        expect.stringContaining('"status":"building"'),
      );

      expect(redisClient.del).toHaveBeenCalledWith('bloom-filter:usernames');
    });

    it('should mark the filter as ready', async () => {
      await service.markReady();

      expect(redisClient.set).toHaveBeenCalledWith(
        'bloom-filter:usernames:metadata',
        expect.stringContaining('"status":"ready"'),
      );
    });

    it('should invalidate the filter', async () => {
      await service.invalidate();

      expect(redisClient.set).toHaveBeenCalledWith(
        'bloom-filter:usernames:metadata',
        expect.stringContaining('"status":"invalid"'),
      );
    });
  });
});
