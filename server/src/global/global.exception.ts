import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const type = host.getType();

    if (type === 'http') {
      this.handleHttpException(exception, host);
      return;
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const isProd = process.env.NODE_ENV === 'production';

      if (status >= 500) {
        this.log.error(exception.message, exception.stack);
        Sentry.captureException(exception);
      } else {
        this.log.warn(
          `${status} ${request.method} ${request.url} — ${exception.message}`,
        );
      }

      const body =
        typeof res === 'string'
          ? { message: isProd && status >= 500 ? '서버 오류가 발생했습니다.' : res }
          : { ...res, ...(isProd && status >= 500 ? { message: '서버 오류가 발생했습니다.' } : {}) };

      return response.status(status).json({
        ...body,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      });
    }
  }
}
