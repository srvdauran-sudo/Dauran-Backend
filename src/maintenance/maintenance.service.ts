
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class MaintenanceService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(userId: number) {
    const [rows] = await this.databaseService.getPool().execute<RowDataPacket[]>(
      `SELECT
        maintenance_id,
        vehicle_id,
        category_id,
        service_date,
        description,
        mileage,
        cost,
        status,
        created_at,
        updated_at
      FROM maintenance_records
      WHERE id = ?
      ORDER BY service_date DESC`,
      [userId],
    );

    return rows;
  }

  async findOne(id: number, userId: number) {
    const [rows] = await this.databaseService.getPool().execute<RowDataPacket[]>(
      `SELECT * FROM maintenance_records
       WHERE maintenance_id = ? AND id = ?`,
      [id, userId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Maintenance record not found');
    }

    return rows[0];
  }

  async create(data: any, userId: number) {
    const {
      vehicle_id,
      category_id,
      service_date,
      description,
      mileage,
      cost,
      status,
    } = data;

    const [result] = await this.databaseService.getPool().execute<ResultSetHeader>(
      `INSERT INTO maintenance_records
      (id, vehicle_id, category_id, service_date, description, mileage, cost, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        vehicle_id,
        category_id,
        service_date,
        description || null,
        mileage ?? null,
        cost ?? 0,
        status || 'Completed',
      ],
    );

    return this.findOne(result.insertId, userId);
  }

  async update(id: number, data: any, userId: number) {
    await this.findOne(id, userId);

    const {
      vehicle_id,
      category_id,
      service_date,
      description,
      mileage,
      cost,
      status,
    } = data;

    await this.databaseService.getPool().execute(
      `UPDATE maintenance_records
       SET vehicle_id = ?,
           category_id = ?,
           service_date = ?,
           description = ?,
           mileage = ?,
           cost = ?,
           status = ?
       WHERE maintenance_id = ? AND id = ?`,
      [
        vehicle_id,
        category_id,
        service_date,
        description || null,
        mileage ?? null,
        cost ?? 0,
        status || 'Completed',
        id,
        userId,
      ],
    );

    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    await this.databaseService.getPool().execute(
      `DELETE FROM maintenance_records
       WHERE maintenance_id = ? AND id = ?`,
      [id, userId],
    );

    return { message: 'Maintenance record deleted successfully' };
  }
}