import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readPostsAsync, readDailyBriefsAsync, parseMarkdownToHtml } from './utils/markdown.js';
import { buildPostPage, buildCardHtml, buildHomePage, buildDailyBriefPage } from './utils/htmlBuilder.js';
import { generateSlug } from './config.js';

const PROJECT_ROOT = process.cwd();
const POSTS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'site/posts');
const BRIEFS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'site/daily-briefs');

async function generateSite(): Promise<void> {
  console.log('Generating site...');

  try {
    if (!fs.existsSync(POSTS_OUTPUT_DIR)) {
      fs.mkdirSync(POSTS_OUTPUT_DIR, { recursive: true });
    }
    if (!fs.existsSync(BRIEFS_OUTPUT_DIR)) {
      fs.mkdirSync(BRIEFS_OUTPUT_DIR, { recursive: true });
    }

    const [posts, briefs] = await Promise.all([readPostsAsync(), readDailyBriefsAsync()]);
    console.log(`Found ${posts.length} blog posts`);
    console.log(`Found ${briefs.length} daily briefs`);

    const sortedPosts = posts.sort((a, b) => {
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      return dateB - dateA;
    });

    const sortedBriefs = briefs.sort((a, b) => {
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      return dateB - dateA;
    });

    const postWritePromises = sortedPosts.map(async (post) => {
      const slug = generateSlug(post.metadata.title, post.metadata.slug);
      try {
        const htmlContent = parseMarkdownToHtml(post.content);
        const html = buildPostPage(post, htmlContent, slug);
        await fs.promises.writeFile(path.join(POSTS_OUTPUT_DIR, `${slug}.html`), html);
        console.log(`Generated: posts/${slug}.html`);
      } catch (err) {
        console.error(`Failed to generate post ${slug}:`, err instanceof Error ? err.message : err);
      }
    });

    const briefWritePromises = sortedBriefs.map(async (brief) => {
      const slug = generateSlug(brief.metadata.title, brief.metadata.slug);
      try {
        const htmlContent = parseMarkdownToHtml(brief.content);
        const html = buildPostPage(brief, htmlContent, slug);
        await fs.promises.writeFile(path.join(BRIEFS_OUTPUT_DIR, `${slug}.html`), html);
        console.log(`Generated: daily-briefs/${slug}.html`);
      } catch (err) {
        console.error(`Failed to generate brief ${slug}:`, err instanceof Error ? err.message : err);
      }
    });

    await Promise.all([...postWritePromises, ...briefWritePromises]);

    const postCardsHtml = sortedPosts
      .map(post => {
        const slug = generateSlug(post.metadata.title, post.metadata.slug);
        return buildCardHtml(post, slug);
      })
      .join('');

    const homepage = buildHomePage(postCardsHtml);
    await fs.promises.writeFile(path.join(PROJECT_ROOT, 'site/index.html'), homepage);
    console.log('Generated: index.html');

    const briefCardsHtml = sortedBriefs
      .map(brief => {
        const slug = generateSlug(brief.metadata.title, brief.metadata.slug);
        return buildCardHtml(brief, slug, '/daily-briefs');
      })
      .join('');

    const briefPage = buildDailyBriefPage(briefCardsHtml);
    await fs.promises.writeFile(path.join(PROJECT_ROOT, 'site/daily-brief.html'), briefPage);
    console.log('Generated: daily-brief.html');

    console.log('Site generation complete!');
  } catch (err) {
    console.error('Site generation failed:', err instanceof Error ? err.message : err);
    throw err;
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateSite().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export { generateSite };
