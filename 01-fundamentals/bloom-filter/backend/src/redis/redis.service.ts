import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private connectionLost = false;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: Number(this.configService.get<string>('REDIS_PORT', '6380')),

      // Connection behavior
      connectTimeout: 5000,

      // Fail commands promptly when Redis is unavailable.
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,

      // Keep reconnecting, with a capped delay.
      retryStrategy: (times: number) => Math.min(times * 200, 2000),
    });

    this.client.on('ready', () => {
      console.log('Redis connected successfully');
    });

    this.client.on('error', (error: Error) => {
      console.error('Redis connection error:', error.message);
    });

    this.client.on('close', () => {
      this.connectionLost = true;
      console.warn('Redis connection lost; Bloom Filter requires rebuild');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status === 'ready') {
      await this.client.quit();
    } else {
      this.client.disconnect();
    }
  }

  hasConnectionBeenLost(): boolean {
    return this.connectionLost;
  }

  markConnectionRebuilt(): void {
    this.connectionLost = false;
  }
}
