import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SyncDto, SyncResponse } from '@md-reader/shared';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get()
  async getSync(@CurrentUser() user: { id: string }): Promise<SyncResponse> {
    return this.syncService.getSync(user.id);
  }

  @Post()
  async sync(
    @CurrentUser() user: { id: string },
    @Body() dto: SyncDto,
  ): Promise<SyncResponse> {
    return this.syncService.sync(user.id, dto);
  }
}
