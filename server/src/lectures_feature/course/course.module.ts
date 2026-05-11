import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
})
export class CourseModule {}
