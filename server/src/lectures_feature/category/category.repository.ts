import { Injectable } from '@nestjs/common';
import prisma from '../../../prisma/prisma.client';

@Injectable()
export class CategoryRepository {
  async findAll() {
    return prisma.categories.findMany();
  }

  async findById(id: number) {
    return prisma.categories.findUnique({ where: { id } });
  }

  async create(name: string) {
    return prisma.categories.create({ data: { name } });
  }

  async update(id: number, name: string) {
    return prisma.categories.update({ where: { id }, data: { name } });
  }

  async delete(id: number) {
    return prisma.categories.delete({ where: { id } });
  }

  async findCoursesByCategory(categoryId: number) {
    return prisma.courses.findMany({ where: { category_id: categoryId } });
  }
}
