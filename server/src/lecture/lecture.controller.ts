import { Controller, Get } from '@nestjs/common';
import { LectureService } from './lecture.service';

@Controller()
export class LectureController {
  constructor(private readonly lectureService : LectureService) {}

  @Get()
  getHello() {
    return this.lectureService.getLecture();
  }
}
