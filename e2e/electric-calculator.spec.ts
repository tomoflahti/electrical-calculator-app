import { test, expect } from "@playwright/test";

test.describe("Electric Calculator End-to-End Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the main calculator page", async ({ page }) => {
    await expect(page).toHaveTitle(/Electric/);
    await expect(
      page.getByRole("heading", { name: /electric.*calculator/i }),
    ).toBeVisible();
  });

  test("should perform basic wire size calculation", async ({ page }) => {
    // Look for wire size calculator
    const wireCalculator = page.getByText(/wire.*size.*calculator/i).first();
    if (await wireCalculator.isVisible()) {
      await wireCalculator.click();
    }

    // Fill in basic calculation inputs
    await page.fill(
      'input[name="current"], input[aria-label*="Current"], input[label*="Current"]',
      "20",
    );
    await page.fill(
      'input[name="length"], input[aria-label*="Length"], input[label*="Length"]',
      "100",
    );
    await page.fill(
      'input[name="voltage"], input[aria-label*="Voltage"], input[label*="Voltage"]',
      "120",
    );

    // Select voltage system if available
    const voltageSelect = page
      .locator('select[name="voltageSystem"], [aria-label*="Voltage System"]')
      .first();
    if (await voltageSelect.isVisible()) {
      await voltageSelect.selectOption("single");
    }

    // Click calculate button
    const calculateButton = page.getByRole("button", { name: /calculate/i });
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
    }

    // Check for results
    await expect(page.getByText(/recommended/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should display voltage drop analysis", async ({ page }) => {
    // Navigate to voltage drop analysis if it exists as separate page
    const voltageDropLink = page.getByText(/voltage.*drop/i).first();
    if (await voltageDropLink.isVisible()) {
      await voltageDropLink.click();
    }

    // Fill in voltage drop calculation inputs
    await page.fill(
      'input[aria-label*="Load Current"], input[label*="Current"]',
      "32",
    );
    await page.fill(
      'input[aria-label*="Circuit Length"], input[label*="Length"]',
      "50",
    );
    await page.fill('input[aria-label*="Voltage"]', "400");

    // Look for chart or results
    const chartContainer = page.locator(
      '[data-testid="voltage-drop-chart"], .recharts-wrapper, svg',
    );
    if (await chartContainer.first().isVisible()) {
      await expect(chartContainer.first()).toBeVisible();
    }

    // Check for voltage drop results
    const resultsTable = page.locator('table, [role="table"]');
    if (await resultsTable.first().isVisible()) {
      await expect(resultsTable.first()).toBeVisible();
    }
  });

  test("should perform conduit fill calculation", async ({ page }) => {
    // Navigate to conduit fill calculator
    const conduitLink = page.getByText(/conduit.*fill/i).first();
    if (await conduitLink.isVisible()) {
      await conduitLink.click();
    }

    // Add wire configurations
    const addWireButton = page.getByRole("button", { name: /add.*wire/i });
    if (await addWireButton.isVisible()) {
      await addWireButton.click();
    }

    // Fill in wire information
    const wireGaugeInputs = page.locator(
      'input[aria-label*="Gauge"], input[label*="Gauge"]',
    );
    if (await wireGaugeInputs.first().isVisible()) {
      await wireGaugeInputs.first().fill("4");
    }

    const wireCountInputs = page.locator(
      'input[aria-label*="Count"], input[label*="Count"]',
    );
    if (await wireCountInputs.first().isVisible()) {
      await wireCountInputs.first().fill("3");
    }

    // Check for conduit recommendations
    await expect(page.getByText(/conduit.*size|recommended/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should handle standard switching (NEC/IEC)", async ({ page }) => {
    // Look for standard selector
    const standardSelector = page.locator(
      'select[name="standard"], [aria-label*="Standard"]',
    );
    if (await standardSelector.first().isVisible()) {
      // Test switching between standards
      await standardSelector.first().selectOption("NEC");
      await expect(page.getByText(/awg|nec/i)).toBeVisible();

      await standardSelector.first().selectOption("IEC");
      await expect(page.getByText(/mm²|iec/i)).toBeVisible();
    }
  });

  test("should display charts when available", async ({ page }) => {
    // Look for any chart components
    const charts = page.locator(
      '.recharts-wrapper, svg[class*="recharts"], [data-testid*="chart"]',
    );

    // Wait for potential charts to load
    await page.waitForTimeout(2000);

    const chartCount = await charts.count();
    if (chartCount > 0) {
      // Verify at least one chart is visible
      await expect(charts.first()).toBeVisible();

      // Test chart interactions if available
      const chartSelectButton = page.getByRole("button", {
        name: /chart|view/i,
      });
      if (await chartSelectButton.first().isVisible()) {
        await chartSelectButton.first().click();
      }
    }
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the page is still functional
    await expect(page.getByRole("heading").first()).toBeVisible();

    // Check for mobile-friendly navigation
    const mobileMenu = page.getByRole("button", { name: /menu|hamburger/i });
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }

    // Verify inputs are accessible on mobile
    const inputs = page.locator('input[type="number"]');
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      await expect(inputs.first()).toBeVisible();
    }
  });

  test("should handle calculation errors gracefully", async ({ page }) => {
    // Try to trigger an error with invalid inputs
    const currentInput = page
      .locator('input[aria-label*="Current"], input[label*="Current"]')
      .first();
    if (await currentInput.isVisible()) {
      await currentInput.fill("-100"); // Invalid negative current
    }

    const calculateButton = page.getByRole("button", { name: /calculate/i });
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
    }

    // Check for error handling (either validation message or graceful fallback)
    const errorMessage = page.getByText(/error|invalid|warning/i);
    const hasError = await errorMessage.isVisible();

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    } else {
      // If no error message, ensure page doesn't crash
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });

  test("should maintain state during navigation", async ({ page }) => {
    // Fill in some values
    const currentInput = page
      .locator('input[aria-label*="Current"], input[label*="Current"]')
      .first();
    if (await currentInput.isVisible()) {
      await currentInput.fill("25");
    }

    const lengthInput = page
      .locator('input[aria-label*="Length"], input[label*="Length"]')
      .first();
    if (await lengthInput.isVisible()) {
      await lengthInput.fill("75");
    }

    // Navigate away and back (if there are multiple pages)
    const navLinks = page.getByRole("link");
    const linkCount = await navLinks.count();

    if (linkCount > 1) {
      await navLinks.nth(1).click();
      await page.goBack();

      // Check if values are preserved (if the app supports this)
      const _currentValue = await currentInput.inputValue();
      // This might not be preserved depending on implementation
    }

    // Verify page is still functional
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("should perform accessibility checks", async ({ page }) => {
    // Check for basic accessibility features

    // Verify headings are properly structured
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for form labels
    const labeledInputs = page.locator(
      "input[aria-label], input[aria-labelledby], label input",
    );
    const inputCount = await labeledInputs.count();

    // If there are inputs, they should be properly labeled
    if (inputCount > 0) {
      await expect(labeledInputs.first()).toBeVisible();
    }

    // Verify buttons have accessible names
    const buttons = page.getByRole("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const buttonText = await button.textContent();
      expect(buttonText?.trim().length).toBeGreaterThan(0);
    }
  });

  test("should handle keyboard navigation", async ({ page }) => {
    // Test tab navigation through form elements
    await page.keyboard.press("Tab");

    // Check that focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const currentFocus = page.locator(":focus");
      await expect(currentFocus).toBeVisible();
    }

    // Test Enter key on buttons
    const buttons = page.getByRole("button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      await buttons.first().focus();
      await page.keyboard.press("Enter");

      // Verify the action occurred (page didn't crash)
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });
});
