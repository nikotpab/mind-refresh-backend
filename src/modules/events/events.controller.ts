import { Controller, Get, Post, Body, Req, Res, UseGuards, Put, Param, Delete, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Response } from 'express';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Administrador', 'Líder')
  async createEvent(@Body() createEventDto: any, @Req() req: any, @Res() res: Response) {
    try {
      console.log(`[EventsController] Creating event: ${createEventDto.title} by ${req.user.sub}`);
      const result = await this.eventsService.create({
        ...createEventDto,
        createdBy: req.user.sub
      });
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('[EventsController] Create error:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getEvents(@Res() res: Response) {
    try {
      const result = await this.eventsService.findAll();
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Post(':id/invite')
  @UseGuards(AuthGuard)
  async inviteToEvent(@Param('id') id: string, @Body() inviteDto: any, @Req() req: any, @Res() res: Response) {
    try {
      console.log(`[EventsController] Invite request for event ${id} from ${req.user.name}`);
      const result = await this.eventsService.invite(id, inviteDto.email, req.user.name);
      console.log('[EventsController] Invite success, sending 200');
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('[EventsController] Invite error:', error);
      return res.status(error.status || 500).json({ message: error.message });
    }
  }

  @Post(':id/enroll')
  @UseGuards(AuthGuard)
  async enrollInEvent(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      console.log(`[EventsController] Enrollment request for event: ${id} by user: ${req.user.sub}`);
      const result = await this.eventsService.enroll(id, req.user.sub);
      console.log('[EventsController] Enrollment success, sending 200');
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('[EventsController] Enrollment error:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  @Post(':id/save')
  @UseGuards(AuthGuard)
  async toggleSaveEvent(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    try {
      const savedEvents = await this.eventsService.toggleSave(id, req.user.sub);
      return res.status(200).json({ savedEvents });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Administrador', 'Líder')
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: any, @Res() res: Response) {
    try {
      console.log(`[EventsController] Updating event: ${id}`);
      const result = await this.eventsService.update(id, updateEventDto);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Administrador', 'Líder')
  async deleteEvent(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`[EventsController] Deleting event: ${id}`);
      const result = await this.eventsService.delete(id);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
