import { Controller, Get, Body, Put, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    // Prevent updating sensitive fields like role or passwordHash directly here
    const { role, passwordHash, id, ...allowedData } = updateData;
    await this.usersService.update(req.user.sub, allowedData);
    return { message: 'Profile updated successfully' };
  }
}
