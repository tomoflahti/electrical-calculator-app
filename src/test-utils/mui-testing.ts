/**
 * Test utilities for Material-UI components
 * Provides helpers for testing MUI Select components and other complex interactions
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';

/**
 * Helper to select value from MUI Select component by actual value
 * More reliable for complex dropdown structures
 */
export const selectMuiOption = async (testId: string, value: string) => {
  const select = screen.getByTestId(testId);
  
  // Open the select dropdown
  fireEvent.mouseDown(select);
  
  // Wait for the dropdown to open and find the option by value attribute
  await waitFor(() => {
    // For complex dropdowns, look for MenuItem with the value
    const option = screen.getByRole('option', { name: new RegExp(value, 'i') });
    fireEvent.click(option);
  });
};

/**
 * Helper to select value from MUI Select component by display text
 * Use this when you know the exact display text
 */
export const selectMuiOptionByText = async (testId: string, displayText: string) => {
  const select = screen.getByTestId(testId);
  
  // Open the select dropdown
  fireEvent.mouseDown(select);
  
  // Wait for the option to appear and click it
  await waitFor(() => {
    const option = screen.getByText(displayText);
    fireEvent.click(option);
  });
};

/**
 * Get the current value of a MUI Select component
 */
export const getMuiSelectValue = (testId: string): string => {
  const select = screen.getByTestId(testId);
  // MUI Select stores the value in a hidden native input
  const hiddenInput = select.querySelector('input[type="hidden"]') || select.querySelector('input[aria-hidden="true"]');
  return (hiddenInput as HTMLInputElement)?.value || '';
};

/**
 * Check if a MUI Select has a specific value
 */
export const expectMuiSelectToHaveValue = (testId: string, expectedValue: string) => {
  const actualValue = getMuiSelectValue(testId);
  expect(actualValue).toBe(expectedValue);
};

/**
 * Check if a MUI Select has specific options available
 */
export const expectMuiSelectToHaveOptions = async (testId: string, options: string[]) => {
  const select = screen.getByTestId(testId);
  
  // Open the dropdown
  fireEvent.mouseDown(select);
  
  // Check each option is present
  for (const option of options) {
    await waitFor(() => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  }
  
  // Close the dropdown by clicking away
  fireEvent.click(document.body);
};

/**
 * Check if specific options are NOT available in a MUI Select
 */
export const expectMuiSelectNotToHaveOptions = async (testId: string, options: string[]) => {
  const select = screen.getByTestId(testId);
  
  // Open the dropdown
  fireEvent.mouseDown(select);
  
  // Wait a moment for dropdown to open
  await waitFor(() => {
    // Check each option is NOT present
    for (const option of options) {
      expect(screen.queryByText(option)).not.toBeInTheDocument();
    }
  });
  
  // Close the dropdown
  fireEvent.click(document.body);
};

/**
 * Simple helper to verify component state without UI interaction
 */
export const verifyComponentState = (expectations: Record<string, any>) => {
  Object.entries(expectations).forEach(([testId, expectedValue]) => {
    if (typeof expectedValue === 'string') {
      expect(screen.getByTestId(testId)).toHaveValue(expectedValue);
    } else if (typeof expectedValue === 'boolean') {
      if (expectedValue) {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
      }
    }
  });
};