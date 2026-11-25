import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeHtml, mapCatalog, paragraphsFromHtml, storyBlocksFromHtml, storyBriefs, storyImage, type WpCategory, type WpPost } from './wordpress';

const categories: WpCategory[] = [
  { id: 1, slug: 'uncategorized', name: 'Uncategorized', description: '', count: 0 },
  { id: 7, slug: 'artificial-intelligence', name: 'Artificial Intelligence', description: 'Trends, tools, and real-world use cases', count: 1 },
  { id: 3, slug: 'mobile', name: 'Mobile', description: 'Phones, reviews, and mobile tech', count: 1 },
  { id: 8, slug: 'cybersecurity', name: 'Cybersecurity', description: 'Stay safe in a digital world', count: 1 },
  { id: 6, slug: 'how-to', name: 'How-to', description: 'Practical guides for everyday technology', count: 1 },
];

function post(partial: Pick<WpPost, 'slug' | 'date' | 'categories'> & { title: string; image?: { width: number; height: number } }): WpPost {
  return {
    slug: partial.slug,
    date: partial.date,
    title: { rendered: partial.title },
    excerpt: { rendered: '<p>A short excerpt.</p>' },
    content: { rendered: '<p>First paragraph.</p><p>Second paragraph.</p>' },
    categories: partial.categories,
    _embedded: partial.image
      ? {
          'wp:featuredmedia': [
            {
              source_url: `https://nanaatips.com/${partial.slug}.jpg`,
              media_details: {
                ...partial.image,
                sizes: {
                  thumbnail: {
                    source_url: `https://nanaatips.com/${partial.slug}-150x150.jpg`,
                    width: 150,
                    height: 150,
                  },
                  full: {
                    source_url: `https://nanaatips.com/${partial.slug}.jpg`,
                    width: partial.image.width,
                    height: partial.image.height,
                  },
                },
              },
            },
          ],
        }
      : undefined,
  };
}

describe('decodeHtml', () => {
  it('turns WordPress entities and tags into plain text', () => {
    assert.equal(decodeHtml('<p>AI tools &#8211; a guide&hellip;</p>'), 'AI tools – a guide…');
  });
});

describe('paragraphsFromHtml', () => {
  it('keeps each paragraph', () => {
    assert.deepEqual(paragraphsFromHtml('<p>One</p><p>Two</p>'), ['One', 'Two']);
  });

  it('keeps a link in the sentence and a Play Store button', () => {
    const html = [
      '<p>Sources: <a href="https://www.mckinsey.com/trends">McKinsey</a> and <a href="https://www.gartner.com/ai">Gartner&#8217;s note</a>.</p>',
      '<h2><a href="https://play.google.com/store/apps/details?id=com.openai.chatgpt">INSTALL</a></h2>',
      '<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link" href="https://play.google.com/store/apps/details?id=com.openai.chatgpt"><strong>INSTALL</strong></a></div></div>',
      '<p><a href="javascript:alert(1)">Skip me</a> Stay</p>',
    ].join('');
    const blocks = storyBlocksFromHtml(html);

    assert.deepEqual(blocks[0], {
      kind: 'text',
      spans: [
        { text: 'Sources: ' },
        { text: 'McKinsey', href: 'https://www.mckinsey.com/trends' },
        { text: ' and ' },
        { text: 'Gartner’s note', href: 'https://www.gartner.com/ai' },
        { text: '.' },
      ],
    });
    assert.deepEqual(
      blocks.filter((block) => block.kind === 'button'),
      [
        { kind: 'button', text: 'INSTALL', href: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt' },
        { kind: 'button', text: 'INSTALL', href: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt' },
      ],
    );
    assert.equal(blocks.some((block) => block.kind === 'text' && block.spans.some((span) => span.href?.startsWith('javascript:'))), false);
    assert.deepEqual(paragraphsFromHtml(html).slice(0, 2), ['Sources: McKinsey and Gartner’s note.', 'INSTALL']);
  });
});

describe('mapCatalog', () => {
  it('keeps the site categories and files each post under its category with the full image size', () => {
    const catalog = mapCatalog(categories, [
      post({
        slug: 'ai-tools-worth-knowing',
        title: 'AI Tools Worth Knowing',
        date: '2026-10-25T09:00:00',
        categories: [7],
        image: { width: 1600, height: 1068 },
      }),
      post({
        slug: 'a-calmer-way-to-work-on-a-computer',
        title: 'A Calmer Way to Work on a Computer',
        date: '2026-10-17T09:00:00',
        categories: [6],
        image: { width: 1600, height: 2400 },
      }),
    ]);

    assert.deepEqual(
      catalog.categories.map((category) => category.slug),
      ['artificial-intelligence', 'mobile', 'cybersecurity', 'how-to'],
    );
    const featured = catalog.articles.find((article) => article.id === 'ai-tools-worth-knowing');
    assert.equal(featured?.categorySlug, 'artificial-intelligence');
    assert.deepEqual(featured?.image, {
      uri: 'https://nanaatips.com/ai-tools-worth-knowing.jpg',
      width: 1600,
      height: 1068,
    });
    const guide = catalog.articles.find((article) => article.id === 'a-calmer-way-to-work-on-a-computer');
    assert.deepEqual(guide?.categorySlugs, ['how-to']);
    assert.equal(guide?.image?.uri, 'https://nanaatips.com/a-calmer-way-to-work-on-a-computer.jpg');
    assert.equal(guide?.image?.width, 1600);
    assert.equal(guide?.image?.height, 2400);
  });
});

describe('storyBriefs', () => {
  it('keeps the slug, plain title, and date for a new-story alert', () => {
    assert.deepEqual(
      storyBriefs([
        {
          slug: 'new-story',
          date: '2026-10-25T09:00:00',
          title: { rendered: 'A brand new story' },
          excerpt: { rendered: '<p>Just published.</p>' },
        },
      ]),
      [{ id: 'new-story', title: 'A brand new story', excerpt: 'Just published.', publishedAt: '2026-10-25' }],
    );
  });
});

describe('storyImage', () => {
  it('keeps the original photo instead of the cropped thumbnail', () => {
    const image = storyImage({
      source_url: 'https://nanaatips.com/wp-content/uploads/2026/10/calmer-work.jpg',
      media_details: {
        width: 1600,
        height: 2400,
        sizes: {
          thumbnail: {
            source_url: 'https://nanaatips.com/wp-content/uploads/2026/10/calmer-work-150x150.jpg',
            width: 150,
            height: 150,
          },
          full: {
            source_url: 'https://nanaatips.com/wp-content/uploads/2026/10/calmer-work.jpg',
            width: 1600,
            height: 2400,
          },
        },
      },
    });

    assert.deepEqual(image, {
      uri: 'https://nanaatips.com/wp-content/uploads/2026/10/calmer-work.jpg',
      width: 1600,
      height: 2400,
    });
  });
});
