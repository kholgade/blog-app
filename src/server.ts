import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config, SLUG_REGEX } from './config.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const POSTS_DIR = path.resolve(PROJECT_ROOT, 'site/posts');

app.use(express.static(path.join(PROJECT_ROOT, 'site')));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).send('Internal server error');
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(PROJECT_ROOT, 'site/index.html'), (err) => {
    if (err) {
      console.error('Error serving homepage:', err.message);
      res.status(500).send('Error loading homepage');
    }
  });
});

function validateSlug(req: Request, res: Response, next: NextFunction): void {
  const slug = String(req.params.slug);

  if (!SLUG_REGEX.test(slug)) {
    console.warn(`Invalid slug attempt: ${slug}`);
    res.status(400).send('Invalid post slug');
    return;
  }

  const resolvedPath = path.resolve(POSTS_DIR, `${slug}.html`);
  if (!resolvedPath.startsWith(POSTS_DIR)) {
    console.warn(`Path traversal attempt: ${slug}`);
    res.status(400).send('Invalid post slug');
    return;
  }

  next();
}

app.get('/posts/:slug', validateSlug, (req: Request, res: Response, next: NextFunction) => {
  const filePath = path.join(POSTS_DIR, `${req.params.slug}.html`);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving post:', err.message);
      res.status(404).send('Post not found');
    }
  });
});

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Blog app running on http://0.0.0.0:${config.port}`);
});

function gracefulShutdown(): void {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { app, server };
