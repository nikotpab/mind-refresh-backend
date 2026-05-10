import { Controller, Get, Post, Body, Req, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('Administrador', 'Líder')
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

  @Put(':id')
  @Roles('Administrador', 'Líder')
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: any) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('Administrador', 'Líder')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}
