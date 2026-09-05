import { describe, expect, it } from 'vitest';
import { fillDefaults, qaVerdict, type Entry } from './ledger';

const entry = (extra: Partial<Entry> = {}): Entry => ({ slug: 'sample', title: 'Sample', url: 'https://sample.sociobot.in', class: 'static-web', territory: 'utilities', description: 'Sample.', paid: false, state: 'VERIFYING', ...extra });

describe('catalogue defaults', () => {
  it('classifies missing fields and puts uncurated rows on the named fallback shelf', () => {
    const game = entry({ class: 'web-with-backend', territory: 'games-creative' });
    fillDefaults(game);
    expect(game).toMatchObject({ kind: 'game', category: 'new' });
    const installer = entry({ class: 'desktop-app', territory: 'games-creative' });
    fillDefaults(installer);
    expect(installer).toMatchObject({ kind: 'installable', category: 'new' });
  });
});

describe('QA verdicts', () => {
  it('reports passed, in-progress, and changes-required states with recorded dates', () => {
    expect(qaVerdict(entry({ state: 'RELEASED', qa: { status: 'RELEASED', strict_zero_review: true, reviewed_at: '2026-09-03T10:00:00Z' } }))).toMatchObject({ label: 'QA passed', date: '3 September 2026', tone: 'pass' });
    expect(qaVerdict(entry({ qa: { status: 'VERIFYING', strict_zero_review: false, reviewed_at: '2026-09-02T10:00:00Z' } }))).toMatchObject({ label: 'QA in progress', date: '2 September 2026', tone: 'active' });
    expect(qaVerdict(entry({ state: 'POLISHING', qa: { status: 'POLISHING', strict_zero_review: false, reviewed_at: '2026-09-01T10:00:00Z' } }))).toMatchObject({ label: 'QA changes required', date: '1 September 2026', tone: 'changes' });
  });
});
