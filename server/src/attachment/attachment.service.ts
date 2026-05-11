import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentRepository } from './attachment.repository';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    instructorId: number,
    lectureId: number,
    file: Express.Multer.File,
  ) {
    const canAccess = await this.attachmentRepository.isEnrolledOrInstructor(
      instructorId,
      lectureId,
    );
    if (!canAccess) {
      throw new ForbiddenException('본인 강의에만 파일을 업로드할 수 있습니다.');
    }

    const storedName = await this.storageService.save(
      file.buffer,
      file.originalname,
    );

    const attachment = await this.attachmentRepository.create({
      lectureId,
      filename: file.originalname,
      storedName,
      mimeType: file.mimetype,
      size: file.size,
    });

    return this.toResponse(attachment);
  }

  async remove(instructorId: number, attachmentId: number) {
    const attachment =
      await this.attachmentRepository.findByIdWithCourse(attachmentId);

    if (attachment.lectures.chapters.courses.instructor_id !== instructorId) {
      throw new ForbiddenException('본인 강의의 파일만 삭제할 수 있습니다.');
    }

    await this.storageService.remove(attachment.stored_name);
    await this.attachmentRepository.delete(attachmentId);
  }

  async listByLecture(lectureId: number) {
    const attachments =
      await this.attachmentRepository.findByLectureId(lectureId);
    return attachments.map(this.toResponse);
  }

  async getDownloadStream(userId: number, attachmentId: number) {
    const attachment =
      await this.attachmentRepository.findByIdWithCourse(attachmentId);

    const lectureId = attachment.lecture_id;
    const canAccess = await this.attachmentRepository.isEnrolledOrInstructor(
      userId,
      lectureId,
    );

    if (!canAccess) {
      throw new ForbiddenException('수강 중인 강의의 파일만 다운로드할 수 있습니다.');
    }

    return {
      stream: this.storageService.createReadStream(attachment.stored_name),
      filename: attachment.filename,
      mimeType: attachment.mime_type,
      size: attachment.size,
    };
  }

  private toResponse(attachment: {
    id: number;
    filename: string;
    mime_type: string;
    size: number;
    created_at: Date;
  }) {
    return {
      id: attachment.id,
      filename: attachment.filename,
      mimeType: attachment.mime_type,
      size: attachment.size,
      createdAt: attachment.created_at,
    };
  }
}
