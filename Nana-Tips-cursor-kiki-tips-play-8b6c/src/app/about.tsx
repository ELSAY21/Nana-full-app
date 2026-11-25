import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { StackHeader } from '@/components/StackHeader';
import { useAppTheme } from '@/theme/ThemeProvider';

const points = [
  {
    title: 'The publication',
    body: 'Kiki Tips is a free technology publication. The stories are written in English and published at yerase.com for anyone who wants practical advice without the jargon.',
  },
  {
    title: 'This app',
    body: 'The app is the reader for those stories. It shows the latest posts, the full photo, and the topic the story was filed under, including Alternatives, Finance, Guides, Reviews, and Trends. A new post on the site appears in the app under that same topic. The app is free and shows ads from Google.',
  },
  {
    title: 'On your phone',
    body: 'You do not need an account. Articles you bookmark stay on this device. You can choose a light theme, a dark theme, or the device theme. If alerts are on, Kiki Tips tells you when a new story is published.',
  },
];

export default function AboutScreen() {
  const { colors } = useAppTheme();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen>
      <StackHeader title="About Us" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.forest, colors.emerald]} style={styles.hero}>
          <View style={styles.logoPlate}>
            <Logo size={56} />
          </View>
          <AppText variant="title" tone="inverse">
            Kiki Tips
          </AppText>
          <AppText variant="body" style={styles.tagline}>
            Smarter tech for a brighter tomorrow.
          </AppText>
        </LinearGradient>

        {points.map((point) => (
          <View key={point.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AppText variant="heading">{point.title}</AppText>
            <AppText variant="body" tone="muted">
              {point.body}
            </AppText>
          </View>
        ))}

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open yerase.com"
          onPress={() => Linking.openURL('https://yerase.com')}
          style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="globe-outline" size={18} color={colors.accent} />
          <AppText variant="button" tone="accent" style={styles.linkText}>
            Visit yerase.com
          </AppText>
          <Ionicons name="open-outline" size={16} color={colors.accent} />
        </Pressable>

        <AppText variant="meta" tone="muted" style={styles.version}>
          Version {version}
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    gap: 12,
  },
  hero: {
    marginHorizontal: 16,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 8,
  },
  logoPlate: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
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
  version: {
    textAlign: 'center',
    paddingTop: 8,
  },
});
