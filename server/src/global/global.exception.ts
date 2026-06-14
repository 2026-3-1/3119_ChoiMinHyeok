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

      if (status >= 500) {
        this.log.error(exception.message, exception.stack);
        Sentry.captureException(exception);
      } else {
        this.log.warn(`${status} ${request.method} ${request.url} — ${exception.message}`);
      }

      return response.status(status).json({
        ...(typeof res === 'string' ? { message: res } : res),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      });
    }
  }
}
