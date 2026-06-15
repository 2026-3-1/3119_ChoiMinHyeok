import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { createCategory, updateCategory } from './dto/category.request';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategories() {
    return this.categoryRepository.findAll();
  }

  async getCourseById(courseId: number) {
    const course = await this.categoryRepository.findCourseById(courseId);
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return course;
  }

  async getCourseByCategories(categoryId: number) {
    return this.categoryRepository.findCoursesByCategory(categoryId);
  }

  async getCourses(
    search: string | undefined,
    categoryId: number | undefined,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    return this.categoryRepository.findCourses(
      search?.trim(),
      categoryId,
      skip,
      limit,
    );
  }

  async createCategory(data: createCategory) {
    return this.categoryRepository.create(data.name);
  }

  async updateCategory(categoryId: number, data: updateCategory) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');

    return this.categoryRepository.update(categoryId, data.name!);
  }

  async deleteCategory(categoryId: number) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');

    const courseCount = await this.categoryRepository.countCoursesByCategory(categoryId);
    if (courseCount > 0) {
      throw new BadRequestException(
        `해당 카테고리에 강의가 ${courseCount}개 있어 삭제할 수 없습니다. 강의를 먼저 이동하거나 삭제해주세요.`,
      );
    }

    await this.categoryRepository.delete(categoryId);
  }
}
