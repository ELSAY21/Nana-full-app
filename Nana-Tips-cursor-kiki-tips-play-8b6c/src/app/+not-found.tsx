import { useRouter } from 'expo-router';

import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ErrorState
        title="Page not found"
        message="That screen is not part of Kiki Tips."
        actionLabel="Go to Home"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
