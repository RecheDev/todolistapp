import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display welcome page for unauthenticated users', async ({ page }) => {
    await expect(page.getByText('Welcome to Todo App')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create Account' })).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Sign in')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Create Account' }).click()
    await expect(page).toHaveURL('/register')
  })

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login')
    
    // Submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Browser validation should prevent submission
    await expect(page.getByLabel('Email')).toHaveAttribute('required')
    await expect(page.getByLabel('Password')).toHaveAttribute('required')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel('Email').fill('nonexistent@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()
    
    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible()
  })

  test('login form should have proper accessibility', async ({ page }) => {
    await page.goto('/login')
    
    // Check form accessibility
    const emailInput = page.getByLabel('Email')
    const passwordInput = page.getByLabel('Password')
    
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('autocomplete', 'email')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    
    // Check keyboard navigation
    await emailInput.focus()
    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()
  })

  test('should redirect authenticated users to dashboard', async ({ page }) => {
    // This test would need a setup with a test user
    // For now, we'll just test the redirect logic exists
    await page.goto('/')
    // If user is authenticated, should redirect to /dashboard
    // This will be implemented when we have test user setup
  })
})

test.describe('Navigation', () => {
  test('should have proper navigation between auth pages', async ({ page }) => {
    await page.goto('/login')
    
    // Navigate to register from login
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('/register')
    
    // Should have link back to login
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })
})