import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePostRequest {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
}

export class UpdatePostRequest {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
}

export class CreateCommentRequest {
  @ApiProperty() @IsString() content: string;
}

export class UpdateCommentRequest {
  @ApiProperty() @IsString() content: string;
}

export class BoardQueryRequest {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 20;
}
