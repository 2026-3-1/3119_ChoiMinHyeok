import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseMessage } from "src/global/decorator/message.decorator";
import { ChapterService } from "./chapter.service";
import { SwaggerResponse } from "src/global/decorator/swagger.response";
import { chapter } from "./dto/chapter.response";

@ApiTags('chapters')
@Controller('/api/v1')
export class ChapterController {
    constructor(
        private chapterService : ChapterService
    ) {}

    @ResponseMessage('챕터 목록 조회 성공')
    @Get('corses/:courseId/chapters')
    @ApiOperation({ summary : '챕터 목록 조회' })
    @SwaggerResponse(chapter, true, 200, '챕터 목록 조회 성공')
    getChapters(@Param('courseId', ParseIntPipe) courseId : number) {
        return this.chapterService.getChapters(courseId)
    }

    @ResponseMessage('챕터 단건 조회 성공')
    @Get('chapters/:chapterId')
    @ApiOperation({ summary : '챕터 단건 조회' })
    @SwaggerResponse(chapter, false, 200, '챕터 단건 조회 성공')
    getChapter(@Param('chapterId', ParseIntPipe) chapterId : number) {
        return this.chapterService.getChapter(chapterId)
    }

}
