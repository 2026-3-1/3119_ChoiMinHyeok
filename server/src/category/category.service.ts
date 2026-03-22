import { Injectable } from "@nestjs/common";
import prisma from "prisma/prisma.client";
import { createCategory } from "./dto/category.request";

@Injectable()
export class CategoryService {
    async getCategories() {
        return await prisma.categories.findMany()
    }

    async getCourseByCategories(categoryId : number) {
        return await prisma.courses.findMany({
            where: {
                category_id: categoryId
            }
        })
    }

    async createCategory(data : createCategory) {
        await prisma.categories.create({
            data : {
                name : data.name
            }
        })
    }
}