import { Platform, type ViewStyle } from 'react-native';

import type { Palette } from '@/theme/colors';

export function cardShadow(colors: Palette): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `0 10px 28px ${colors.shadow}` } as ViewStyle;
  }

  return {
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  };
}
