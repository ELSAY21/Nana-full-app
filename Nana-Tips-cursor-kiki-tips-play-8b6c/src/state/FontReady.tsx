import { createContext, useContext, type ReactNode } from 'react';

type FontReadyValue = {
  settled: boolean;
  custom: boolean;
};

const FontReadyContext = createContext<FontReadyValue>({ settled: false, custom: false });

export function FontReadyProvider({
  settled,
  custom,
  children,
}: FontReadyValue & { children: ReactNode }) {
  return <FontReadyContext.Provider value={{ settled, custom }}>{children}</FontReadyContext.Provider>;
}

export function useFontReady(): FontReadyValue {
  return useContext(FontReadyContext);
}
