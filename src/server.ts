import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '32323', 10);

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use project root as base
const PROJECT_ROOT = join(__dirname, '..');

// Middleware
app.use(express.static(path.join(PROJECT_ROOT, 'site')));

// Homepage - list all posts
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(PROJECT_ROOT, 'site/index.html'));
});

// Individual post pages
app.get('/posts/:slug', (req: Request, res: Response) => {
  const filePath = path.join(PROJECT_ROOT, 'site/posts', `${req.params.slug}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Post not found');
    }
  });
});

// Theme CSS
app.get('/css/theme.css', (req: Request, res: Response) => {
  res.sendFile(path.join(PROJECT_ROOT, 'site/css/theme.css'));
});

// Start server - bind to all interfaces for public access
app.listen(PORT, '0.0.0.0' as any, () => {
  console.log(`Blog app running on http://0.0.0.0:${PORT}`);
});
