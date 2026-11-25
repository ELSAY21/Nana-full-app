import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/EmptyState';
import { useAppTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({ title, message, actionLabel, onAction }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { backgroundColor: colors.mintSoft }]}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.accent} />
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
});
