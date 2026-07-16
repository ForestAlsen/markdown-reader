# Markdown Reader

Expo (React Native) + NestJS 手机端 Markdown 阅读器。

## 架构

```
markdown-reader/
├── mobile/      # Expo App (React Native, Expo Router)
├── server/      # NestJS 后端 (JWT 认证 + 收藏/进度同步)
├── shared/      # 前后端共享类型定义
└── content/     # 内置 markdown 文档
```

## 快速开始

### 后端
```bash
cd server
npm install
npm run start:dev    # http://localhost:3000
```

### 前端
```bash
cd mobile
npm install
npx expo start       # 扫码启动 Expo Go
```

## 功能

- 文章列表 + 正文渲染(GFM)
- 代码高亮 + 一键复制
- 图片点击预览
- 目录树(TOC)跳转
- 全文搜索(SQLite FTS5)
- 收藏 + 阅读进度(本地 + 跨设备同步)
- 夜间模式 / 字号调节
