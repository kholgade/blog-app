import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GIT_REPO_URL = process.env.GIT_REPO_URL || '';
const REPOS_DIR = './repos/posts';

/**
 * Clone or pull the private git repository
 */
async function syncGitRepo(): Promise<void> {
  try {
    if (!GIT_REPO_URL) {
      console.log('GIT_REPO_URL not set, skipping git sync');
      return;
    }

    console.log('Starting git sync...');

    try {
      // Try to pull if repo exists
      await execAsync(`cd ${REPOS_DIR} && git pull`);
      console.log('Git repo pulled successfully');
    } catch (error) {
      // Clone if repo doesn't exist
      await execAsync(`git clone ${GIT_REPO_URL} ${REPOS_DIR}`);
      console.log('Git repo cloned successfully');
    }

  } catch (err) {
    console.error('Git sync failed:', err);
  }
}

/**
 * Schedule daily sync
 */
function scheduleDailySync(): void {
  console.log('Scheduling sync every 24 hours');

  // Run immediately on startup
  syncGitRepo();

  // Then run every 24 hours
  setInterval(syncGitRepo, 24 * 60 * 60 * 1000);
}

export { syncGitRepo, scheduleDailySync };
