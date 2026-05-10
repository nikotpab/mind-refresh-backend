import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() createEventDto: any, @Req() req: any) {
    return this.eventsService.create({
      ...createEventDto,
      createdBy: req.user.sub
    });
  }

  @Get()
  async getEvents() {
    return this.eventsService.findAll();
  }
}
