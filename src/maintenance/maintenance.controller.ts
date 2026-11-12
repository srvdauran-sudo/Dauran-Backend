
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';

import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
  ) {}

  private getUserId(req: any): number {
    const userId = req.user?.id ?? req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return Number(userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.maintenanceService.findAll(this.getUserId(req));
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.maintenanceService.findOne(id, this.getUserId(req));
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.maintenanceService.create(body, this.getUserId(req));
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.maintenanceService.update(
      id,
      body,
      this.getUserId(req),
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.maintenanceService.remove(id, this.getUserId(req));
  }
}
