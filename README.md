# Markdown Reader — Server

基于NestJS 的后端服务，为移动端 Markdown 阅读器提供文章内容、全文搜索、用户认证和跨设备数据同步。

## 技术栈

| 技术 | 说明 |
|------|------|
| NestJS 10 | 后端框架 |
| TypeORM 0.3 | ORM |
| better-sqlite3 | 嵌入式 SQLite 数据库（无需额外数据库服务） |
| Passport + JWT | 无状态认证 |
| bcryptjs | 密码哈希 |
| class-validator + class-transformer | DTO 校验与转换 |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run start:dev

# 生产构建
npm run build
npm run start:prod

# 类型检查
npm run typecheck
```

服务启动在 `http://0.0.0.0:3001/api`，监听所有网卡（方便真机 / 模拟器访问）。

## 项目结构

```
server/
├── src/
│   ├── main.ts                      # 应用入口，配置 CORS / 全局前缀 / 验证管道
│   ├── app.module.ts                # 根模块，注册所有子模块 + TypeORM + 全局拦截器
│   │
│   ├── article/                     # 文章模块（公开访问，无需认证）
│   │   ├── article.module.ts        # 模块定义
│   │   ├── article.controller.ts    # GET /articles, GET /articles/:id, GET /articles/search
│   │   └── article.service.ts       # 启动时扫描 content/ 目录，解析元数据 / TOC / 搜索索引
│   │
│   ├── auth/                        # 认证模块
│   │   ├── auth.module.ts           # 注册 JwtModule / PassportModule / UserService
│   │   ├── auth.controller.ts       # POST /auth/register, POST /auth/login
│   │   ├── auth.service.ts          # 注册（bcrypt 哈希）+ 登录（校验 + 签发 JWT）
│   │   ├── jwt.strategy.ts          # Passport JWT 策略（从 Bearer token 解析用户）
│   │   ├── jwt-auth.guard.ts        # JWT 路由守卫
│   │   └── dto/
│   │       ├── login.dto.ts         # 登录 DTO
│   │       └── register.dto.ts      # 注册 DTO
│   │
│   ├── sync/                        # 数据同步模块（需 JWT 认证）
│   │   ├── sync.module.ts           # 模块定义
│   │   ├── sync.controller.ts       # GET /sync, POST /sync
│   │   ├── sync.service.ts          # 收藏 + 阅读进度的 upsert 逻辑
│   │   ├── favorite.entity.ts       # 收藏实体（userId + articleId + title + category）
│   │   └── progress.entity.ts       # 进度实体（userId + articleId + scrollY + scrollRatio）
│   │
│   ├── user/                        # 用户模块
│   │   ├── user.entity.ts           # 用户实体（id / username / password / email）
│   │   └── user.service.ts          # 用户 CRUD（findByUsername / create）
│   │
│   └── common/                      # 公共设施
│       ├── decorators/
│       │   └── current-user.decorator.ts   # @CurrentUser() 参数装饰器
│       └── interceptors/
│           └── transform.interceptor.ts     # 统一响应格式 { success, data, message }
│
├── nest-cli.json                    # NestJS CLI 配置
├── tsconfig.json                    # TypeScript 配置
├── data.sqlite                      # SQLite 数据库文件（运行时自动生成）
└── package.json
```

## API 接口

所有响应统一格式：`{ success: boolean, data?: T, message?: string }`

### 文章（公开）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles` | 获取所有文章列表 |
| GET | `/api/articles/:id` | 获取文章详情（meta + content + toc） |
| GET | `/api/articles/search?q=关键词` | 全文搜索（返回匹配列表 + snippet） |

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册（username, password, email?）→ 返回 JWT |
| POST | `/api/auth/login` | 登录（username, password）→ 返回 JWT |

### 同步（需 Bearer Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/sync` | 拉取当前用户的收藏 + 阅读进度 |
| POST | `/api/sync` | 推送收藏 + 进度到服务端（upsert） |

## 文章内容来源

文章文件位于 `../content/` 目录（项目根目录的 `content/` 文件夹），服务启动时由 `ArticleService.onModuleInit()` 自动扫描：

- 解析 `# 标题` 作为文章标题
- 解析 `> 引用` 或首段作为描述
- 从文件名派生分类
- 从 `##` 子标题或 YAML front matter 提取标签
- 统计字数并计算预计阅读时间（300 字/分钟）
- 从 `#` / `##` / `###` 提取目录树

## 数据库

使用 better-sqlite3 嵌入式数据库，文件 `data.sqlite` 在首次运行时自动创建。TypeORM `synchronize: true` 会自动同步表结构（仅限开发环境）。

涉及三张表：
- **users** — 用户
- **favorites** — 收藏（关联 user）
- **progress** — 阅读进度（关联 user，userId + articleId 唯一约束）
