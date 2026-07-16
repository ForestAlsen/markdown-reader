import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  FavoriteItem,
  ReadingProgress,
  LocalArticle,
  ArticleMeta,
  TocItem,
} from './types';

const FAV_KEY = 'favorites';
const PROG_KEY = 'progress';
const LOCAL_KEY = 'local_articles';

// ===== Local Article Storage =====

export async function getLocalArticles(): Promise<LocalArticle[]> {
  const raw = await AsyncStorage.getItem(LOCAL_KEY);
  return raw ? (JSON.parse(raw) as LocalArticle[]) : [];
}

export async function getLocalArticle(id: string): Promise<LocalArticle | null> {
  const all = await getLocalArticles();
  return all.find((a) => a.id === id) ?? null;
}

export async function saveLocalArticle(article: LocalArticle): Promise<void> {
  const all = await getLocalArticles();
  const idx = all.findIndex((a) => a.id === article.id);
  if (idx >= 0) all[idx] = article;
  else all.unshift(article);
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

export async function deleteLocalArticle(id: string): Promise<void> {
  const all = await getLocalArticles();
  const filtered = all.filter((a) => a.id !== id);
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(filtered));
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const raw = await AsyncStorage.getItem(FAV_KEY);
  return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
}

export async function addFavorite(item: FavoriteItem): Promise<void> {
  const favs = await getFavorites();
  if (!favs.find((f) => f.articleId === item.articleId)) {
    favs.unshift(item);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }
}

export async function removeFavorite(articleId: string): Promise<void> {
  const favs = await getFavorites();
  const filtered = favs.filter((f) => f.articleId !== articleId);
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(filtered));
}

export async function isFavorite(articleId: string): Promise<boolean> {
  const favs = await getFavorites();
  return !!favs.find((f) => f.articleId === articleId);
}

export async function getProgress(
  articleId: string,
): Promise<ReadingProgress | null> {
  const raw = await AsyncStorage.getItem(PROG_KEY);
  const all: ReadingProgress[] = raw ? JSON.parse(raw) : [];
  return all.find((p) => p.articleId === articleId) ?? null;
}

export async function saveProgress(p: ReadingProgress): Promise<void> {
  const raw = await AsyncStorage.getItem(PROG_KEY);
  const all: ReadingProgress[] = raw ? JSON.parse(raw) : [];
  const idx = all.findIndex((x) => x.articleId === p.articleId);
  if (idx >= 0) all[idx] = p;
  else all.push(p);
  await AsyncStorage.setItem(PROG_KEY, JSON.stringify(all));
}

export async function getAllProgress(): Promise<ReadingProgress[]> {
  const raw = await AsyncStorage.getItem(PROG_KEY);
  return raw ? (JSON.parse(raw) as ReadingProgress[]) : [];
}

export async function getAllFavorites(): Promise<FavoriteItem[]> {
  return getFavorites();
}

// ===== Markdown Parsing Helpers =====

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function extractTitle(body: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractDescription(body: string): string | undefined {
  const lines = body.split('\n');
  // First blockquote
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('> ')) {
      const content = trimmed.slice(2).trim();
      if (!/^\[!\w+\]$/.test(content)) return content;
    }
  }
  // Fallback: first non-empty, non-heading, non-code line
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('>') &&
      !trimmed.startsWith('```') &&
      !trimmed.startsWith('---')
    ) {
      return trimmed;
    }
  }
  return undefined;
}

function extractToc(body: string): TocItem[] {
  const toc: TocItem[] = [];
  const regex = /^(#{1,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    toc.push({
      id: slugify(match[2].trim()),
      level: match[1].length,
      text: match[2].trim(),
    });
  }
  return toc;
}

function countWords(body: string): number {
  return body.split(/\s+/).filter((w) => w.length > 0).length;
}

/** Parse a markdown string into a LocalArticle ready for storage. */
export function parseMarkdownToArticle(
  filename: string,
  raw: string,
): LocalArticle {
  // Strip front matter if present
  let body = raw;
  const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (fmMatch) body = raw.slice(fmMatch[0].length);

  const title = extractTitle(body);
  const description = extractDescription(body);
  const category = filename.replace(/\.md$/i, '').split('-')[0] || 'imported';
  const wordCount = countWords(body);
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));
  const toc = extractToc(body);

  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const meta: ArticleMeta = {
    id,
    title,
    description,
    category,
    tags: toc.filter((t) => t.level === 2).map((t) => t.text).slice(0, 6),
    source: filename,
    wordCount,
    readingTime,
  };

  return {
    id,
    meta,
    content: raw,
    toc,
    importedAt: Date.now(),
  };
}
