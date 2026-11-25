import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <AppText variant="heading" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        <View style={[styles.rule, { backgroundColor: colors.emerald }]} />
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={8}
          style={styles.action}
        >
          <AppText variant="button" tone="accent">
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    flex: 0,
  },
  rule: {
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 36,
  },
});
