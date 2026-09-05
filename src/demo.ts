import './style.css';
import { card, loadCatalog, type Entry } from './ledger';

const initialQuery = 'plan a game night';
const preferred = ['dawn-run', 'finite-foundry', 'kitchen-table', 'mirror-orchard', 'room-code-mystery', 'wordlist-arcade'];

function matches(entry: Entry, query: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/).filter((word) => word.length > 2 && !['plan', 'game', 'night'].includes(word));
  if (!words.length) return true;
  const text = [entry.title, entry.description, entry.why, ...(entry.tags ?? [])].filter(Boolean).join(' ').toLowerCase();
  return words.every((word) => text.includes(word));
}

async function main(): Promise<void> {
  const catalog = await loadCatalog();
  const grid = document.querySelector<HTMLOListElement>('#demo-grid')!;
  const count = document.querySelector<HTMLElement>('#demo-count')!;
  const empty = document.querySelector<HTMLElement>('#demo-empty')!;
  const search = document.querySelector<HTMLInputElement>('#demo-search')!;
  if (!catalog) {
    count.textContent = 'The sample could not be loaded. Try again in a minute.';
    return;
  }
  const bySlug = new Map(catalog.products.map((entry) => [entry.slug, entry]));
  const selected = preferred.map((slug) => bySlug.get(slug)).filter((entry): entry is Entry => Boolean(entry));
  const sample = selected.length >= 4 ? selected : catalog.products.filter((entry) => entry.kind === 'game').slice(0, 6);
  const render = (): void => {
    const shown = sample.filter((entry) => matches(entry, search.value));
    grid.innerHTML = shown.map((entry) => card(entry, { showWhy: true, eager: true })).join('');
    count.textContent = `${shown.length} of ${sample.length} sample tools`;
    empty.hidden = shown.length > 0;
  };
  search.addEventListener('input', render);
  document.querySelector<HTMLButtonElement>('#reset-demo')!.addEventListener('click', () => {
    search.value = initialQuery;
    render();
    search.focus();
  });
  render();
}

void main();
