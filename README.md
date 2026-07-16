# Markdown Reader — Mobile

Expo (React Native) 移动端 Markdown 阅读器，支持文章列表浏览、Markdown 渲染、全文搜索、本地导入、收藏与阅读进度。

## 技术栈

| 技术 | 说明 |
|------|------|
| Expo SDK 57 | React Native 开发框架 |
| Expo Router | 文件路由系统（类似 Next.js App Router） |
| React Native 0.86 | UI 框架 |
| react-native-markdown-display | Markdown 渲染引擎 |
| AsyncStorage | 本地持久化（收藏 / 进度 / 导入文章） |
| expo-secure-store | JWT 安全存储 |
| expo-document-picker + expo-file-system | 本地 .md 文件导入 |

## 快速开始

```bash
# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npx expo start --clear

# 扫码启动 Expo Go
```

> **网络配置**: 服务端默认地址为 `http://192.168.0.101:3001/api`。
> 请在 `lib/api.ts` 的 `BASE_URL` 中修改为你的电脑 IP。
> 手机和电脑须在同一 WiFi 下。

## 项目结构

```
mobile/
├── app/                              # Expo Router 文件路由
│   ├── _layout.tsx                   # 根布局：SafeAreaProvider → ThemeProvider → AuthProvider → Stack
│   │
│   ├── (tabs)/                       # 底部 Tab 导航组
│   │   ├── _layout.tsx               # Tab 布局：4 个标签（文章/搜索/收藏/设置）
│   │   ├── index.tsx                 # 文章列表页 + 导入按钮（FAB）
│   │   ├── search.tsx                # 全文搜索页（防抖 400ms）
│   │   ├── favorites.tsx             # 收藏列表页（本地存储 + 删除）
│   │   └── settings.tsx              # 设置页（夜间模式 / 字号 / 登录注册）
│   │
│   └── article/
│       └── [id].tsx                  # 文章阅读器（Markdown 渲染 + 代码块 + TOC + 收藏 + 进度）
│
├── lib/                              # 基础设施层
│   ├── api.ts                        # API 客户端：fetch 封装 + JWT 注入 + 本地文章回退
│   ├── auth.tsx                      # 认证 Context：login / register / logout + SecureStore
│   ├── theme.tsx                     # 主题 Context：日/夜模式 + 字号调节（AsyncStorage 持久化）
│   ├── storage.ts                    # 本地存储：收藏 / 进度 / 导入文章 CRUD + Markdown 解析器
│   └── types.ts                     # 共享 TypeScript 类型定义
│
├── assets/                           # 应用图标 / 启动图
├── metro.config.js                   # Metro 配置：.md 文件支持 + punycode polyfill
├── app.json                          # Expo 配置（scheme / plugins / 实验）
├── tsconfig.json                     # TypeScript 配置（@/ 路径别名）
└── package.json
```

## 页面功能

### 文章列表 (`app/(tabs)/index.tsx`)
- 从服务端拉取文章列表，合并本地导入的文章
- 每张卡片展示：分类、标题、描述、标签、字数、阅读时间
- 下拉刷新
- 右下角 `+` 浮动按钮：导入 .md 文件

### 搜索 (`app/(tabs)/search.tsx`)
- 关键词搜索（400ms 防抖）
- 同时搜索服务端文章和本地导入文章
- 结果卡片：标题 + snippet + 匹配数

### 收藏 (`app/(tabs)/favorites.tsx`)
- 本地 AsyncStorage 存储
- 点击跳转阅读
- 右侧删除按钮

### 设置 (`app/(tabs)/settings.tsx`)
- 夜间模式开关（暖色调色板）
- 字号选择（小 14px / 中 16px / 大 18px）
- 登录 / 注册表单（JWT 存入 SecureStore）
- 已登录显示用户名 + 退出按钮

### 阅读器 (`app/article/[id].tsx`)
- Markdown 渲染（react-native-markdown-display）
- 代码块：语言标签 + 水平滚动 + 深色背景
- 目录弹窗（底部 Modal，从 heading 提取）
- 收藏按钮（浮动 FAB）
- 阅读进度自动保存 / 恢复（滚动位置）
- 主题感知：日/夜模式自适应

## 本地导入

点击文章列表右下角 `+` 按钮：

1. 调用 `expo-document-picker` 选择 `.md` 文件（支持多选）
2. 用 `expo-file-system` 读取文件内容
3. `parseMarkdownToArticle()` 解析标题 / 描述 / 目录 / 字数 / 阅读时间
4. 存入 AsyncStorage，文章列表立即可见
5. 导入的文章纯本地存储，离线可读，服务端 404 时自动回退

## 主题系统

| 模式 | 背景 | 文字 | 强调色 |
|------|------|------|--------|
| 日间 | `#f7f5f2` | `#1c1917` | `#c2410c` |
| 夜间 | `#0c0a09` | `#f5f5f4` | `#fb923c` |

主题通过 `useTheme()` Hook 使用，所有页面从 Context 获取颜色，切换时全局生效。

## API 对接

服务端地址在 `lib/api.ts` 顶部配置：

```typescript
const BASE_URL = 'http://192.168.0.101:3001/api';
```

| 场景 | 地址 |
|------|------|
| Android 模拟器 | `http://10.0.2.2:3001/api` |
| iOS 模拟器 | `http://localhost:3001/api` |
| 真机（同 WiFi） | `http://<你的电脑IP>:3001/api` |

API 客户端自动从 SecureStore 读取 JWT 并注入 `Authorization` 头，服务端 404 时回退到本地存储中的导入文章。
