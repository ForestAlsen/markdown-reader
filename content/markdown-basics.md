# Markdown 基础语法指南

> 本文档介绍 Markdown 的常用语法,适合初学者快速上手。

## 目录

- [标题](#标题)
- [文本格式](#文本格式)
- [列表](#列表)
- [代码](#代码)
- [链接与图片](#链接与图片)
- [表格](#表格)
- [引用](#引用)

## 标题

使用 `#` 表示标题,数量代表层级:

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

## 文本格式

- **粗体**: `**文字**`
- *斜体*: `*文字*`
- ~~删除线~~: `~~文字~~`
- `行内代码`: 反引号包裹

## 列表

### 无序列表

- 项目一
- 项目二
  - 子项目 A
  - 子项目 B

### 有序列表

1. 第一步
2. 第二步
3. 第三步

### 任务列表

- [x] 已完成
- [ ] 未完成

## 代码

行内代码:使用 `const x = 1`

代码块:

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}

greet('World');
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
```

```typescript
interface User {
  id: string;
  name: string;
}

const user: User = {
  id: '1',
  name: 'Alice',
};
```

## 链接与图片

行内链接: [Expo 官网](https://expo.dev)

自动链接: https://expo.dev

图片:

![Expo Logo](https://expo.dev/static/icon.png)

## 表格

| 库 | 用途 | 评分 |
| --- | --- | --- |
| Expo Router | 导航 | 9/10 |
| NestJS | 后端 | 9/10 |
| expo-sqlite | 本地存储 | 8/10 |

## 引用

> 这是一段引用文字。
>
> 可以有多行。

> [!NOTE]
> 这是一个提示框(GitHub Flavored Markdown 扩展)。

---

*最后更新: 2025-01-15*
