import { Injectable } from '@nestjs/common';
import prisma from 'prisma/prisma.client';
import { createCourse } from './dto/courses.request';

@Injectable()
export class CourseService {

    async createCourses(data : createCourse) {
        await prisma.courses.create({
            data: {
                title : data.title,
                description : data.description,
                instructor : data.instructor,
                thumbnail : data.thumbnail,
                difficulty : data.difficulty,
                category_id : data.categoryId
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

    async getCourses(categoryId? : number, keyword? : string) {
        return prisma.courses.findMany({
            where: {
                ...(categoryId && {
                    category_id: categoryId,
                }),
                ...(keyword && {
                    OR: [{
                            title: {
                            contains: keyword,
                            mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                            contains: keyword,
                            mode: 'insensitive',
                            },
                    },],
                }),
            },
        })
    }
}
