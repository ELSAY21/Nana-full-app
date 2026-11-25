export type ColorScheme = 'light' | 'dark';

export type Palette = {
  canvas: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  emerald: string;
  emeraldPressed: string;
  forest: string;
  mint: string;
  mintSoft: string;
  border: string;
  chipBg: string;
  chipText: string;
  accent: string;
  iconMuted: string;
  tabBar: string;
  input: string;
  skeleton: string;
  onEmerald: string;
  leaf: string;
  shadow: string;
  inverse: string;
};

export const lightPalette: Palette = {
  canvas: '#E7F3EC',
  background: '#F7FAF8',
  surface: 'rgba(255,255,255,0.78)',
  card: '#FFFFFF',
  text: '#10231B',
  textMuted: '#5C7268',
  emerald: '#059669',
  emeraldPressed: '#047857',
  forest: '#064E3B',
  mint: '#A7F3D0',
  mintSoft: '#ECFDF5',
  border: 'rgba(6, 78, 59, 0.08)',
  chipBg: '#D1FAE5',
  chipText: '#047857',
  accent: '#059669',
  iconMuted: '#7C9086',
  tabBar: '#FFFFFF',
  input: '#FFFFFF',
  skeleton: '#E4F2EA',
  onEmerald: '#FFFFFF',
  leaf: 'rgba(167, 243, 208, 0.7)',
  shadow: 'rgba(6, 78, 59, 0.08)',
  inverse: '#FFFFFF',
};

export const darkPalette: Palette = {
  canvas: '#040C09',
  background: '#07130F',
  surface: '#10221A',
  card: '#12261D',
  text: '#F3FBF7',
  textMuted: '#A9C3B6',
  emerald: '#059669',
  emeraldPressed: '#047857',
  forest: '#064E3B',
  mint: '#A7F3D0',
  mintSoft: '#12382C',
  border: 'rgba(167, 243, 208, 0.12)',
  chipBg: 'rgba(52, 211, 153, 0.16)',
  chipText: '#A7F3D0',
  accent: '#6EE7B7',
  iconMuted: '#8AA399',
  tabBar: '#10221A',
  input: '#10221A',
  skeleton: '#1A3329',
  onEmerald: '#FFFFFF',
  leaf: 'rgba(16, 78, 59, 0.55)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  inverse: '#FFFFFF',
};

export const palettes: Record<ColorScheme, Palette> = {
  light: lightPalette,
  dark: darkPalette,
};
