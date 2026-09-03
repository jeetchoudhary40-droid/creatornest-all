import { test, expect } from '@playwright/test';

test('Admin Login and Panel Features functionality', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:3000/login');

  // Fill in login credentials
  await page.fill('input[type="email"]', 'admin@creatornest.com');
  await page.fill('input[type="password"]', 'password123');

  // Click Sign In
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/admin/dashboard*');

  // Check if we are on the admin dashboard
  await expect(page.locator('text=Admin Dashboard').first()).toBeVisible({ timeout: 10000 });

  // Test Creators Tab
  const creatorsLink = page.locator('a[href="/admin/creators"]').first();
  await creatorsLink.click();
  await page.waitForURL('**/admin/creators*');
  await expect(page.locator('h1', { hasText: 'Creator Roster' }).first()).toBeVisible();

  // Test Brands Tab
  const brandsLink = page.locator('a[href="/admin/brands"]').first();
  await brandsLink.click();
  await page.waitForURL('**/admin/brands*');
  await expect(page.locator('h1', { hasText: 'Brand Partners' }).first()).toBeVisible();

  // Test Users Tab
  const usersLink = page.locator('a[href="/admin/users"]').first();
  await usersLink.click();
  await page.waitForURL('**/admin/users*');
  await expect(page.locator('h1', { hasText: 'User Management' }).first()).toBeVisible();

  console.log("Admin login and full panel navigation passed.");
});
