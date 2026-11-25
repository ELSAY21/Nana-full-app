import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { useAppTheme } from '@/theme/ThemeProvider';

export function LoadingState() {
  const { colors } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Logo size={64} />
      <AppText variant="heading">Kiki Tips</AppText>
      <AppText variant="caption" tone="muted">
        Preparing your stories
      </AppText>
      <View style={styles.stack}>
        <Animated.View style={[styles.featured, { backgroundColor: colors.skeleton, opacity }]} />
        <Animated.View style={[styles.row, { backgroundColor: colors.skeleton, opacity }]} />
        <Animated.View style={[styles.row, { backgroundColor: colors.skeleton, opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  stack: {
    alignSelf: 'stretch',
    marginTop: 28,
    gap: 12,
  },
  featured: {
    height: 160,
    borderRadius: 24,
  },
  row: {
    height: 148,
    borderRadius: 22,
  },
});
