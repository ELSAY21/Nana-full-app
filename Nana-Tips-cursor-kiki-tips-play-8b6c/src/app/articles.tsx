import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ArticleCard } from '@/components/ArticleCard';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { StackHeader } from '@/components/StackHeader';
import { useContent } from '@/state/ContentProvider';

export default function ArticlesScreen() {
  const { ready, refreshing, error, refresh, articles } = useContent();

  return (
    <Screen>
      <StackHeader title="Latest Articles" />
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
          <AppText variant="body" tone="muted" style={styles.intro}>
            Every story on yerase.com, newest first.
          </AppText>
          <View>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  intro: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
