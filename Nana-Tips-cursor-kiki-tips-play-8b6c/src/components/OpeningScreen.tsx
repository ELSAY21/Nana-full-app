import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { useAppTheme } from '@/theme/ThemeProvider';

const nativeDriver = Platform.OS !== 'web';

export function OpeningScreen() {
  const { colors } = useAppTheme();
  const [scale] = useState(() => new Animated.Value(0.98));

  useEffect(() => {
    const settle = Animated.spring(scale, {
      toValue: 1,
      friction: 9,
      tension: 120,
      useNativeDriver: nativeDriver,
    });
    settle.start();
    return () => settle.stop();
  }, [scale]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Logo size={96} />
      </Animated.View>
      <Text style={[styles.credit, { color: colors.textMuted }]}>
        Stories from <Text style={[styles.brand, { color: colors.text }]}>yerase.com</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credit: {
    position: 'absolute',
    bottom: 48,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  brand: {
    fontWeight: '700',
  },
});
