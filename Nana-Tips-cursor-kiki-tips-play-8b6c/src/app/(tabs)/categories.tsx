import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { CategoryCard } from '@/components/CategoryCard';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { useContent } from '@/state/ContentProvider';

export default function CategoriesScreen() {
  const router = useRouter();
  const { ready, refreshing, error, refresh, categories, articlesIn } = useContent();

  const open = (slug: string) => {
    router.push({ pathname: '/category/[slug]', params: { slug } });
  };

  return (
    <Screen>
      {!ready && error ? (
        <ErrorState title="Categories unavailable" message={error} actionLabel="Try again" onAction={() => refresh()} />
      ) : !ready ? (
        <LoadingState />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh()} tintColor="#059669" />}
        >
          <View style={styles.header}>
            <AppText variant="display">Categories</AppText>
            <AppText variant="body" tone="muted">
              The same topics as yerase.com. A new post appears in the category it was filed under.
            </AppText>
          </View>
          <View style={styles.grid}>
            {categories.map((category) => (
              <View key={category.slug} style={styles.cell}>
                <CategoryCard
                  category={category}
                  stories={articlesIn(category.slug).length}
                  onPress={() => open(category.slug)}
                />
              </View>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  cell: {
    width: '50%',
    padding: 6,
  },
});
