import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

import { AppearanceControl } from '@/components/AppearanceControl';
import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { useBookmarks } from '@/state/BookmarksProvider';
import { useContent } from '@/state/ContentProvider';
import { useNotifications } from '@/state/NotificationsProvider';
import { cardShadow } from '@/theme/shadow';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { ids } = useBookmarks();
  const { articles } = useContent();
  const { prefs, unread } = useNotifications();
  const alertsOn = prefs.enabled && prefs.newPosts;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.forest, colors.emerald]} style={styles.hero}>
          <View style={styles.logoPlate}>
            <Logo size={64} />
          </View>
          <AppText variant="body" style={styles.tagline}>
            Free technology stories for everyone.
          </AppText>
        </LinearGradient>

        <View style={styles.stats}>
          <View style={[styles.stat, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText variant="button">{articles.length}</AppText>
            <AppText variant="meta" tone="muted">
              Stories
            </AppText>
          </View>
          <View style={[styles.stat, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText variant="button">{ids.length}</AppText>
            <AppText variant="meta" tone="muted">
              Saved
            </AppText>
          </View>
          <View style={[styles.stat, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText variant="button" tone={alertsOn ? 'accent' : 'text'}>
              {alertsOn ? 'On' : 'Off'}
            </AppText>
            <AppText variant="meta" tone="muted">
              Alerts
            </AppText>
          </View>
        </View>

        <AppText variant="meta" tone="muted" style={styles.label}>
          APPEARANCE
        </AppText>
        <View style={[styles.card, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.appearance}>
            <AppText variant="button">Theme</AppText>
            <AppText variant="caption" tone="muted">
              Light, dark, or match this device.
            </AppText>
            <AppearanceControl />
          </View>
        </View>

        <AppText variant="meta" tone="muted" style={styles.label}>
          KIKI TIPS
        </AppText>
        <View style={[styles.card, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            subtitle={alertsOn ? 'Alerts when a new story is published' : 'New-story alerts are off'}
            value={unread > 0 ? String(unread) : undefined}
            onPress={() => router.push('/notifications')}
          />
          <SettingsRow
            icon="information-circle-outline"
            label="About Us"
            subtitle="The publication behind the app"
            onPress={() => router.push('/about')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            subtitle="How Kiki Tips handles information"
            onPress={() => router.push('/privacy')}
            last
          />
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" tone="muted" style={styles.center}>
            Stay informed. Stay ahead.
          </AppText>
          <AppText variant="meta" tone="muted" style={styles.center}>
            Version {version}
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  logoPlate: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  stat: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
    letterSpacing: 0.8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  appearance: {
    padding: 16,
    gap: 8,
  },
  footer: {
    paddingTop: 28,
    paddingHorizontal: 24,
    gap: 6,
  },
  center: {
    textAlign: 'center',
  },
});
