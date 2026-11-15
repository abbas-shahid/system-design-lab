import { Module } from '@nestjs/common';
import { RedisBloomFilterService } from './redis-bloom-filter.service';

@Module({
  providers: [RedisBloomFilterService],
  exports: [RedisBloomFilterService],
})
export class BloomFilterModule {}
