import { Controller, Get, Post, Body, Put, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    return this.notificationsService.getNotifications(req.user.sub);
  }

  @Post('share')
  async shareQuote(@Request() req, @Body() body: any) {
    return this.notificationsService.shareQuote(
      req.user.sub,
      body.email,
      body.message,
      body.title,
    );
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
