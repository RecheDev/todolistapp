import { test, expect, Page } from '@playwright/test'

// Mock authentication helper using demo credentials
async function mockLogin(page: Page) {
  // Use the demo credentials from CLAUDE.md
  await page.goto('/login')
  await page.getByLabel('Email').fill('demo@todoapp.com')
  await page.getByLabel('Password').fill('demo123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard')
}

test.describe('Todo Management', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate with demo credentials before each test
    await mockLogin(page)
  })

  test('should display dashboard with header and stats', async ({ page }) => {
    await expect(page.getByText('My Todos')).toBeVisible()
    await expect(page.getByText(/total/)).toBeVisible()
    await expect(page.getByText(/pending/)).toBeVisible()
    await expect(page.getByText(/completed/)).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search todos...')
    await expect(searchInput).toBeVisible()
    
    // Test search functionality
    await searchInput.fill('test todo')
    // Would need to verify search results
  })

  test('should have filter functionality', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /All Todos/i })
    await expect(filterButton).toBeVisible()
    
    await filterButton.click()
    await expect(page.getByText('Pending')).toBeVisible()
    await expect(page.getByText('Completed')).toBeVisible()
  })

  test('should display add todo form', async ({ page }) => {
    // Check for add todo button/form
    await expect(page.getByText('Add a new todo...')).toBeVisible()
    
    // Click to expand form
    await page.getByText('Add a new todo...').click()
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible()
    await expect(page.getByPlaceholder('Description (optional)')).toBeVisible()
  })

  test('should create a new todo', async ({ page }) => {
    // Click add todo
    await page.getByText('Add a new todo...').click()
    
    // Fill form
    await page.getByPlaceholder('What needs to be done?').fill('Test Todo')
    await page.getByPlaceholder('Description (optional)').fill('Test Description')
    
    // Submit
    await page.getByRole('button', { name: /Add Todo/i }).click()
    
    // Verify todo appears
    await expect(page.getByText('Test Todo')).toBeVisible()
    await expect(page.getByText('Test Description')).toBeVisible()
  })

  test('should toggle todo completion', async ({ page }) => {
    // Assuming a todo exists, find its checkbox
    const checkbox = page.getByRole('checkbox').first()
    await checkbox.check()
    
    // Verify todo appears completed (crossed out)
    await expect(page.locator('.line-through').first()).toBeVisible()
  })

  test('should edit todo', async ({ page }) => {
    // Click more menu on first todo
    await page.getByRole('button', { name: 'Open menu' }).first().click()
    await page.getByText('Edit').click()
    
    // Edit the todo
    const titleInput = page.locator('input[value*="Test Todo"]')
    await titleInput.fill('Updated Todo')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify update
    await expect(page.getByText('Updated Todo')).toBeVisible()
  })

  test('should delete todo', async ({ page }) => {
    // Click more menu on first todo
    await page.getByRole('button', { name: 'Open menu' }).first().click()
    await page.getByText('Delete').click()
    
    // Todo should be removed
    // Would need to verify the specific todo is gone
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Cmd+Enter to submit todo
    await page.getByText('Add a new todo...').click()
    await page.getByPlaceholder('What needs to be done?').fill('Keyboard Test')
    await page.keyboard.press('Meta+Enter')
    
    // Should submit the form
    await expect(page.getByText('Keyboard Test')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that layout adapts
    await expect(page.getByText('My Todos')).toBeVisible()
    // Verify mobile-specific layout changes
  })
})

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await mockLogin(page)
    
    // Check checkbox has proper aria-label
    const checkbox = page.getByRole('checkbox').first()
    await expect(checkbox).toHaveAttribute('aria-label', /Mark .* as/i)
    
    // Check buttons have proper labels
    const menuButton = page.getByRole('button', { name: 'Open menu' }).first()
    await expect(menuButton).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await mockLogin(page)
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    // Verify focus moves through elements properly
  })

  test('should have proper heading structure', async ({ page }) => {
    await mockLogin(page)
    
    // Check h1 exists
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})