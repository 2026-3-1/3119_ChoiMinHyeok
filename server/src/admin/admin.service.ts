import { Injectable } from '@nestjs/common';
import { Roles } from '../../prisma/generated/prisma/enums';
import { AdminRepository } from './admin.repository';
import {
  AdminCourseQueryRequest,
  AdminReportQueryRequest,
  AdminUserQueryRequest,
  ResolveReportRequest,
} from './dto/admin.request';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getDashboard() {
    return this.adminRepository.getDashboard();
  }

  async getUsers(query: AdminUserQueryRequest) {
    const { data, total } = await this.adminRepository.getUsers({
      search: query.search,
      role: query.role,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async deleteUser(userId: number) {
    await this.adminRepository.deleteUser(userId);
  }

  async banUser(userId: number) {
    await this.adminRepository.banUser(userId);
  }

  async changeUserRole(userId: number, role: Roles) {
    await this.adminRepository.changeUserRole(userId, role);
  }

  async getCourses(query: AdminCourseQueryRequest) {
    const { data, total } = await this.adminRepository.getCourses({
      search: query.search,
      categoryId: query.categoryId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: data.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        difficulty: c.difficulty,
        price: c.price,
        status: c.status,
        createdAt: c.created_at,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async setCourseStatus(courseId: number, status: string) {
    await this.adminRepository.setCourseStatus(courseId, status);
  }

  async deleteCourse(courseId: number) {
    await this.adminRepository.deleteCourse(courseId);
  }

  async getReports(query: AdminReportQueryRequest) {
    const { data, total } = await this.adminRepository.getReports({
      isResolved: query.isResolved,
      type: query.type,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: data.map((r) => ({
        id: r.id,
        type: r.type,
        content: r.content,
        isResolved: r.is_resolved,
        courseId: r.course_id,
        userId: r.user_id,
        createdAt: r.created_at,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async resolveReport(reportId: number, data: ResolveReportRequest) {
    await this.adminRepository.resolveReport(reportId, data.isResolved);
  }
}
