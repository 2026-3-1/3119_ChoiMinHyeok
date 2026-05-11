import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from '../../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../../global/global_decorator/decorator.swagger-response';
import { JwtAuthGuard } from '../../global/guards/jwt-auth.guard';
import { RolesGuard } from '../../global/guards/roles.guard';
import { Roles } from '../../global/global_decorator/decorator.roles';
import { course } from '../course/dto/courses.response';
import { CategoryService } from './category.service';
import { createCategory, updateCategory } from './dto/category.request';
import { category } from './dto/category.response';

@ApiTags('categories')
@Controller('/api/v1')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ResponseMessage('카테고리 목록 조회 성공')
  @Get('categories')
  @ApiOperation({ summary: '카테고리 목록 조회' })
  @SwaggerResponse(category, true, 200, '카테고리 목록 조회 성공')
  getCategories() {
    return this.categoryService.getCategories();
  }

  @ResponseMessage('카테고리별 강좌 조회 성공')
  @Get('categories/:categoryId/courses')
  @ApiOperation({ summary: '카테고리별 강좌 조회' })
  @ApiParam({ name: 'categoryId', required: true, type: Number })
  @SwaggerResponse(course, true, 200, '카테고리별 강좌 조회 성공')
  getCourseByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryService.getCourseByCategories(categoryId);
  }

  @ResponseMessage('카테고리 생성 완료')
  @HttpCode(201)
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 생성 (ADMIN, INSTRUCTOR)' })
  @ApiBody({ type: createCategory })
  @SwaggerResponse(category, false, 201, '카테고리 생성 완료')
  addCategories(@Body() data: createCategory) {
    return this.categoryService.createCategory(data);
  }

  @ResponseMessage('카테고리 수정 완료')
  @Patch('categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 수정 (ADMIN)' })
  @ApiParam({ name: 'categoryId', type: Number })
  @ApiBody({ type: updateCategory })
  @SwaggerResponse(category, false, 200, '카테고리 수정 완료')
  updateCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() data: updateCategory,
  ) {
    return this.categoryService.updateCategory(categoryId, data);
  }

  @ResponseMessage('카테고리 삭제 완료')
  @Delete('categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 삭제 (ADMIN)' })
  @ApiParam({ name: 'categoryId', type: Number })
  @SwaggerResponse(null, false, 200, '카테고리 삭제 완료')
  deleteCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryService.deleteCategory(categoryId);
  }
}
