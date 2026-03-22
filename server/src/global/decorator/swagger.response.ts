import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function SwaggerResponse<TModel extends Type<any>>(
    model: TModel,
    isArray: boolean = false,
    status: number,
    message: string,
) {
    return applyDecorators(
        ApiExtraModels(model),
        ApiOkResponse({
            schema: {
                properties: {
                success: { type: 'boolean', example: true },
                status: { type : 'number', example: status },
                message: { type: 'string', example: message },
                data: isArray
                    ? {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                    }
                    : {
                        $ref: getSchemaPath(model),
                    },
                },
            },
        }),
    );
}