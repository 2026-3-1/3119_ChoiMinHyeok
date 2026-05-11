import { Injectable } from '@nestjs/common';
import { ReportRepository } from './report.repository';
import { CreateReportRequest } from './dto/report.request';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(courseId: number, data: CreateReportRequest) {
    await this.reportRepository.assertCourseExists(courseId);
    await this.reportRepository.assertUserExists(data.userId);
    await this.reportRepository.assertNotAlreadyReported(courseId, data.userId);

    const report = await this.reportRepository.createReport(
      courseId,
      data.userId,
      data.type,
      data.content,
    );

    return {
      id: report.id,
      courseId: report.course_id,
      userId: report.user_id,
      type: report.type,
      content: report.content,
      isResolved: report.is_resolved,
      createdAt: report.created_at,
    };
  }
}
