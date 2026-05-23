import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { PostMetadata, Post } from '../types.js';

const BLOG_DIR = path.join(process.cwd(), 'repos/posts');
const DAILY_NEWS_DIR = path.join(process.cwd(), 'repos/daily-news');

function parseFrontmatter(content: string): Post {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in content');
  }

  const frontmatterLines = match[1].split('\n');
  const metadata: Partial<PostMetadata> = {};

  for (const line of frontmatterLines) {
    const [key, ...valueParts] = line.split(':');
    if (key) {
      const value = valueParts.join(':').trim();
      const trimmedKey = key.trim().toLowerCase();

      if (trimmedKey === 'categories') {
        metadata.categories = value.split(',').map(v => v.trim()).filter(Boolean);
      } else if (trimmedKey === 'tags') {
        metadata.tags = value.split(',').map(v => v.trim()).filter(Boolean);
      } else if (trimmedKey === 'title') {
        metadata.title = value;
      } else if (trimmedKey === 'date') {
        metadata.date = value;
      } else if (trimmedKey === 'description') {
        metadata.description = value;
      } else if (trimmedKey === 'slug') {
        metadata.slug = value;
      }
    }
  }

  if (!metadata.title) {
    throw new Error('Post requires title in frontmatter');
  }
  if (!metadata.date) {
    throw new Error('Post requires date in frontmatter');
  }

  return {
    metadata: metadata as PostMetadata,
    content: match[2]
  };
}

async function readFilesFromDir(dir: string): Promise<Post[]> {
  const posts: Post[] = [];

  if (!fs.existsSync(dir)) {
    return posts;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    try {
      const filePath = path.join(dir, file);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const post = parseFrontmatter(content);
      posts.push(post);
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  return posts;
}

export async function readPostsAsync(): Promise<Post[]> {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log('Blog posts directory not found:', BLOG_DIR);
    return [];
  }
  return readFilesFromDir(BLOG_DIR);
}

export async function readDailyBriefsAsync(): Promise<Post[]> {
  if (!fs.existsSync(DAILY_NEWS_DIR)) {
    console.log('Daily briefs directory not found:', DAILY_NEWS_DIR);
    return [];
  }
  return readFilesFromDir(DAILY_NEWS_DIR);
}

export function parseMarkdownToHtml(content: string): string {
  try {
    const result = marked(content, { async: false });
    if (typeof result !== 'string') {
      throw new Error('Markdown conversion failed');
    }
    return result;
  } catch (err) {
    console.error('Markdown parsing error:', err);
    throw new Error('Failed to parse markdown content');
  }
}

export function shouldRegenerate(mdFilePath: string, htmlFilePath: string): boolean {
  if (!fs.existsSync(htmlFilePath)) {
    return true;
  }

  try {
    const mdStats = fs.statSync(mdFilePath);
    const htmlStats = fs.statSync(htmlFilePath);
    return mdStats.mtime > htmlStats.mtime;
  } catch {
    return true;
  }
}
