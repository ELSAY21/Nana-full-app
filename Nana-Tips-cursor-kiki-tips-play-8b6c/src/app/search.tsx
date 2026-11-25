import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { StackHeader } from '@/components/StackHeader';
import { useFontReady } from '@/state/FontReady';
import { useContent } from '@/state/ContentProvider';
import { useAppTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/typography';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const { custom } = useFontReady();
  const { ready, error, refresh, search } = useContent();
  const [query, setQuery] = useState('');
  const results = search(query);
  const hasQuery = query.trim().length > 0;

  return (
    <Screen>
      <StackHeader title="Search" />
      {!ready && error ? (
        <ErrorState title="Search unavailable" message={error} actionLabel="Try again" onAction={() => refresh()} />
      ) : !ready ? (
        <LoadingState />
      ) : (
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.field, { backgroundColor: colors.input, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.iconMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search stories, topics, or categories"
              placeholderTextColor={colors.iconMuted}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search stories"
              style={[styles.input, { color: colors.text, fontFamily: custom ? font.medium : undefined }]}
            />
            {hasQuery ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.iconMuted} />
              </Pressable>
            ) : null}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {!hasQuery ? (
              <EmptyState
                icon="search"
                title="Search Kiki Tips"
                message="Find stories from yerase.com by title, topic, or category."
              />
            ) : results.length === 0 ? (
              <EmptyState
                icon="search"
                title="No matching stories"
                message="Try a topic like AI, mobile, security, or how-to."
                actionLabel="Clear search"
                onAction={() => setQuery('')}
              />
            ) : (
              <View>
                <AppText variant="meta" tone="muted" style={styles.count}>
                  {results.length} {results.length === 1 ? 'story' : 'stories'}
                </AppText>
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  field: {
    marginHorizontal: 16,
    marginBottom: 8,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  content: {
    paddingBottom: 28,
  },
  count: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
