import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import prisma from '../../../prisma/prisma.client';

@Injectable()
export class LectureCommentRepository {
  async findByLectureId(lectureId: number) {
    return prisma.lecture_comment.findMany({
      where: { lecture_id: lectureId },
      include: {
        users: { select: { id: true, name: true, role: true } },
      },
      orderBy: { create_at: 'desc' },
    });
  }

  async create(data: { userId: number; lectureId: number; content: string }) {
    return prisma.lecture_comment.create({
      data: {
        user_id: data.userId,
        lecture_id: data.lectureId,
        content: data.content,
      },
      include: {
        users: { select: { id: true, name: true, role: true } },
      },
    });
  }

  async findById(commentId: number) {
    const comment = await prisma.lecture_comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    return comment;
  }

  async delete(commentId: number, userId: number) {
    const comment = await this.findById(commentId);
    if (comment.user_id !== userId)
      throw new ForbiddenException('본인 댓글만 삭제할 수 있습니다.');
    return prisma.lecture_comment.delete({ where: { id: commentId } });
  }
}
