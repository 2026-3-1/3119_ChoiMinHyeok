import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global.exception';

function makeHostMock(statusFn: jest.Mock, jsonFn: jest.Mock) {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getResponse: () => ({ status: statusFn, json: jsonFn }),
      getRequest: () => ({ method: 'GET', url: '/test' }),
    }),
  } as any;
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  });

  it('4xx 에러는 원래 메시지를 그대로 반환한다', () => {
    const OLD_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    filter.catch(
      new HttpException('잘못된 요청', HttpStatus.BAD_REQUEST),
      makeHostMock(statusMock, jsonMock),
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    const body = jsonMock.mock.calls[0][0];
    expect(body.message).toBe('잘못된 요청');

    process.env.NODE_ENV = OLD_ENV;
  });

  it('프로덕션 환경에서 500 에러는 generic 메시지를 반환한다', () => {
    const OLD_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    filter.catch(
      new HttpException('내부 DB 연결 실패 — 민감한 정보', HttpStatus.INTERNAL_SERVER_ERROR),
      makeHostMock(statusMock, jsonMock),
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    const body = jsonMock.mock.calls[0][0];
    expect(body.message).toBe('서버 오류가 발생했습니다.');
    expect(body.message).not.toContain('DB');

    process.env.NODE_ENV = OLD_ENV;
  });

  it('개발 환경에서 500 에러는 실제 메시지를 반환한다', () => {
    const OLD_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    filter.catch(
      new HttpException('내부 오류 상세', HttpStatus.INTERNAL_SERVER_ERROR),
      makeHostMock(statusMock, jsonMock),
    );

    const body = jsonMock.mock.calls[0][0];
    expect(body.message).toBe('내부 오류 상세');

    process.env.NODE_ENV = OLD_ENV;
  });

  it('응답에 path와 timestamp가 항상 포함된다', () => {
    filter.catch(
      new HttpException('not found', HttpStatus.NOT_FOUND),
      makeHostMock(statusMock, jsonMock),
    );

    const body = jsonMock.mock.calls[0][0];
    expect(body.path).toBe('/test');
    expect(body.method).toBe('GET');
    expect(body.timestamp).toBeDefined();
  });
});
