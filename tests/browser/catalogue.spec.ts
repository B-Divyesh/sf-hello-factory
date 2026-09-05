import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
});

test('@claim:qa-verdicts shows controller verdicts and recorded dates', async ({ page }) => {
  await page.goto('/p/a11y-interaction-trace/');
  await expect(page.locator('.product h1')).toHaveText('A11y Interaction Trace');
  await expect(page.locator('.product .chips')).toContainText('QA passed · 28 August 2026');
  await expect(page.locator('.facts')).toContainText('Passed on 28 August 2026.');
  await page.goto('/p/client-request-catalog/');
  await expect(page.locator('.product .chips')).toContainText('QA changes required · 2 September 2026');
  await page.goto('/p/assessment-authorship-receipts/');
  await expect(page.locator('.product .chips')).toContainText('QA in progress');
  await expect(page.locator('.facts')).toContainText('no check date recorded yet');
});

test('@claim:catalogue-truth games, recent releases, defaults, and controller counts agree across pages', async ({ page, request }) => {
  const response = await request.get('/products.json');
  const catalog = await response.json();
  const gameCount = catalog.products.filter((entry: { kind: string }) => entry.kind === 'game').length;
  await page.goto('/');
  await expect(page.locator('#hero-count')).toContainText(`${catalog.count} tools listed`);
  const gamesRail = page.locator('#rail-games').locator('xpath=ancestor::section');
  await expect(gamesRail.locator('.see-all')).toContainText(`See all ${gameCount}`);
  const releasedRail = page.locator('#rail-new').locator('xpath=ancestor::section');
  await expect(releasedRail.locator('.chip-qa-changes')).toHaveCount(0);
  await expect(releasedRail.locator('.chip-qa-active').first()).toBeVisible();
  await page.goto('/catalog/?kind=game');
  await expect(page.locator('#cat-count')).toContainText(`${gameCount} of ${catalog.count} tools`);
  await page.goto('/p/assessment-authorship-receipts/');
  await expect(page.locator('.product .chips')).toContainText('Web app with a server');
  await expect(page.locator('#crumb-cat')).toHaveText('Not yet shelved');
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
