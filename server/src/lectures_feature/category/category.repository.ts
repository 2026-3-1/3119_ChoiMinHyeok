import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client';
import { CourseLifecycleStatus } from '../../../prisma/generated/prisma/enums';
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

  async findCourseById(courseId: number) {
    return prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        chapters: {
          orderBy: { position: 'asc' },
          include: {
            lectures: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                position: true,
                is_published: true,
              },
            },
          },
        },
      },
    });
  }

  async findCoursesByCategory(categoryId: number) {
    return prisma.courses.findMany({
      where: { category_id: categoryId, status: CourseLifecycleStatus.OPEN },
      orderBy: { created_at: 'desc' },
    });
  }

  async findCourses(search: string | undefined, categoryId: number | undefined, skip: number, take: number) {
    const where: Prisma.coursesWhereInput = {
      status: CourseLifecycleStatus.OPEN,
      ...(categoryId !== undefined && { category_id: categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [data, count] = await Promise.all([
      prisma.courses.findMany({ where, skip, take, orderBy: { created_at: 'desc' } }),
      prisma.courses.count({ where }),
    ]);

    return { data, count };
  }
}
