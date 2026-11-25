import { Pressable, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { ArticleImage } from '@/components/ArticleImage';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ShareButton } from '@/components/ShareButton';
import { CategoryChip } from '@/components/CategoryChip';
import type { Article } from '@/data/types';
import { useContent } from '@/state/ContentProvider';
import { cardShadow } from '@/theme/shadow';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  article: Article;
  showCategory?: boolean;
};

export function ArticleCard({ article, showCategory = true }: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { categoryName } = useContent();
  const category = categoryName(article.categorySlug);

  const href = { pathname: '/article/[id]', params: { id: article.id } } as const;

  return (
    <View style={[styles.wrap, cardShadow(colors)]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Link href={href} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={article.title}
            style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}
          >
            <ArticleImage source={article.image} style={styles.image} backgroundColor={colors.mintSoft} />
          </Pressable>
        </Link>
        <View style={styles.body}>
          {showCategory ? (
            <CategoryChip
              label={category}
              onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: article.categorySlug } })}
            />
          ) : null}
          <Link href={href} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel={article.title} style={{ gap: 6 }}>
              <AppText variant="cardTitle" numberOfLines={2}>
                {article.title}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={2}>
                {article.excerpt}
              </AppText>
            </Pressable>
          </Link>
          <View style={styles.footer}>
            <ShareButton articleId={article.id} title={article.title} />
            <BookmarkButton articleId={article.id} title={article.title} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
