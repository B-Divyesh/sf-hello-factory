const TITLE_SUFFIX = ' — Hello Factory';

function shorten(value: string, limit: number): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const available = Math.max(1, limit - 1);
  const candidate = text.slice(0, available + 1);
  const boundary = candidate.lastIndexOf(' ', available);
  const cut = boundary >= Math.floor(available * 0.55) ? boundary : available;
  return `${candidate.slice(0, cut).replace(/[\s,;:.-]+$/u, '')}…`;
}

export function productDocumentTitle(controllerTitle: string): string {
  return `${shorten(controllerTitle, 60 - TITLE_SUFFIX.length)}${TITLE_SUFFIX}`;
}

export function productMetaDescription(controllerDescription: string): string {
  return shorten(controllerDescription, 155);
}
