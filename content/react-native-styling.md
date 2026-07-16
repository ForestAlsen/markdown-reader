# React Native 样式指南

> React Native 使用类似 CSS 的样式系统,但有一些重要区别。

## 核心区别

| CSS | React Native |
| --- | --- |
| `display: flex` | 默认就是 flex |
| `px` 单位 | 无单位(数字) |
| `color: red` | `color: 'red'` |
| `font-size: 14px` | `fontSize: 14` |
| `background-color` | `backgroundColor` |
| `text-align` | `textAlign` |

## Flexbox

React Native 默认 flexbox,且默认 `flexDirection: 'column'`:

```typescript
import { View, Text } from 'react-native';

<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
  <View style={{ flex: 1, backgroundColor: 'red' }} />
  <View style={{ flex: 2, backgroundColor: 'blue' }} />
</View>
```

### 常用属性

- `flex: 1` - 占满剩余空间
- `justifyContent`: `flex-start` | `center` | `flex-end` | `space-between` | `space-around`
- `alignItems`: `flex-start` | `center` | `flex-end` | `stretch`
- `gap` - 间距(SDK 68+ 支持)

## StyleSheet

使用 `StyleSheet.create` 获得性能优化:

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
});
```

## 主题方案

```typescript
const dark = {
  background: '#1a1a1a',
  text: '#e0e0e0',
  surface: '#2a2a2a',
  primary: '#4a9eff',
};

const light = {
  background: '#f5f5f5',
  text: '#333333',
  surface: '#ffffff',
  primary: '#007aff',
};

const theme = isDark ? dark : light;
```

## 响应式

```typescript
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    width: width > 600 ? '48%' : '100%',
  },
});
```

---

*RN 0.76+*
