import fs from 'fs';
import path from 'path';
import { generateSite } from './generate.js';
import { scheduleDailySync, stopScheduledSync } from './utils/git.js';

const postsDir = path.join(process.cwd(), 'site/posts');

async function main(): Promise<void> {
  try {
    console.log('Starting blog application...');

    const hasPostsGenerated =
      fs.existsSync(postsDir) &&
      fs.readdirSync(postsDir).filter(f => f.endsWith('.html')).length > 0;

    if (!hasPostsGenerated) {
      console.log('No posts found, generating site...');
      await generateSite();
    }

    console.log('Loading server...');
    await import('./server.js');

    console.log('Scheduling git sync...');
    scheduleDailySync();

    const handleShutdown = (): void => {
      console.log('Shutting down application...');
      stopScheduledSync();
      process.exit(0);
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
  } catch (err) {
    console.error('Failed to start application:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();

