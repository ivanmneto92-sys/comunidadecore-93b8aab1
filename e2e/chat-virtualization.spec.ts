import { test, expect, type Page } from '@playwright/test';

/**
 * E2E tests for the virtualized chat in /community.
 *
 * Prerequisites:
 *   1. Dev server running on BASE_URL (default http://localhost:8080).
 *   2. A test user exists; credentials in E2E_EMAIL / E2E_PASSWORD env vars.
 *   3. Seed messages: `psql "$DATABASE_URL" -v user_id="'<uuid>'" -f e2e/seed.sql`.
 *
 * The seed inserts ~200 messages plus three markers in #chat-geral:
 *   - "[E2E] OLDEST MARKER"        (top of history, requires load-more)
 *   - "[E2E] SCROLL TARGET — find me" (mid-list, used by search)
 *   - "[E2E] NEWEST MARKER"        (bottom, initial-load anchor)
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const EMAIL = process.env.E2E_EMAIL!;
const PASSWORD = process.env.E2E_PASSWORD!;
const CHANNEL_SLUG = 'chat-geral';

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/e-?mail/i).fill(EMAIL);
  await page.getByLabel(/senha|password/i).first().fill(PASSWORD);
  await page.getByRole('button', { name: /entrar|sign in/i }).click();
  await page.waitForURL(/\/(app|community|dashboard)/, { timeout: 15_000 });
}

async function openChannel(page: Page) {
  await page.goto(`${BASE_URL}/community?channel=${CHANNEL_SLUG}`, {
    waitUntil: 'domcontentloaded',
  });
  // Wait until the virtualized container is populated
  await expect(
    page.getByText('[E2E] NEWEST MARKER').first(),
  ).toBeVisible({ timeout: 15_000 });
}

// Resolve the chat scroll container (the parentRef div from ChatView).
function chatScroller(page: Page) {
  // The virtualized parent is the only `.overflow-y-auto` inside the chat
  // column that contains messages.
  return page.locator('div.overflow-y-auto').filter({
    has: page.locator('text=/\\[E2E\\]/'),
  }).first();
}

test.describe('Virtualized chat', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await openChannel(page);
  });

  test('scroll-to-bottom on initial load shows newest message', async ({ page }) => {
    const scroller = chatScroller(page);
    const metrics = await scroller.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    // Should be within the near-bottom threshold (200px in chatScroll.ts)
    expect(metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight).toBeLessThan(200);
    await expect(page.getByText('[E2E] NEWEST MARKER').first()).toBeInViewport();
  });

  test('load-more anchors previously-first message after prepend', async ({ page }) => {
    const scroller = chatScroller(page);

    // Scroll to top to trigger load-more
    await scroller.evaluate((el) => { el.scrollTop = 0; });

    // Capture the first visible E2E message before load-more resolves
    const firstVisible = await scroller.evaluate((el) => {
      const nodes = Array.from(el.querySelectorAll('[data-index]')) as HTMLElement[];
      const rect = el.getBoundingClientRect();
      const visible = nodes.find((n) => {
        const r = n.getBoundingClientRect();
        return r.bottom > rect.top && r.top < rect.bottom;
      });
      return visible?.textContent ?? null;
    });
    expect(firstVisible).toBeTruthy();

    // Wait for "Carregando mensagens..." indicator to come and go
    await page.waitForSelector('text=/Carregando mensagens/i', { state: 'visible', timeout: 5_000 }).catch(() => {});
    await page.waitForSelector('text=/Carregando mensagens/i', { state: 'hidden', timeout: 10_000 }).catch(() => {});

    // After prepend, the previously-first message should still be near the top of the viewport
    const stillVisible = await scroller.evaluate((el, text) => {
      const nodes = Array.from(el.querySelectorAll('[data-index]')) as HTMLElement[];
      const match = nodes.find((n) => n.textContent?.includes(text ?? ''));
      if (!match) return null;
      const r = match.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return { top: r.top - er.top, height: er.height };
    }, firstVisible);

    expect(stillVisible).not.toBeNull();
    // Anchor should keep the message in the upper half of the viewport
    expect(stillVisible!.top).toBeGreaterThanOrEqual(-50);
    expect(stillVisible!.top).toBeLessThan(stillVisible!.height * 0.75);
  });

  test('scroll-to-message via search brings the target into view + highlights', async ({ page }) => {
    // Open search panel
    await page.getByRole('button', { name: /search|buscar/i }).first().click();
    await page.getByPlaceholder(/buscar|search/i).fill('SCROLL TARGET');

    // Click the first matching result
    await page.getByText(/\[E2E\] SCROLL TARGET/).first().click();

    // Target should be in viewport and visually highlighted (animate-pulse class)
    const target = page.getByText('[E2E] SCROLL TARGET — find me').first();
    await expect(target).toBeInViewport({ timeout: 5_000 });

    const highlighted = await target.evaluate((node) => {
      let el: HTMLElement | null = node as HTMLElement;
      while (el) {
        if (el.className && /animate-pulse/.test(el.className)) return true;
        el = el.parentElement;
      }
      return false;
    });
    expect(highlighted).toBe(true);
  });
});
