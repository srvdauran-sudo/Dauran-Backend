
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2';

import { DatabaseService } from '../database/database.service';

interface VehicleData {
  plate_number: string;
  brand: string;
  model: string;
  year?: number;
}

@Injectable()
export class VehicleService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // Create vehicle
  async createVehicle(
    userId: number,
    data: VehicleData,
  ) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      `INSERT INTO vehicles
       (id, plate_number, brand, model, year)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        data.plate_number,
        data.brand,
        data.model,
        data.year ?? null,
      ],
    );

    return {
      vehicle_id: result.insertId,
      id: userId,
      ...data,
      year: data.year ?? null,
    };
  }

  // Get all vehicles belonging to a user
  async getAll(userId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT vehicle_id, id, plate_number, brand,
              model, year, created_at, updated_at
       FROM vehicles
       WHERE id = ?
       ORDER BY vehicle_id DESC`,
      [userId],
    );

    return rows;
  }

  // Get vehicle by ID
  async findById(
    vehicleId: number,
    userId: number,
  ) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT vehicle_id, id, plate_number, brand,
              model, year, created_at, updated_at
       FROM vehicles
       WHERE vehicle_id = ? AND id = ?`,
      [vehicleId, userId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Vehicle not found');
    }

    return rows[0];
  }

  // Update vehicle
  async updateVehicle(
    vehicleId: number,
    userId: number,
    partial: Partial<VehicleData>,
  ) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (partial.plate_number !== undefined) {
      fields.push('plate_number = ?');
      values.push(partial.plate_number);
    }

    if (partial.brand !== undefined) {
      fields.push('brand = ?');
      values.push(partial.brand);
    }

    if (partial.model !== undefined) {
      fields.push('model = ?');
      values.push(partial.model);
    }

    if (partial.year !== undefined) {
      fields.push('year = ?');
      values.push(partial.year);
    }

    if (fields.length === 0) {
      return this.findById(vehicleId, userId);
    }

    values.push(vehicleId, userId);

    await this.pool().execute(
      `UPDATE vehicles
       SET ${fields.join(', ')}
       WHERE vehicle_id = ? AND id = ?`,
      values,
    );

    return this.findById(vehicleId, userId);
  }

  // Delete vehicle
  async deleteVehicle(
    vehicleId: number,
    userId: number,
  ) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      `DELETE FROM vehicles
       WHERE vehicle_id = ? AND id = ?`,
      [vehicleId, userId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Vehicle not found');
    }

    return {
      message: 'Vehicle deleted successfully',
    };
  }
}
