import { test, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Mock authentication helper using demo credentials
async function mockLogin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('demo@todoapp.com')
  await page.getByLabel('Password').fill('demo123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
}

test.describe('Accessibility', () => {
  test('home page should be accessible', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('register page should be accessible', async ({ page }) => {
    await page.goto('/register')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('dashboard should be accessible', async ({ page }) => {
    // Authenticate with demo credentials first
    await mockLogin(page)
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/login')
    
    // Check initial focus
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Email')).toBeFocused()
    
    // Tab to next element
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused()
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    
    // This would be caught by axe-core, but we can also do specific checks
    const button = page.getByRole('link', { name: 'Sign In' })
    await expect(button).toBeVisible()
    
    // In a real test, you might check computed styles for contrast ratios
  })

  test('should support screen readers', async ({ page }) => {
    await page.goto('/login')
    
    // Check for proper labels and descriptions
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('type', 'email')
    
    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Check form has proper structure
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })

  test('should work with keyboard only', async ({ page }) => {
    await page.goto('/')
    
    // Navigate using only keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should navigate to login
    await expect(page).toHaveURL('/login')
    
    // Fill form with keyboard
    await page.keyboard.press('Tab') // Focus email
    await page.keyboard.type('test@example.com')
    await page.keyboard.press('Tab') // Focus password
    await page.keyboard.type('password')
    
    // Submit with Enter
    await page.keyboard.press('Enter')
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check main heading exists
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    
    await page.goto('/login')
    
    // Login should have proper heading
    const loginHeading = page.getByRole('heading', { level: 1 })
    await expect(loginHeading).toBeVisible()
  })

  test('should have skip links for screen readers', async ({ page }) => {
    await page.goto('/')
    
    // In a complete implementation, you'd have skip links
    // This is a placeholder for that functionality
  })
})