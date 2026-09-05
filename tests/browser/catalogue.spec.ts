import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { normalizeSnapshot } from '../../scripts/catalog-data.mjs';

type Product = { slug: string; title: string; class: string; territory: string; description: string; why?: string; state: string; kind?: string; category?: string; image?: string; qa: { status: string; strict_zero_review: boolean; reviewed_at?: string } };

function dateLabel(iso?: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
}

async function undersizedTargets(page: import('@playwright/test').Page): Promise<string[]> {
  return page.locator('a[href], button, input, select').evaluateAll((elements) => elements.filter((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
  }).map((element) => {
    const box = element.getBoundingClientRect();
    return `${element.tagName}:${(element.getAttribute('aria-label') || element.textContent || '').trim().slice(0, 30)}:${Math.round(box.width)}x${Math.round(box.height)}`;
  }));
}

test('@claim:demo-sandbox loads, resets, and leaves no saved demo data', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#demo-grid .card')).toHaveCount(6);
  expect(await page.locator('#demo-grid .card').evaluateAll((cards) => cards.every((card) => card.getAttribute('data-kind') === 'game'))).toBe(true);
  await expect(page.locator('#demo-grid .chip-qa-pass')).toHaveCount(6);
  await expect(page.locator('#demo-grid .chip-qa-active, #demo-grid .chip-qa-changes')).toHaveCount(0);
  await page.locator('#demo-search').fill('no-result-boundary');
  await expect(page.locator('#demo-empty')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-search')).toHaveValue('plan a game night');
  await expect(page.locator('#demo-grid .card')).toHaveCount(6);
  const storage = await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, databases: (await indexedDB.databases()).length }));
  expect(storage).toEqual({ local: 0, session: 0, databases: 0 });
  expect(await context.cookies()).toEqual([]);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/catalog\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
  await context.close();
});

test('@claim:local-search keeps search words in the browser', async ({ page }) => {
  await page.goto('/catalog/');
  await expect(page.locator('#cat-count')).toContainText('tools');
  await page.waitForLoadState('networkidle');
  const requests: { url: string; body: string | null }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), body: request.postData() }));
  const phrase = 'A11y Interaction Trace';
  await page.locator('#cat-search').fill(phrase);
  await expect(page.locator('#cat-grid .card')).toHaveCount(1);
  expect(requests.some((request) => request.url.includes(encodeURIComponent(phrase)) || request.body?.includes(phrase))).toBe(false);
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:account-free browsing does not require sign-in', async ({ page }) => {
  await page.goto('/catalog/?kind=game');
  await expect(page.locator('#cat-grid .card').first()).toBeVisible();
  await page.locator('#cat-grid .card-link').first().click();
  await expect(page.locator('.product h1')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByText(/sign in|log in|create account/i)).toHaveCount(0);
});

test('@claim:free-browse has no catalogue checkout or payment request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/catalog/');
  await expect(page.locator('#cat-grid .card').first()).toBeVisible();
  const paymentPaths = await page.locator('a, form').evaluateAll((elements) => elements.filter((element) => {
    const value = element instanceof HTMLAnchorElement ? element.href : element.getAttribute('action') ?? '';
    const url = new URL(value, location.href);
    return url.origin === location.origin && /^\/(checkout|payment|billing)(\/|$)/i.test(url.pathname);
  }).length);
  expect(paymentPaths).toBe(0);
  expect(requests.some((url) => new URL(url).origin !== 'http://127.0.0.1:4173' && /checkout|payment|billing/i.test(url))).toBe(false);
});

test('@claim:privacy-defaults sets no cookies, storage, or analytics', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/privacy/');
  await page.goto('/catalog/');
  await expect(page.locator('#cat-grid .card').first()).toBeVisible();
  const storage = await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, databases: (await indexedDB.databases()).length }));
  expect(storage).toEqual({ local: 0, session: 0, databases: 0 });
  expect(await context.cookies()).toEqual([]);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await context.close();
});

test('@claim:guide-explicit sends words only after Ask the guide', async ({ page }) => {
  const calls: { method: string; body: string | null }[] = [];
  await page.route('https://api.sociobot.in/api/v1/products/recommend', async (route) => {
    calls.push({ method: route.request().method(), body: route.request().postData() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ picks: [], note: 'No close match in this sample.' }) });
  });
  await page.goto('/');
  await page.locator('#guide-input').fill('split a restaurant bill');
  expect(calls).toHaveLength(0);
  await page.getByRole('button', { name: 'Ask the guide' }).click();
  await expect(page.locator('.guide-panel')).toContainText('Nothing in the catalogue fits');
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({ method: 'POST' });
  expect(JSON.parse(calls[0].body ?? '{}')).toEqual({ query: 'split a restaurant bill' });
  expect(Number(await page.locator('.guide-panel').getAttribute('data-stream-updates'))).toBeGreaterThan(0);
});

test('product metadata is bounded while page content and source records stay complete', async ({ page, request }) => {
  for (const slug of ['how-it-runs', 'voice-riff-loop', 'scan-count-pad']) {
    const detail = await (await request.get(`/products/${slug}.json`)).json() as Product;
    await page.goto(`/p/${slug}/`);
    await expect(page.locator('.product h1')).toHaveText(detail.title);
    expect((await page.title()).length, `${slug} title length`).toBeLessThanOrEqual(60);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description, `${slug} meta description`).toBeTruthy();
    expect(description!.length, `${slug} description length`).toBeLessThanOrEqual(155);
    if (slug === 'how-it-runs') expect(`${detail.title} — Hello Factory`.length).toBeGreaterThan(60);
    else expect((detail.why || detail.description).length, `${slug} source metadata remains full`).toBeGreaterThan(description!.length);
  }
});

test('every standard route footer states the catalogue job', async ({ page }) => {
  const oneLiner = 'Find a focused tool for a specific job, compare its QA state, and open it at its own address.';
  for (const route of ['/', '/catalog/', '/demo/', '/p/a11y-interaction-trace/', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('footer .footer-job'), route).toHaveText(oneLiner);
  }
});

test('@claim:qa-verdicts shows controller verdicts and recorded dates', async ({ page, request }) => {
  const catalog = await (await request.get('/products.json')).json() as { products: Product[] };
  const expected = [
    ['RELEASED', 'QA passed'],
    ['VERIFYING', 'QA in progress'],
    ['POLISHING', 'QA changes required'],
  ] as const;
  for (const [state, label] of expected) {
    const product = catalog.products.find((entry) => entry.state === state);
    expect(product, `A ${state} catalogue row`).toBeTruthy();
    await page.goto(`/p/${product!.slug}/`);
    await expect(page.locator('.product h1')).toHaveText(product!.title);
    await expect(page.locator('.product .chips')).toContainText(label);
    expect(product!.qa.status).toBe(state);
    if (product!.qa.reviewed_at) {
      await expect(page.locator('.product .chips')).toContainText(dateLabel(product!.qa.reviewed_at));
      await expect(page.locator('.facts')).toContainText(dateLabel(product!.qa.reviewed_at));
    } else {
      await expect(page.locator('.facts')).toContainText(/no check date/i);
    }
  }
});

test('@claim:catalogue-truth games, recent releases, defaults, and controller counts agree across pages', async ({ page, request }) => {
  const sourceBytes = await readFile('.factory/input/latest-catalog.json');
  const source = JSON.parse(sourceBytes.toString()) as { catalog: { generated: string; count: number; products: Product[] }; details: Record<string, Product>; images: Record<string, string> };
  const expected = normalizeSnapshot(source).catalog as { generated: string; count: number; products: Product[] };
  const response = await request.get('/products.json');
  const catalog = await response.json() as { generated: string; count: number; products: Product[] };
  const summary = await (await request.get('/catalog-build.json')).json();
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const publishedGames = catalog.products.filter((entry) => entry.kind === 'game');
  const expectedGames = source.catalog.products.filter((entry) => entry.kind === 'game' || (!entry.kind && (entry.class === 'browser-game' || entry.territory === 'browser-games')));
  const states = Object.fromEntries(['POLISHING', 'RELEASED', 'VERIFYING'].map((state) => [state, source.catalog.products.filter((entry) => entry.state === state).length]));
  expect(catalog).toEqual(expected);
  expect(summary).toMatchObject({
    sourceSha256: createHash('sha256').update(sourceBytes).digest('hex'),
    generated: source.catalog.generated,
    count: source.catalog.count,
    details: source.catalog.count,
    currentPictures: source.catalog.count,
    states,
  });
  expect(catalog.products.every((entry) => entry.image === `/shots/${entry.slug}.webp`)).toBe(true);
  expect(publishedGames.map((entry) => entry.slug).sort()).toEqual(expectedGames.map((entry) => entry.slug).sort());
  expect(sitemap.match(/<loc>/g)).toHaveLength(source.catalog.count + 5);
  for (const entry of source.catalog.products) {
    expect(sitemap).toContain(`/p/${entry.slug}/`);
    const detail = JSON.parse(await readFile(`dist/products/${entry.slug}.json`, 'utf8'));
    expect(detail).toMatchObject({ description: source.details[entry.slug].description, qa: source.details[entry.slug].qa, image: `/shots/${entry.slug}.webp` });
  }
  const gameCount = publishedGames.length;
  await page.goto('/');
  await expect(page.locator('#hero-count')).toContainText(`${catalog.count} tools listed`);
  const gamesRail = page.locator('#rail-games').locator('xpath=ancestor::section');
  await expect(gamesRail.locator('.see-all')).toContainText(`See all ${gameCount}`);
  const releasedRail = page.locator('#rail-new').locator('xpath=ancestor::section');
  await expect(releasedRail.locator('.chip-qa-changes')).toHaveCount(0);
  await expect(releasedRail.locator('.chip-qa-active').first()).toBeVisible();
  await page.goto('/catalog/?kind=game');
  await expect(page.locator('#cat-count')).toContainText(`${gameCount} of ${catalog.count} tools`);
  const unshelved = catalog.products.find((entry) => entry.category === 'new');
  expect(unshelved).toBeTruthy();
  await page.goto(`/p/${unshelved!.slug}/`);
  await expect(page.locator('#crumb-cat')).toHaveText('Not yet shelved');
});

test('keyboard, reduced motion, route titles, links, and recovery paths work', async ({ browser, request }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  expect(await page.locator('.skip-link').evaluate((element) => getComputedStyle(element).outlineWidth)).toBe('3px');
  for (let step = 0; step < 8 && !(await page.getByRole('link', { name: 'Try it with sample data' }).evaluate((element) => element === document.activeElement)); step += 1) await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeFocused();
  expect(await undersizedTargets(page)).toEqual([]);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page).toHaveTitle('Demo — Hello Factory');
  expect(await undersizedTargets(page)).toEqual([]);
  await page.goto('/');
  const drum = page.locator('.drum');
  await expect(drum).toBeVisible();
  const before = await drum.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(500);
  expect(await drum.evaluate((element) => getComputedStyle(element).transform)).toBe(before);
  for (const [route, title] of [['/catalog/', /Hello Factory/], ['/privacy/', 'Privacy — Hello Factory'], ['/terms/', 'Terms — Hello Factory'], ['/404.html', 'Page not found — Hello Factory']] as const) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    expect(await undersizedTargets(page), route).toEqual([]);
  }
  for (const route of ['/', '/catalog/', '/demo/', '/privacy/', '/terms/', '/products.json']) {
    expect((await request.get(route)).status(), route).toBe(200);
  }
  await page.goto('/p/a11y-interaction-trace/');
  await expect(page.locator('.product h1')).toBeVisible();
  expect(await undersizedTargets(page)).toEqual([]);
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  expect(errors).toEqual([]);
  await page.route('**/products.json', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('#hero-count')).toContainText('could not be loaded');
  await page.unroute('**/products.json');
  await page.goto('/p/?slug=not-a-real-product');
  await expect(page.locator('h1')).toHaveText('No tool at this address.');
  await context.close();
});

for (const route of ['/', '/catalog/', '/demo/', '/privacy/', '/terms/', '/404.html', '/p/a11y-interaction-trace/']) {
  test(`has no serious accessibility violations on ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    if (route.startsWith('/p/')) await expect(page.locator('.product h1')).toBeVisible();
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  });
}
