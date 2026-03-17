import { Get, Injectable, Post } from '@nestjs/common';

@Injectable()
export class LectureService {

    @Get('letures')
    getLecture(){
        return {
            title: "lecture Test",
            url : "https://exmaple/a12fdsq2dfsa34" 
        };
    }

    @Post('lectures')
    createLecture(){
        
    }
}
