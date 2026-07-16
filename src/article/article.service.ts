import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ArticleMeta, SearchResult, TocItem } from '@md-reader/shared';

interface ArticleIndex {
  meta: ArticleMeta;
  content: string;
  toc: TocItem[];
  wordCounts: Map<string, number>;
}

interface ParsedFrontMatter {
  tags?: string[];
}

@Injectable()
export class ArticleService implements OnModuleInit {
  private readonly logger = new Logger(ArticleService.name);
  private readonly articles = new Map<string, ArticleIndex>();

  onModuleInit() {
    this.scanArticles();
  }

  private getContentDir(): string {
    return join(process.cwd(), '..', 'content');
  }

  private scanArticles(): void {
    const dir = this.getContentDir();
    if (!existsSync(dir)) {
      this.logger.warn(`Content directory not found: ${dir}`);
      return;
    }

    const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    this.logger.log(`Found ${files.length} markdown files in ${dir}`);

    for (const file of files) {
      try {
        const filePath = join(dir, file);
        const raw = readFileSync(filePath, 'utf-8');
        const article = this.parseArticle(file, raw);
        this.articles.set(article.meta.id, article);
        this.logger.log(`Indexed article: ${article.meta.id}`);
      } catch (err) {
        this.logger.error(`Failed to parse ${file}: ${err}`);
      }
    }
  }

  private parseArticle(filename: string, raw: string): ArticleIndex {
    const id = filename.replace(/\.md$/, '');
    const { frontMatter, body } = this.extractFrontMatter(raw);

    const title = this.extractTitle(body);
    const description = this.extractDescription(body);
    const category = this.deriveCategory(filename);
    const tags = this.extractTags(body, frontMatter);
    const wordCount = this.countWords(body);
    const readingTime = Math.max(1, Math.ceil(wordCount / 300));
    const toc = this.extractToc(body);
    const wordCounts = this.buildWordCounts(body);

    const meta: ArticleMeta = {
      id,
      title,
      description,
      category,
      tags,
      source: filename,
      wordCount,
      readingTime,
    };

    return { meta, content: raw, toc, wordCounts };
  }

  private extractFrontMatter(
    raw: string,
  ): { frontMatter: ParsedFrontMatter; body: string } {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!match) {
      return { frontMatter: {}, body: raw };
    }
    const frontText = match[1];
    const body = raw.slice(match[0].length);
    const result: ParsedFrontMatter = {};

    for (const line of frontText.split('\n')) {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (key === 'tags') {
          result.tags = value
            .replace(/[\[\]]/g, '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
    }

    return { frontMatter: result, body };
  }

  private extractTitle(body: string): string {
    const match = body.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  private extractDescription(body: string): string | undefined {
    // First blockquote line (excluding alert syntax like > [!TIP])
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('> ')) {
        const content = trimmed.slice(2).trim();
        // Skip GitHub-style alert markers like > [!TIP]
        if (/^\[!\w+\]$/.test(content)) continue;
        return content;
      }
    }
    // Fallback: first non-empty, non-heading, non-quote, non-code line
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

  private deriveCategory(filename: string): string {
    const base = filename.replace(/\.md$/, '');
    const firstPart = base.split('-')[0];
    return firstPart;
  }

  private extractTags(
    body: string,
    frontMatter: ParsedFrontMatter,
  ): string[] {
    // From YAML-like front matter if present
    if (frontMatter.tags && frontMatter.tags.length > 0) {
      return frontMatter.tags;
    }
    // Otherwise extract from ## sub-headings
    const tags: string[] = [];
    const headingRegex = /^##\s+(.+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(body)) !== null) {
      tags.push(match[1].trim());
    }
    // Dedupe, preserving order
    return [...new Set(tags)];
  }

  private countWords(body: string): number {
    return body
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .length;
  }

  private extractToc(body: string): TocItem[] {
    const toc: TocItem[] = [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(body)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = this.slugify(text);
      toc.push({ id, level, text });
    }
    return toc;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private buildWordCounts(body: string): Map<string, number> {
    const counts = new Map<string, number>();
    const tokens = body.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    for (const token of tokens) {
      const cleaned = token.replace(/[^\w\u4e00-\u9fff]/g, '');
      if (cleaned.length === 0) continue;
      counts.set(cleaned, (counts.get(cleaned) || 0) + 1);
    }
    return counts;
  }

  // ===== Public API =====

  getAllMetas(): ArticleMeta[] {
    return Array.from(this.articles.values()).map((a) => a.meta);
  }

  getArticle(
    id: string,
  ): { meta: ArticleMeta; content: string; toc: TocItem[] } | null {
    const article = this.articles.get(id);
    if (!article) return null;
    return {
      meta: article.meta,
      content: article.content,
      toc: article.toc,
    };
  }

  search(query: string): SearchResult[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const article of this.articles.values()) {
      const contentLower = article.content.toLowerCase();
      const matchCount = contentLower.split(q).length - 1;
      if (matchCount <= 0) continue;

      const idx = contentLower.indexOf(q);
      const snippetRadius = 75;
      const start = Math.max(0, idx - snippetRadius);
      const end = Math.min(article.content.length, idx + q.length + snippetRadius);
      let snippet = article.content.slice(start, end).trim();
      if (start > 0) snippet = '...' + snippet;
      if (end < article.content.length) snippet = snippet + '...';

      results.push({
        articleId: article.meta.id,
        title: article.meta.title,
        snippet,
        matchCount,
      });
    }

    results.sort((a, b) => b.matchCount - a.matchCount);
    return results.slice(0, 20);
  }
}
