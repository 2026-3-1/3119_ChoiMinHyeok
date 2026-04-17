import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../global/global_decorator/decorator.message';
import { SwaggerResponse } from '../../global/global_decorator/decorator.swagger-response';
import { course } from '../course/dto/courses.response';
import { CategoryService } from './category.service';
import { createCategory } from './dto/category.request';
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
  @ApiParam({ name: 'categoryId', required: true, type: Number, description: '카테고리 ID' })
  @SwaggerResponse(course, true, 200, '카테고리별 강좌 조회 성공')
  getCourseByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryService.getCourseByCategories(categoryId);
  }

  @ResponseMessage('카테고리 생성 완료')
  @HttpCode(201)
  @Post('categories')
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiBody({ type: createCategory })
  @SwaggerResponse(null, false, 201, '카테고리 생성 완료')
  addCategories(@Body() data: createCategory) {
    return this.categoryService.createCategory(data);
  }
}
