export const config = {
  blogTitle: process.env.BLOG_TITLE || "Yashodhan's Blogs",
  baseUrl: process.env.BLOG_BASE_URL || 'http://localhost:32323',
  port: parseInt(process.env.PORT || '32323', 10),
} as const;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function generateSlug(title: string | undefined, explicitSlug: string | undefined): string {
  if (explicitSlug) return explicitSlug;
  if (!title) return 'untitled-post';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
