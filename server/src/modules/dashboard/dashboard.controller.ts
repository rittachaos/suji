import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('home')
  home(@CurrentUser() user: { id: string }) {
    return this.dashboardService.home(user.id);
  }

  @Get('overview')
  overview(@CurrentUser() user: { id: string; role: 'USER' | 'COACH' | 'ADMIN' }, @Query('rangeDays') rangeDays?: string) {
    return this.dashboardService.overview(user.id, user.role, rangeDays ? Number(rangeDays) : 30);
  }
}
