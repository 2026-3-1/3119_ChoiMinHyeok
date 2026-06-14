import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentRepository } from './enrollment.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentRepository],
})
export class EnrollmentModule {}
