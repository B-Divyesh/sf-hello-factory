export type Product = { name: string; domain: string; state: 'live' | 'building' };

export const products: Product[] = [
  { name: 'Hello Factory', domain: 'hello-factory.sociobot.in', state: 'live' },
];

export function formatProductSummary(items: Product[]): string {
  const liveCount = items.filter(({ state }) => state === 'live').length;
  if (items.length === 0) return 'No tools released yet.';
  return `${liveCount} ${liveCount === 1 ? 'tool' : 'tools'} live · ${items.length} tracked`;
}
