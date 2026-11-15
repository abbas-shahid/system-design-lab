import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BloomFilterModule } from '../bloom-filter/bloom-filter.module';

@Module({
  imports: [BloomFilterModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
