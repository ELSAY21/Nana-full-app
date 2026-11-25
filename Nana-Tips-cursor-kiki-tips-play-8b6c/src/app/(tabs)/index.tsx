import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { FeaturedArticle } from '@/components/FeaturedArticle';
import { HomeStoryCard } from '@/components/HomeStoryCard';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StoryAd } from '@/components/StoryAd';
import { HOME_PAGE_SIZE, homeFeed } from '@/data/queries';
import type { Article } from '@/data/types';
import { useContent } from '@/state/ContentProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { ready, refreshing, error, refresh, articles } = useContent();
  const [shown, setShown] = useState(HOME_PAGE_SIZE);
  const { featured, latest, hasMore } = homeFeed(articles, shown);
  const rows: Article[][] = [];
  for (let index = 0; index < latest.length; index += 2) {
    rows.push(latest.slice(index, index + 2));
  }

  return (
    <Screen>
      <AppHeader />
      {!ready && error ? (
        <ErrorState title="Stories unavailable" message={error} actionLabel="Try again" onAction={() => refresh()} />
      ) : !ready ? (
        <LoadingState />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh()} tintColor="#059669" />}
        >
          {featured ? (
            <>
              <SectionHeader title="Featured" />
              <FeaturedArticle article={featured} showCategory={false} />
            </>
          ) : (
            <EmptyState
              icon="newspaper-outline"
              title="No stories yet"
              message="Posts published on yerase.com will show up here."
            />
          )}
          {latest.length > 0 ? (
            <>
              <SectionHeader title="Latest Articles" />
              <View style={styles.grid}>
                {rows.map((row) => {
                  const rowKey = row.map((article) => article.id).join('-');
                  return (
                    <View key={rowKey} style={styles.group}>
                      <View style={styles.row}>
                        {row.map((article) => (
                          <View key={article.id} style={styles.cell}>
                            <HomeStoryCard article={article} />
                          </View>
                        ))}
                        {row.length === 1 ? <View style={styles.cell} /> : null}
                      </View>
                      {row.length === 2 ? <StoryAd parentInset={12} /> : null}
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}
          {hasMore ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show more stories"
              onPress={() => setShown((count) => count + HOME_PAGE_SIZE)}
              style={({ pressed }) => [
                styles.more,
                { backgroundColor: pressed ? colors.emeraldPressed : colors.emerald },
              ]}
            >
              <AppText variant="button" tone="inverse">
                Show more
              </AppText>
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  grid: {
    paddingHorizontal: 12,
    gap: 10,
  },
  group: {
    gap: 8,
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
  more: {
    marginHorizontal: 12,
    marginTop: 8,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
