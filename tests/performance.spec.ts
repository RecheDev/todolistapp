import { test, expect } from '@playwright/test'

test.describe('Performance Tests - Action Response Times', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo@todoapp.com')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('Add new task action should complete under 200ms', async ({ page }) => {
    // Click add new task button
    const startTime = Date.now()
    await page.click('button:has-text("Add New Task")')
    
    // Wait for form to appear
    await page.waitForSelector('input[placeholder*="e.g."]')
    const formAppearTime = Date.now() - startTime
    
    expect(formAppearTime).toBeLessThan(200)
    console.log(`Add task button response time: ${formAppearTime}ms`)
    
    // Fill form and submit
    await page.fill('input[placeholder*="e.g."]', 'Performance Test Task')
    
    const submitStartTime = Date.now()
    await page.click('button:has-text("Create Task")')
    
    // Wait for task to appear in list
    await page.waitForSelector('text=Performance Test Task')
    const submitTime = Date.now() - submitStartTime
    
    expect(submitTime).toBeLessThan(200)
    console.log(`Task creation time: ${submitTime}ms`)
  })

  test('Toggle task completion should complete under 200ms', async ({ page }) => {
    // First create a task
    await page.click('button:has-text("Add New Task")')
    await page.fill('input[placeholder*="e.g."]', 'Toggle Test Task')
    await page.click('button:has-text("Create Task")')
    await page.waitForSelector('text=Toggle Test Task')
    
    // Find and toggle the checkbox
    const checkbox = page.locator('[role="checkbox"]').first()
    
    const startTime = Date.now()
    await checkbox.click()
    
    // Wait for visual feedback (checked state)
    await page.waitForSelector('[role="checkbox"][data-state="checked"]')
    const toggleTime = Date.now() - startTime
    
    expect(toggleTime).toBeLessThan(200)
    console.log(`Toggle task time: ${toggleTime}ms`)
  })

  test('Delete task action should complete under 200ms', async ({ page }) => {
    // First create a task
    await page.click('button:has-text("Add New Task")')
    await page.fill('input[placeholder*="e.g."]', 'Delete Test Task')
    await page.click('button:has-text("Create Task")')
    await page.waitForSelector('text=Delete Test Task')
    
    // Open dropdown menu
    await page.click('[data-testid="todo-menu"]')
    
    const startTime = Date.now()
    
    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept())
    
    await page.click('text=Delete')
    
    // Wait for task to disappear
    await page.waitForSelector('text=Delete Test Task', { state: 'detached' })
    const deleteTime = Date.now() - startTime
    
    expect(deleteTime).toBeLessThan(200)
    console.log(`Delete task time: ${deleteTime}ms`)
  })

  test('Edit task action should complete under 200ms', async ({ page }) => {
    // First create a task
    await page.click('button:has-text("Add New Task")')
    await page.fill('input[placeholder*="e.g."]', 'Edit Test Task')
    await page.click('button:has-text("Create Task")')
    await page.waitForSelector('text=Edit Test Task')
    
    // Open dropdown and click edit
    await page.click('[data-testid="todo-menu"]')
    
    const startTime = Date.now()
    await page.click('text=Edit')
    
    // Wait for edit form to appear
    await page.waitForSelector('input[value="Edit Test Task"]')
    const editFormTime = Date.now() - startTime
    
    expect(editFormTime).toBeLessThan(200)
    console.log(`Edit form appearance time: ${editFormTime}ms`)
    
    // Edit and save
    await page.fill('input[value="Edit Test Task"]', 'Edited Test Task')
    
    const saveStartTime = Date.now()
    await page.click('button:has-text("Save")')
    
    // Wait for edited task to appear
    await page.waitForSelector('text=Edited Test Task')
    const saveTime = Date.now() - saveStartTime
    
    expect(saveTime).toBeLessThan(200)
    console.log(`Save edit time: ${saveTime}ms`)
  })

  test('Search/filter actions should complete under 200ms', async ({ page }) => {
    // Create multiple tasks first
    const tasks = ['Task 1', 'Task 2', 'Special Task']
    
    for (const task of tasks) {
      await page.click('button:has-text("Add New Task")')
      await page.fill('input[placeholder*="e.g."]', task)
      await page.click('button:has-text("Create Task")')
      await page.waitForSelector(`text=${task}`)
    }
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]')
    
    const startTime = Date.now()
    await searchInput.fill('Special')
    
    // Wait for filtered results
    await page.waitForSelector('text=Special Task')
    await page.waitForSelector('text=Task 1', { state: 'detached' })
    
    const searchTime = Date.now() - startTime
    
    expect(searchTime).toBeLessThan(200)
    console.log(`Search filter time: ${searchTime}ms`)
  })

  test('Theme toggle should complete under 200ms', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="theme"], button:has-text("🌙"), button:has-text("☀️")')
    
    const startTime = Date.now()
    await themeButton.click()
    
    // Wait for theme change to be visible (check for dark class on html)
    await page.waitForFunction(() => {
      return document.documentElement.classList.contains('dark') || 
             document.documentElement.classList.contains('light')
    })
    
    const themeToggleTime = Date.now() - startTime
    
    expect(themeToggleTime).toBeLessThan(200)
    console.log(`Theme toggle time: ${themeToggleTime}ms`)
  })
})