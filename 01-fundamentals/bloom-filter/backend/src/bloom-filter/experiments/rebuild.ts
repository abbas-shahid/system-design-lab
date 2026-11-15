import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisBloomFilterService } from '../redis-bloom-filter.service';

const BATCH_SIZE = 1000;

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const prisma = app.get(PrismaService);
    const bloomFilter = app.get(RedisBloomFilterService);

    console.log('Starting Bloom Filter rebuild...');

    await bloomFilter.beginRebuild();

    let cursor: string | undefined;
    let totalProcessed = 0;

    while (true) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
        },
        orderBy: {
          id: 'asc',
        },
        take: BATCH_SIZE,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      });

      if (users.length === 0) {
        break;
      }

      await bloomFilter.addMany(users.map((user) => user.username));

      totalProcessed += users.length;
      cursor = users[users.length - 1].id;

      console.log(`Processed ${totalProcessed} users`);
    }

    await bloomFilter.markReady();

    console.log('Bloom Filter rebuild completed successfully.');
    console.log(`Total usernames indexed: ${totalProcessed}`);
  } catch (error) {
    console.error('Bloom Filter rebuild failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error('Rebuild command failed:', error);
  process.exitCode = 1;
});
