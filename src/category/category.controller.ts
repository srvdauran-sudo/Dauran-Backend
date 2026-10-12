
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
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthenticatedRequest = {
  user?: {
    id?: number;
    userId?: number;
  };
};

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async getAll() {
    return this.categoryService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.categoryService.findById(Number(id));
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      category_name: string;
      description?: string;
    },
  ) {
    const userId = req.user?.id ?? req.user?.userId;

    if (userId === undefined) {
      throw new UnauthorizedException(
        'User ID was not found in the authenticated request',
      );
    }

    return this.categoryService.createCategory(
      body.category_name,
      body.description,
      Number(userId),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      category_name?: string;
      description?: string;
    },
  ) {
    return this.categoryService.updateCategory(
      Number(id),
      body,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(Number(id));
  }
}
