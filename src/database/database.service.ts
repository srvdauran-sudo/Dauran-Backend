
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnModuleDestroy
{
  pool!: mysql.Pool;

  async onModuleInit() {
    const requiredVariables = [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_PASSWORD',
      'DB_NAME',
    ];

    // Check required database environment variables.
    for (const variable of requiredVariables) {
      if (!process.env[variable]) {
        throw new Error(
          `Missing required environment variable: ${variable}`,
        );
      }
    }

    // Create the MySQL connection pool.
    this.pool = mysql.createPool({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test the database connection.
    const connection = await this.pool.getConnection();

    try {
      await connection.ping();

      console.log('MySQL database connected successfully');
    } finally {
      connection.release();
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool() {
    return this.pool;
  }
}