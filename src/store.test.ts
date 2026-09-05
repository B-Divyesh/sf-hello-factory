import { describe, expect, it } from 'vitest';
import { byCategory, featuredPicks, games, justReleased, related, slugFromPath, sortEntries } from './store';
import type { Entry } from './ledger';

const e = (slug: string, extra: Partial<Entry> = {}): Entry => ({ slug, title: slug.replace(/-/g, ' '), url: `https://${slug}.sociobot.in`, class: 'static-web', territory: 'utilities', description: 'd', paid: false, state: 'RELEASED', kind: 'product', category: 'life', interest: 3, ...extra });

describe('featuredPicks', () => {
  it('prefers featured tools with a picture, then fills with interesting product-like tools', () => {
    const all = [e('a', { featured: true, image: '/a' }), e('b', { image: '/b', interest: 5 }), e('c', { featured: true }), e('d', { image: '/d', kind: 'library', interest: 5 }), e('f', { image: '/f', interest: 1 })];
    expect(featuredPicks(all, 3).map((x) => x.slug)).toEqual(['a', 'b', 'f']);
  });
});

describe('justReleased', () => {
  it('lists tools still being verified first, then the newest first releases', () => {
    const all = [e('old', { released: '2026-08-01' }), e('fresh', { released: '2026-08-30' }), e('checking', { released: '2026-07-01', state: 'VERIFYING' }), e('changes', { released: '2026-09-03', state: 'POLISHING' }), e('today', { released: '2026-09-02' })];
    expect(justReleased(all, 3).map((x) => x.slug)).toEqual(['checking', 'today', 'fresh']);
  });
});

describe('games', () => {
  it('uses the same kind membership as the catalogue game filter, regardless of shelf', () => {
    const all = [e('game-on-play', { kind: 'game', category: 'play' }), e('game-new', { kind: 'game', category: 'new' }), e('music-tool', { kind: 'product', category: 'play' })];
    expect(games(all).map((x) => x.slug).sort()).toEqual(all.filter((x) => x.kind === 'game').map((x) => x.slug).sort());
  });
});

describe('byCategory', () => {
  it('groups by curated category, sorts by interest and parks unknown shelves under "new"', () => {
    const groups = byCategory([e('a', { interest: 1 }), e('b', { interest: 5 }), e('x', { category: 'weird' })], [{ id: 'life', title: 'Life' }]);
    expect(groups.get('life')!.map((x) => x.slug)).toEqual(['b', 'a']);
    expect(groups.get('new')!.map((x) => x.slug)).toEqual(['x']);
  });
});

describe('related', () => {
  it('returns other tools on the same shelf, best first', () => {
    const me = e('me');
    expect(related([me, e('a', { interest: 1 }), e('b', { interest: 4 }), e('c', { category: 'money', interest: 9 })], me).map((x) => x.slug)).toEqual(['b', 'a']);
  });
});

describe('slugFromPath', () => {
  it('reads /p/<slug> and rejects anything that is not a slug', () => {
    expect(slugFromPath('/p/wordlist-arcade')).toBe('wordlist-arcade');
    expect(slugFromPath('/p/wordlist-arcade/')).toBe('wordlist-arcade');
    expect(slugFromPath('/p/', '?slug=kitchen-table')).toBe('kitchen-table');
    expect(slugFromPath('/p/../etc')).toBeNull();
    expect(slugFromPath('/catalog/')).toBeNull();
  });
});

describe('sortEntries', () => {
  it('sorts by newest release, by title, or by the curator’s order', () => {
    const all = [e('b', { released: '2026-08-01', interest: 5 }), e('a', { released: '2026-08-20', interest: 1 })];
    expect(sortEntries(all, 'new').map((x) => x.slug)).toEqual(['a', 'b']);
    expect(sortEntries(all, 'az').map((x) => x.slug)).toEqual(['a', 'b']);
    expect(sortEntries(all, 'best').map((x) => x.slug)).toEqual(['b', 'a']);
  });
});
