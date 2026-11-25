import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import type { IonName } from '@/data/types';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? colors.emeraldPressed : colors.emerald },
      ]}
    >
      <AppText variant="button" tone="inverse">
        {label}
      </AppText>
    </Pressable>
  );
}

type EmptyProps = {
  icon?: IonName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'bookmark-outline', title, message, actionLabel, onAction }: EmptyProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: colors.mintSoft }]}>
        <Ionicons name={icon} size={32} color={colors.accent} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {title}
      </AppText>
      <AppText variant="body" tone="muted" style={styles.center}>
        {message}
      </AppText>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 10,
  },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  center: {
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
