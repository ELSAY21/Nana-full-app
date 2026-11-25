import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import type { IonName } from '@/data/types';
import type { Appearance } from '@/theme/ThemeProvider';
import { cardShadow } from '@/theme/shadow';
import { useAppTheme } from '@/theme/ThemeProvider';

const options: { value: Appearance; label: string; icon: IonName }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export function AppearanceControl() {
  const { colors, appearance, setAppearance } = useAppTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.mintSoft }]}>
      {options.map((option) => {
        const selected = appearance === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label} appearance`}
            onPress={() => setAppearance(option.value)}
            style={[
              styles.option,
              selected && [styles.selected, cardShadow(colors), { backgroundColor: colors.card }],
            ]}
          >
            <Ionicons name={option.icon} size={16} color={selected ? colors.accent : colors.iconMuted} />
            <AppText variant="meta" tone={selected ? 'accent' : 'muted'} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  selected: {
    borderWidth: 0,
  },
});
