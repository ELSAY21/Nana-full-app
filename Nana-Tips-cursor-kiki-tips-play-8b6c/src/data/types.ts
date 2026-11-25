import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IonName = ComponentProps<typeof Ionicons>['name'];

export type StoryImage = {
  uri: string;
  width?: number;
  height?: number;
};

export type StorySpan = {
  text: string;
  href?: string;
};

export type StoryBlock =
  | { kind: 'text'; spans: StorySpan[] }
  | { kind: 'button'; text: string; href: string };

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  body: string[];
  blocks: StoryBlock[];
  categorySlug: string;
  categorySlugs: string[];
  publishedAt: string;
  readMinutes: number;
  image: StoryImage | null;
};

export type Category = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: IonName;
  tintLight: string;
  tintDark: string;
};
