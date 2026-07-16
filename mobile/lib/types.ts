export interface ArticleMeta {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  source: string;
  wordCount: number;
  readingTime: number;
}
export interface TocItem {
  id: string;
  level: number;
  text: string;
}
export interface FavoriteItem {
  articleId: string;
  title: string;
  category: string;
  addedAt: number;
}
export interface ReadingProgress {
  articleId: string;
  scrollY: number;
  scrollRatio: number;
  updatedAt: number;
}
export interface SearchResult {
  articleId: string;
  title: string;
  snippet: string;
  matchCount: number;
}
export interface AuthResponse {
  accessToken: string;
  user: User;
}
export interface User {
  id: string;
  username: string;
  email?: string;
}
export interface SyncDto {
  favorites: FavoriteItem[];
  progress: ReadingProgress[];
}
export interface SyncResponse {
  favorites: FavoriteItem[];
  progress: ReadingProgress[];
  syncedAt: number;
}
/** 本地导入的文章 */
export interface LocalArticle {
  id: string;
  meta: ArticleMeta;
  content: string;
  toc: TocItem[];
  importedAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
