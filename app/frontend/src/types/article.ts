export interface Article {
  id?: number;
  slug: string;
  preview?: string;
  title: string;
  body?: string;
  author?: string | null;
  published_at: string;
  image_url?: string;
  thumbnail_url?: string;
  url?: string;
}
