import { generateSite } from './generate.js';

// Generate site on startup
console.log('Starting blog application...');

// Run initial site generation
generateSite();

// Start server
import './server.js';
