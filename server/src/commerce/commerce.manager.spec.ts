import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommerceManager } from './commerce.manager';

describe('CommerceManager', () => {
  let manager: CommerceManager;

  beforeEach(() => {
    manager = new CommerceManager();
  });

  describe('assertCourseExists', () => {
    it('강의가 null이면 NotFoundException을 던진다', () => {
      expect(() => manager.assertCourseExists(null)).toThrow(NotFoundException);
    });

    it('강의가 있으면 예외를 던지지 않는다', () => {
      expect(() =>
        manager.assertCourseExists({ id: 1, status: 'OPEN' }),
      ).not.toThrow();
    });
  });

  describe('assertCourseOpen', () => {
    it('OPEN 상태가 아니면 BadRequestException을 던진다', () => {
      expect(() => manager.assertCourseOpen({ status: 'CANCELED' })).toThrow(
        BadRequestException,
      );
      expect(() => manager.assertCourseOpen({ status: 'DRAFT' })).toThrow(
        BadRequestException,
      );
    });

    it('OPEN 상태면 예외를 던지지 않는다', () => {
      expect(() => manager.assertCourseOpen({ status: 'OPEN' })).not.toThrow();
    });
  });

  describe('assertEnrollmentAbsent', () => {
    it('이미 수강 중이면 BadRequestException을 던진다', () => {
      expect(() => manager.assertEnrollmentAbsent({ id: 1 })).toThrow(
        BadRequestException,
      );
    });

    it('수강 중이 아니면 예외를 던지지 않는다', () => {
      expect(() => manager.assertEnrollmentAbsent(null)).not.toThrow();
    });
  });

  describe('assertCheckoutCartItemsFound', () => {
    it('요청한 항목 수와 실제 항목 수가 다르면 BadRequestException', () => {
      expect(() => manager.assertCheckoutCartItemsFound([], [1, 2])).toThrow(
        BadRequestException,
      );
    });

    it('요청한 항목 수와 실제 항목 수가 같으면 예외 없음', () => {
      const cartItem = {
        id: 1,
        course_id: 1,
        user_id: 1,
        status: 'ACTIVE' as any,
        added_at: new Date(),
        updated_at: new Date(),
        checked_out_at: null,
        courses: { id: 1, status: 'OPEN' } as any,
      };
      expect(() =>
        manager.assertCheckoutCartItemsFound([cartItem], [1]),
      ).not.toThrow();
    });
  });

  describe('assertNoDuplicatePurchasedCourses', () => {
    it('이미 구매한 강의가 있으면 BadRequestException', () => {
      expect(() =>
        manager.assertNoDuplicatePurchasedCourses([{ id: 1 }]),
      ).toThrow(BadRequestException);
    });

    it('구매 이력이 없으면 예외 없음', () => {
      expect(() => manager.assertNoDuplicatePurchasedCourses([])).not.toThrow();
    });
  });

  describe('createOrderNumber', () => {
    it('ORD- 로 시작하는 주문번호를 생성한다', () => {
      const orderNumber = manager.createOrderNumber();
      expect(orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{6}$/);
    });

    it('두 번 생성하면 서로 다른 주문번호가 나온다', () => {
      const a = manager.createOrderNumber();
      const b = manager.createOrderNumber();
      expect(a).not.toBe(b);
    });
  });

  describe('getProvider', () => {
    it('provider가 없으면 TOSS를 반환한다', () => {
      expect(manager.getProvider(undefined)).toBe('TOSS');
    });

    it('provider가 있으면 그대로 반환한다', () => {
      expect(manager.getProvider('DEMO' as any)).toBe('DEMO');
    });
  });
});
