const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../site')));

// Homepage - list all posts
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../site/index.html'));
});

// Individual post pages
app.get('/posts/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../site/posts', `${req.params.slug}.html`));
});

// Theme CSS
app.get('/css/theme.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../site/css/theme.css'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Blog app running on http://localhost:${PORT}`);
});
