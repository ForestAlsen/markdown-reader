import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Progress } from './progress.entity';
import type {
  FavoriteItem,
  ReadingProgress,
  SyncResponse,
} from '@md-reader/shared';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
    @InjectRepository(Progress)
    private readonly progressRepo: Repository<Progress>,
  ) {}

  async getSync(userId: string): Promise<SyncResponse> {
    const [favorites, progress] = await Promise.all([
      this.favoriteRepo.find({ where: { userId } }),
      this.progressRepo.find({ where: { userId } }),
    ]);

    return {
      favorites: favorites.map((f) => this.toFavoriteItem(f)),
      progress: progress.map((p) => this.toReadingProgress(p)),
      syncedAt: Date.now(),
    };
  }

  async sync(
    userId: string,
    data: { favorites: FavoriteItem[]; progress: ReadingProgress[] },
  ): Promise<SyncResponse> {
    const now = Date.now();

    // Upsert favorites: find by articleId for this user
    for (const item of data.favorites) {
      const existing = await this.favoriteRepo.findOne({
        where: { userId, articleId: item.articleId },
      });
      if (existing) {
        existing.title = item.title;
        existing.category = item.category;
        existing.addedAt = item.addedAt;
        await this.favoriteRepo.save(existing);
      } else {
        const fav = this.favoriteRepo.create({
          userId,
          articleId: item.articleId,
          title: item.title,
          category: item.category,
          addedAt: item.addedAt,
        });
        await this.favoriteRepo.save(fav);
      }
    }

    // Upsert progress: find by articleId for this user
    for (const item of data.progress) {
      const existing = await this.progressRepo.findOne({
        where: { userId, articleId: item.articleId },
      });
      if (existing) {
        existing.scrollY = item.scrollY;
        existing.scrollRatio = item.scrollRatio;
        existing.updatedAt = item.updatedAt;
        await this.progressRepo.save(existing);
      } else {
        const prog = this.progressRepo.create({
          userId,
          articleId: item.articleId,
          scrollY: item.scrollY,
          scrollRatio: item.scrollRatio,
          updatedAt: item.updatedAt,
        });
        await this.progressRepo.save(prog);
      }
    }

    // Return merged result from DB
    const [favorites, progress] = await Promise.all([
      this.favoriteRepo.find({ where: { userId } }),
      this.progressRepo.find({ where: { userId } }),
    ]);

    return {
      favorites: favorites.map((f) => this.toFavoriteItem(f)),
      progress: progress.map((p) => this.toReadingProgress(p)),
      syncedAt: now,
    };
  }

  private toFavoriteItem(f: Favorite): FavoriteItem {
    return {
      articleId: f.articleId,
      title: f.title,
      category: f.category,
      addedAt: f.addedAt,
    };
  }

  private toReadingProgress(p: Progress): ReadingProgress {
    return {
      articleId: p.articleId,
      scrollY: p.scrollY,
      scrollRatio: p.scrollRatio,
      updatedAt: p.updatedAt,
    };
  }
}
