import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('availability/:username')
  async checkUsernameAvailability(
    @Param('username') username: string,
  ): Promise<{ username: string; available: boolean }> {
    const available =
      await this.usersService.checkUsernameAvailability(username);

    return { username, available };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
