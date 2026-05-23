import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readPostsAsync, readDailyBriefsAsync, parseMarkdownToHtml, shouldRegenerate } from './utils/markdown.js';
import { buildPostPage, buildCardHtml, buildHomePage, buildDailyBriefPage } from './utils/htmlBuilder.js';
import { generateSlug } from './config.js';

const PROJECT_ROOT = process.cwd();
const POSTS_DIR = path.join(process.cwd(), 'repos/posts');
const BRIEFS_DIR = path.join(process.cwd(), 'repos/daily-news');
const POSTS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'site/posts');
const BRIEFS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'site/daily-briefs');

function getMdFilePath(title: string, sourceDir: string): string {
  const normalized = title?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || 'untitled';
  const mdFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));

  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(sourceDir, file), 'utf-8');
    const titleMatch = content.match(/title:\s*(.+)/i);
    if (titleMatch && titleMatch[1].trim() === title) {
      return path.join(sourceDir, file);
    }
  }

  return path.join(sourceDir, `${normalized}.md`);
}

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

    let postsGenerated = 0;
    let postsSkipped = 0;

    const postWritePromises = sortedPosts.map(async (post) => {
      const slug = generateSlug(post.metadata.title, post.metadata.slug);
      const mdFilePath = getMdFilePath(post.metadata.title, POSTS_DIR);
      const htmlFilePath = path.join(POSTS_OUTPUT_DIR, `${slug}.html`);

      if (!shouldRegenerate(mdFilePath, htmlFilePath)) {
        postsSkipped++;
        return;
      }

      try {
        const htmlContent = parseMarkdownToHtml(post.content);
        const html = buildPostPage(post, htmlContent, slug);
        await fs.promises.writeFile(htmlFilePath, html);
        postsGenerated++;
        console.log(`Generated: posts/${slug}.html`);
      } catch (err) {
        console.error(`Failed to generate post ${slug}:`, err instanceof Error ? err.message : err);
      }
    });

    let brifsGenerated = 0;
    let brifsSkipped = 0;

    const briefWritePromises = sortedBriefs.map(async (brief) => {
      const slug = generateSlug(brief.metadata.title, brief.metadata.slug);
      const mdFilePath = getMdFilePath(brief.metadata.title, BRIEFS_DIR);
      const htmlFilePath = path.join(BRIEFS_OUTPUT_DIR, `${slug}.html`);

      if (!shouldRegenerate(mdFilePath, htmlFilePath)) {
        brifsSkipped++;
        return;
      }

      try {
        const htmlContent = parseMarkdownToHtml(brief.content);
        const html = buildPostPage(brief, htmlContent, slug);
        await fs.promises.writeFile(htmlFilePath, html);
        brifsGenerated++;
        console.log(`Generated: daily-briefs/${slug}.html`);
      } catch (err) {
        console.error(`Failed to generate brief ${slug}:`, err instanceof Error ? err.message : err);
      }
    });

    await Promise.all([...postWritePromises, ...briefWritePromises]);

    if (postsSkipped > 0) {
      console.log(`Posts: ${postsGenerated} generated, ${postsSkipped} skipped (unchanged)`);
    }
    if (brifsSkipped > 0) {
      console.log(`Briefs: ${brifsGenerated} generated, ${brifsSkipped} skipped (unchanged)`);
    }

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
