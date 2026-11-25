import { Fragment, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleImage } from '@/components/ArticleImage';
import { BookmarkButton } from '@/components/BookmarkButton';
import { CategoryChip } from '@/components/CategoryChip';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { ShareButton } from '@/components/ShareButton';
import { StoryAd } from '@/components/StoryAd';
import { StoryBody } from '@/components/StoryBody';
import { StackHeader } from '@/components/StackHeader';
import type { StoryImage } from '@/data/types';
import { useContent } from '@/state/ContentProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatPublishedDate, formatReadTime } from '@/utils/format';
import { firstParam } from '@/utils/params';

function heroAspect(image: StoryImage | null): number {
  if (!image?.width || !image?.height) return 3 / 2;
  return image.width / image.height;
}

export default function ArticleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { ready, error, refresh, articleById, related, categoryName, categoryShortName } = useContent();
  const params = useLocalSearchParams<{ id: string }>();
  const id = firstParam(params.id) ?? '';
  const article = articleById(id);
  const [check, setCheck] = useState({ id: '', done: false });
  const checked = check.id === id && check.done;

  useEffect(() => {
    if (!ready || article || checked) return;
    let active = true;
    refresh().finally(() => {
      if (active) setCheck({ id, done: true });
    });
    return () => {
      active = false;
    };
  }, [article, checked, id, ready, refresh]);

  if (!ready && error) {
    return (
      <Screen>
        <StackHeader title="Article" />
        <ErrorState title="Story unavailable" message={error} actionLabel="Try again" onAction={() => refresh()} />
      </Screen>
    );
  }

  if (!ready || (!article && !checked)) {
    return (
      <Screen>
        <StackHeader title="Article" />
        <LoadingState />
      </Screen>
    );
  }

  if (!article) {
    return (
      <Screen>
        <StackHeader title="Article" />
        <ErrorState
          title="Story unavailable"
          message="This story could not be opened."
          actionLabel="Back to Home"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  const more = related(article);
  const category = categoryName(article.categorySlug);

  return (
    <Screen>
      <StackHeader
        title={categoryShortName(article.categorySlug)}
        right={
          <>
            <ShareButton articleId={article.id} title={article.title} />
            <BookmarkButton articleId={article.id} title={article.title} />
          </>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <CategoryChip
            label={category}
            onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: article.categorySlug } })}
          />
          <AppText variant="title">{article.title}</AppText>
          <AppText variant="meta" tone="muted">
            {formatPublishedDate(article.publishedAt)} · {formatReadTime(article.readMinutes)}
          </AppText>
        </View>
        <View style={styles.heroFrame}>
          <ArticleImage
            source={article.image}
            radius={20}
            backgroundColor={colors.mintSoft}
            fit="contain"
            aspectRatio={heroAspect(article.image)}
          />
        </View>
        <View style={styles.copy}>
          <AppText variant="lead">{article.excerpt}</AppText>
          {article.blocks?.length ? (
            <StoryBody blocks={article.blocks} />
          ) : (
            article.body.map((paragraph, index) => (
              <Fragment key={`${article.id}-${index}`}>
                <AppText variant="body" style={styles.paragraph}>
                  {paragraph}
                </AppText>
                {(index + 1) % 3 === 0 ? <StoryAd parentInset={16} /> : null}
              </Fragment>
            ))
          )}
        </View>
        {more.length > 0 ? (
          <View style={styles.related}>
            <AppText variant="heading" style={styles.relatedTitle}>
              More stories
            </AppText>
            {more.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  intro: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  heroFrame: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  copy: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  paragraph: {
    marginTop: 4,
  },
  related: {
    marginTop: 12,
  },
  relatedTitle: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
