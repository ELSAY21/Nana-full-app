import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { PRIVACY_POLICY_URL, privacySections, privacyUpdated } from '@/data/legal';
import { Screen } from '@/components/Screen';
import { StackHeader } from '@/components/StackHeader';
import { useAds } from '@/state/AdsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

const webPolicy = PRIVACY_POLICY_URL.startsWith('https://') ? PRIVACY_POLICY_URL : '';

export default function PrivacyScreen() {
  const { colors } = useAppTheme();
  const { privacyOptions, openPrivacyOptions } = useAds();

  return (
    <Screen>
      <StackHeader title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="body" tone="muted" style={styles.intro}>
          Effective {privacyUpdated}. This is the Kiki Tips privacy policy.
        </AppText>
        {webPolicy ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Open the privacy policy on the web"
            onPress={() => Linking.openURL(webPolicy)}
            style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="open-outline" size={18} color={colors.accent} />
            <AppText variant="button" tone="accent" style={styles.linkText}>
              Open the web version
            </AppText>
          </Pressable>
        ) : null}
        {privacyOptions ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open ad privacy choices"
            onPress={openPrivacyOptions}
            style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="options-outline" size={18} color={colors.accent} />
            <AppText variant="button" tone="accent" style={styles.linkText}>
              Ad privacy choices
            </AppText>
          </Pressable>
        ) : null}
        {privacySections.map((section) => (
          <View key={section.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText variant="heading">{section.title}</AppText>
            <AppText variant="body" tone="muted">
              {section.body}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 12,
  },
  intro: {
    paddingHorizontal: 16,
  },
  link: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
});
