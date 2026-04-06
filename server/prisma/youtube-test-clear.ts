import {
  clearYoutubeTestSeed,
  closeYoutubeSeedPrisma,
} from './youtube-test-seed.lib';

async function main() {
  const cleanup = await clearYoutubeTestSeed();

  console.log('YouTube test seed cleanup completed.');
  console.log(JSON.stringify(cleanup, null, 2));
}

main()
  .catch((error) => {
    console.error('YouTube test cleanup failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeYoutubeSeedPrisma();
  });
