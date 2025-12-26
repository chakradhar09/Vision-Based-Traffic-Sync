
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('Test_2025-12-26', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:5175/');

    // Fill input field
    await page.fill('input[type="email"]', 'operator@traffic.com');

    // Fill input field
    await page.fill('input[type="password"]', 'demo123');

    // Click element
    await page.click('button[type="submit"]');

    // Click element
    await page.click('button:has-text("ACTIVATE EMERGENCY")');
});