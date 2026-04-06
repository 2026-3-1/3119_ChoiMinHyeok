import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  closeYoutubeSeedPrisma,
  seedYoutubeTestData,
  type YoutubeTestSeedResult,
} from './../prisma/youtube-test-seed.lib';

describe('YouTube seed catalog (e2e)', () => {
  let app: INestApplication<App>;
  let seeded: YoutubeTestSeedResult;

  beforeAll(async () => {
    seeded = await seedYoutubeTestData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closeYoutubeSeedPrisma();
  });

  it('returns the seeded categories', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);

    expect(response.body.success).toBe(true);

    const categoryNames = response.body.data.map(
      (category: { name: string }) => category.name,
    );

    expect(categoryNames).toEqual(
      expect.arrayContaining(['web', 'pwn', 'pentest']),
    );
  });

  it('returns only the seeded courses when searched by the seed marker', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/courses')
      .query({
        search: seeded.marker,
        page: 1,
        limit: 20,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.count).toBe(6);
    expect(response.body.data.data).toHaveLength(6);

    const seededCourseIds = seeded.categories.flatMap((category) =>
      category.courses.map((course) => course.id),
    );

    const responseCourseIds = response.body.data.data.map(
      (course: { id: number }) => course.id,
    );

    expect(responseCourseIds).toEqual(expect.arrayContaining(seededCourseIds));
  });

  it('walks the seeded category -> course -> chapter -> lecture chain', async () => {
    const webCategory = seeded.categories.find((category) => category.name === 'web');

    expect(webCategory).toBeDefined();

    const seededCourse = webCategory!.courses[0];

    const categoryCoursesResponse = await request(app.getHttpServer())
      .get(`/api/v1/categories/${webCategory!.id}/courses`)
      .expect(200);

    const categoryCourseIds = categoryCoursesResponse.body.data.map(
      (course: { id: number }) => course.id,
    );

    expect(categoryCourseIds).toContain(seededCourse.id);

    const courseResponse = await request(app.getHttpServer())
      .get(`/api/v1/courses/${seededCourse.id}`)
      .expect(200);

    expect(courseResponse.body.data.id).toBe(seededCourse.id);
    expect(courseResponse.body.data.slug).toBe(seededCourse.slug);

    const chaptersResponse = await request(app.getHttpServer())
      .get(`/api/v1/courses/${seededCourse.id}/chapters`)
      .expect(200);

    expect(chaptersResponse.body.data).toHaveLength(5);

    const firstChapter = seededCourse.chapters[0];
    const secondChapter = seededCourse.chapters[1];

    expect(chaptersResponse.body.data[0].id).toBe(firstChapter.id);

    const lecturesResponse = await request(app.getHttpServer())
      .get(`/api/v1/chapters/${firstChapter.id}/lectures`)
      .expect(200);

    expect(lecturesResponse.body.data).toHaveLength(1);
    expect(lecturesResponse.body.data[0].id).toBe(firstChapter.lecture.id);
    expect(lecturesResponse.body.data[0].video_url).toBe(firstChapter.lecture.url);

    const lectureDetailResponse = await request(app.getHttpServer())
      .get(`/api/v1/lectures/${firstChapter.lecture.id}`)
      .expect(200);

    expect(lectureDetailResponse.body.data.lecture.id).toBe(firstChapter.lecture.id);
    expect(lectureDetailResponse.body.data.nextLecture).toBe(secondChapter.lecture.id);
    expect(lectureDetailResponse.body.data.prevLecture).toBeNull();
  });
});
