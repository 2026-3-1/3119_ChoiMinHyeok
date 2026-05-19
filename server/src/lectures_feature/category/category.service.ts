import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { createCategory, updateCategory } from './dto/category.request';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategories() {
    return this.categoryRepository.findAll();
  }

  async getCourseByCategories(categoryId: number) {
    return this.categoryRepository.findCoursesByCategory(categoryId);
  }

  async getCourses(search: string | undefined, categoryId: number | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.categoryRepository.findCourses(search?.trim(), categoryId, skip, limit);
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

    await this.categoryRepository.delete(categoryId);
  }
}
