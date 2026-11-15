import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect().then(() => {
      console.log('Connected to the database');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
