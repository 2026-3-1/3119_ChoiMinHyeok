import { ApiProperty } from "@nestjs/swagger"

export class chapter {
    @ApiProperty()
    id : number

    @ApiProperty()
    courseId : number

    @ApiProperty()
    title : string

    @ApiProperty()
    position : number
}
