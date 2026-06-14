import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserManager } from './user.manager';

const mockRepo = {
  findUserByEmail: jest.fn(),
};

describe('UserManager', () => {
  let manager: UserManager;

  beforeEach(() => {
    manager = new UserManager(mockRepo as any);
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('bcrypt로 해싱된 문자열을 반환한다', async () => {
      const hash = await manager.hashPassword('Test1234!');
      expect(hash).not.toBe('Test1234!');
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('saltRounds가 12 이상이다', async () => {
      const hash = await manager.hashPassword('Test1234!');
      const cost = parseInt(hash.split('$')[2], 10);
      expect(cost).toBeGreaterThanOrEqual(12);
    });

    it('동일한 비밀번호라도 매번 다른 해시를 생성한다', async () => {
      const a = await manager.hashPassword('Test1234!');
      const b = await manager.hashPassword('Test1234!');
      expect(a).not.toBe(b);
    });
  });

  describe('comparePassword', () => {
    it('원본 비밀번호와 해시가 일치하면 true를 반환한다', async () => {
      const hash = await bcrypt.hash('Test1234!', 12);
      const result = await manager.comparePassword('Test1234!', hash);
      expect(result).toBe(true);
    });

    it('비밀번호가 다르면 false를 반환한다', async () => {
      const hash = await bcrypt.hash('Test1234!', 12);
      const result = await manager.comparePassword('WrongPass!', hash);
      expect(result).toBe(false);
    });
  });

  describe('verifyUser', () => {
    it('이메일이 존재하지 않으면 BadRequestException을 던진다', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      await expect(manager.verifyUser('no@one.com', 'Test1234!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('비밀번호가 틀리면 BadRequestException을 던진다', async () => {
      const hash = await bcrypt.hash('Test1234!', 12);
      mockRepo.findUserByEmail.mockResolvedValue({ id: 1, password: hash });
      await expect(manager.verifyUser('user@example.com', 'WrongPass!')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('이메일과 비밀번호가 맞으면 유저 객체를 반환한다', async () => {
      const hash = await bcrypt.hash('Test1234!', 12);
      const user = { id: 1, email: 'user@example.com', password: hash };
      mockRepo.findUserByEmail.mockResolvedValue(user);
      const result = await manager.verifyUser('user@example.com', 'Test1234!');
      expect(result).toEqual(user);
    });
  });
});
