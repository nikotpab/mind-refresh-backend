import { Controller, Get, Body, Put, Req, UseGuards, NotFoundException, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('Administrador', 'Líder')
  async findAll(@Query('limit') limit?: number, @Query('lastId') lastId?: string) {
    const users = await this.usersService.findAll(limit ? Number(limit) : 20, lastId);
    return users.map(user => plainToInstance(UserResponseDto, user));
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserResponseDto, user);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    // Prevent updating sensitive fields like role or passwordHash directly here
    const { role, passwordHash, id, ...allowedData } = updateData;
    await this.usersService.update(req.user.sub, allowedData);
    return { message: 'Profile updated successfully' };
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  async updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    await this.usersService.update(id, { role: body.role });
    return { message: 'User role updated successfully' };
  }
}
