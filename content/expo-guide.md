# Expo 开发入门

> 使用 Expo 构建 React Native 应用的快速入门指南。

## 为什么选择 Expo

Expo 是 React Native 生态最流行的开发框架,提供:

1. **零配置启动**:无需 Android Studio / Xcode
2. **Expo Go**:通过手机 App 实时预览
3. **Over-the-Air 更新**:无需重新发版
4. **丰富的 SDK**:相机、文件、SQLite 等内置模块

## 安装

```bash
# 创建新项目
npx create-expo-app@latest my-app --template blank-typescript

# 启动开发服务器
cd my-app
npx expo start
```

## 核心概念

### Expo Router

Expo Router 是文件路由系统,类似 Next.js:

```
app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx        # 首页
│   └── settings.tsx     # 设置
└── article/[id].tsx    # 动态路由
```

### 组件示例

```typescript
import { View, Text, Pressable } from 'react-native';

export function ArticleCard({ title, onPress }: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View>
        <Text>{title}</Text>
      </View>
    </Pressable>
  );
}
```

### 使用内置模块

```typescript
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('mydb.db');

await db.execAsync(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    content TEXT
  )
`);
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npx expo start` | 启动开发服务器 |
| `npx expo start --android` | 在 Android 模拟器启动 |
| `npx expo start --ios` | 在 iOS 模拟器启动 |
| `npx expo prebuild` | 生成原生项目 |
| `eas build` | 云端构建 |

## 构建发布

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录
eas login

# 构建 Android
eas build --platform android
```

---

## 常见问题

> [!TIP]
> 如果 Expo Go 无法连接,确保手机和电脑在同一 Wi-Fi 网络。

> [!WARNING]
> 部分原生模块需要 Development Build,不支持 Expo Go。

---

*Expo SDK 53+*
