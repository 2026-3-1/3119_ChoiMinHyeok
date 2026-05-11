import { Injectable } from '@nestjs/common';
import prisma from '../../../prisma/prisma.client';

@Injectable()
export class ChapterRepository {
  async findByCourse(courseId: number) {
    return prisma.chapter.findMany({
      where: { course_id: courseId },
      orderBy: { position: 'asc' },
    });
  }

  async findById(chapterId: number) {
    return prisma.chapter.findUnique({ where: { id: chapterId } });
  }

  async create(title: string, courseId: number, position: number) {
    return prisma.chapter.create({ data: { title, course_id: courseId, position } });
  }

  async update(chapterId: number, data: Partial<{ title: string; position: number }>) {
    return prisma.chapter.update({ where: { id: chapterId }, data });
  }

  async delete(chapterId: number) {
    return prisma.chapter.delete({ where: { id: chapterId } });
  }
}
