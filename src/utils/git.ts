import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

const GIT_REPO_URL = process.env.GIT_REPO_URL || '';
const REPOS_DIR = path.resolve('./repos/posts');

function validateGitUrl(url: string): boolean {
  return /^https?:\/\/.+\.git$|^git@.+:.+\.git$/.test(url);
}

async function pullRepo(): Promise<void> {
  await execFileAsync('git', ['pull'], { cwd: REPOS_DIR });
}

async function cloneRepo(): Promise<void> {
  const parentDir = path.dirname(REPOS_DIR);
  await execFileAsync('git', ['clone', GIT_REPO_URL, REPOS_DIR], { cwd: parentDir });
}

async function syncGitRepo(): Promise<void> {
  try {
    if (!GIT_REPO_URL) {
      console.log('GIT_REPO_URL not set, skipping git sync');
      return;
    }

    if (!validateGitUrl(GIT_REPO_URL)) {
      console.error('Invalid GIT_REPO_URL format');
      return;
    }

    console.log('Starting git sync...');

    try {
      await pullRepo();
      console.log('Git repo pulled successfully');
    } catch {
      await cloneRepo();
      console.log('Git repo cloned successfully');
    }
  } catch (err) {
    console.error('Git sync failed:', err instanceof Error ? err.message : err);
  }
}

let syncIntervalId: NodeJS.Timeout | null = null;

function scheduleDailySync(): void {
  console.log('Scheduling sync every 24 hours');
  syncGitRepo();
  syncIntervalId = setInterval(syncGitRepo, 24 * 60 * 60 * 1000);
}

function stopScheduledSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

export { syncGitRepo, scheduleDailySync, stopScheduledSync };
