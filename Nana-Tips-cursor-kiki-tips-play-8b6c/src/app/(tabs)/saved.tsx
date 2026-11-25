import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { useBookmarks } from '@/state/BookmarksProvider';
import { useContent } from '@/state/ContentProvider';

export default function SavedScreen() {
  const router = useRouter();
  const { ids } = useBookmarks();
  const { ready, error, refresh, saved } = useContent();
  const stories = saved(ids);

  return (
    <Screen>
      {!ready && error ? (
        <ErrorState title="Stories unavailable" message={error} actionLabel="Try again" onAction={() => refresh()} />
      ) : !ready ? (
        <LoadingState />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <AppText variant="display">Saved Articles</AppText>
            <AppText variant="body" tone="muted">
              Your bookmarked articles stay on this device.
            </AppText>
          </View>
          {stories.length === 0 ? (
            <EmptyState
              icon="bookmark-outline"
              title="No saved stories yet"
              message="Bookmark a story and it will wait for you here, even after you close the app."
              actionLabel="Explore stories"
              onAction={() => router.push('/')}
            />
          ) : (
            <View style={styles.list}>
              {stories.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 6,
  },
  list: {
    marginTop: 4,
  },
});
