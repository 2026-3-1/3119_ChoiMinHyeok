import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import prisma from '../prisma/prisma.client';
import {
  closeYoutubeSeedPrisma,
  seedYoutubeTestData,
  type YoutubeTestSeedResult,
} from '../prisma/youtube-test-seed.lib';
import { AppModule } from '../src/app.module';

jest.setTimeout(120000);

describe('Commerce + Learning flow (e2e)', () => {
  let app: INestApplication<App>;
  let seeded: YoutubeTestSeedResult;
  let userId: number;

  beforeAll(async () => {
    seeded = await seedYoutubeTestData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    );
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'E2E Student',
        email: 'e2e-student@example.com',
        password: 'password123!',
        roles: 'STUDENT',
        description: 'e2e test user',
      })
      .expect(201);

    userId = registerResponse.body.data.id;
  });

  afterAll(async () => {
    await prisma.lecture_playback_history.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.lecture_bookmark.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.lectures_progress.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.course_comment.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.enrollment_history.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.enrollments.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.payment_transactions.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.order_items.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.orders.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.cart_items.deleteMany({
      where: {
        user_id: userId,
      },
    });
    await prisma.users.delete({
      where: {
        id: userId,
      },
    });
    await app.close();
    await closeYoutubeSeedPrisma();
  });

  it('supports cart checkout, progress, review, bookmark, refund, and course cancellation', async () => {
    const webCourse = seeded.categories.find(
      (category) => category.name === 'web',
    )!.courses[0];
    const pwnCourse = seeded.categories.find(
      (category) => category.name === 'pwn',
    )!.courses[0];

    const addFirstCartItemResponse = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .send({
        userId,
        courseId: webCourse.id,
      })
      .expect(201);

    expect(addFirstCartItemResponse.body.data.totalCount).toBe(1);

    const addSecondCartItemResponse = await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .send({
        userId,
        courseId: pwnCourse.id,
      })
      .expect(201);

    const cartItemIds = addSecondCartItemResponse.body.data.items.map(
      (item: { id: number }) => item.id,
    );

    expect(cartItemIds).toHaveLength(2);

    const checkoutResponse = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .send({
        userId,
        cartItemIds,
        provider: 'TOSS',
        paymentKey: 'test-payment-key',
        providerOrderId: 'test-order-id',
      })
      .expect(201);

    expect(checkoutResponse.body.data.items).toHaveLength(2);
    expect(
      checkoutResponse.body.data.payment_transactions[0].transaction_type,
    ).toBe('PAYMENT');

    const courseLearningBeforeProgress = await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}/courses/${webCourse.id}/learning-status`)
      .expect(200);

    expect(courseLearningBeforeProgress.body.data.isEnrolled).toBe(true);
    expect(courseLearningBeforeProgress.body.data.progressPercent).toBe(0);

    const lectureDetails = await Promise.all(
      webCourse.chapters.map(async (chapter) => {
        const lecturesResponse = await request(app.getHttpServer())
          .get(`/api/v1/chapters/${chapter.id}/lectures`)
          .expect(200);

        return lecturesResponse.body.data[0] as {
          id: number;
          duration: number;
        };
      }),
    );

    for (const lecture of lectureDetails) {
      await request(app.getHttpServer())
        .put(`/api/v1/lectures/${lecture.id}/progress`)
        .send({
          userId,
          lastPosition: lecture.duration,
          watchedSeconds: lecture.duration,
          eventType: 'COMPLETED',
        })
        .expect(200);
    }

    const lectureProgressResponse = await request(app.getHttpServer())
      .get(`/api/v1/lectures/${lectureDetails[0].id}/progress`)
      .query({ userId })
      .expect(200);

    expect(lectureProgressResponse.body.data.progress).toBe(100);

    const courseLearningAfterProgress = await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}/courses/${webCourse.id}/learning-status`)
      .expect(200);

    expect(courseLearningAfterProgress.body.data.progressPercent).toBe(100);
    expect(courseLearningAfterProgress.body.data.canWriteReview).toBe(true);

    const bookmarkResponse = await request(app.getHttpServer())
      .post(`/api/v1/lectures/${lectureDetails[0].id}/bookmarks`)
      .send({
        userId,
        position: 120,
        note: '중요 구간',
      })
      .expect(201);

    expect(bookmarkResponse.body.data).toHaveLength(1);

    const historyResponse = await request(app.getHttpServer())
      .get(`/api/v1/lectures/${lectureDetails[0].id}/history`)
      .query({ userId })
      .expect(200);

    expect(historyResponse.body.data.length).toBeGreaterThan(0);

    const reviewResponse = await request(app.getHttpServer())
      .post(`/api/v1/courses/${webCourse.id}/reviews`)
      .send({
        userId,
        title: '실전 흐름이 좋은 강의',
        content: '챕터 구성이 좋아서 완강하기 쉬웠습니다.',
        star: 5,
      })
      .expect(201);

    expect(reviewResponse.body.data[0].star).toBe(5);

    const ordersBeforeRefund = await request(app.getHttpServer())
      .get('/api/v1/orders')
      .query({ userId })
      .expect(200);

    const firstOrder = ordersBeforeRefund.body.data[0];
    const pwnOrderItem = firstOrder.items.find(
      (item: { course: { id: number } }) => item.course.id === pwnCourse.id,
    );

    const partialRefundResponse = await request(app.getHttpServer())
      .post(`/api/v1/orders/${firstOrder.id}/cancel`)
      .send({
        userId,
        orderItemIds: [pwnOrderItem.id],
        reason: 'USER_REQUEST',
        reasonDetail: '수강 계획 변경',
      })
      .expect(200);

    expect(partialRefundResponse.body.data.status).toBe('PARTIALLY_REFUNDED');
    expect(
      partialRefundResponse.body.data.payment_transactions.some(
        (transaction: { transaction_type: string }) =>
          transaction.transaction_type === 'REFUND',
      ),
    ).toBe(true);

    const courseCancelResponse = await request(app.getHttpServer())
      .post(`/api/v1/courses/${webCourse.id}/cancel`)
      .send({
        reason: 'UNDER_ENROLLED',
        note: '최소 인원 미달',
      })
      .expect(200);

    expect(courseCancelResponse.body.data.courseId).toBe(webCourse.id);
    expect(courseCancelResponse.body.data.refundedEnrollmentCount).toBe(1);

    const ordersAfterCourseCancel = await request(app.getHttpServer())
      .get('/api/v1/orders')
      .query({ userId })
      .expect(200);

    expect(ordersAfterCourseCancel.body.data[0].status).toBe('REFUNDED');

    const myLearningResponse = await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}/learning`)
      .expect(200);

    expect(myLearningResponse.body.data).toHaveLength(0);
  });
});
