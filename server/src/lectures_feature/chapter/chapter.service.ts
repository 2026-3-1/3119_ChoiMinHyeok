import { Injectable, NotFoundException } from '@nestjs/common';
import { ChapterRepository } from './chapter.repository';
import { createChapter, updateChapter } from './dto/chapter.request';

@Injectable()
export class ChapterService {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async getChapters(courseId: number) {
    return this.chapterRepository.findByCourse(courseId);
  }

  async getChapter(chapterId: number) {
    return this.chapterRepository.findById(chapterId);
  }

  async addChapter(data: createChapter) {
    await this.chapterRepository.create(data.title, data.courseId, data.position);
  }

  async updateChapter(chapterId: number, data: updateChapter) {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new NotFoundException('챕터를 찾을 수 없습니다.');

    return this.chapterRepository.update(chapterId, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.position !== undefined && { position: data.position }),
    });
  }

  async deleteChapter(chapterId: number) {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new NotFoundException('챕터를 찾을 수 없습니다.');

    await this.chapterRepository.delete(chapterId);
  }
}
