# NestJS 后端开发

> NestJS 是一个用于构建高效、可扩展的 Node.js 服务端应用框架。

## 核心特性

- **TypeScript 优先**:完整的类型支持
- **模块化架构**:基于装饰器和依赖注入
- **微服务就绪**:支持 REST、GraphQL、WebSocket、gRPC
- **生态丰富**:官方模块覆盖 ORM、验证、认证、缓存等

## 项目结构

```
src/
├── main.ts              # 启动入口
├── app.module.ts         # 根模块
├── auth/                 # 认证模块
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── strategies/jwt.strategy.ts
├── user/
│   ├── user.entity.ts
│   └── user.service.ts
├── sync/
│   ├── sync.controller.ts
│   └── sync.service.ts
└── common/
    ├── guards/jwt.guard.ts
    └── decorators/current-user.decorator.ts
```

## 快速开始

```bash
# 安装 CLI
npm install -g @nestjs/cli

# 创建项目
nest new server

# 运行
cd server
npm run start:dev
```

## 模块示例

### 定义实体

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email: string;
}
```

### 控制器

```typescript
import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### JWT 守卫

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  @Post()
  sync(@CurrentUser() user: User, @Body() dto: SyncDto) {
    return this.syncService.sync(user.id, dto);
  }
}
```

## 数据库配置

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data.db',
      entities: [User, Favorite, Progress],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

## 部署

```bash
# 构建
npm run build

# 运行生产环境
node dist/main.js

# Docker
docker build -t markdown-reader-server .
docker run -p 3000:3000 markdown-reader-server
```

---

*NestJS 11+*
