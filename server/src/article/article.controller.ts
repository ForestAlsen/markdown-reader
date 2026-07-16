import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import type { ArticleMeta, SearchResult, TocItem } from '@md-reader/shared';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getAll(): ArticleMeta[] {
    return this.articleService.getAllMetas();
  }

  @Get('search')
  search(@Query('q') q: string | undefined): SearchResult[] {
    return this.articleService.search(q ?? '');
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
  ): { meta: ArticleMeta; content: string; toc: TocItem[] } {
    const article = this.articleService.getArticle(id);
    if (!article) {
      throw new NotFoundException(`Article "${id}" not found`);
    }
    return article;
  }
}
