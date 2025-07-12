/**
 * Input Helpers - Utilities for handling number inputs in forms
 * Handles leading zeros, empty values, and validation gracefully
 */

export interface NumberInputOptions {
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  allowEmpty?: boolean;
  emptyValue?: number | string;
}

/**
 * Handles number input changes while preventing leading zeros and handling empty values
 * @param value - The input value from the event
 * @param options - Configuration options for the input
 * @returns The processed value or null if invalid
 */
export function handleNumberInput(
  value: string, 
  options: NumberInputOptions = {}
): number | string | null {
  const {
    min,
    max,
    allowDecimals = true,
    allowEmpty = true,
    emptyValue = ''
  } = options;

  // Handle empty string
  if (value === '' || value === null || value === undefined) {
    return allowEmpty ? emptyValue : null;
  }

  // Convert to string to handle properly
  const stringValue = String(value).trim();
  
  // Handle empty string after trim
  if (stringValue === '') {
    return allowEmpty ? emptyValue : null;
  }

  // Allow typing negative sign or decimal point at start
  if (stringValue === '-' || stringValue === '.') {
    return stringValue;
  }

  // Remove leading zeros while preserving decimal values
  let cleanValue = stringValue;
  
  // Handle leading zeros for integers
  if (/^0+\d/.test(cleanValue)) {
    cleanValue = cleanValue.replace(/^0+/, '');
  }
  
  // Handle decimal leading zeros (0.123 should remain 0.123)
  if (/^0+\./.test(stringValue)) {
    cleanValue = stringValue.replace(/^0+(?=\.)/, '0');
  }

  // Validate decimal places if not allowed
  if (!allowDecimals && cleanValue.includes('.')) {
    // Remove decimal part
    cleanValue = cleanValue.split('.')[0];
  }

  // Validate format before parsing
  const validNumberPattern = /^-?(\d+\.?\d*|\.\d+)$/;
  if (!validNumberPattern.test(cleanValue)) {
    return null;
  }

  // Parse as number for validation
  const numericValue = parseFloat(cleanValue);
  
  // Check if it's a valid number
  if (isNaN(numericValue)) {
    return null;
  }

  // Check min/max constraints
  if (min !== undefined && numericValue < min) {
    return min;
  }
  
  if (max !== undefined && numericValue > max) {
    return max;
  }

  // Return the clean string value for display, not the number
  // This prevents the input from reformatting while typing
  return cleanValue;
}

/**
 * Converts the stored value to a number for calculations
 * @param value - The stored value from the input handler
 * @param defaultValue - Default value if conversion fails
 * @returns The numeric value
 */
export function getNumericValue(value: number | string | null, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string' && value !== '') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
}

/**
 * Creates an input change handler that uses the number input logic
 * @param onValueChange - Callback function to handle the value change
 * @param options - Number input options
 * @returns The event handler function
 */
export function createNumberInputHandler(
  onValueChange: (value: number | string | null) => void,
  options: NumberInputOptions = {}
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const processedValue = handleNumberInput(event.target.value, options);
    onValueChange(processedValue);
  };
}

/**
 * Validates if a value meets the input constraints
 * @param value - The value to validate
 * @param options - The validation options
 * @returns Object with validation result and error message
 */
export function validateNumberInput(
  value: number | string | null,
  options: NumberInputOptions = {}
): { isValid: boolean; error?: string } {
  const { min, max, allowEmpty = true } = options;
  
  if (value === '' || value === null || value === undefined) {
    if (!allowEmpty) {
      return { isValid: false, error: 'This field is required' };
    }
    return { isValid: true };
  }

  // Check if it's a valid number format first
  if (typeof value === 'string' && value !== '') {
    const validNumberPattern = /^-?(\d+\.?\d*|\.\d+)$/;
    if (!validNumberPattern.test(value)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }
  }
  
  const numericValue = getNumericValue(value);
  
  if (isNaN(numericValue)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (min !== undefined && numericValue < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && numericValue > max) {
    return { isValid: false, error: `Value must be no more than ${max}` };
  }

  return { isValid: true };
}

/**
 * Formats a number for display in input fields
 * @param value - The value to format
 * @param options - Formatting options
 * @returns The formatted display value
 */
export function formatDisplayValue(
  value: number | string | null,
  options: { decimalPlaces?: number; showEmpty?: boolean } = {}
): string {
  const { decimalPlaces, showEmpty = false } = options;
  
  if (value === null || value === undefined || value === '') {
    return showEmpty ? '' : '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    if (decimalPlaces !== undefined) {
      return value.toFixed(decimalPlaces);
    }
    return value.toString();
  }

  return '';
}