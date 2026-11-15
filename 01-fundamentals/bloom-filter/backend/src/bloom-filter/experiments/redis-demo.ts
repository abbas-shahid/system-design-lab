import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RedisBloomFilterService } from '../redis-bloom-filter.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const bloomFilter = app.get(RedisBloomFilterService);

    // Insert usernames into Redis.
    await bloomFilter.add('shahid');
    await bloomFilter.add('ahmed');
    await bloomFilter.add('ali');

    // Check membership.
    console.log('shahid:', await bloomFilter.mightContain('shahid'));
    console.log('ahmed:', await bloomFilter.mightContain('ahmed'));
    console.log('ali:', await bloomFilter.mightContain('ali'));
    console.log(
      'unknown_user:',
      await bloomFilter.mightContain('unknown_user'),
    );
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('Redis demo failed:', error);
  process.exitCode = 1;
});
