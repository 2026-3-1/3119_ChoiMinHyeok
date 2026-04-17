import { Difficulty } from './generated/prisma/enums';
import prisma from './prisma.client';

export const YOUTUBE_TEST_SEED_MARKER = '[YOUTUBE_TEST_SEED]';
export const YOUTUBE_TEST_SLUG_PREFIX = 'seed-';

type SeedVideo = {
  title: string;
  channel: string;
  url: string;
  durationSeconds: number;
};

type CourseBlueprint = {
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  instructorId: number;
};

type CategoryBlueprint = {
  name: string;
  chapterTitles: string[];
  videos: SeedVideo[];
  courseBlueprints: CourseBlueprint[];
};

export type SeedLectureSummary = {
  id: number;
  title: string;
  url: string;
};

export type SeedChapterSummary = {
  id: number;
  title: string;
  lecture: SeedLectureSummary;
};

export type SeedCourseSummary = {
  id: number;
  slug: string;
  title: string;
  chapters: SeedChapterSummary[];
};

export type SeedCategorySummary = {
  id: number;
  name: string;
  courses: SeedCourseSummary[];
};

export type YoutubeTestSeedResult = {
  marker: string;
  categories: SeedCategorySummary[];
  counts: {
    categories: number;
    courses: number;
    chapters: number;
    lectures: number;
  };
};

type YoutubeTestCleanupResult = {
  categoriesRemoved: number;
  coursesRemoved: number;
  chaptersRemoved: number;
  lecturesRemoved: number;
};

const youtubeCatalog: CategoryBlueprint[] = [
  {
    name: 'web',
    chapterTitles: [
      'Recon and surface mapping',
      'Authentication and session flow',
      'XSS fundamentals',
      'SQL injection workflow',
      'Real-world case study review',
    ],
    videos: [
      {
        title: 'Do NOT use alert(1) in XSS',
        channel: 'LiveOverflow',
        url: 'https://www.youtube.com/watch?v=KHwVjzWei1c',
        durationSeconds: 1022,
      },
      {
        title: 'GitLab 11.4.7 Remote Code Execution - Real World CTF 2018',
        channel: 'LiveOverflow',
        url: 'https://www.youtube.com/watch?v=LrLJuyAdoAg',
        durationSeconds: 1539,
      },
      {
        title: 'What is SQL injection? - Web Security Academy',
        channel: 'PortSwigger',
        url: 'https://www.youtube.com/watch?v=wX6tszfgYp4',
        durationSeconds: 289,
      },
    ],
    courseBlueprints: [
      {
        slug: 'seed-web-foundations',
        title: 'Web Security Foundations',
        summary: 'Baseline concepts for request flow, auth, XSS, and SQLi.',
        difficulty: Difficulty.EASY,
        instructorId: 101,
      },
      {
        slug: 'seed-web-case-studies',
        title: 'Web Exploitation Case Studies',
        summary: 'Practice-oriented walkthroughs using real incident-style videos.',
        difficulty: Difficulty.MEDIUM,
        instructorId: 102,
      },
    ],
  },
  {
    name: 'pwn',
    chapterTitles: [
      'Environment and tooling setup',
      'Memory layout and offsets',
      'Buffer overflow primitives',
      'ROP and control-flow chaining',
      'Exploit rehearsal and review',
    ],
    videos: [
      {
        title: 'Speedrun Hacking - Buffer Overflow - Speedrun-001 - DC27',
        channel: 'LiveOverflow',
        url: 'https://www.youtube.com/watch?v=gBL6IzwIjuA',
        durationSeconds: 1304,
      },
      {
        title: 'Binary Exploitation / Pwn 101',
        channel: 'John Hammond',
        url: 'https://www.youtube.com/watch?v=PVx1hUlMxtQ',
        durationSeconds: 2498,
      },
      {
        title: 'Kernel Driver Binary Exploitation - ROP is DEAD!',
        channel: 'John Hammond',
        url: 'https://www.youtube.com/watch?v=mALEQkLegaE',
        durationSeconds: 2587,
      },
    ],
    courseBlueprints: [
      {
        slug: 'seed-pwn-foundations',
        title: 'Pwn Fundamentals',
        summary: 'Introductory exploit-dev flow with buffers, offsets, and ROP.',
        difficulty: Difficulty.MEDIUM,
        instructorId: 201,
      },
      {
        slug: 'seed-pwn-lab-series',
        title: 'Pwn Lab Series',
        summary: 'Hands-on binary exploitation drills for repeatable practice.',
        difficulty: Difficulty.HARD,
        instructorId: 202,
      },
    ],
  },
  {
    name: 'pentest',
    chapterTitles: [
      'Scoping and target profiling',
      'Enumeration checklist',
      'Initial foothold',
      'Privilege escalation ideas',
      'Reporting and remediation notes',
    ],
    videos: [
      {
        title: 'Ethical Hacking in 15 Hours - 2023 Edition - Learn to Hack! (Part 1)',
        channel: 'The Cyber Mentor',
        url: 'https://www.youtube.com/watch?v=3FNYvj2U0HM',
        durationSeconds: 14400,
      },
      {
        title: 'HackTheBox - Wifinetic',
        channel: 'IppSec',
        url: 'https://youtu.be/jj4r5lwnCp8',
        durationSeconds: 4140,
      },
      {
        title: 'HackTheBox - Support',
        channel: 'IppSec',
        url: 'https://youtu.be/iIveZ-raTTQ',
        durationSeconds: 3840,
      },
    ],
    courseBlueprints: [
      {
        slug: 'seed-pentest-foundations',
        title: 'Pentest Foundations',
        summary: 'Recon-to-report workflow for network and host assessments.',
        difficulty: Difficulty.EASY,
        instructorId: 301,
      },
      {
        slug: 'seed-pentest-htb-series',
        title: 'Pentest HTB Walkthrough Series',
        summary: 'Lab-focused walkthroughs for enumeration and privilege escalation.',
        difficulty: Difficulty.MEDIUM,
        instructorId: 302,
      },
    ],
  },
];

function extractYouTubeVideoId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);

  if (!match) {
    throw new Error(`Unsupported YouTube URL: ${url}`);
  }

  return match[1];
}

function buildThumbnailUrl(videoUrl: string) {
  return `https://img.youtube.com/vi/${extractYouTubeVideoId(videoUrl)}/hqdefault.jpg`;
}

function buildCourseDescription(
  categoryName: string,
  course: CourseBlueprint,
  videos: SeedVideo[],
) {
  const videoLines = videos
    .map((video, index) => `${index + 1}. ${video.channel} - ${video.title}`)
    .join('\n');

  return [
    `${YOUTUBE_TEST_SEED_MARKER} ${course.summary}`,
    `Category: ${categoryName}`,
    `This record is safe to remove with db:clear:youtube-test.`,
    'Referenced YouTube materials:',
    videoLines,
  ].join('\n');
}

export function getYoutubeTestCatalog() {
  return youtubeCatalog;
}

export async function clearYoutubeTestSeed(): Promise<YoutubeTestCleanupResult> {
  const seededCourses = await prisma.courses.findMany({
    where: {
      slug: {
        startsWith: YOUTUBE_TEST_SLUG_PREFIX,
      },
      description: {
        contains: YOUTUBE_TEST_SEED_MARKER,
      },
    },
    select: {
      id: true,
    },
  });

  const courseIds = seededCourses.map((course) => course.id);

  if (courseIds.length === 0) {
    return {
      categoriesRemoved: 0,
      coursesRemoved: 0,
      chaptersRemoved: 0,
      lecturesRemoved: 0,
    };
  }

  const seededChapters = await prisma.chapter.findMany({
    where: {
      course_id: {
        in: courseIds,
      },
    },
    select: {
      id: true,
    },
  });

  const chapterIds = seededChapters.map((chapter) => chapter.id);

  const lecturesDeleted =
    chapterIds.length > 0
      ? await prisma.lectures.deleteMany({
          where: {
            chapter_id: {
              in: chapterIds,
            },
          },
        })
      : { count: 0 };

  const chaptersDeleted = await prisma.chapter.deleteMany({
    where: {
      course_id: {
        in: courseIds,
      },
    },
  });

  const coursesDeleted = await prisma.courses.deleteMany({
    where: {
      id: {
        in: courseIds,
      },
    },
  });

  const removableCategories = await prisma.categories.findMany({
    where: {
      name: {
        in: youtubeCatalog.map((category) => category.name),
      },
    },
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
  });

  const removableCategoryIds = removableCategories
    .filter((category) => category._count.courses === 0)
    .map((category) => category.id);

  const categoriesDeleted =
    removableCategoryIds.length > 0
      ? await prisma.categories.deleteMany({
          where: {
            id: {
              in: removableCategoryIds,
            },
          },
        })
      : { count: 0 };

  return {
    categoriesRemoved: categoriesDeleted.count,
    coursesRemoved: coursesDeleted.count,
    chaptersRemoved: chaptersDeleted.count,
    lecturesRemoved: lecturesDeleted.count,
  };
}

export async function seedYoutubeTestData(): Promise<YoutubeTestSeedResult> {
  await clearYoutubeTestSeed();

  const categories: SeedCategorySummary[] = [];
  let courseCount = 0;
  let chapterCount = 0;
  let lectureCount = 0;

  for (const categoryBlueprint of youtubeCatalog) {
    let category = await prisma.categories.findFirst({
      where: {
        name: categoryBlueprint.name,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!category) {
      category = await prisma.categories.create({
        data: {
          name: categoryBlueprint.name,
        },
      });
    }

    const seededCategory: SeedCategorySummary = {
      id: category.id,
      name: category.name,
      courses: [],
    };

    for (const courseBlueprint of categoryBlueprint.courseBlueprints) {
      const primaryVideo = categoryBlueprint.videos[0];
      const course = await prisma.courses.create({
        data: {
          title: `${courseBlueprint.title} (${YOUTUBE_TEST_SEED_MARKER})`,
          description: buildCourseDescription(
            categoryBlueprint.name,
            courseBlueprint,
            categoryBlueprint.videos,
          ),
          instructor_id: courseBlueprint.instructorId,
          thumbnail: buildThumbnailUrl(primaryVideo.url),
          difficulty: courseBlueprint.difficulty,
          category_id: category.id,
          slug: courseBlueprint.slug,
          price: 39000 + courseCount * 1000,
          rating: 0,
          max_capacity: 30,
          min_enrollment: 1,
          updated_at: new Date(),
        },
      });

      courseCount += 1;

      const seededCourse: SeedCourseSummary = {
        id: course.id,
        slug: course.slug,
        title: course.title,
        chapters: [],
      };

      for (const [chapterIndex, chapterTitle] of categoryBlueprint.chapterTitles.entries()) {
        const chapter = await prisma.chapter.create({
          data: {
            course_id: course.id,
            title: `Chapter ${chapterIndex + 1}. ${chapterTitle}`,
            position: chapterIndex + 1,
          },
        });

        chapterCount += 1;

        const selectedVideo =
          categoryBlueprint.videos[chapterIndex % categoryBlueprint.videos.length];

        const lecture = await prisma.lectures.create({
          data: {
            chapter_id: chapter.id,
            title: `${selectedVideo.title} [${categoryBlueprint.name.toUpperCase()} Lab ${chapterIndex + 1}]`,
            video_url: selectedVideo.url,
            thumbnail_url: buildThumbnailUrl(selectedVideo.url),
            duration: selectedVideo.durationSeconds,
            position: 1,
            is_published: true,
          },
        });

        lectureCount += 1;

        seededCourse.chapters.push({
          id: chapter.id,
          title: chapter.title,
          lecture: {
            id: lecture.id,
            title: lecture.title,
            url: lecture.video_url,
          },
        });
      }

      seededCategory.courses.push(seededCourse);
    }

    categories.push(seededCategory);
  }

  return {
    marker: YOUTUBE_TEST_SEED_MARKER,
    categories,
    counts: {
      categories: categories.length,
      courses: courseCount,
      chapters: chapterCount,
      lectures: lectureCount,
    },
  };
}

export async function closeYoutubeSeedPrisma() {
  await prisma.$disconnect();
}
