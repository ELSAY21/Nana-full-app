import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { listenForNotificationOpens } from '@/notifications/delivery';

export function NotificationLink() {
  const router = useRouter();

  useEffect(
    () =>
      listenForNotificationOpens((slug) => {
        router.push({ pathname: '/article/[id]', params: { id: slug } });
      }),
    [router],
  );

  return null;
}
