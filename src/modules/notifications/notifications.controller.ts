import { Controller, Get, Post, Body, Req, UseGuards, Put, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    return this.notificationsService.findByUserId(req.user.sub);
  }

  @Post('share')
  async share(@Body() shareDto: any, @Req() req: any) {
    return this.notificationsService.createByEmail(shareDto.email, {
      title: shareDto.title || 'Alguien compartió contigo',
      message: shareDto.message,
      type: shareDto.type || 'QUOTE_SHARED',
      senderName: req.user.name
    });
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
