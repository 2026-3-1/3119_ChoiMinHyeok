import { Injectable } from "@nestjs/common";
import prisma from "prisma/prisma.client";

@Injectable()
export class ChapterService {
    async getChapters(courseId : number) {
        return await prisma.chapter.findMany({
            where : {
                course_id : courseId
            }
        })
    }

    async getChapter(chapterId : number) {
        return await prisma.chapter.findUnique({
            where : {
                id : chapterId  
            }
        })
    }
}