import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export function SwaggerResponse(
  model: Type<unknown> | null,
  isArray = false,
  status: number,
  message: string,
) {
  const dataSchema = !model
    ? {
        nullable: true,
        example: null,
      }
    : isArray
      ? {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        }
      : {
          $ref: getSchemaPath(model),
        };

  return applyDecorators(
    ...(model ? [ApiExtraModels(model)] : []),
    ApiResponse({
      status,
      description: message,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          status: { type: 'number', example: status },
          message: { type: 'string', example: message },
          data: dataSchema,
        },
      },
    }),
  );
}
