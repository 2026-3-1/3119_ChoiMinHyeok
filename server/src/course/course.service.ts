import { Injectable } from '@nestjs/common';
import prisma from 'prisma/prisma.client';
import { createCourse, getCourse } from './dto/courses.request';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class CourseService {

    async addCourses(data : createCourse) {
        await prisma.courses.create({
            data: {
                title : data.title,
                description : data.description,
                instructor_id : data.instructorId,
                thumbnail : data.thumbnail,
                slug : data.slug ,
                difficulty : data.difficulty,
                category_id : data.categoryId,
                updated_at : new Date()
            }
        })
    }
    
    async getCourseDetail(courseId : number) {
        const course = await prisma.courses.findUnique({
            where : {
                id : courseId
            }
        })

        return course
    }

    async getCourses(
        query : getCourse
    ) {
        const page = Number(query.page)
        const limit = Number(query.limit)

        const skip = (query.page - 1) * query.limit;

        const where: Prisma.coursesWhereInput = {
            ...(query.categoryId !== undefined && {
            category_id: Number(query.categoryId),
            }),
            ...(query.search && {
            OR: [{
                    title: {
                        contains: query.search,
                        mode: Prisma.QueryMode.insensitive,
                    },
                },{
                    description: {
                        contains: query.search,
                        mode: Prisma.QueryMode.insensitive,
                    },
                },],
            }),
        };

        const [data, count] = await Promise.all([
            prisma.courses.findMany({
            where,
            skip,
            take: Number(query.limit),
            orderBy: {
                    created_at: 'desc',
                },
            },),
            prisma.courses.count({ where })
        ]);

        return {
            data,
            count,
            page,
            limit,
        };
    }
}
