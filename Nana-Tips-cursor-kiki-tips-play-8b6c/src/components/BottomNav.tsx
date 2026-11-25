import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { AppText } from '@/components/AppText';
import type { IonName } from '@/data/types';
import { useNotifications } from '@/state/NotificationsProvider';
import { useAppTheme } from '@/theme/ThemeProvider';

const tabs: Record<string, { label: string; active: IonName; inactive: IonName }> = {
  index: { label: 'Home', active: 'home', inactive: 'home-outline' },
  categories: { label: 'Categories', active: 'grid', inactive: 'grid-outline' },
  saved: { label: 'Saved', active: 'bookmark', inactive: 'bookmark-outline' },
  profile: { label: 'Profile', active: 'person', inactive: 'person-outline' },
};

export function BottomNav({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors } = useAppTheme();
  const { unread } = useNotifications();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = tabs[route.name] ?? { label: descriptors[route.key]?.options.title ?? route.name, active: 'ellipse' as const, inactive: 'ellipse' as const };
        const color = focused ? colors.accent : colors.iconMuted;

        return (
          <Pressable
            key={route.key}
            testID={`tab-${route.name}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={() => {
              const event = emitter.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigateToTab(route.key);
              }
            }}
            style={styles.item}
          >
            <View>
              <Ionicons name={focused ? tab.active : tab.inactive} size={22} color={color} />
              {route.name === 'profile' && unread > 0 ? (
                <View style={[styles.dot, { backgroundColor: colors.emerald, borderColor: colors.tabBar }]} />
              ) : null}
            </View>
            <AppText variant="meta" style={{ color }} numberOfLines={1}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingTop: 8,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
});
