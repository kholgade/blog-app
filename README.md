# Blog Application

A static blog application with claymorphic UX design, built with TypeScript and Express.

## Features

- **Static Site Generation**: Markdown posts converted to static HTML
- **Claymorphic Design**: Soft, rounded UI with dark/light mode toggle
- **Daily Git Sync**: Automatically pulls updates from private Git repo
- **Post Features**:
  - Categories and tags
  - Social sharing buttons (Twitter, Facebook, LinkedIn)
  - Responsive grid layout

## Project Structure

```
/blog-app/
├── src/
│   ├── utils/
│   │   ├── markdown.ts   # Markdown parsing and HTML generation
│   │   └── git.ts        # Git repository sync
│   ├── types.ts          # TypeScript type definitions
│   ├── server.ts         # Express server
│   ├── generate.ts       # Site generation logic
│   └── index.ts          # Application entry point
├── site/                 # Generated static site
│   ├── css/
│   │   └── theme.css     # Centralized claymorphic CSS
│   └── js/
│       └── theme-toggle.js
├── repos/                # Local clone of private blog repo
│   └── posts/            # Markdown blog files
└── Dockerfile            # Container configuration
```

## Setup

### Prerequisites

- Node.js 22+
- Git
- Docker (optional)

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Generate site (with posts from repos/posts)
npm run generate
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `GIT_REPO_URL` | Private Git repo URL | (none) |
| `SYNC_INTERVAL` | Git sync interval | `24h` |

### Docker

```bash
# Build image
docker build -t blog-app .

# Run container
docker run -p 3000:3000 -e GIT_REPO_URL=your-repo-url blog-app
```

## Blog Post Format

Create Markdown files in `repos/posts/` with YAML frontmatter:

```markdown
---
title: My First Blog Post
date: 2024-01-15
description: A short description of the post
categories: Technology, Development
tags: TypeScript, Docker
slug: my-first-post
---

Content starts here...
```

## Theme Customization

Edit `site/css/theme.css` to customize the claymorphic design. The theme uses CSS variables for easy color customization:

```css
:root {
  --bg-color: #f0f2f5;
  --text-color: #333333;
  --card-bg: #ffffff;
  --accent-color: #6c5ce7;
  /* ... */
}

[data-theme="dark"] {
  --bg-color: #1a1b26;
  /* ... */
}
```

## Tasks Status

| Task | Status |
|------|--------|
| Project structure & npm init | ✅ |
| Express server (TypeScript) | ✅ |
| Markdown parser & HTML generator | ✅ |
| TypeScript setup | ✅ |
| Docker configuration | ✅ |
