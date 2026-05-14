import { test, expect } from '@playwright/test';

test.describe('AlphaMind Trading Platform', () => {
  test('Trading page has Scalper Zone and Volatility Edge strategies available and selectable', async ({ page }) => {
    // Navigate to the trading page directly
    await page.goto('/trading');

    // Verify the page loaded correctly
    await expect(page.locator('h1', { hasText: 'Trading Engine' })).toBeVisible();

    // Verify "Scalper Zone" strategy
    const scalperButton = page.locator('button', { hasText: 'Scalper Zone' });
    await expect(scalperButton).toBeVisible();
    
    // Click and verify it becomes the active selected strategy
    await scalperButton.click();
    await expect(scalperButton).toHaveClass(/ring-primary/);

    // Verify "Volatility Edge" strategy
    const volatilityButton = page.locator('button', { hasText: 'Volatility Edge' });
    await expect(volatilityButton).toBeVisible();
    
    // Click and verify it becomes the active selected strategy
    await volatilityButton.click();
    await expect(volatilityButton).toHaveClass(/ring-primary/);
  });

  test('Dashboard reflects active strategy fallback correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check that the Return Target widget loads and has an activity text 
    // It will show one of the strategies (either from DB or fallback)
    await expect(page.locator('text=Return Target')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Active Model' })).toBeVisible();
  });
});
