import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterRequest } from './register.request';

async function validateDto(data: Partial<RegisterRequest>) {
  const obj = plainToInstance(RegisterRequest, data);
  return validate(obj);
}

const VALID_BASE = {
  name: '홍길동',
  email: 'test@example.com',
  password: 'Pass1234',
  role: 'STUDENT',
} as const;

describe('RegisterRequest — 비밀번호 복잡도', () => {
  it('영문+숫자 포함 8자 이상이면 통과한다', async () => {
    const errors = await validateDto(VALID_BASE);
    expect(errors.length).toBe(0);
  });

  it('숫자 없이 영문만이면 실패한다', async () => {
    const errors = await validateDto({ ...VALID_BASE, password: 'OnlyLetters' });
    const pwErr = errors.find((e) => e.property === 'password');
    expect(pwErr).toBeDefined();
  });

  it('영문 없이 숫자만이면 실패한다', async () => {
    const errors = await validateDto({ ...VALID_BASE, password: '12345678' });
    const pwErr = errors.find((e) => e.property === 'password');
    expect(pwErr).toBeDefined();
  });

  it('8자 미만이면 실패한다', async () => {
    const errors = await validateDto({ ...VALID_BASE, password: 'Ab1' });
    const pwErr = errors.find((e) => e.property === 'password');
    expect(pwErr).toBeDefined();
  });

  it('특수문자 포함도 통과한다', async () => {
    const errors = await validateDto({ ...VALID_BASE, password: 'Pass1234!@#' });
    expect(errors.length).toBe(0);
  });
});

describe('RegisterRequest — 역할 제한', () => {
  it('STUDENT는 허용된다', async () => {
    const errors = await validateDto({ ...VALID_BASE, role: 'STUDENT' });
    expect(errors.length).toBe(0);
  });

  it('INSTRUCTOR는 허용된다', async () => {
    const errors = await validateDto({ ...VALID_BASE, role: 'INSTRUCTOR' });
    expect(errors.length).toBe(0);
  });

  it('ADMIN은 허용되지 않는다', async () => {
    const errors = await validateDto({ ...VALID_BASE, role: 'ADMIN' as any });
    const roleErr = errors.find((e) => e.property === 'role');
    expect(roleErr).toBeDefined();
  });
});
