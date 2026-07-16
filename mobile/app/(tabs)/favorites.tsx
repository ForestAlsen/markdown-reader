import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme';
import { getFavorites, removeFavorite } from '@/lib/storage';
import type { FavoriteItem } from '@/lib/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const favs = await getFavorites();
    setFavorites(favs);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (articleId: string) => {
    await removeFavorite(articleId);
    load();
  };

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.articleId}
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
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            还没有收藏文章
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
            在阅读文章时点击收藏按钮即可添加
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.text,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cardBody}
            onPress={() => router.push(`/article/${item.articleId}`)}
            activeOpacity={0.65}
          >
            <View style={styles.categoryBadge}>
              <Text style={[styles.category, { color: colors.accent }]}>
                {item.category}
              </Text>
            </View>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={[styles.addedAt, { color: colors.subtext }]}>
              {new Date(item.addedAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.removeBtn,
              { borderLeftColor: colors.border },
            ]}
            onPress={() => handleRemove(item.articleId)}
            activeOpacity={0.5}
          >
            <Text style={[styles.removeText, { color: colors.accent }]}>
              删除
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingTop: 12, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardBody: { flex: 1, padding: 18 },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 23, letterSpacing: -0.2 },
  addedAt: { fontSize: 12, fontWeight: '500' },
  removeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderLeftWidth: 1,
  },
  removeText: { fontSize: 14, fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
