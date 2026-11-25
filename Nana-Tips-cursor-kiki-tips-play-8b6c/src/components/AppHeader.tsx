import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { useAppTheme } from '@/theme/ThemeProvider';

export function SearchButton() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Pressable
      testID="search-button"
      accessibilityRole="button"
      accessibilityLabel="Search stories"
      onPress={() => router.push('/search')}
      style={({ pressed }) => [styles.button, { backgroundColor: pressed ? colors.emeraldPressed : colors.emerald }]}
    >
      <Ionicons name="search" size={16} color={colors.onEmerald} />
      <AppText variant="button" tone="inverse" numberOfLines={1}>
        Search
      </AppText>
    </Pressable>
  );
}

export function AppHeader() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Logo size={36} />
      <AppText variant="heading" numberOfLines={1} style={[styles.name, { color: colors.text }]}>
        Kiki Tips
      </AppText>
      <SearchButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  button: {
    flexShrink: 0,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
