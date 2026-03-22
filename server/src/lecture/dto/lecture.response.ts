import { ApiProperty } from "@nestjs/swagger"

export class lecture {
    @ApiProperty()
    id: number

    @ApiProperty()
    chapter_id: number
    
    @ApiProperty()
    title: string

    @ApiProperty()
    video_url: string
    
    @ApiProperty()
    duration: number
    
    @ApiProperty()
    position: number
    
    @ApiProperty()
    is_published: boolean
    
    @ApiProperty()
    created_at: Date
}