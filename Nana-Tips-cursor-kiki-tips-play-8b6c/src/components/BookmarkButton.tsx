import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useBookmarks } from '@/state/BookmarksProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  articleId: string;
  title: string;
};

export function BookmarkButton({ articleId, title }: Props) {
  const { colors } = useAppTheme();
  const { isSaved, toggle } = useBookmarks();
  const saved = isSaved(articleId);

  const onToggle = () => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    toggle(articleId);
  };

  return (
    <Pressable
      testID={`bookmark-${articleId}`}
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${title} from saved` : `Save ${title}`}
      accessibilityState={{ selected: saved }}
      hitSlop={8}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: saved ? colors.chipBg : colors.surface,
          borderColor: saved ? colors.chipBg : colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? colors.accent : colors.iconMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function BookmarkSpacer() {
  return <View style={styles.button} />;
}
