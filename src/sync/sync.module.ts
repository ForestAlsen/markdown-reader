import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Favorite } from './favorite.entity';
import { Progress } from './progress.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Progress])],
  controllers: [SyncController],
  providers: [SyncService, JwtAuthGuard],
})
export class SyncModule {}
