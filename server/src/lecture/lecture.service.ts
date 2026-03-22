import { Injectable } from "@nestjs/common";
import prisma from "prisma/prisma.client";

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
        return await prisma.lectures.findUnique({
            where : {
                id : lectureId
            }
        })
    }
}