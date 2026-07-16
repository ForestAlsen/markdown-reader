import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { SyncModule } from './sync/sync.module';
import { User } from './user/user.entity';
import { Favorite } from './sync/favorite.entity';
import { Progress } from './sync/progress.entity';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data.sqlite',
      entities: [User, Favorite, Progress],
      synchronize: true,
    }),
    AuthModule,
    SyncModule,
    ArticleModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
