import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import prisma from "prisma/prisma.client";
import { createLecture } from "./dto/lecture.request";

@Injectable()
export class LectureService {
    async getLectures(chapterId : number) {
        return await prisma.lectures.findMany({
            where : {
                chapter_id : chapterId
            }
        })
    }

    async getLecture(lectureId : number) {
        const lecture = await prisma.lectures.findUnique({
            where : {
                id : lectureId
            }
        })

        if(!lecture) {
            throw new NotFoundException()
        }
        if(lecture.id < 0) {
            throw new BadRequestException()
        }

        const nextLectureId = lecture.id + 1
        const prevLectureId = lecture.id - 1

        const nextLecture = await prisma.lectures.findUnique({
            where:{
                id : nextLectureId
            }
        })
        const prevLecture = await prisma.lectures.findUnique({
            where : {
                id : prevLectureId
            }
        })

        return {
            lecture : lecture,
            nextLecture : nextLecture?.id,
            prevLecture : prevLecture?.id
        }
    }

    async addLecture(data : createLecture) {
        await prisma.lectures.create({
            data : {
                title: data.title,
                video_url: data.videoUrl,
                chapter_id: data.chapterId,
                thumbnail_url: data.thumbnailUrl,
                position: data.position,
                duration: data.duration,
                is_published: data.isPublished,
            }
        })
    }
}