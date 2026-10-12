
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { VehicleService } from './vehicle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: {
    id?: number;
    userId?: number;
  };
};

@Controller('vehicles')
export class VehicleController {
  constructor(
    private vehicleService: VehicleService,
  ) {}

  // Get all vehicles belonging to the logged-in user
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserId(req);
    return this.vehicleService.getAll(userId);
  }

  // Get vehicle by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(req);

    return this.vehicleService.findById(
      Number(id),
      userId,
    );
  }

  // Register a vehicle
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    body: {
      plate_number: string;
      brand: string;
      model: string;
      year?: number;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(req);

    return this.vehicleService.createVehicle(
      userId,
      body,
    );
  }

  // Update vehicle
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      plate_number?: string;
      brand?: string;
      model?: string;
      year?: number;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(req);

    return this.vehicleService.updateVehicle(
      Number(id),
      userId,
      body,
    );
  }

  // Delete vehicle
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = this.getUserId(req);

    return this.vehicleService.deleteVehicle(
      Number(id),
      userId,
    );
  }

  // Get the authenticated user's ID from the JWT
  private getUserId(req: AuthenticatedRequest): number {
    const userId = req.user?.id ?? req.user?.userId;

    if (typeof userId !== 'number' || !Number.isInteger(userId)) {
      throw new Error(
        'User ID is missing from the authenticated JWT payload',
      );
    }

    return userId;
  }
}
