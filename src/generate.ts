import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import type { Post, PostMetadata } from './types.js';

// Use current working directory
const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'site/posts');

function generatePostHtml(post: Post, slug: string): string {
  const htmlContent = marked(post.content, { async: false }) as string;
  const date = new Date(post.metadata.date || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const categories = post.metadata.categories?.length ? post.metadata.categories.join(', ') : '';
  const tags = post.metadata.tags || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metadata.title || 'Blog Post'} - Yashodhan's Blogs</title>
  <link rel="stylesheet" href="/css/theme.css">
</head>
<body>
  <div class="app-container">
    <header class="clay-header">
      <div class="header-content">
        <div class="header-left">
          <h1><a href="/">Yashodhan's Blogs</a></h1>
        </div>
        <div class="nav-list">
          <a href="/">Home</a>
        </div>
        <div class="header-right">
          <button id="theme-toggle" class="clay-btn">🌙</button>
        </div>
      </div>
    </header>

    <main class="clay-container">
      <article class="clay-post">
        <header class="post-header">
          <h2>${post.metadata.title || 'Untitled'}</h2>
          <p class="post-meta">${date} ${categories ? '• Categories: ' + categories : ''}</p>
        </header>

        <div class="post-content">
          ${htmlContent}
        </div>

        ${tags.length > 0 ? `<div class="post-tags">Tags: ${tags.map((t: string) => `<span class="tag">#${t}</span>`).join(' ')}</div>` : ''}

        <div class="share-buttons">
          <span>Share this post:</span>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent('http://localhost:32323/posts/' + slug)}&text=${encodeURIComponent(post.metadata.title || '')}" target="_blank">Twitter</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://localhost:32323/posts/' + slug)}" target="_blank">Facebook</a>
          <a href="https://www.linkedin.com/shareArticle?url=${encodeURIComponent('http://localhost:32323/posts/' + slug)}&title=${encodeURIComponent(post.metadata.title || '')}" target="_blank">LinkedIn</a>
        </div>
      </article>
    </main>

    <footer class="clay-footer">
      <p>&copy; ${new Date().getFullYear()} Yashodhan's Blogs. All rights reserved.</p>
    </footer>
  </div>

  <script src="/js/theme-toggle.js"></script>
</body>
</html>`;
}

function generateHomepage(posts: Post[]): string {
  const sortedPosts = [...posts].sort((a, b) => new Date(b.metadata.date || 0).getTime() - new Date(a.metadata.date || 0).getTime());

  const postsGrid = sortedPosts.map(post => {
    const date = new Date(post.metadata.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const slug = post.metadata.slug || post.metadata.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
    return `
    <a href="/posts/${slug}" class="clay-card">
      <div class="card-content">
        <h3>${post.metadata.title || 'Untitled'}</h3>
        <p class="card-date">${date}</p>
        <p class="card-excerpt">${post.metadata.description || post.content.substring(0, 150) + '...'}</p>
      </div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yashodhan's Blogs - Home</title>
  <link rel="stylesheet" href="/css/theme.css">
</head>
<body>
  <div class="app-container">
    <header class="clay-header">
      <div class="header-content">
        <div class="header-left">
          <h1><a href="/">Yashodhan's Blogs</a></h1>
        </div>
        <div class="nav-list">
          <a href="/">Home</a>
        </div>
        <div class="header-right">
          <button id="theme-toggle" class="clay-btn">🌙</button>
        </div>
      </div>
    </header>

    <main class="clay-container">
      <div class="posts-grid">
        ${postsGrid}
      </div>
    </main>

    <footer class="clay-footer">
      <p>&copy; ${new Date().getFullYear()} Yashodhan's Blogs. All rights reserved.</p>
    </footer>
  </div>

  <script src="/js/theme-toggle.js"></script>
</body>
</html>`;
}

function readPosts(): Post[] {
  const posts: Post[] = [];
  const REPOS_DIR = path.join(process.cwd(), 'repos/posts');

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

export function generateSite(): void {
  console.log('Generating site...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const posts = readPosts();
  console.log(`Found ${posts.length} posts`);

  for (const post of posts) {
    const slug = post.metadata.slug || post.metadata.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
    const html = generatePostHtml(post, slug);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html);
    console.log(`Generated: ${slug}.html`);
  }

  const homepage = generateHomepage(posts);
  fs.writeFileSync(path.join(PROJECT_ROOT, 'site/index.html'), homepage);
  console.log('Generated: index.html');

  console.log('Site generation complete!');
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateSite();
}
