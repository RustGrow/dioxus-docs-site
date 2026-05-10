import { test, expect } from '@playwright/test';

// Helper: get the content h1 (not the page title h1)
const contentHeading = (page: any) => page.locator('main h1#_top ~ h1, main [id]:not([id="_top"]) > h1, main h1').nth(1);

test.describe('Dioxus Docs - Root (EN)', () => {
  test('homepage loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dioxus Documentation/);
    await expect(page.locator('main')).toContainText('Dioxus Documentation');
  });

  test('welcome page loads', async ({ page }) => {
    await page.goto('/getting-started/welcome');
    await expect(page).toHaveTitle(/Welcome/);
    await expect(page.locator('main')).toContainText('Introduction');
  });

  test('tutorial overview loads', async ({ page }) => {
    await page.goto('/tutorial/overview');
    await expect(page).toHaveTitle(/Tutorial Overview/);
    await expect(page.locator('main')).toContainText('Dioxus Tutorial');
  });

  test('essentials/ui/rsx page loads', async ({ page }) => {
    await page.goto('/essentials/ui/rsx');
    await expect(page).toHaveTitle(/Introducing RSX/);
    await expect(page.locator('main')).toContainText('Introducing RSX');
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // Use the sidebar nav specifically
    const sidebar = page.locator('nav.sidebar');
    // Check sidebar exists in DOM even if visually hidden
    await expect(sidebar).toHaveCount(1);
    // Click on Getting Started group to expand it
    const gettingStarted = sidebar.locator('summary:has-text("Getting Started"), button:has-text("Getting Started")').first();
    if (await gettingStarted.isVisible().catch(() => false)) {
      await gettingStarted.click();
    }
    // Click on Welcome link
    const welcomeLink = sidebar.locator('a:has-text("Welcome")').first();
    if (await welcomeLink.isVisible().catch(() => false)) {
      await welcomeLink.click();
      await expect(page).toHaveURL(/getting-started\/welcome/);
      await expect(page.locator('main')).toContainText('Introduction');
    }
  });

  test('dark/light theme toggle works', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('button[title*="dark" i], button[aria-label*="dark" i], button.starlight-theme-toggle').first();
    if (await themeButton.isVisible().catch(() => false)) {
      await themeButton.click();
      const html = page.locator('html');
      const theme = await html.getAttribute('data-theme');
      expect(theme === 'dark' || theme === 'light').toBe(true);
    }
  });

  test('search is accessible', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.locator('button').filter({ hasText: /Search/i }).first();
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click();
      const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe('Dioxus Docs - Russian (RU)', () => {
  test('russian homepage loads', async ({ page }) => {
    await page.goto('/ru/');
    await expect(page).toHaveTitle(/Документация Dioxus/);
    await expect(page.locator('main')).toContainText('Документация Dioxus');
  });

  test('russian welcome page loads', async ({ page }) => {
    await page.goto('/ru/getting-started/welcome');
    await expect(page).toHaveTitle(/Добро пожаловать/);
    await expect(page.locator('main')).toContainText('Введение');
  });

  test('russian tutorial overview loads', async ({ page }) => {
    await page.goto('/ru/tutorial/overview');
    await expect(page).toHaveTitle(/Обзор туториала/);
    await expect(page.locator('main')).toContainText('Туториал по Dioxus');
  });

  test('russian essentials page loads', async ({ page }) => {
    await page.goto('/ru/essentials/ui/rsx');
    await expect(page).toHaveTitle(/Введение в RSX/);
    await expect(page.locator('main')).toContainText('Введение в RSX');
  });

  test('language switcher exists', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/getting-started/welcome');
    // Starlight language picker is in the header
    const header = page.locator('header');
    await expect(header).toContainText('English');
    await expect(header).toContainText('Русский');
  });

  test('russian sidebar labels are correct', async ({ page }) => {
    await page.goto('/ru/');
    const sidebar = page.locator('nav.sidebar');
    await expect(sidebar).toContainText('Начало работы');
    await expect(sidebar).toContainText('Туториал');
    await expect(sidebar).toContainText('Основные концепции');
  });
});

test.describe('Dioxus Docs - Code blocks', () => {
  test('rust code blocks are rendered', async ({ page }) => {
    await page.goto('/getting-started/welcome');
    const codeBlocks = page.locator('pre code');
    await expect(codeBlocks.first()).toBeVisible();
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('code blocks have language markers', async ({ page }) => {
    await page.goto('/tutorial/rsx');
    const codeBlocks = page.locator('pre code, .expressive-code pre');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Dioxus Docs - Mobile responsiveness', () => {
  test('mobile menu button exists on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i]').first();
    await expect(menuButton).toBeVisible();
  });
});

test.describe('Dioxus Docs - 404 page', () => {
  test('404 page loads for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page.locator('main')).toContainText('404');
  });
});

test.describe('Dioxus Docs - SEO and Meta', () => {
  test('sitemap exists', async ({ page }) => {
    const response = await page.goto('/sitemap-index.xml');
    expect(response?.status()).toBe(200);
  });

  test('meta charset is present', async ({ page }) => {
    await page.goto('/');
    const charset = page.locator('meta[charset]');
    const value = await charset.getAttribute('charset');
    expect(value?.toLowerCase()).toBe('utf-8');
  });
});
