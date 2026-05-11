import { Injectable } from '@nestjs/common';
import prisma from '../../../prisma/prisma.client';

@Injectable()
export class LectureRepository {
  async findByChapter(chapterId: number) {
    return prisma.lectures.findMany({
      where: { chapter_id: chapterId },
      orderBy: { position: 'asc' },
    });
  }

  async findById(lectureId: number) {
    return prisma.lectures.findUnique({
      where: { id: lectureId },
      include: { chapters: { select: { course_id: true } } },
    });
  }

  async findOrderedChaptersWithLectures(courseId: number) {
    return prisma.chapter.findMany({
      where: { course_id: courseId },
      orderBy: { position: 'asc' },
      include: { lectures: { orderBy: { position: 'asc' } } },
    });
  }

  async create(data: {
    title: string;
    video_url: string;
    chapter_id: number;
    thumbnail_url: string;
    position: number;
    duration: number;
    is_published: boolean;
  }) {
    return prisma.lectures.create({ data });
  }

  async update(
    lectureId: number,
    data: Partial<{
      title: string;
      video_url: string;
      thumbnail_url: string;
      position: number;
      duration: number;
      is_published: boolean;
    }>,
  ) {
    return prisma.lectures.update({ where: { id: lectureId }, data });
  }

  async delete(lectureId: number) {
    return prisma.lectures.delete({ where: { id: lectureId } });
  }
}
