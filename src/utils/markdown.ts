import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { PostMetadata, Post } from '../types.js';

const REPOS_DIR = path.join(process.cwd(), 'repos/posts');

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

export async function readPostsAsync(): Promise<Post[]> {
  const posts: Post[] = [];

  if (!fs.existsSync(REPOS_DIR)) {
    console.log('Posts directory not found:', REPOS_DIR);
    return posts;
  }

  const files = fs.readdirSync(REPOS_DIR).filter(f => f.endsWith('.md'));

  for (const file of files) {
    try {
      const filePath = path.join(REPOS_DIR, file);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const post = parseFrontmatter(content);
      posts.push(post);
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  return posts;
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
