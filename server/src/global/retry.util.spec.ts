import { withRetry } from './retry.util';

// setTimeout을 즉시 실행으로 대체해 테스트 속도 향상
jest.spyOn(global, 'setTimeout').mockImplementation((fn: () => void) => {
  fn();
  return 0 as any;
});

describe('withRetry', () => {
  afterAll(() => jest.restoreAllMocks());

  it('성공 시 바로 값을 반환한다', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('첫 번째 실패 후 재시도하여 성공한다', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('일시 오류'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('maxAttempts 초과 시 마지막 에러를 던진다', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('계속 실패'));

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 }),
    ).rejects.toThrow('계속 실패');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
