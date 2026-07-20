import { describe, expect, it } from 'vitest';
import {
  DEMO_BLOG_POSTS,
  demoPublicAsset,
  getDemoBlogPostBySlug,
  getRelatedDemoBlogPosts,
  listDemoBlogPosts,
} from '../../src/features/demo/data/demoBlogPosts';

const REQUIRED_SLUGS = [
  'introducing-zax-seamless-v2',
  'building-a-faster-manga-reading-experience',
  'exploring-the-zax-demo-role-lab',
  'how-premium-membership-works',
  'the-uploader-dashboard-experience',
  'inside-the-zax-administration-dashboard',
  'responsive-reading-across-every-device',
  'secure-payments-coins-and-digital-licenses',
];

describe('demo blog catalogue', () => {
  it('ships at least eight polished local articles', () => {
    expect(DEMO_BLOG_POSTS.length).toBeGreaterThanOrEqual(8);
    for (const slug of REQUIRED_SLUGS) {
      expect(getDemoBlogPostBySlug(slug)).toBeTruthy();
    }
  });

  it('includes required editorial fields on every post', () => {
    for (const post of DEMO_BLOG_POSTS) {
      expect(post.slug.length).toBeGreaterThan(0);
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.excerpt.length).toBeGreaterThan(0);
      expect(post.content.length).toBeGreaterThan(80);
      expect(post.category.length).toBeGreaterThan(0);
      expect(post.author).toBe('ZAX MILLION');
      expect(post.published_at).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(post.reading_time_minutes).toBeGreaterThan(0);
      expect(post.featured_image_url).toContain('/demo-covers/');
      expect(post.featured_image_alt.length).toBeGreaterThan(0);
      expect(post.tags.length).toBeGreaterThan(0);
      expect(post.seo_title.length).toBeGreaterThan(0);
      expect(post.seo_description.length).toBeGreaterThan(0);
      expect(post.content.toLowerCase()).not.toMatch(/\bcursor\b|\bchatgpt\b|\bprompt\b|\bagents?\b/);
    }
  });

  it('lists newest posts first and respects limit', () => {
    const all = listDemoBlogPosts();
    const limited = listDemoBlogPosts(3);
    expect(limited).toHaveLength(3);
    expect(new Date(all[0].published_at).getTime()).toBeGreaterThanOrEqual(
      new Date(all[1].published_at).getTime()
    );
    expect(limited.map((p) => p.slug)).toEqual(all.slice(0, 3).map((p) => p.slug));
  });

  it('returns related posts without duplicating the current slug', () => {
    const related = getRelatedDemoBlogPosts('introducing-zax-seamless-v2', 3);
    expect(related).toHaveLength(3);
    expect(related.every((post) => post.slug !== 'introducing-zax-seamless-v2')).toBe(true);
  });

  it('treats unknown slugs as missing for article pages', () => {
    expect(getDemoBlogPostBySlug('does-not-exist')).toBeUndefined();
  });

  it('prefixes public assets with the Vite base path', () => {
    expect(demoPublicAsset('/demo-covers/1.jpg')).toMatch(/\/demo-covers\/1\.jpg$/);
  });
});
