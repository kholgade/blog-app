import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { PostMetadata, Post } from '../types.js';

// Use current working directory for repos path
const REPOS_DIR = path.join(process.cwd(), 'repos/posts');

export function readPosts(): Post[] {
  const posts: Post[] = [];

  if (!fs.existsSync(REPOS_DIR)) {
    console.log('Posts directory not found:', REPOS_DIR);
    return posts;
  }

  const files = fs.readdirSync(REPOS_DIR).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(REPOS_DIR, file), 'utf-8');
    const post = parseFrontmatter(content);
    posts.push(post);
  }

  return posts;
}

function parseFrontmatter(content: string): Post {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: { title: '', date: new Date().toISOString() }, content };
  }

  const frontmatterLines = match[1].split('\n');
  const metadata: PostMetadata = { title: '', date: new Date().toISOString() };

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

  return {
    metadata,
    content: match[2]
  };
}

export function convertToHtml(content: string): string {
  // marked returns Promise in newer versions, but sync mode is available
  return marked(content, { async: false }) as string;
}
