import { Injectable } from '@nestjs/common';
import prisma from '../../../prisma/prisma.client';
import { createChapter } from './dto/chapter.request';

@Injectable()
export class ChapterService {
  async getChapters(courseId: number) {
    return await prisma.chapter.findMany({
      where: {
        course_id: courseId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getChapter(chapterId: number) {
    return await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });
  }

  async addChapter(data: createChapter) {
    await prisma.chapter.create({
      data: {
        title: data.title,
        course_id: data.courseId,
        position: data.position,
      },
    });
  }
}
