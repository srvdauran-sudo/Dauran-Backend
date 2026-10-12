
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CategoryService {
  constructor(private readonly db: DatabaseService) {}

  private pool() {
    return this.db.getPool();
  }

  async createCategory(
    categoryName: string,
    description: string | undefined,
    userId: number,
  ) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      `INSERT INTO category (category_name, description, id)
       VALUES (?, ?, ?)`,
      [categoryName, description || null, userId],
    );

    return {
      category_id: result.insertId,
      category_name: categoryName,
      description: description || null,
      id: userId,
    };
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT category_id, category_name, description,
              id, created_at, updated_at
       FROM category
       ORDER BY category_id DESC`,
    );

    return rows;
  }

  async findById(categoryId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT category_id, category_name, description,
              id, created_at, updated_at
       FROM category
       WHERE category_id = ?`,
      [categoryId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Category not found');
    }

    return rows[0];
  }

  async updateCategory(
    categoryId: number,
    partial: {
      category_name?: string;
      description?: string;
    },
  ) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (partial.category_name !== undefined) {
      fields.push('category_name = ?');
      values.push(partial.category_name);
    }

    if (partial.description !== undefined) {
      fields.push('description = ?');
      values.push(partial.description);
    }

    if (fields.length === 0) {
      return this.findById(categoryId);
    }

    values.push(categoryId);

    await this.pool().execute(
      `UPDATE category
       SET ${fields.join(', ')}
       WHERE category_id = ?`,
      values,
    );

    return this.findById(categoryId);
  }

  async deleteCategory(categoryId: number) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      `DELETE FROM category WHERE category_id = ?`,
      [categoryId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }
}
