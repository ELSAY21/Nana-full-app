import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { openAdPrivacyOptions, prepareAds } from '@/ads/mobileAds';

type AdsContextValue = {
  canRequest: boolean;
  privacyOptions: boolean;
  openPrivacyOptions: () => void;
};

const AdsContext = createContext<AdsContextValue | null>(null);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [canRequest, setCanRequest] = useState(false);
  const [privacyOptions, setPrivacyOptions] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      prepareAds().then((result) => {
        if (!active) return;
        setCanRequest(result.canRequest);
        setPrivacyOptions(result.privacyOptions);
      });
    }, 900);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const value = useMemo<AdsContextValue>(
    () => ({
      canRequest,
      privacyOptions,
      openPrivacyOptions: () => {
        void openAdPrivacyOptions().catch(() => {});
      },
    }),
    [canRequest, privacyOptions],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds(): AdsContextValue {
  const value = useContext(AdsContext);
  if (!value) throw new Error('useAds must be used within AdsProvider');
  return value;
}
