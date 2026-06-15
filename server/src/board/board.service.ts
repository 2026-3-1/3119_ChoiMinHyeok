import { ForbiddenException, Injectable } from '@nestjs/common';
import { Roles } from '../../prisma/generated/prisma/enums';
import { BoardRepository } from './board.repository';
import {
  BoardQueryRequest,
  CreateCommentRequest,
  CreatePostRequest,
  UpdateCommentRequest,
  UpdatePostRequest,
} from './dto/board.request';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async getPosts(query: BoardQueryRequest) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.boardRepository.getPosts({
      search: query.search,
      page,
      limit,
    });

    return {
      data: data.map((p) => ({
        id: p.id,
        title: p.title,
        isAnnouncement: p.is_announcement,
        commentCount: p._count.board_comments,
        author: { id: p.users.id, name: p.users.name, role: p.users.role },
        createdAt: p.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPost(postId: number) {
    const post = await this.boardRepository.getPost(postId);
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      isAnnouncement: post.is_announcement,
      author: { id: post.users.id, name: post.users.name, role: post.users.role },
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      comments: post.board_comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: { id: c.users.id, name: c.users.name, role: c.users.role },
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
    };
  }

  async createPost(
    userId: number,
    userRole: string,
    body: CreatePostRequest,
    isAnnouncement: boolean,
  ) {
    if (isAnnouncement && userRole !== Roles.ADMIN) {
      throw new ForbiddenException('공지사항은 관리자만 작성할 수 있습니다.');
    }
    if (!isAnnouncement && userRole !== Roles.STUDENT) {
      throw new ForbiddenException('일반 게시글은 학생만 작성할 수 있습니다.');
    }

    return this.boardRepository.createPost({
      title: body.title,
      content: body.content,
      userId,
      isAnnouncement,
    });
  }

  async updatePost(
    postId: number,
    userId: number,
    userRole: string,
    body: UpdatePostRequest,
  ) {
    return this.boardRepository.updatePost(
      postId,
      userId,
      userRole === Roles.ADMIN,
      body,
    );
  }

  async deletePost(postId: number, userId: number, userRole: string) {
    return this.boardRepository.deletePost(
      postId,
      userId,
      userRole === Roles.ADMIN,
    );
  }

  async createComment(
    postId: number,
    userId: number,
    body: CreateCommentRequest,
  ) {
    return this.boardRepository.createComment({
      content: body.content,
      userId,
      postId,
    });
  }

  async updateComment(
    commentId: number,
    userId: number,
    userRole: string,
    body: UpdateCommentRequest,
  ) {
    return this.boardRepository.updateComment(
      commentId,
      userId,
      userRole === Roles.ADMIN,
      body.content,
    );
  }

  async deleteComment(commentId: number, userId: number, userRole: string) {
    return this.boardRepository.deleteComment(
      commentId,
      userId,
      userRole === Roles.ADMIN,
    );
  }
}
