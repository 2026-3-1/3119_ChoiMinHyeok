import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/prisma/client';
import prisma from '../../../prisma/prisma.client';
import { createCourse, getCourse } from './dto/courses.request';

@Injectable()
export class CourseService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 12;
  private readonly maxLimit = 100;

  async addCourses(data: createCourse) {
    if (data.minEnrollment > data.maxCapacity) {
      throw new BadRequestException(
        '최소 개설 인원은 최대 수강 인원보다 클 수 없습니다.',
      );
    }

    const [category, existingCourse] = await Promise.all([
      prisma.categories.findUnique({
        where: {
          id: data.categoryId,
        },
      }),
      prisma.courses.findUnique({
        where: {
          slug: data.slug,
        },
      }),
    ]);

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    if (existingCourse) {
      throw new BadRequestException('이미 사용 중인 슬러그입니다.');
    }

    await prisma.courses.create({
      data: {
        title: data.title,
        description: data.description,
        instructor_id: data.instructorId,
        thumbnail: data.thumbnail,
        slug: data.slug,
        difficulty: data.difficulty,
        category_id: data.categoryId,
        price: data.price,
        rating: 0,
        max_capacity: data.maxCapacity,
        min_enrollment: data.minEnrollment,
      },
    });
  }

  async getCourseDetail(courseId: number) {
    const course = await prisma.courses.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    return course;
  }

  async getCourses(query: getCourse) {
    const rawPage = Number(query.page);
    const rawLimit = Number(query.limit);
    const rawCategoryId = Number(query.categoryId);
    const page =
      Number.isInteger(rawPage) && rawPage > 0 ? rawPage : this.defaultPage;
    const limit =
      Number.isInteger(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, this.maxLimit)
        : this.defaultLimit;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();
    const categoryId =
      Number.isInteger(rawCategoryId) && rawCategoryId > 0
        ? rawCategoryId
        : undefined;

    const where: Prisma.coursesWhereInput = {
      ...(categoryId !== undefined && {
        category_id: categoryId,
      }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [data, count] = await Promise.all([
      prisma.courses.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.courses.count({ where }),
    ]);

    return {
      data,
      count,
      page,
      limit,
    };
  }
}
