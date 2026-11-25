import { type ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useFontReady } from '@/state/FontReady';
import { useAppTheme } from '@/theme/ThemeProvider';
import { font, type FontWeight } from '@/theme/typography';

type Variant = 'display' | 'title' | 'heading' | 'cardTitle' | 'lead' | 'body' | 'button' | 'caption' | 'meta';
type Tone = 'text' | 'muted' | 'accent' | 'inverse' | 'chip' | 'forest';

const variantStyle: Record<Variant, { size: number; line: number; weight: FontWeight; tracking?: number }> = {
  display: { size: 32, line: 38, weight: 'bold', tracking: -0.6 },
  title: { size: 28, line: 34, weight: 'bold', tracking: -0.4 },
  heading: { size: 20, line: 26, weight: 'bold', tracking: -0.2 },
  cardTitle: { size: 16, line: 22, weight: 'bold', tracking: -0.2 },
  lead: { size: 16, line: 24, weight: 'medium' },
  body: { size: 15, line: 23, weight: 'regular' },
  button: { size: 14, line: 18, weight: 'semibold' },
  caption: { size: 13, line: 18, weight: 'regular' },
  meta: { size: 12, line: 16, weight: 'semibold' },
};

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function AppText({ variant = 'body', tone = 'text', style, children, ...props }: Props) {
  const { colors } = useAppTheme();
  const { custom } = useFontReady();
  const spec = variantStyle[variant];
  const color = {
    text: colors.text,
    muted: colors.textMuted,
    accent: colors.accent,
    inverse: colors.inverse,
    chip: colors.chipText,
    forest: colors.forest,
  }[tone];

  return (
    <Text
      {...props}
      style={[
        styles.base,
        {
          color,
          fontSize: spec.size,
          lineHeight: spec.line,
          letterSpacing: spec.tracking,
          fontFamily: custom ? font[spec.weight] : undefined,
          fontWeight: custom ? undefined : spec.weight === 'regular' ? '400' : spec.weight === 'medium' ? '500' : spec.weight === 'semibold' ? '600' : '700',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
