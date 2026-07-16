import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme';
import { api } from '@/lib/api';
import type { SearchResult } from '@/lib/types';

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onSearch = useCallback((text: string) => {
    setQuery(text);
    if (timer.current) clearTimeout(timer.current);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(text);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="搜索文章..."
          placeholderTextColor={colors.subtext}
          value={query}
          onChangeText={onSearch}
          autoFocus
          returnKeyType="search"
        />
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.accent}
            style={styles.spinner}
          />
        ) : null}
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.articleId}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {query.trim() ? '未找到相关文章' : '输入关键词搜索'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.resultCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push(`/article/${item.articleId}`)}
            activeOpacity={0.65}
          >
            <Text
              style={[styles.resultTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={[styles.snippet, { color: colors.subtext }]}
              numberOfLines={3}
            >
              {item.snippet}
            </Text>
            <Text style={[styles.matchCount, { color: colors.accent }]}>
              {item.matchCount} 处匹配
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  spinner: { marginLeft: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
  resultCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  resultTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, letterSpacing: -0.2 },
  snippet: { fontSize: 14, lineHeight: 21, marginBottom: 10 },
  matchCount: { fontSize: 12, fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 15, fontWeight: '500' },
});
