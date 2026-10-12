import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './category/category.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, VehicleModule, CategoryModule],
})
export class AppModule {}