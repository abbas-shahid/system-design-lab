import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisBloomFilterService } from '../bloom-filter/redis-bloom-filter.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bloomFilter: RedisBloomFilterService,
  ) {}

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      if (await this.bloomFilter.isReady()) {
        const mightExist = await this.bloomFilter.mightContain(username);

        if (!mightExist) {
          return true;
        }
      }
    } catch (error) {
      console.error('Bloom Filter lookup failed; using PostgreSQL:', error);
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return !user;
  }

  async create(createUserDto: CreateUserDto) {
    let user;

    try {
      user = await this.prisma.user.create({
        data: {
          username: createUserDto.username,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username is already taken');
      }

      throw error;
    }

    try {
      await this.bloomFilter.add(user.username);
    } catch (error) {
      console.error('Failed to update Bloom Filter after signup:', error);

      try {
        await this.bloomFilter.invalidate();
      } catch (invalidateError) {
        console.error('Failed to invalidate Bloom Filter:', invalidateError);
      }
    }

    return user;
  }
}
