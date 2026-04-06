import {
  closeYoutubeSeedPrisma,
  seedYoutubeTestData,
} from './youtube-test-seed.lib';

async function main() {
  const seeded = await seedYoutubeTestData();

  console.log('YouTube test seed completed.');
  console.log(JSON.stringify(seeded, null, 2));
}

main()
  .catch((error) => {
    console.error('YouTube test seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeYoutubeSeedPrisma();
  });
