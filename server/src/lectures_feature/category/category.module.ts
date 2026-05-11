import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
