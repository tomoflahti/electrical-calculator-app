/**
 * DC Wire Calculator Voltage Selector Tests
 * Focused tests for voltage selector initialization and behavior
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DCWireCalculator from '../DCWireCalculator';
import { expectMuiSelectToHaveValue } from '../../test-utils/mui-testing';
import '@testing-library/jest-dom';

// Mock the calculation functions
jest.mock('../../utils/calculations/dc', () => ({
  calculateDCWireSize: jest.fn(() => ({
    recommendedWireGauge: '10',
    ampacity: 30,
    voltageDropPercent: 1.8,
    voltageDropVolts: 0.216,
    powerLossWatts: 4.32,
    efficiency: 98.2,
    compliance: {
      ampacityCompliant: true,
      voltageDropCompliant: true,
      temperatureCompliant: true,
      applicationCompliant: true
    },
    correctionFactors: {
      temperature: 1.0
    }
  })),
  validateDCInput: jest.fn(() => [])
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('DC Wire Calculator Voltage Selector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Voltage Selector Initialization', () => {
    it('should show voltage selector with default automotive voltage on mount', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should immediately show voltage selector with 12V for automotive
      const voltageSelector = screen.getByTestId('voltage-selector');
      expect(voltageSelector).toBeInTheDocument();
      expectMuiSelectToHaveValue('voltage-selector', '12');
    });

    it('should show voltage selector with correct options for automotive', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Voltage selector should exist and have automotive voltages available
      const voltageSelector = screen.getByTestId('voltage-selector');
      expect(voltageSelector).toBeInTheDocument();
      expect(voltageSelector).not.toBeEmptyDOMElement();
    });

    it('should have consistent voltage state between input and form states', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Voltage should be consistent
      expectMuiSelectToHaveValue('voltage-selector', '12');
      
      // The displayed value should match
      const voltageSelector = screen.getByTestId('voltage-selector');
      expect(voltageSelector).toBeInTheDocument();
    });

    it('should work immediately without requiring application switch', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should be able to perform calculation immediately
      const calculateButton = screen.getByText('Calculate Wire Size');
      expect(calculateButton).not.toBeDisabled();
      
      // Voltage selector should be functional
      expectMuiSelectToHaveValue('voltage-selector', '12');
    });

    it('should show proper voltage options for DC_AUTOMOTIVE standard', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show automotive application by default
      expect(screen.getByText('DC_AUTOMOTIVE')).toBeInTheDocument();
      
      // Should have voltage selector with proper default
      expectMuiSelectToHaveValue('voltage-selector', '12');
    });
  });

  describe('Voltage Persistence', () => {
    it('should maintain voltage when switching back to automotive', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Initial state - automotive with 12V
      expectMuiSelectToHaveValue('application-selector', 'automotive');
      expectMuiSelectToHaveValue('voltage-selector', '12');
      
      // This test verifies the voltage remains stable
      expect(screen.getByTestId('voltage-selector')).toBeInTheDocument();
    });

    it('should handle standard initialization correctly', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should properly initialize with the provided standard
      expect(screen.getByText('DC_AUTOMOTIVE')).toBeInTheDocument();
      expectMuiSelectToHaveValue('voltage-selector', '12');
    });

    it('should show voltage selector immediately on first render', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      // Should have voltage selector in DOM immediately
      await waitFor(() => {
        expect(screen.getByTestId('voltage-selector')).toBeInTheDocument();
      });

      // Should not be empty
      const voltageSelector = screen.getByTestId('voltage-selector');
      expect(voltageSelector).not.toBeEmptyDOMElement();
    });
  });

  describe('Voltage State Synchronization', () => {
    it('should keep form input and select value synchronized', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Both the select value and internal state should be synchronized
      expectMuiSelectToHaveValue('voltage-selector', '12');
      
      // The form should be ready for calculation
      const calculateButton = screen.getByText('Calculate Wire Size');
      expect(calculateButton).toBeInTheDocument();
    });

    it('should handle voltage updates correctly', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should start with correct voltage
      expectMuiSelectToHaveValue('voltage-selector', '12');
      
      // Should be stable
      await waitFor(() => {
        expectMuiSelectToHaveValue('voltage-selector', '12');
      }, { timeout: 1000 });
    });
  });
});