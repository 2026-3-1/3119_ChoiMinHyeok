import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { LectureService } from "./lecture.service";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ResponseMessage } from "src/global/decorator/message.decorator";
import { SwaggerResponse } from "src/global/decorator/swagger.response";
import { lecture } from "./dto/lecture.response";

@ApiTags('lectures')
@Controller('/api/v1')
export class LectureController {
    constructor(
        private lectureService : LectureService
    ) {}

    @ResponseMessage('강의 영상 목록 조회 완료')
    @Get('chapters/:chapterId/lectures')
    @ApiOperation({ summary : '강의 영상 목록 조회' })
    @ApiParam({ name : 'chapterId', required : true, type : Number })
    @SwaggerResponse(lecture, true, 200, '강의 영상 목록 조회 완료')
    getLectures(@Param('chapterId', ParseIntPipe) chapterId : number) {
        return this.lectureService.getLectures(chapterId)
    }

    @ResponseMessage('강의 영상 단건 조회 완료')
    @Get('lectures/:lectureId')
    @ApiOperation({ summary : '강의 영상 단건 조회' })
    @ApiParam({ name : 'lectureId', required : true, type : Number })
    @SwaggerResponse(lecture, false, 200, '강의 영상 단건 조회 완료')
    getLecture(@Param('lectureId', ParseIntPipe) lectureId : number) {
        return this.lectureService.getLecture(lectureId)
    }
}