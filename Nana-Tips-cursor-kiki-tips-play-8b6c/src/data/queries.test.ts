import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Article, Category } from './types';
import { homeFeed, orderByIds, randomArticles, searchArticles, sortByDate, toggleId } from './queries';

const categories: Category[] = [
  {
    slug: 'artificial-intelligence',
    name: 'Artificial Intelligence',
    shortName: 'AI',
    description: 'Trends',
    icon: 'sparkles',
    tintLight: '#D1FAE5',
    tintDark: '#14382C',
  },
  {
    slug: 'mobile',
    name: 'Mobile',
    shortName: 'Mobile',
    description: 'Phones',
    icon: 'phone-portrait-outline',
    tintLight: '#CCFBF1',
    tintDark: '#12352F',
  },
];

function story(
  partial: Pick<Article, 'id' | 'title' | 'categorySlug' | 'publishedAt'> & Partial<Article>,
): Article {
  return {
    excerpt: 'Excerpt',
    body: ['Body copy'],
    blocks: [],
    readMinutes: 4,
    image: { uri: 'https://nanaatips.com/photo.jpg', width: 1600, height: 1068 },
    categorySlugs: [partial.categorySlug],
    ...partial,
  };
}

const stories: Article[] = [
  story({
    id: 'ai-tools',
    title: 'AI Tools Worth Knowing',
    excerpt: 'Practical workflow tools',
    categorySlug: 'artificial-intelligence',
    publishedAt: '2026-10-20',
    body: ['A writing assistant can clean a draft.'],
  }),
  story({
    id: 'phones',
    title: 'The Best New Phones',
    categorySlug: 'mobile',
    publishedAt: '2026-10-08',
  }),
  story({
    id: 'older-ai',
    title: 'Ethics Questions',
    categorySlug: 'artificial-intelligence',
    publishedAt: '2026-09-10',
  }),
];

describe('searchArticles', () => {
  it('returns nothing for a blank query', () => {
    assert.deepEqual(searchArticles(stories, categories, '   '), []);
  });

  it('matches titles without caring about case', () => {
    const results = searchArticles(stories, categories, 'ai tools');
    assert.deepEqual(
      results.map((article) => article.id),
      ['ai-tools'],
    );
  });

  it('matches the category name and short name', () => {
    const results = searchArticles(stories, categories, 'artificial');
    assert.deepEqual(
      results.map((article) => article.id),
      ['ai-tools', 'older-ai'],
    );
  });

  it('matches body text', () => {
    const results = searchArticles(stories, categories, 'writing assistant');
    assert.deepEqual(
      results.map((article) => article.id),
      ['ai-tools'],
    );
  });
});

describe('homeFeed', () => {
  it('shows the first 20 stories and offers another page when more exist', () => {
    const many = Array.from({ length: 25 }, (_, index) =>
      story({
        id: `story-${index}`,
        title: `Story ${index}`,
        categorySlug: 'mobile',
        publishedAt: `2026-01-${String(index + 1).padStart(2, '0')}`,
      }),
    );
    const first = homeFeed(many, 20);
    assert.equal(first.latest.length + (first.featured ? 1 : 0), 20);
    assert.equal(first.hasMore, true);
    assert.equal(first.featured?.id, 'story-24');
    const second = homeFeed(many, 40);
    assert.equal(second.latest.length + (second.featured ? 1 : 0), 25);
    assert.equal(second.hasMore, false);
  });
});

describe('sortByDate', () => {
  it('puts the newest story first', () => {
    assert.deepEqual(
      sortByDate(stories).map((article) => article.id),
      ['ai-tools', 'phones', 'older-ai'],
    );
  });
});

describe('toggleId', () => {
  it('adds a new id at the front and removes it on the next toggle', () => {
    const saved = toggleId(['phones'], 'ai-tools');
    assert.deepEqual(saved, ['ai-tools', 'phones']);
    assert.deepEqual(toggleId(saved, 'ai-tools'), ['phones']);
  });
});

describe('randomArticles', () => {
  it('returns four other stories and leaves out the open post', () => {
    const extra = [
      story({ id: 'cloud', title: 'Cloud', categorySlug: 'mobile', publishedAt: '2026-10-01' }),
      story({ id: 'security', title: 'Security', categorySlug: 'mobile', publishedAt: '2026-10-02' }),
    ];
    const picked = randomArticles([...stories, ...extra], 'ai-tools', 4);
    assert.equal(picked.length, 4);
    assert.equal(picked.some((article) => article.id === 'ai-tools'), false);
    assert.deepEqual(randomArticles([...stories, ...extra], 'ai-tools', 4).map((article) => article.id), picked.map((article) => article.id));
  });
});

describe('orderByIds', () => {
  it('keeps bookmark order and skips unknown ids', () => {
    const ordered = orderByIds(stories, ['missing', 'phones', 'ai-tools']);
    assert.deepEqual(
      ordered.map((article) => article.id),
      ['phones', 'ai-tools'],
    );
  });
});
