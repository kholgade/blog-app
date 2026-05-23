import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readPostsAsync, parseMarkdownToHtml } from './utils/markdown.js';
import { buildPostPage, buildCardHtml, buildHomePage } from './utils/htmlBuilder.js';
import { generateSlug } from './config.js';

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'site/posts');

async function generateSite(): Promise<void> {
  console.log('Generating site...');

  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const posts = await readPostsAsync();
    console.log(`Found ${posts.length} posts`);

    if (posts.length === 0) {
      console.warn('No posts found to generate');
    }

    const sortedPosts = posts.sort((a, b) => {
      const dateA = new Date(a.metadata.date).getTime();
      const dateB = new Date(b.metadata.date).getTime();
      return dateB - dateA;
    });

    const writePromises = sortedPosts.map(async (post) => {
      const slug = generateSlug(post.metadata.title, post.metadata.slug);
      try {
        const htmlContent = parseMarkdownToHtml(post.content);
        const html = buildPostPage(post, htmlContent, slug);
        await fs.promises.writeFile(path.join(OUTPUT_DIR, `${slug}.html`), html);
        console.log(`Generated: ${slug}.html`);
      } catch (err) {
        console.error(`Failed to generate ${slug}:`, err instanceof Error ? err.message : err);
      }
    });

    await Promise.all(writePromises);

    const cardsHtml = sortedPosts
      .map(post => {
        const slug = generateSlug(post.metadata.title, post.metadata.slug);
        return buildCardHtml(post, slug);
      })
      .join('');

    const homepage = buildHomePage(cardsHtml);
    await fs.promises.writeFile(path.join(PROJECT_ROOT, 'site/index.html'), homepage);
    console.log('Generated: index.html');

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
