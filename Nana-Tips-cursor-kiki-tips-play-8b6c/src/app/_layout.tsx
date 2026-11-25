import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { NotificationLink } from '@/components/NotificationLink';
import { OpeningScreen } from '@/components/OpeningScreen';
import { AdsProvider } from '@/state/AdsProvider';
import { BookmarksProvider, useBookmarks } from '@/state/BookmarksProvider';
import { ContentProvider } from '@/state/ContentProvider';
import { FontReadyProvider } from '@/state/FontReady';
import { NotificationsProvider, useNotifications } from '@/state/NotificationsProvider';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

if (Constants.executionEnvironment !== 'storeClient') {
  SplashScreen.setOptions({ duration: 160, fade: true });
}
SplashScreen.preventAutoHideAsync().catch(() => {});

const minimumSplashMs = 420;

function BootGate({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  const bookmarks = useBookmarks();
  const notifications = useNotifications();
  const ready = theme.ready && bookmarks.ready && notifications.ready;
  const [cover] = useState(() => new Animated.Value(1));
  const [covered, setCovered] = useState(true);
  const [openedAt] = useState(() => Date.now());

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready) return;
    let fade: Animated.CompositeAnimation | null = null;
    const wait = Math.max(0, minimumSplashMs - (Date.now() - openedAt));
    const timer = setTimeout(() => {
      fade = Animated.timing(cover, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      });
      fade.start(({ finished }) => {
        if (finished) setCovered(false);
      });
    }, wait);
    return () => {
      clearTimeout(timer);
      fade?.stop();
    };
  }, [cover, openedAt, ready]);

  return (
    <View style={styles.boot}>
      {ready ? children : null}
      {covered ? (
        <Animated.View pointerEvents={ready ? 'none' : 'auto'} style={[StyleSheet.absoluteFill, { opacity: cover }]}>
          <OpeningScreen />
        </Animated.View>
      ) : null}
    </View>
  );
}

function RootNavigator() {
  const { colors, resolved } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center' }}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, width: '100%', maxWidth: 560, backgroundColor: colors.background }}>
        <NotificationLink />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    ...Ionicons.font,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FontReadyProvider settled={Boolean(loaded) || Boolean(error)} custom={Boolean(loaded) && !error}>
          <ThemeProvider>
            <ContentProvider>
              <BookmarksProvider>
                <NotificationsProvider>
                  <BootGate>
                    <AdsProvider>
                      <RootNavigator />
                    </AdsProvider>
                  </BootGate>
                </NotificationsProvider>
              </BookmarksProvider>
            </ContentProvider>
          </ThemeProvider>
        </FontReadyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
