import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SettingsRow } from '@/components/SettingsRow';
import { StackHeader } from '@/components/StackHeader';
import { useNotifications } from '@/state/NotificationsProvider';
import { cardShadow } from '@/theme/shadow';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatPublishedDate } from '@/utils/format';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { prefs, notices, allowed, setAlerts, markRead } = useNotifications();
  const alertsOn = prefs.enabled && prefs.newPosts;

  useFocusEffect(
    useCallback(() => {
      markRead();
    }, [markRead]),
  );

  return (
    <Screen>
      <StackHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.note, { backgroundColor: colors.mintSoft, borderColor: colors.border }]}>
          <AppText variant="button">New stories from yerase.com</AppText>
          <AppText variant="caption" tone="muted">
            The first time you open Kiki Tips, the phone asks to allow notifications. When a post is published, tap the alert to open that story.
          </AppText>
          {allowed === false ? (
            <AppText variant="caption" tone="muted">
              Phone alerts are blocked. Allow notifications for Expo Go, or for Kiki Tips, in the phone settings. New stories will still be listed here.
            </AppText>
          ) : null}
        </View>

        <View style={[styles.card, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="newspaper-outline"
            label="New stories"
            subtitle={alertsOn ? 'Alerts are on' : 'Alerts are off'}
            last
            accessory={
              <Switch
                value={alertsOn}
                onValueChange={setAlerts}
                trackColor={{ false: colors.border, true: colors.emerald }}
                thumbColor="#FFFFFF"
                accessibilityLabel="New story alerts"
              />
            }
          />
        </View>

        <AppText variant="meta" tone="muted" style={styles.label}>
          RECENT ALERTS
        </AppText>
        {notices.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No alerts yet"
            message="Publish a new story on yerase.com and it will show up here."
          />
        ) : (
          <View style={[styles.card, cardShadow(colors), { backgroundColor: colors.card, borderColor: colors.border }]}>
            {notices.map((notice, index) => (
              <Pressable
                key={notice.id}
                accessibilityRole="button"
                accessibilityLabel={notice.title}
                onPress={() => router.push({ pathname: '/article/[id]', params: { id: notice.id } })}
                style={[
                  styles.notice,
                  index < notices.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                ]}
              >
                <AppText variant="button">{notice.title}</AppText>
                {notice.excerpt ? (
                  <AppText variant="caption" tone="muted" numberOfLines={2}>
                    {notice.excerpt}
                  </AppText>
                ) : null}
                {notice.publishedAt ? (
                  <AppText variant="meta" tone="accent">
                    {formatPublishedDate(notice.publishedAt)}
                  </AppText>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  note: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    letterSpacing: 0.8,
  },
  notice: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
});
