import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RedisBloomFilterService } from '../redis-bloom-filter.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const bloomFilter = app.get(RedisBloomFilterService);

    // Read existing Redis data without inserting anything.
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
  console.error('Redis read demo failed:', error);
  process.exitCode = 1;
});
