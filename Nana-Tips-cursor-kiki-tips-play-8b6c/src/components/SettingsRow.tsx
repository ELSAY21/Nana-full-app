import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import type { IonName } from '@/data/types';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  icon: IonName;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  accessory?: ReactNode;
  last?: boolean;
};

export function SettingsRow({ icon, label, subtitle, value, onPress, accessory, last = false }: Props) {
  const { colors } = useAppTheme();
  const content = (
    <View style={[styles.row, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.icon, { backgroundColor: colors.mintSoft }]}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <AppText variant="button" numberOfLines={1}>
          {label}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="caption" tone="muted">
          {value}
        </AppText>
      ) : null}
      {accessory}
      {onPress && !accessory ? <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.72 }}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
