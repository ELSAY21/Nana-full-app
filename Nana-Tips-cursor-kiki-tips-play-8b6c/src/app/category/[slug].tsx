import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HomeStoryCard } from '@/components/HomeStoryCard';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { StackHeader } from '@/components/StackHeader';
import type { Article } from '@/data/types';
import { useContent } from '@/state/ContentProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { firstParam } from '@/utils/params';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { ready, refreshing, error, refresh, categoryBySlug, articlesIn } = useContent();
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = firstParam(params.slug) ?? '';
  const category = categoryBySlug(slug);

  if (!ready && error) {
    return (
      <Screen>
        <StackHeader title="Category" />
        <ErrorState title="Stories unavailable" message={error} actionLabel="Try again" onAction={() => refresh()} />
      </Screen>
    );
  }

  if (!ready) {
    return (
      <Screen>
        <StackHeader title="Category" />
        <LoadingState />
      </Screen>
    );
  }

  if (!category) {
    return (
      <Screen>
        <StackHeader title="Category" />
        <EmptyState
          icon="grid-outline"
          title="Category not found"
          message="That topic is not on yerase.com."
          actionLabel="Browse categories"
          onAction={() => router.replace('/categories')}
        />
      </Screen>
    );
  }

  const stories = articlesIn(category.slug);
  const rows: Article[][] = [];
  for (let index = 0; index < stories.length; index += 2) {
    rows.push(stories.slice(index, index + 2));
  }

  return (
    <Screen>
      <StackHeader title={category.shortName} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh()} tintColor="#059669" />}
      >
        <LinearGradient colors={[colors.forest, colors.emerald]} style={styles.banner}>
          <Ionicons name={category.icon} size={24} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.copy}>
          <AppText variant="heading">{category.name}</AppText>
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {category.description}
          </AppText>
          <AppText variant="meta" tone="accent">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
          </AppText>
        </View>
        {stories.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="No stories in this topic"
            message="When a post is published in this category, it will show up here."
            actionLabel="Back"
            onAction={() => router.back()}
          />
        ) : (
          <View style={styles.grid}>
            {rows.map((row) => (
              <View key={row.map((article) => article.id).join('-')} style={styles.row}>
                {row.map((article) => (
                  <View key={article.id} style={styles.cell}>
                    <HomeStoryCard article={article} compact />
                  </View>
                ))}
                {row.length === 1 ? <View style={styles.cell} /> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  banner: {
    marginHorizontal: 12,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 4,
  },
  grid: {
    paddingHorizontal: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
});
