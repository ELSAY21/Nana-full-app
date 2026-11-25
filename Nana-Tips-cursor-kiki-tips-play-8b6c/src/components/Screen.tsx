import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edges } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  children: ReactNode;
  edges?: Edges;
};

export function Screen({ children, edges = ['top', 'left', 'right'] }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, styles.blobTop, { backgroundColor: colors.leaf }]} />
        <View style={[styles.blob, styles.blobBottom, { backgroundColor: colors.leaf }]} />
      </View>
      <SafeAreaView edges={edges} style={styles.fill}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 180,
    height: 180,
    top: -110,
    right: -90,
    opacity: 0.7,
  },
  blobBottom: {
    width: 180,
    height: 180,
    bottom: 40,
    left: -80,
    opacity: 0.55,
  },
});
