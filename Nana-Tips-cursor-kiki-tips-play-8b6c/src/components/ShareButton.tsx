import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAppTheme } from '@/theme/ThemeProvider';
import { shareStory } from '@/utils/shareStory';

type Props = {
  articleId: string;
  title: string;
};

export function ShareButton({ articleId, title }: Props) {
  const { colors } = useAppTheme();
  const [busy, setBusy] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Share ${title}`}
      hitSlop={8}
      disabled={busy}
      onPress={() => {
        setBusy(true);
        shareStory(title, articleId).finally(() => setBusy(false));
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.emeraldPressed : colors.emerald,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
    >
      <Ionicons name="share-social" size={16} color={colors.onEmerald} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
