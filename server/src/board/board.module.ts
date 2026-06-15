import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardRepository } from './board.repository';
import { BoardService } from './board.service';

@Module({
  controllers: [BoardController],
  providers: [BoardService, BoardRepository],
})
export class BoardModule {}
