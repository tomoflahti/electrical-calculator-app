/**
 * Input Helpers Tests
 * Test the number input handling utilities
 */

import {
  handleNumberInput,
  getNumericValue,
  validateNumberInput,
  formatDisplayValue,
  createNumberInputHandler
} from '../inputHelpers';

describe('Input Helpers', () => {
  describe('handleNumberInput', () => {
    it('should handle empty strings correctly', () => {
      expect(handleNumberInput('', { allowEmpty: true })).toBe('');
      expect(handleNumberInput('', { allowEmpty: false })).toBe(null);
      expect(handleNumberInput('', { allowEmpty: true, emptyValue: 0 })).toBe(0);
    });

    it('should prevent leading zeros for integers', () => {
      expect(handleNumberInput('01')).toBe('1');
      expect(handleNumberInput('007')).toBe('7');
      expect(handleNumberInput('0123')).toBe('123');
    });

    it('should preserve decimal leading zeros', () => {
      expect(handleNumberInput('0.5')).toBe('0.5');
      expect(handleNumberInput('0.123')).toBe('0.123');
      expect(handleNumberInput('00.5')).toBe('0.5');
    });

    it('should handle partial input while typing', () => {
      expect(handleNumberInput('-')).toBe('-');
      expect(handleNumberInput('.')).toBe('.');
      expect(handleNumberInput('1.')).toBe('1.');
      expect(handleNumberInput('12.')).toBe('12.');
    });

    it('should respect min/max constraints', () => {
      expect(handleNumberInput('5', { min: 10 })).toBe(10);
      expect(handleNumberInput('15', { max: 10 })).toBe(10);
      expect(handleNumberInput('8', { min: 5, max: 10 })).toBe('8');
    });

    it('should handle decimal restrictions', () => {
      expect(handleNumberInput('12.5', { allowDecimals: false })).toBe('12');
      expect(handleNumberInput('12.5', { allowDecimals: true })).toBe('12.5');
    });

    it('should handle invalid input', () => {
      expect(handleNumberInput('abc')).toBe(null);
      expect(handleNumberInput('12a')).toBe(null);
      expect(handleNumberInput('1.2.3')).toBe(null);
    });

    it('should handle negative numbers', () => {
      expect(handleNumberInput('-5')).toBe('-5');
      expect(handleNumberInput('-12.5')).toBe('-12.5');
    });
  });

  describe('getNumericValue', () => {
    it('should convert string values to numbers', () => {
      expect(getNumericValue('123')).toBe(123);
      expect(getNumericValue('12.5')).toBe(12.5);
      expect(getNumericValue('-5')).toBe(-5);
    });

    it('should return numbers as-is', () => {
      expect(getNumericValue(123)).toBe(123);
      expect(getNumericValue(12.5)).toBe(12.5);
    });

    it('should handle empty/invalid values with default', () => {
      expect(getNumericValue('', 10)).toBe(10);
      expect(getNumericValue(null, 20)).toBe(20);
      expect(getNumericValue('abc', 30)).toBe(30);
    });

    it('should use default value of 0 when not provided', () => {
      expect(getNumericValue('')).toBe(0);
      expect(getNumericValue(null)).toBe(0);
    });
  });

  describe('validateNumberInput', () => {
    it('should validate empty values based on allowEmpty', () => {
      expect(validateNumberInput('', { allowEmpty: true })).toEqual({ isValid: true });
      expect(validateNumberInput('', { allowEmpty: false })).toEqual({ 
        isValid: false, 
        error: 'This field is required' 
      });
    });

    it('should validate numeric values', () => {
      expect(validateNumberInput('123')).toEqual({ isValid: true });
      expect(validateNumberInput('12.5')).toEqual({ isValid: true });
      expect(validateNumberInput('abc')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid number' 
      });
    });

    it('should validate min/max constraints', () => {
      expect(validateNumberInput('5', { min: 10 })).toEqual({ 
        isValid: false, 
        error: 'Value must be at least 10' 
      });
      expect(validateNumberInput('15', { max: 10 })).toEqual({ 
        isValid: false, 
        error: 'Value must be no more than 10' 
      });
      expect(validateNumberInput('8', { min: 5, max: 10 })).toEqual({ isValid: true });
    });
  });

  describe('formatDisplayValue', () => {
    it('should format numbers for display', () => {
      expect(formatDisplayValue(123)).toBe('123');
      expect(formatDisplayValue(12.5)).toBe('12.5');
      expect(formatDisplayValue(12.567, { decimalPlaces: 2 })).toBe('12.57');
    });

    it('should return strings as-is', () => {
      expect(formatDisplayValue('123')).toBe('123');
      expect(formatDisplayValue('12.5')).toBe('12.5');
    });

    it('should handle empty values', () => {
      expect(formatDisplayValue(null)).toBe('');
      expect(formatDisplayValue('')).toBe('');
      expect(formatDisplayValue(null, { showEmpty: true })).toBe('');
    });
  });

  describe('createNumberInputHandler', () => {
    it('should create a working input handler', () => {
      const mockOnChange = jest.fn();
      const handler = createNumberInputHandler(mockOnChange, { min: 1 });
      
      const mockEvent = {
        target: { value: '123' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handler(mockEvent);
      expect(mockOnChange).toHaveBeenCalledWith('123');
    });

    it('should apply options to the handler', () => {
      const mockOnChange = jest.fn();
      const handler = createNumberInputHandler(mockOnChange, { min: 10 });
      
      const mockEvent = {
        target: { value: '5' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handler(mockEvent);
      expect(mockOnChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Edge Cases and Real-World Scenarios', () => {
    it('should handle rapid typing without leading zeros', () => {
      // Simulate typing "20" quickly
      expect(handleNumberInput('2')).toBe('2');
      expect(handleNumberInput('20')).toBe('20');
      
      // Simulate typing "02" and correcting to "20"
      expect(handleNumberInput('02')).toBe('2');
      expect(handleNumberInput('020')).toBe('20');
    });

    it('should handle current and length field constraints', () => {
      // Current field: min 0.1, decimals allowed
      expect(handleNumberInput('0.5', { min: 0.1, allowDecimals: true })).toBe('0.5');
      expect(handleNumberInput('0.05', { min: 0.1, allowDecimals: true })).toBe(0.1);
      
      // Length field: min 1, decimals allowed
      expect(handleNumberInput('10.5', { min: 1, allowDecimals: true })).toBe('10.5');
      expect(handleNumberInput('0.5', { min: 1, allowDecimals: true })).toBe(1);
      
      // Number of conductors: no decimals, min 1
      expect(handleNumberInput('3', { min: 1, allowDecimals: false })).toBe('3');
      expect(handleNumberInput('3.5', { min: 1, allowDecimals: false })).toBe('3');
    });

    it('should handle clearing and retyping values', () => {
      // User clears field
      expect(handleNumberInput('', { allowEmpty: true })).toBe('');
      
      // User types new value
      expect(handleNumberInput('1')).toBe('1');
      expect(handleNumberInput('15')).toBe('15');
      expect(handleNumberInput('150')).toBe('150');
    });

    it('should handle copy-paste scenarios', () => {
      // Paste valid number
      expect(handleNumberInput('123.45')).toBe('123.45');
      
      // Paste number with leading zeros
      expect(handleNumberInput('00123.45')).toBe('123.45');
      
      // Paste invalid content
      expect(handleNumberInput('$123.45')).toBe(null);
      expect(handleNumberInput('123,45')).toBe(null);
    });
  });
});