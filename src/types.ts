export interface PostMetadata {
  title?: string;
  date?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  slug?: string;
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}
