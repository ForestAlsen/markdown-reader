import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '@/lib/theme';
import { api } from '@/lib/api';
import {
  isFavorite,
  addFavorite,
  removeFavorite,
  getProgress,
  saveProgress,
} from '@/lib/storage';
import type { ArticleMeta, TocItem } from '@/lib/types';

export default function ArticleReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fontPx, isDark } = useTheme();
  const [meta, setMeta] = useState<ArticleMeta | null>(null);
  const [content, setContent] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const restoredScroll = useRef(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getArticle(id);
      setMeta(data.meta);
      setContent(data.content);
      setToc(data.toc);
      setFav(await isFavorite(id));
    } catch (e) {
      console.error(e);
      Alert.alert('错误', '加载文章失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Restore reading progress
  useEffect(() => {
    if (!content || restoredScroll.current || !meta) return;
    (async () => {
      const prog = await getProgress(id);
      if (prog && prog.scrollY > 0) {
        // Use setTimeout to ensure content is laid out before scrolling
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: prog.scrollY, animated: false });
        }, 300);
      }
      restoredScroll.current = true;
    })();
  }, [content, id, meta]);

  const handleScroll = useCallback(
    (event: {
      nativeEvent: {
        contentOffset: { y: number };
        contentSize: { height: number };
        layoutMeasurement: { height: number };
      };
    }) => {
      if (!meta) return;
      const { y } = event.nativeEvent.contentOffset;
      const maxScroll =
        event.nativeEvent.contentSize.height -
        event.nativeEvent.layoutMeasurement.height;
      saveProgress({
        articleId: id,
        scrollY: Math.round(y),
        scrollRatio: maxScroll > 0 ? y / maxScroll : 0,
        updatedAt: Date.now(),
      });
    },
    [id, meta],
  );

  const toggleFav = async () => {
    if (!meta) return;
    if (fav) {
      await removeFavorite(id);
      setFav(false);
    } else {
      await addFavorite({
        articleId: id,
        title: meta.title,
        category: meta.category,
        addedAt: Date.now(),
      });
      setFav(true);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!meta) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>文章未找到</Text>
      </View>
    );
  }

  const markdownStyle = StyleSheet.create({
    body: { color: colors.text, fontSize: fontPx, lineHeight: fontPx * 1.75 },
    heading1: {
      color: colors.text,
      fontSize: fontPx + 12,
      fontWeight: 'bold',
      marginTop: 28,
      marginBottom: 14,
      letterSpacing: -0.5,
    },
    heading2: {
      color: colors.text,
      fontSize: fontPx + 8,
      fontWeight: '700',
      marginTop: 24,
      marginBottom: 12,
      letterSpacing: -0.3,
    },
    heading3: {
      color: colors.text,
      fontSize: fontPx + 4,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
      letterSpacing: -0.2,
    },
    paragraph: {
      color: colors.text,
      fontSize: fontPx,
      lineHeight: fontPx * 1.75,
      marginVertical: 10,
    },
    link: { color: colors.accent, textDecorationLine: 'underline', fontWeight: '500' },
    code_inline: {
      color: isDark ? '#fb923c' : '#c2410c',
      backgroundColor: isDark ? '#292524' : '#fafaf9',
      padding: 3,
      borderRadius: 5,
      fontFamily: 'Courier',
      fontSize: fontPx - 1,
    },
    fence: {
      backgroundColor: isDark ? '#1c1917' : '#fafaf9',
      marginVertical: 14,
      borderRadius: 10,
    },
    blockquote: {
      backgroundColor: isDark ? '#1c1917' : '#fafaf9',
      borderLeftColor: colors.accent,
      borderLeftWidth: 4,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginVertical: 10,
      borderRadius: 6,
    },
    bullet_list: { marginVertical: 10 },
    ordered_list: { marginVertical: 10 },
    list_item: { flexDirection: 'row', marginVertical: 5 },
    table: { borderWidth: 1, borderColor: colors.border, marginVertical: 10, borderRadius: 8, overflow: 'hidden' },
    th: { backgroundColor: isDark ? '#292524' : '#f5f5f4', padding: 10 },
    td: { padding: 10, borderTopWidth: 1, borderColor: colors.border },
  });

  // Custom rule for fenced code blocks — renders a RN-native ScrollView + Text
  // instead of react-syntax-highlighter (which renders web DOM and crashes in RN).
  const rules = {
    fence: (node: {
      key: string | number;
      sourceInfo?: string;
      content?: string;
    }) => {
      const lang = node.sourceInfo?.trim() || 'text';
      const code = node.content || '';
      return (
        <View
          key={node.key}
          style={{
            marginVertical: 14,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: isDark ? '#1c1917' : '#fafaf9',
            borderWidth: 1,
            borderColor: isDark ? '#292524' : '#e7e5e4',
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#292524' : '#f5f5f4',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#44403c' : '#e7e5e4',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: isDark ? '#a8a29e' : '#78716c', fontSize: 12, fontFamily: 'Courier', fontWeight: '600' }}>
              {lang}
            </Text>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text
              style={{
                color: isDark ? '#e7e5e4' : '#44403c',
                fontFamily: 'Courier',
                fontSize: fontPx - 2,
                lineHeight: fontPx * 1.5,
                padding: 14,
              }}
            >
              {code}
            </Text>
          </ScrollView>
        </View>
      );
    },
    code_inline: (
      node: { key: string | number },
      children: React.ReactNode,
    ) => {
      return (
        <Text key={node.key} style={markdownStyle.code_inline}>
          {children}
        </Text>
      );
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.articleTitle, { color: colors.text }]}>
          {meta.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={[styles.metaText, { color: colors.accent }]}>
              {meta.category}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: colors.subtext }]}>
            {meta.wordCount} 字 · {meta.readingTime} 分钟
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Markdown style={markdownStyle} rules={rules}>
          {content}
        </Markdown>
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Floating action buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.text,
            },
          ]}
          onPress={() => setShowToc(true)}
          activeOpacity={0.65}
        >
          <MaterialIcons name="format-list-bulleted" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.text,
            },
          ]}
          onPress={toggleFav}
          activeOpacity={0.65}
        >
          <MaterialIcons
            name={fav ? 'favorite' : 'favorite-border'}
            size={22}
            color={fav ? colors.accent : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* TOC Modal */}
      <Modal
        visible={showToc}
        transparent
        animationType="slide"
        onRequestClose={() => setShowToc(false)}
      >
        <Pressable
          style={styles.tocOverlay}
          onPress={() => setShowToc(false)}
        >
          <Pressable
            style={[styles.tocSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[styles.tocHeader, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.tocTitle, { color: colors.text }]}>
                目录
              </Text>
              <TouchableOpacity onPress={() => setShowToc(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={toc}
              keyExtractor={(_, i) => String(i)}
              ItemSeparatorComponent={() => (
                <View style={[styles.tocDivider, { backgroundColor: colors.border }]} />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.tocItem,
                    { paddingLeft: (item.level - 1) * 18 + 16 },
                  ]}
                  onPress={() => {
                    // Note: react-native-markdown-display doesn't generate native
                    // heading IDs. Full anchor scrolling would require custom
                    // heading renderers. For now, just close the TOC.
                    setShowToc(false);
                  }}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.tocItemText,
                      {
                        color: colors.text,
                        fontWeight: item.level === 1 ? '700' : '400',
                        fontSize: item.level === 1 ? 16 : 14,
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  articleTitle: { fontSize: 26, fontWeight: '800', marginBottom: 10, lineHeight: 34, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: { fontSize: 13, fontWeight: '500' },
  divider: { height: 1, marginVertical: 16 },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    gap: 14,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  tocOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tocSheet: {
    maxHeight: '60%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  tocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  tocTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  tocItem: { paddingVertical: 12, paddingRight: 16 },
  tocItemText: { fontSize: 15, lineHeight: 22 },
  tocDivider: { height: 1, marginLeft: 16 },
});
