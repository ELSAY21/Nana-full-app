import { Fragment } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { StoryAd } from '@/components/StoryAd';
import type { StoryBlock } from '@/data/types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { openExternalLink } from '@/utils/openLink';

type Props = {
  blocks: readonly StoryBlock[];
};

function adAfterTextBlock(blocks: readonly StoryBlock[]): boolean[] {
  const marks = blocks.map(() => false);
  let paragraphs = 0;
  blocks.forEach((block, index) => {
    if (block.kind !== 'text') return;
    paragraphs += 1;
    if (paragraphs % 3 === 0) marks[index] = true;
  });
  return marks;
}

export function StoryBody({ blocks }: Props) {
  const { colors } = useAppTheme();
  const adAfter = adAfterTextBlock(blocks);

  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === 'button') {
          return (
            <Pressable
              key={`button-${index}`}
              accessibilityRole="link"
              accessibilityLabel={block.text}
              onPress={() => openExternalLink(block.href)}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? colors.emeraldPressed : colors.emerald },
              ]}
            >
              <AppText variant="button" tone="inverse">
                {block.text}
              </AppText>
              <Ionicons name="open-outline" size={16} color={colors.onEmerald} />
            </Pressable>
          );
        }

        const paragraph = (
          <AppText key={`text-${index}`} variant="body" style={styles.paragraph}>
            {block.spans.map((span, spanIndex) =>
              span.href ? (
                <Text
                  key={`${index}-${spanIndex}`}
                  accessibilityRole="link"
                  accessibilityLabel={span.text}
                  onPress={() => openExternalLink(span.href!)}
                  style={{ color: colors.accent, textDecorationLine: 'underline' }}
                >
                  {span.text}
                </Text>
              ) : (
                <Text key={`${index}-${spanIndex}`}>{span.text}</Text>
              ),
            )}
          </AppText>
        );
        if (!adAfter[index]) return paragraph;
        return (
          <Fragment key={`text-${index}`}>
            {paragraph}
            <StoryAd parentInset={16} />
          </Fragment>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    marginTop: 4,
  },
  button: {
    alignSelf: 'flex-start',
    minHeight: 44,
    marginTop: 4,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
