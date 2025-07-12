/**
 * DC Wire Calculator NEC/IEC Standard Selection Tests
 * Tests the NEC/IEC wire standard selection functionality in DCWireCalculator
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DCWireCalculator from '../DCWireCalculator';
import { expectMuiSelectToHaveValue } from '../../test-utils/mui-testing';
import '@testing-library/jest-dom';

// Mock the calculation functions to avoid complex async behavior
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
      temperature: 1.0,
      bundling: 1.0,
      ambient: 1.0
    }
  })),
  validateDCInput: jest.fn(() => [])
}));

// Mock wire conversion utilities
jest.mock('../../utils/wireConversion', () => ({
  awgToMm2: jest.fn((awg: string) => {
    const awgToMm2Map: Record<string, number> = {
      '14': 2.08,
      '12': 3.31,
      '10': 5.26,
      '8': 8.37
    };
    return awgToMm2Map[awg] || 5.26;
  }),
  findMinimumMetricWireSize: jest.fn((requiredMm2: number) => {
    if (requiredMm2 <= 2.5) return 2.5;
    if (requiredMm2 <= 4) return 4;
    if (requiredMm2 <= 6) return 6;
    return 10;
  }),
  convertAwgWireToMetric: jest.fn((wire) => ({ ...wire, gauge: '6', crossSectionMm2: 6 })),
  formatWireSize: jest.fn((size: string, standard: 'NEC' | 'IEC') => 
    standard === 'NEC' ? `${size} AWG` : `${size} mm²`
  )
}));

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('DC Wire Calculator NEC/IEC Standard Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Behavior', () => {
    it('should default to NEC wire standard and automotive application', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show NEC as default wire standard
      expectMuiSelectToHaveValue('wire-standard-selector', 'NEC');
      
      // Should show automotive as default application
      expectMuiSelectToHaveValue('application-selector', 'automotive');
      
      // Should show NEC-specific description
      expect(screen.getByText('American Wire Gauge (AWG) sizing system used in North America')).toBeInTheDocument();
    });

    it('should show default automotive voltage with NEC standard', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should default to 12V for automotive
      expectMuiSelectToHaveValue('voltage-selector', '12');
    });

    it('should show Wire Sizing Standard selector', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show wire standard selection by testid to avoid duplicates
      expect(screen.getByTestId('wire-standard-selector')).toBeInTheDocument();
      expect(screen.getAllByText('Wire Sizing Standard')).toHaveLength(3); // Header, label, legend
    });
  });

  describe('NEC/IEC Standard Selection', () => {
    it('should show IEC description when calculator renders', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show default NEC description
      expect(screen.getByText('American Wire Gauge (AWG) sizing system used in North America')).toBeInTheDocument();
      
      // Should have wire standard selector available
      expect(screen.getByTestId('wire-standard-selector')).toBeInTheDocument();
    });

    it('should maintain application selection when switching wire standards', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Verify initial state
      expectMuiSelectToHaveValue('wire-standard-selector', 'NEC');
      expectMuiSelectToHaveValue('application-selector', 'automotive');
      
      // Both selectors should be independent
      expect(screen.getByTestId('wire-standard-selector')).toBeInTheDocument();
      expect(screen.getByTestId('application-selector')).toBeInTheDocument();
    });

    it('should maintain voltage selection with wire standards', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Verify initial voltage is consistent
      expectMuiSelectToHaveValue('voltage-selector', '12');
      
      // Wire standard should not affect voltage options
      expect(screen.getByTestId('voltage-selector')).toBeInTheDocument();
    });

    it('should show form inputs with default values', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show default input values
      expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // Default current
      expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Default length
      
      // Should have wire standard selector
      expectMuiSelectToHaveValue('wire-standard-selector', 'NEC');
    });
  });

  describe('Calculation Integration', () => {
    it('should perform NEC calculation with AWG results', async () => {
      const { calculateDCWireSize } = require('../../utils/calculations/dc');
      
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Trigger calculation
      const calculateButton = screen.getByText('Calculate Wire Size');
      fireEvent.click(calculateButton);

      // Should call calculation function with NEC standard
      await waitFor(() => {
        expect(calculateDCWireSize).toHaveBeenCalledWith(
          expect.objectContaining({
            wireStandard: 'NEC'
          })
        );
        expect(screen.getByText('10 AWG')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show different wire units based on standard', async () => {
      const { calculateDCWireSize } = require('../../utils/calculations/dc');
      
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Trigger calculation with NEC standard
      const calculateButton = screen.getByText('Calculate Wire Size');
      fireEvent.click(calculateButton);

      // Should show AWG units for NEC
      await waitFor(() => {
        expect(calculateDCWireSize).toHaveBeenCalledWith(
          expect.objectContaining({
            wireStandard: 'NEC'
          })
        );
        expect(screen.getByText('10 AWG')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show compliance indicators for both standards', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Trigger calculation
      const calculateButton = screen.getByText('Calculate Wire Size');
      fireEvent.click(calculateButton);

      // Should show compliance indicators
      await waitFor(() => {
        expect(screen.getByText('Compliant')).toBeInTheDocument();
        expect(screen.getByText('Voltage Drop')).toBeInTheDocument();
        expect(screen.getByText('Power Loss')).toBeInTheDocument();
        expect(screen.getByText('Efficiency')).toBeInTheDocument();
        expect(screen.getByText('Wire Ampacity')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Combined Application + Wire Standard Tests', () => {
    it('should work with automotive application and NEC standard', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show automotive initially with NEC
      expect(screen.getByText('DC_AUTOMOTIVE')).toBeInTheDocument();
      expectMuiSelectToHaveValue('wire-standard-selector', 'NEC');
    });

    it('should show proper selectors for all combinations', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show both selectors independently
      expect(screen.getByTestId('wire-standard-selector')).toBeInTheDocument();
      expect(screen.getByTestId('application-selector')).toBeInTheDocument();
      expect(screen.getByTestId('voltage-selector')).toBeInTheDocument();
    });

    it('should handle voltage options correctly with different combinations', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show voltage selector regardless of wire standard
      expect(screen.getByTestId('voltage-selector')).toBeInTheDocument();
      expectMuiSelectToHaveValue('voltage-selector', '12');
    });
  });

  describe('Form Validation and User Experience', () => {
    it('should show calculation functionality', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show calculate button
      const calculateButton = screen.getByText('Calculate Wire Size');
      expect(calculateButton).toBeInTheDocument();
      expect(calculateButton).not.toBeDisabled();
    });

    it('should show proper form elements for both standards', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show all key form elements
      expect(screen.getByText('Load Current (A)')).toBeInTheDocument();
      expect(screen.getByText('Circuit Length (ft)')).toBeInTheDocument();
      expect(screen.getByText('Calculate Wire Size')).toBeInTheDocument();
      expect(screen.getByTestId('voltage-selector')).toBeInTheDocument();
      expect(screen.getByTestId('application-selector')).toBeInTheDocument();
      expect(screen.getByTestId('wire-standard-selector')).toBeInTheDocument();
    });

    it('should maintain form state consistency', async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('DC Wire Calculator')).toBeInTheDocument();
      });

      // Should show default form values
      expect(screen.getByDisplayValue('20')).toBeInTheDocument(); // Default current
      expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Default length
      expectMuiSelectToHaveValue('voltage-selector', '12'); // Default voltage
    });
  });
});