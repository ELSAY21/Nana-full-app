import { useState } from 'react';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { StoryImage } from '@/data/types';

type Props = {
  source: StoryImage | null;
  style?: StyleProp<ImageStyle>;
  radius?: number;
  backgroundColor?: string;
  fit?: 'contain' | 'cover';
  aspectRatio?: number;
};

function ratioFor(source: StoryImage | null): number | null {
  if (!source?.width || !source?.height) return null;
  return source.width / source.height;
}

/**
 * The frame uses the photo's own width and height, and the photo is fit inside
 * that frame. A wide or tall upload stays complete on the homepage and on every
 * new post.
 */
export function ArticleImage({
  source,
  style,
  radius = 0,
  backgroundColor = '#ECFDF5',
  fit = 'contain',
  aspectRatio,
}: Props) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [measured, setMeasured] = useState<{ uri: string; ratio: number } | null>(null);
  const loaded = source?.uri && measured?.uri === source.uri ? measured.ratio : null;
  const ratio = aspectRatio ?? loaded ?? ratioFor(source) ?? 3 / 2;
  const failed = Boolean(source?.uri) && failedUri === source?.uri;

  if (!source?.uri || failed) {
    return (
      <LinearGradient
        colors={['#064E3B', '#059669']}
        style={[styles.frame, { borderRadius: radius, aspectRatio: ratio }, style]}
      >
        <Ionicons name="leaf" size={28} color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <Image
      source={{ uri: source.uri }}
      style={[styles.frame, { borderRadius: radius, backgroundColor, aspectRatio: ratio }, style]}
      contentFit={fit}
      contentPosition="center"
      transition={180}
      onLoad={(event) => {
        const width = event.source?.width;
        const height = event.source?.height;
        if (width && height) setMeasured({ uri: source.uri, ratio: width / height });
      }}
      onError={() => setFailedUri(source.uri)}
    />
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
