import type { Post, PostMetadata } from '../types.js';
import { config } from '../config.js';

export function formatDate(dateStr: string, format: 'long' | 'short' = 'long'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function buildHeader(): string {
  return `
    <header class="clay-header">
      <div class="header-content">
        <div class="header-left">
          <h1><a href="/">${config.blogTitle}</a></h1>
        </div>
        <div class="nav-list">
          <a href="/">Home</a>
        </div>
        <div class="header-right">
          <button id="theme-toggle" class="clay-btn">🌙</button>
        </div>
      </div>
    </header>`;
}

function buildFooter(): string {
  return `
    <footer class="clay-footer">
      <p>&copy; ${new Date().getFullYear()} ${config.blogTitle}. All rights reserved.</p>
    </footer>`;
}

function buildPostMetadata(metadata: PostMetadata): string {
  const date = formatDate(metadata.date, 'long');
  const categories = metadata.categories?.length ? metadata.categories.join(', ') : '';
  return `<p class="post-meta">${date} ${categories ? '• Categories: ' + categories : ''}</p>`;
}

function buildPostTags(tags: string[] = []): string {
  if (!tags.length) return '';
  return `<div class="post-tags">Tags: ${tags.map(t => `<span class="tag">#${t}</span>`).join(' ')}</div>`;
}

function buildShareButtons(slug: string, title: string): string {
  const postUrl = `${config.baseUrl}/posts/${slug}`;
  return `
    <div class="share-buttons">
      <span>Share this post:</span>
      <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(title)}" target="_blank">Twitter</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}" target="_blank">Facebook</a>
      <a href="https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(title)}" target="_blank">LinkedIn</a>
    </div>`;
}

export function buildPostPage(post: Post, htmlContent: string, slug: string): string {
  const metadata = buildPostMetadata(post.metadata);
  const tags = buildPostTags(post.metadata.tags);
  const shareButtons = buildShareButtons(slug, post.metadata.title);
  const header = buildHeader();
  const footer = buildFooter();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metadata.title} - ${config.blogTitle}</title>
  <link rel="stylesheet" href="/css/theme.css">
</head>
<body>
  <div class="app-container">
    ${header}
    <main class="clay-container">
      <article class="clay-post">
        <header class="post-header">
          <h2>${post.metadata.title}</h2>
          ${metadata}
        </header>
        <div class="post-content">
          ${htmlContent}
        </div>
        ${tags}
        ${shareButtons}
      </article>
    </main>
    ${footer}
  </div>
  <script src="/js/theme-toggle.js"></script>
</body>
</html>`;
}

export function buildCardHtml(post: Post, slug: string): string {
  const date = formatDate(post.metadata.date, 'short');
  const excerpt = post.metadata.description || post.content.substring(0, 150) + '...';
  return `
    <a href="/posts/${slug}" class="clay-card">
      <div class="card-content">
        <h3>${post.metadata.title}</h3>
        <p class="card-date">${date}</p>
        <p class="card-excerpt">${excerpt}</p>
      </div>
    </a>`;
}

export function buildHomePage(postsHtml: string): string {
  const header = buildHeader();
  const footer = buildFooter();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.blogTitle} - Home</title>
  <link rel="stylesheet" href="/css/theme.css">
</head>
<body>
  <div class="app-container">
    ${header}
    <main class="clay-container">
      <div class="posts-grid">
        ${postsHtml}
      </div>
    </main>
    ${footer}
  </div>
  <script src="/js/theme-toggle.js"></script>
</body>
</html>`;
}
