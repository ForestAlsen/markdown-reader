// ===== 前后端共享类型定义 =====

/** 文章元信息 */
export interface ArticleMeta {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  /** 内置文件路径或远程 URL */
  source: string;
  /** 字数 */
  wordCount: number;
  /** 预计阅读时间(分钟) */
  readingTime: number;
}

/** 目录项 */
export interface TocItem {
  id: string;
  level: number;
  text: string;
}

/** 收藏项 */
export interface FavoriteItem {
  articleId: string;
  title: string;
  category: string;
  addedAt: number;
}

/** 阅读进度 */
export interface ReadingProgress {
  articleId: string;
  scrollY: number;
  scrollRatio: number;
  updatedAt: number;
}

/** 用户 */
export interface User {
  id: string;
  username: string;
  email?: string;
}

/** 登录请求 */
export interface LoginDto {
  username: string;
  password: string;
}

/** 注册请求 */
export interface RegisterDto extends LoginDto {
  email?: string;
}

/** JWT 认证响应 */
export interface AuthResponse {
  accessToken: string;
  user: User;
}

/** 搜索结果 */
export interface SearchResult {
  articleId: string;
  title: string;
  snippet: string;
  /** 匹配位置高亮信息(可选) */
  matchCount: number;
}

/** 同步请求体 */
export interface SyncDto {
  favorites: FavoriteItem[];
  progress: ReadingProgress[];
}

/** 同步响应 */
export interface SyncResponse {
  favorites: FavoriteItem[];
  progress: ReadingProgress[];
  syncedAt: number;
}

/** API 统一响应 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
