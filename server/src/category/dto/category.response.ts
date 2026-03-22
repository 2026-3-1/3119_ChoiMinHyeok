import { ApiProperty } from "@nestjs/swagger"

export class category {
    @ApiProperty()
    id : number

    @ApiProperty()
    name : string
}