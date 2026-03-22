import { ApiProperty } from "@nestjs/swagger"
import { difficulty } from "src/global/enum/lecture.difficulty"

export class course {
    @ApiProperty()
    id: number

    @ApiProperty()
    title: string

    @ApiProperty()
    description: string
    
    @ApiProperty()
    instructor: string

    @ApiProperty()
    thumbnail: string

    @ApiProperty()
    difficulty: difficulty

    @ApiProperty()
    categorId: number
    
    @ApiProperty()
    createdAt: Date
    
    @ApiProperty()
    updatedAt: Date
}