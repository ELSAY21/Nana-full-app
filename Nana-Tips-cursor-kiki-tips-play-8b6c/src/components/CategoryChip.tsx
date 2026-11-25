import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  label: string;
  onPress?: () => void;
  onImage?: boolean;
};

export function CategoryChip({ label, onPress, onImage = false }: Props) {
  const { colors } = useAppTheme();
  const chip = (
    <View
      style={[
        styles.chip,
        onImage
          ? { backgroundColor: 'rgba(255,255,255,0.94)' }
          : { backgroundColor: colors.chipBg },
      ]}
    >
      <AppText variant="meta" tone={onImage ? 'forest' : 'chip'} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );

  if (!onPress) return chip;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${label}`} onPress={onPress} hitSlop={6}>
      {chip}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
});
