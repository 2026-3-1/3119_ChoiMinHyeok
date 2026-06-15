import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../prisma/generated/prisma/client';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class BoardRepository {
  // ─── Posts ───────────────────────────────────────────────────────────────

  async getPosts(params: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.board_postsWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.board_posts.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ is_announcement: 'desc' }, { created_at: 'desc' }],
        select: {
          id: true,
          title: true,
          is_announcement: true,
          created_at: true,
          users: { select: { id: true, name: true, role: true } },
          _count: { select: { board_comments: true } },
        },
      }),
      prisma.board_posts.count({ where }),
    ]);

    return { data, total };
  }

  async getPost(postId: number) {
    const post = await prisma.board_posts.findUnique({
      where: { id: postId },
      include: {
        users: { select: { id: true, name: true, role: true } },
        board_comments: {
          orderBy: { created_at: 'asc' },
          include: {
            users: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    return post;
  }

  async createPost(data: {
    title: string;
    content: string;
    userId: number;
    isAnnouncement: boolean;
  }) {
    return prisma.board_posts.create({
      data: {
        title: data.title,
        content: data.content,
        user_id: data.userId,
        is_announcement: data.isAnnouncement,
      },
    });
  }

  async updatePost(
    postId: number,
    userId: number,
    isAdmin: boolean,
    data: { title?: string; content?: string },
  ) {
    const post = await prisma.board_posts.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (!isAdmin && post.user_id !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');

    return prisma.board_posts.update({ where: { id: postId }, data });
  }

  async deletePost(postId: number, userId: number, isAdmin: boolean) {
    const post = await prisma.board_posts.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (!isAdmin && post.user_id !== userId)
      throw new ForbiddenException('삭제 권한이 없습니다.');

    return prisma.board_posts.delete({ where: { id: postId } });
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async createComment(data: {
    content: string;
    userId: number;
    postId: number;
  }) {
    const post = await prisma.board_posts.findUnique({
      where: { id: data.postId },
    });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');

    return prisma.board_comments.create({
      data: {
        content: data.content,
        user_id: data.userId,
        post_id: data.postId,
      },
      include: { users: { select: { id: true, name: true, role: true } } },
    });
  }

  async updateComment(
    commentId: number,
    userId: number,
    isAdmin: boolean,
    content: string,
  ) {
    const comment = await prisma.board_comments.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (!isAdmin && comment.user_id !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');

    return prisma.board_comments.update({
      where: { id: commentId },
      data: { content },
      include: { users: { select: { id: true, name: true, role: true } } },
    });
  }

  async deleteComment(commentId: number, userId: number, isAdmin: boolean) {
    const comment = await prisma.board_comments.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (!isAdmin && comment.user_id !== userId)
      throw new ForbiddenException('삭제 권한이 없습니다.');

    return prisma.board_comments.delete({ where: { id: commentId } });
  }
}
