import { Injectable } from '@nestjs/common';
import { LectureCommentRepository } from './lecture-comment.repository';

@Injectable()
export class LectureCommentService {
  constructor(private readonly repo: LectureCommentRepository) {}

  async getComments(lectureId: number) {
    const comments = await this.repo.findByLectureId(lectureId);
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.create_at,
      user: { id: c.users.id, name: c.users.name, role: c.users.role },
    }));
  }

  async createComment(userId: number, lectureId: number, content: string) {
    const comment = await this.repo.create({ userId, lectureId, content });
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.create_at,
      user: {
        id: comment.users.id,
        name: comment.users.name,
        role: comment.users.role,
      },
    };
  }

  async deleteComment(commentId: number, userId: number) {
    await this.repo.delete(commentId, userId);
  }
}
