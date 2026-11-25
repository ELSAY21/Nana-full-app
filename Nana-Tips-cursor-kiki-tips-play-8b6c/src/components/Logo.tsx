import Svg, { Circle, Path } from 'react-native-svg';

type Props = {
  size?: number;
};

/** White kite on the Kiki Tips green. Separate from the Nana Tips leaf. */
export function Logo({ size = 40 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="32" cy="32" r="32" fill="#059669" />
      <Path d="M32 15 L46 32 L32 48 L18 32 Z" fill="#FFFFFF" />
      <Path d="M32 22 V41" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
      <Path d="M24 32 H40" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="32" cy="32" r="1.8" fill="#059669" />
      <Path d="M32 46.5 q6 4 3.5 9.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <Circle cx="35.6" cy="56.4" r="2.1" fill="#FFFFFF" />
    </Svg>
  );
}
