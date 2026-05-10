import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
export class AnalyticsController {
  @Get('strategic')
  @Roles(Role.Admin, Role.Leader)
  getStrategicData() {
    return {
      message: 'This is sensitive strategic data, accessible only by Leaders and Admins.',
      data: [
        { metric: 'Productivity', value: 85 },
        { metric: 'Emotional Wellbeing', value: 72 },
      ],
    };
  }
}
