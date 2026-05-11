import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorRepository } from './instructor.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepository],
})
export class InstructorModule {}
