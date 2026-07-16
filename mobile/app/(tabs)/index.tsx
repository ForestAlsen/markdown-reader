import { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { api } from '@/lib/api';
import { saveLocalArticle, parseMarkdownToArticle } from '@/lib/storage';
import type { ArticleMeta } from '@/lib/types';

export default function ArticleList() {
  const router = useRouter();
  const { colors } = useTheme();
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.getArticles();
      setArticles(data);
    } catch (e) {
      console.error('Failed to load articles:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/plain', 'application/octet-stream'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || !result.assets?.length) return;

      let imported = 0;
      for (const asset of result.assets) {
        const file = new File(asset.uri);
        const content = await file.text();
        const filename = asset.name || 'imported.md';
        console.dir(`Importing file: ${file}`);
        const article = parseMarkdownToArticle(filename, content);
        console.dir(`Parsed article: ${article}`);
        await saveLocalArticle(article);
        imported++;
      }

      if (imported > 0) {
        Alert.alert('导入成功', `已导入 ${imported} 篇文章`);
        await load();
      }
    } catch (e) {
      Alert.alert('导入失败', (e as Error).message);
    }
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: ArticleMeta }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
        },
      ]}
      onPress={() => router.push(`/article/${item.id}`)}
      activeOpacity={0.65}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={[styles.category, { color: colors.accent }]}>
            {item.category}
          </Text>
        </View>
        <Text style={[styles.readingTime, { color: colors.subtext }]}>
          {item.readingTime} 分钟
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.description ? (
        <Text
          style={[styles.desc, { color: colors.subtext }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      ) : null}
      <View style={styles.tagsRow}>
        {item.tags.slice(0, 3).map((tag, i) => (
          <View
            key={i}
            style={[styles.tagBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.tagText, { color: colors.subtext }]}>
              {tag}
            </Text>
          </View>
        ))}
        <Text style={[styles.wordCount, { color: colors.subtext }]}>
          {item.wordCount} 字
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { backgroundColor: colors.background },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              暂无文章
            </Text>
          </View>
        )}
      />
      {/* Import FAB */}
      <TouchableOpacity
        style={[
          styles.importFab,
          {
            backgroundColor: colors.accent,
            shadowColor: '#000',
          },
        ]}
        onPress={handleImport}
        activeOpacity={0.65}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingTop: 12, flexGrow: 1 },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  category: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  readingTime: { fontSize: 12, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, lineHeight: 26, letterSpacing: -0.3 },
  desc: { fontSize: 14, marginBottom: 14, lineHeight: 21, fontWeight: '400' },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: '500' },
  wordCount: { fontSize: 12, marginLeft: 'auto', fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120 },
  emptyText: { fontSize: 15, fontWeight: '500' },
  importFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
