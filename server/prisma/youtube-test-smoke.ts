import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  closeYoutubeSeedPrisma,
  seedYoutubeTestData,
  type YoutubeTestSeedResult,
} from './youtube-test-seed.lib';

async function main() {
  const seeded = await seedYoutubeTestData();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();

  await app.init();

  try {
    await assertSeededCategories(app);
    await assertSeededCourseSearch(app, seeded);
    await assertSeededLearningChain(app, seeded);

    console.log('YouTube smoke test completed.');
    console.log(JSON.stringify(seeded.counts, null, 2));
  } finally {
    await app.close();
    await closeYoutubeSeedPrisma();
  }
}

async function assertSeededCategories(app: INestApplication<App>) {
  const response = await request(app.getHttpServer())
    .get('/api/v1/categories')
    .expect(200);

  const categoryNames = response.body.data.map(
    (category: { name: string }) => category.name,
  );

  expectArrayContains(
    categoryNames,
    ['web', 'pwn', 'pentest'],
    'Seeded categories were not returned from GET /api/v1/categories.',
  );
}

async function assertSeededCourseSearch(
  app: INestApplication<App>,
  seeded: YoutubeTestSeedResult,
) {
  const response = await request(app.getHttpServer())
    .get('/api/v1/courses')
    .query({
      search: seeded.marker,
      page: 1,
      limit: 20,
    })
    .expect(200);

  const count = response.body.data.count;
  const courses = response.body.data.data;

  if (count !== 6 || courses.length !== 6) {
    throw new Error(
      `Expected 6 seeded courses from GET /api/v1/courses, received count=${count}, rows=${courses.length}.`,
    );
  }
}

async function assertSeededLearningChain(
  app: INestApplication<App>,
  seeded: YoutubeTestSeedResult,
) {
  const webCategory = seeded.categories.find((category) => category.name === 'web');

  if (!webCategory) {
    throw new Error('Seed result did not contain the web category.');
  }

  const course = webCategory.courses[0];
  const firstChapter = course.chapters[0];
  const secondChapter = course.chapters[1];

  const categoryCoursesResponse = await request(app.getHttpServer())
    .get(`/api/v1/categories/${webCategory.id}/courses`)
    .expect(200);

  const categoryCourseIds = categoryCoursesResponse.body.data.map(
    (item: { id: number }) => item.id,
  );

  if (!categoryCourseIds.includes(course.id)) {
    throw new Error(
      `Seeded course ${course.id} was not returned from GET /api/v1/categories/${webCategory.id}/courses.`,
    );
  }

  const courseResponse = await request(app.getHttpServer())
    .get(`/api/v1/courses/${course.id}`)
    .expect(200);

  if (courseResponse.body.data.slug !== course.slug) {
    throw new Error(
      `Seeded course slug mismatch. Expected ${course.slug}, received ${courseResponse.body.data.slug}.`,
    );
  }

  const chaptersResponse = await request(app.getHttpServer())
    .get(`/api/v1/courses/${course.id}/chapters`)
    .expect(200);

  if (chaptersResponse.body.data.length !== 5) {
    throw new Error(
      `Expected 5 chapters for course ${course.id}, received ${chaptersResponse.body.data.length}.`,
    );
  }

  const lecturesResponse = await request(app.getHttpServer())
    .get(`/api/v1/chapters/${firstChapter.id}/lectures`)
    .expect(200);

  if (lecturesResponse.body.data.length !== 1) {
    throw new Error(
      `Expected 1 lecture for chapter ${firstChapter.id}, received ${lecturesResponse.body.data.length}.`,
    );
  }

  if (lecturesResponse.body.data[0].id !== firstChapter.lecture.id) {
    throw new Error(
      `Lecture chain mismatch for chapter ${firstChapter.id}. Expected lecture ${firstChapter.lecture.id}.`,
    );
  }

  const lectureDetailResponse = await request(app.getHttpServer())
    .get(`/api/v1/lectures/${firstChapter.lecture.id}`)
    .expect(200);

  if (lectureDetailResponse.body.data.nextLecture !== secondChapter.lecture.id) {
    throw new Error(
      `Expected next lecture ${secondChapter.lecture.id}, received ${lectureDetailResponse.body.data.nextLecture}.`,
    );
  }

  if (lectureDetailResponse.body.data.prevLecture !== null) {
    throw new Error(
      `Expected prevLecture to be null for the first lecture, received ${lectureDetailResponse.body.data.prevLecture}.`,
    );
  }
}

function expectArrayContains(
  received: string[],
  expectedValues: string[],
  errorMessage: string,
) {
  const missingValues = expectedValues.filter((value) => !received.includes(value));

  if (missingValues.length > 0) {
    throw new Error(`${errorMessage} Missing: ${missingValues.join(', ')}`);
  }
}

main().catch((error) => {
  console.error('YouTube smoke test failed.');
  console.error(error);
  process.exitCode = 1;
});
