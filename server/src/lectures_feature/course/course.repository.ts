import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client';
import prisma from '../../../prisma/prisma.client';

@Injectable()
export class CourseRepository {
  async findById(courseId: number) {
    return prisma.courses.findUnique({ where: { id: courseId } });
  }

  async findBySlug(slug: string) {
    return prisma.courses.findUnique({ where: { slug } });
  }

  async findCategoryById(categoryId: number) {
    return prisma.categories.findUnique({ where: { id: categoryId } });
  }

  async findMany(where: Prisma.coursesWhereInput, skip: number, take: number) {
    return prisma.courses.findMany({ where, skip, take, orderBy: { created_at: 'desc' } });
  }

  async count(where: Prisma.coursesWhereInput) {
    return prisma.courses.count({ where });
  }

  async create(data: {
    title: string;
    description: string;
    instructor_id: number;
    thumbnail: string;
    slug: string;
    difficulty: any;
    category_id: number;
    price: number;
    rating: number;
    max_capacity: number;
    min_enrollment: number;
  }) {
    return prisma.courses.create({ data });
  }

  async update(
    courseId: number,
    data: Partial<{
      title: string;
      description: string;
      thumbnail: string;
      difficulty: any;
      category_id: number;
      price: number;
      max_capacity: number;
      min_enrollment: number;
    }>,
  ) {
    return prisma.courses.update({ where: { id: courseId }, data });
  }

  async delete(courseId: number) {
    return prisma.courses.delete({ where: { id: courseId } });
  }
}
