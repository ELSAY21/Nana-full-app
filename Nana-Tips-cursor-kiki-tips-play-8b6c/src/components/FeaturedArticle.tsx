import { Pressable, StyleSheet, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { ArticleImage } from '@/components/ArticleImage';
import { CategoryChip } from '@/components/CategoryChip';
import type { Article } from '@/data/types';
import { useContent } from '@/state/ContentProvider';
import { cardShadow } from '@/theme/shadow';
import { useAppTheme } from '@/theme/ThemeProvider';
type Props = {
  article: Article;
  showCategory?: boolean;
};

export function FeaturedArticle({ article, showCategory = true }: Props) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { categoryName } = useContent();

  const href = { pathname: '/article/[id]', params: { id: article.id } } as const;

  return (
    <View style={[styles.wrap, cardShadow(colors)]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Link href={href} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Featured story, ${article.title}`}
            style={({ pressed }) => ({ opacity: pressed ? 0.96 : 1 })}
          >
            <ArticleImage
              source={article.image}
              style={styles.image}
              backgroundColor={colors.mintSoft}
              fit="cover"
              aspectRatio={2.25}
            />
            <View style={styles.copy}>
              {showCategory ? (
                <CategoryChip
                  label={categoryName(article.categorySlug)}
                  onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: article.categorySlug } })}
                />
              ) : null}
              <AppText variant="heading" numberOfLines={2} style={styles.title}>
                {article.title}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={2}>
                {article.excerpt}
              </AppText>
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  copy: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
  },
});
