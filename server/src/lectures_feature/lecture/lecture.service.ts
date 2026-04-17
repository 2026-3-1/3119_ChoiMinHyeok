import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import prisma from '../../../prisma/prisma.client';
import { createLecture } from './dto/lecture.request';

@Injectable()
export class LectureService {
  async getLectures(chapterId: number) {
    return await prisma.lectures.findMany({
      where: {
        chapter_id: chapterId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getLecture(lectureId: number) {
    const lecture = await prisma.lectures.findUnique({
      where: {
        id: lectureId,
      },
      include: {
        chapters: {
          select: {
            course_id: true,
          },
        },
      },
    });

    if (!lecture) {
      throw new NotFoundException();
    }
    if (lecture.id < 0) {
      throw new BadRequestException();
    }

    const chapters = await prisma.chapter.findMany({
      where: {
        course_id: lecture.chapters.course_id,
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        lectures: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    const orderedLectures = chapters.flatMap((chapter) => chapter.lectures);
    const lectureIndex = orderedLectures.findIndex(
      (item) => item.id === lecture.id,
    );
    const nextLecture =
      lectureIndex >= 0 ? orderedLectures[lectureIndex + 1] : null;
    const prevLecture =
      lectureIndex > 0 ? orderedLectures[lectureIndex - 1] : null;

    return {
      lecture: {
        id: lecture.id,
        chapter_id: lecture.chapter_id,
        title: lecture.title,
        video_url: lecture.video_url,
        thumbnail_url: lecture.thumbnail_url,
        duration: lecture.duration,
        position: lecture.position,
        is_published: lecture.is_published,
        created_at: lecture.created_at,
      },
      nextLecture: nextLecture ? nextLecture.id : null,
      prevLecture: prevLecture ? prevLecture.id : null,
    };
  }

  async addLecture(data: createLecture) {
    await prisma.lectures.create({
      data: {
        title: data.title,
        video_url: data.videoUrl,
        chapter_id: data.chapterId,
        thumbnail_url: data.thumbnailUrl,
        position: data.position,
        duration: data.duration,
        is_published: data.isPublished,
      },
    });
  }
}
