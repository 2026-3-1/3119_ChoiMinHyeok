import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseMessage } from "src/global/decorator/message.decorator";
import { CategoryService } from "./category.service";
import { SwaggerResponse } from "src/global/decorator/swagger.response";
import { category,  } from "./dto/category.response";
import { createCategory } from "./dto/category.request";
import { course,  } from "src/course/dto/courses.response";

@ApiTags('categories')
@Controller('/api/v1')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService){}

    @ResponseMessage('카테고리 목록 조회 성공')
    @Get('categories')
    @ApiOperation({ summary : '카테고리 조회'})
    @SwaggerResponse(category, true, 200, '카테고리 목록 조회 성공')
    getCategories() {
        return this.categoryService.getCategories()
    }

    @ResponseMessage('카테고리별 강좌 조회 성공')
    @Get('/categories/:categoryId/courses')
    @ApiOperation({ summary : '카테고리별 코스 조회'})
    @SwaggerResponse(course, true, 200, '카테고리별 강좌 조회 성공')
    getCourseByCategory(@Param('categoryId', ParseIntPipe) categoryId : number) {
        return this.categoryService.getCourseByCategories(categoryId)
    }

    @ResponseMessage('카테고리 생성 완료')
    @HttpCode(201)
    @Post('categories') 
    addCategories(@Body() data : createCategory) {
        this.categoryService.createCategory(data)
    }
}