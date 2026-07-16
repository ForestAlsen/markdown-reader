import * as SecureStore from 'expo-secure-store';
import type {
  ArticleMeta,
  SearchResult,
  AuthResponse,
  SyncResponse,
  SyncDto,
  TocItem,
  ApiResponse,
  LocalArticle,
} from './types';
import { getLocalArticles, getLocalArticle } from './storage';

// For a physical device on the same WiFi, use the computer's LAN IP.
// For the Android emulator, use 10.0.2.2 (maps to host loopback).
// For the iOS simulator, use localhost.
const BASE_URL = 'http://192.168.0.101:3001/api';

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch {
    return null;
  }
}

/**
 * Internal fetch wrapper. All API responses are wrapped by the server's
 * TransformInterceptor in { success, data, message }. We extract .data.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data as T;
}

export const api = {
  async getArticles(): Promise<ArticleMeta[]> {
    const [remote, local] = await Promise.all([
      request<ArticleMeta[]>('/articles').catch(() => [] as ArticleMeta[]),
      getLocalArticles(),
    ]);
    // Local articles first, then remote
    const localMetas = local.map((a) => a.meta);
    const remoteIds = new Set(remote.map((m) => m.id));
    const localOnly = localMetas.filter((m) => !remoteIds.has(m.id));
    return [...localOnly, ...remote];
  },
  async getArticle(
    id: string,
  ): Promise<{ meta: ArticleMeta; content: string; toc: TocItem[] }> {
    // Try server first
    try {
      return await request<{ meta: ArticleMeta; content: string; toc: TocItem[] }>(
        `/articles/${encodeURIComponent(id)}`,
      );
    } catch {
      // Fallback to local storage
      const local = await getLocalArticle(id);
      if (local) {
        return { meta: local.meta, content: local.content, toc: local.toc };
      }
      throw new Error('Article not found');
    }
  },
  async search(q: string): Promise<SearchResult[]> {
    // Search remote
    const remote = await request<SearchResult[]>(
      `/articles/search?q=${encodeURIComponent(q)}`,
    ).catch(() => [] as SearchResult[]);
    // Search local
    const local = await getLocalArticles();
    const ql = q.toLowerCase().trim();
    const localResults: SearchResult[] = local
      .filter((a) => a.content.toLowerCase().includes(ql))
      .map((a) => {
        const idx = a.content.toLowerCase().indexOf(ql);
        const start = Math.max(0, idx - 75);
        const end = Math.min(a.content.length, idx + ql.length + 75);
        let snippet = a.content.slice(start, end).trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < a.content.length) snippet = snippet + '...';
        return {
          articleId: a.id,
          title: a.meta.title,
          snippet,
          matchCount: a.content.toLowerCase().split(ql).length - 1,
        };
      });
    return [...localResults, ...remote];
  },
  async login(username: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async register(
    username: string,
    password: string,
    email?: string,
  ): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  },
  async getSync(): Promise<SyncResponse> {
    return request<SyncResponse>('/sync');
  },
  async pushSync(data: SyncDto): Promise<SyncResponse> {
    return request<SyncResponse>('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
