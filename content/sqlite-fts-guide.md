# SQLite 全文搜索指南

> 使用 SQLite FTS5 实现高效的全文搜索。

## 什么是 FTS5

FTS5(Full-Text Search 5)是 SQLite 内置的全文搜索扩展,支持:

- 快速全文检索
- 模糊匹配
- 相关性排名
- 布尔查询

## 创建索引

```sql
-- 创建虚拟表
CREATE VIRTUAL TABLE articles_fts USING fts5(
  article_id UNINDEXED,
  title,
  content,
  tokenize = 'porter unicode61'
);

-- 插入数据
INSERT INTO articles_fts (article_id, title, content)
VALUES ('expo-guide', 'Expo 开发入门', 'Expo 是 React Native...');
```

## 搜索查询

```sql
-- 基本搜索
SELECT article_id, title, rank
FROM articles_fts
WHERE articles_fts MATCH 'Expo'
ORDER BY rank;

-- 多词搜索(AND)
SELECT * FROM articles_fts WHERE articles_fts MATCH 'React Native';

-- 短语搜索
SELECT * FROM articles_fts WHERE articles_fts MATCH '"React Native"';

-- 前缀搜索
SELECT * FROM articles_fts WHERE articles_fts MATCH 'Expo*';

-- 布尔查询
SELECT * FROM articles_fts WHERE articles_fts MATCH 'Expo OR NestJS';
```

## 高亮与摘要

```sql
-- 高亮匹配文本
SELECT article_id, highlight(articles_fts, 2, '<', '>') as snippet
FROM articles_fts
WHERE articles_fts MATCH 'React';

-- 生成摘要
SELECT article_id, snippet(articles_fts, 2, '<', '>', '...', 10) as snippet
FROM articles_fts
WHERE articles_fts MATCH 'React';
```

## 在 Expo 中使用

```typescript
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('reader.db');

await db.execAsync(`
  CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    article_id UNINDEXED,
    title,
    content,
    tokenize = 'porter unicode61'
  );
`);

// 搜索
const results = await db.getAllAsync(
  `SELECT article_id, title, snippet(articles_fts, 2, '>>', '<<', '...', 10) as snippet
   FROM articles_fts WHERE articles_fts MATCH ? ORDER BY rank LIMIT 20`,
  [query]
);
```

## 性能建议

1. **批量插入**:使用事务
2. **索引重建**:内容更新后重建索引
3. **分页**:使用 `LIMIT` + `OFFSET`
4. **中文支持**:配合 `unicode61` 分词器处理 CJK

```sql
-- 批量插入
BEGIN TRANSACTION;
INSERT INTO articles_fts ...;
INSERT INTO articles_fts ...;
COMMIT;
```

---

*SQLite 3.40+ / expo-sqlite 14+*
