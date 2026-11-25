import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import type { Category } from '@/data/types';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  category: Category;
  onPress: () => void;
  width?: number;
  stories?: number;
};

export function CategoryCard({ category, onPress, width, stories }: Props) {
  const { colors, resolved } = useAppTheme();
  const tint = resolved === 'dark' ? category.tintDark : category.tintLight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.press,
        width ? { width } : styles.flex,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={[tint, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: colors.border }]}
      >
        <View style={styles.top}>
          <View style={[styles.icon, { backgroundColor: resolved === 'dark' ? 'rgba(167,243,208,0.12)' : 'rgba(255,255,255,0.72)' }]}>
            <Ionicons name={category.icon} size={20} color={colors.accent} />
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.iconMuted} />
        </View>
        <AppText variant="cardTitle" numberOfLines={2} style={styles.name}>
          {category.name}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={2}>
          {category.description}
        </AppText>
        {typeof stories === 'number' ? (
          <AppText variant="meta" tone="accent">
            {stories} {stories === 1 ? 'story' : 'stories'}
          </AppText>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    minHeight: 156,
  },
  flex: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  card: {
    flex: 1,
    minHeight: 156,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 4,
  },
});
