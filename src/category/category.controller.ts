
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
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface CategoryRequest {
  user?: {
    id?: number;
    userId?: number;
  };
}

interface CreateCategoryDto {
  category_name: string;
  description?: string;
}

interface UpdateCategoryDto {
  category_name?: string;
  description?: string;
}

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  private getUserId(req: CategoryRequest): number {
    const userId = Number(
      req.user?.id ?? req.user?.userId,
    );

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException('Valid user ID was not found');
    }

    return userId;
  }

  @Get()
  async getAll(@Req() req: CategoryRequest) {
    return this.categoryService.getAll(this.getUserId(req));
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: CategoryRequest,
  ) {
    return this.categoryService.findById(
      id,
      this.getUserId(req),
    );
  }

  @Post()
  async create(
    @Req() req: CategoryRequest,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(
      body.category_name,
      body.description,
      this.getUserId(req),
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: CategoryRequest,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(
      id,
      this.getUserId(req),
      body,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: CategoryRequest,
  ) {
    return this.categoryService.deleteCategory(
      id,
      this.getUserId(req),
    );
  }
}