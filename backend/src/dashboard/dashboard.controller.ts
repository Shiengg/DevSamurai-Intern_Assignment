import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetDashboardQueryDto } from './dto/dashboard-query.dto';
import { GetDashboardResponseDto } from './dto/dashboard-response.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('overview')
  async getDashboard(
    @Query() query: GetDashboardQueryDto,
  ): Promise<GetDashboardResponseDto> {
    return this.dashboardService.getDashboard(query);
  }

  /** Regenerates demo dashboard rows (gated by ENABLE_DASHBOARD_DEMO_SEED). */
  @Post('demo-seed')
  async seedDemo(): Promise<{ ok: true; daysSeeded: number }> {
    return this.dashboardService.runDemoSeedFromApi();
  }
}
