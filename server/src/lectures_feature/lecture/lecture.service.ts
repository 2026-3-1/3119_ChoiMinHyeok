import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LectureRepository } from './lecture.repository';
import { createLecture, updateLecture } from './dto/lecture.request';

@Injectable()
export class LectureService {
  constructor(private readonly lectureRepository: LectureRepository) {}

  async getLectures(chapterId: number) {
    return this.lectureRepository.findByChapter(chapterId);
  }

  async getLecture(lectureId: number) {
    const lecture = await this.lectureRepository.findById(lectureId);

    if (!lecture) {
      throw new NotFoundException();
    }
    if (lecture.id < 0) {
      throw new BadRequestException();
    }

    const chapters =
      await this.lectureRepository.findOrderedChaptersWithLectures(
        lecture.chapters.course_id,
      );

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
    await this.lectureRepository.create({
      title: data.title,
      video_url: data.videoUrl,
      chapter_id: data.chapterId,
      thumbnail_url: data.thumbnailUrl,
      position: data.position,
      duration: data.duration,
      is_published: data.isPublished,
    });
  }

  async updateLecture(lectureId: number, data: updateLecture) {
    const lecture = await this.lectureRepository.findById(lectureId);
    if (!lecture) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');

    return this.lectureRepository.update(lectureId, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.videoUrl !== undefined && { video_url: data.videoUrl }),
      ...(data.thumbnailUrl !== undefined && {
        thumbnail_url: data.thumbnailUrl,
      }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.isPublished !== undefined && { is_published: data.isPublished }),
    });
  }

  async deleteLecture(lectureId: number) {
    const lecture = await this.lectureRepository.findById(lectureId);
    if (!lecture) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');

    await this.lectureRepository.delete(lectureId);
  }
}
