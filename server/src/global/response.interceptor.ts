import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map } from "rxjs";

@Injectable()
export class ResponseInterCeptor implements NestInterceptor{
    constructor(private readonly reflector: Reflector) {}
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {

    const response: Response = context.switchToHttp().getResponse();

    const message = this.reflector.get<string>('message', context.getHandler()) || '';
    
    return next.handle().pipe(
      map((data) => ({
        success: true,
        status: response.status,
        message: message,
        data: data,
      })),
    );
  }
}