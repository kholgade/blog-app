// Generate site on startup if no posts exist
import fs from 'fs';
import path from 'path';
import { generateSite } from './generate.js';

const postsDir = path.join(process.cwd(), 'site/posts');

console.log('Starting blog application...');

if (!fs.existsSync(postsDir) || fs.readdirSync(postsDir).filter(f => f.endsWith('.html')).length === 0) {
  console.log('No posts found, generating site...');
  generateSite();
}

// Start server
import './server.js';
