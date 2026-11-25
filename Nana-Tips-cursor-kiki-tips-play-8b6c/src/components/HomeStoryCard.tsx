import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';

import { AppText } from '@/components/AppText';
import { ArticleImage } from '@/components/ArticleImage';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ShareButton } from '@/components/ShareButton';
import type { Article } from '@/data/types';
import { cardShadow } from '@/theme/shadow';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  article: Article;
  compact?: boolean;
};

export function HomeStoryCard({ article, compact = false }: Props) {
  const { colors } = useAppTheme();
  const href = { pathname: '/article/[id]', params: { id: article.id } } as const;

  return (
    <View style={[styles.card, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.main}>
        <Link href={href} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={article.title}
            style={StyleSheet.flatten(styles.link)}
          >
            <ArticleImage
              source={article.image}
              style={styles.image}
              backgroundColor={colors.mintSoft}
              fit="cover"
              aspectRatio={compact ? 1.85 : 1.5}
            />
            <View style={[styles.copy, compact && styles.copyCompact]}>
              <AppText variant="cardTitle" numberOfLines={2}>
                {article.title}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={compact ? 2 : 3}>
                {article.excerpt}
              </AppText>
            </View>
          </Pressable>
        </Link>
      </View>
      <View style={[styles.footer, compact && styles.footerCompact]}>
        <ShareButton articleId={article.id} title={article.title} />
        <BookmarkButton articleId={article.id} title={article.title} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
  },
  link: {
    gap: 0,
  },
  image: {
    width: '100%',
  },
  copy: {
    paddingHorizontal: 10,
    paddingTop: 8,
    gap: 4,
  },
  copyCompact: {
    paddingHorizontal: 8,
    paddingTop: 6,
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  footerCompact: {
    paddingTop: 4,
    paddingBottom: 6,
  },
});
