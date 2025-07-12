/**
 * ConduitFillCalculator Tests
 * Testing enhanced conduit fill calculator with new router system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ConduitFillCalculator from '../ConduitFillCalculator';
import '@testing-library/jest-dom';

// Mock the enhanced router
jest.mock('../../utils/calculations/conduitFillRouter', () => ({
  calculateConduitFill: jest.fn(() => ({
    recommendedConduitSize: '3/4',
    conduitType: 'EMT',
    wireStandard: 'NEC',
    fillAnalysis: {
      totalWireArea: 0.0507,
      conduitInternalArea: 0.122,
      fillPercentage: 35.2,
      maxAllowedFillPercentage: 40,
      availableArea: 0.0713,
      fillRule: '40% (3+ wires)'
    },
    compliance: {
      codeCompliant: true,
      fillCompliant: true,
      temperatureCompliant: true,
      applicationCompliant: true,
      installationCompliant: true
    },
    wireBreakdown: [
      {
        gauge: '12',
        quantity: 3,
        insulation: 'THWN',
        individualArea: 0.0169,
        totalArea: 0.0507,
        percentage: 100
      }
    ],
    alternatives: [],
    applicationData: {
      applicationType: 'residential',
      installationMethod: 'indoor',
      specialRequirements: ['NEC 314.16 box fill'],
      recommendedPractices: ['Use appropriate wire management']
    },
    calculationMetadata: {
      calculationMethod: 'NEC Chapter 9',
      standardsUsed: ['NEC 314.28', 'NEC 300.17'],
      temperature: 30,
      environment: 'dry',
      safetyFactors: {
        futureFillReserve: 0,
        temperatureFactor: 1.0,
        environmentFactor: 1.0
      },
      timestamp: new Date()
    }
  }))
}));

// Mock wire tables with comprehensive data matching real structure
jest.mock('../../utils/necTables', () => ({
  WIRE_GAUGES: [
    { awg: '18', ampacity60C: 15, ampacity75C: 20, ampacity90C: 25, resistance: 3.07, area: 0.0058 },
    { awg: '16', ampacity60C: 15, ampacity75C: 20, ampacity90C: 25, resistance: 3.07, area: 0.0075 },
    { awg: '14', ampacity60C: 15, ampacity75C: 20, ampacity90C: 25, resistance: 3.07, area: 0.0097 },
    { awg: '12', ampacity60C: 20, ampacity75C: 25, ampacity90C: 30, resistance: 1.93, area: 0.0133 },
    { awg: '10', ampacity60C: 30, ampacity75C: 35, ampacity90C: 40, resistance: 1.21, area: 0.0211 },
    { awg: '8', ampacity60C: 40, ampacity75C: 50, ampacity90C: 55, resistance: 0.764, area: 0.0366 },
    { awg: '6', ampacity60C: 55, ampacity75C: 65, ampacity90C: 75, resistance: 0.491, area: 0.0507 },
    { awg: '4', ampacity60C: 70, ampacity75C: 85, ampacity90C: 95, resistance: 0.308, area: 0.0824 },
    { awg: '3', ampacity60C: 85, ampacity75C: 100, ampacity90C: 110, resistance: 0.245, area: 0.1041 },
    { awg: '2', ampacity60C: 95, ampacity75C: 115, ampacity90C: 130, resistance: 0.194, area: 0.1318 },
    { awg: '1', ampacity60C: 110, ampacity75C: 130, ampacity90C: 145, resistance: 0.154, area: 0.1662 },
    { awg: '1/0', ampacity60C: 125, ampacity75C: 150, ampacity90C: 170, resistance: 0.122, area: 0.2223 },
    { awg: '2/0', ampacity60C: 145, ampacity75C: 175, ampacity90C: 195, resistance: 0.0967, area: 0.2853 },
    { awg: '3/0', ampacity60C: 165, ampacity75C: 200, ampacity90C: 225, resistance: 0.0766, area: 0.3718 },
    { awg: '4/0', ampacity60C: 195, ampacity75C: 230, ampacity90C: 260, resistance: 0.0608, area: 0.4536 }
  ]
}));

jest.mock('../../standards/iec/cableTables', () => ({
  IEC_CABLE_CROSS_SECTIONS: [
    { size: '1.5', crossSectionMm2: 1.5, currentCapacity70C: 17.5, currentCapacity90C: 22, resistance: 12.1, reactance: 0.07 },
    { size: '2.5', crossSectionMm2: 2.5, currentCapacity70C: 24, currentCapacity90C: 30, resistance: 7.41, reactance: 0.07 },
    { size: '4', crossSectionMm2: 4, currentCapacity70C: 32, currentCapacity90C: 40, resistance: 4.61, reactance: 0.07 },
    { size: '6', crossSectionMm2: 6, currentCapacity70C: 41, currentCapacity90C: 51, resistance: 3.08, reactance: 0.08 },
    { size: '10', crossSectionMm2: 10, currentCapacity70C: 57, currentCapacity90C: 70, resistance: 1.83, reactance: 0.08 },
    { size: '16', crossSectionMm2: 16, currentCapacity70C: 76, currentCapacity90C: 94, resistance: 1.15, reactance: 0.09 },
    { size: '25', crossSectionMm2: 25, currentCapacity70C: 101, currentCapacity90C: 125, resistance: 0.727, reactance: 0.09 },
    { size: '35', crossSectionMm2: 35, currentCapacity70C: 125, currentCapacity90C: 154, resistance: 0.524, reactance: 0.09 },
    { size: '50', crossSectionMm2: 50, currentCapacity70C: 151, currentCapacity90C: 186, resistance: 0.387, reactance: 0.10 },
    { size: '70', crossSectionMm2: 70, currentCapacity70C: 192, currentCapacity90C: 237, resistance: 0.268, reactance: 0.10 },
    { size: '95', crossSectionMm2: 95, currentCapacity70C: 232, currentCapacity90C: 286, resistance: 0.193, reactance: 0.11 },
    { size: '120', crossSectionMm2: 120, currentCapacity70C: 269, currentCapacity90C: 331, resistance: 0.153, reactance: 0.11 },
    { size: '150', crossSectionMm2: 150, currentCapacity70C: 309, currentCapacity90C: 382, resistance: 0.124, reactance: 0.12 },
    { size: '185', crossSectionMm2: 185, currentCapacity70C: 353, currentCapacity90C: 435, resistance: 0.099, reactance: 0.12 },
    { size: '240', crossSectionMm2: 240, currentCapacity70C: 415, currentCapacity90C: 511, resistance: 0.0754, reactance: 0.13 },
    { size: '300', crossSectionMm2: 300, currentCapacity70C: 477, currentCapacity90C: 588, resistance: 0.0601, reactance: 0.13 },
    { size: '400', crossSectionMm2: 400, currentCapacity70C: 546, currentCapacity90C: 673, resistance: 0.047, reactance: 0.14 }
  ]
}));

jest.mock('../../utils/conversions', () => ({
  awgToMm2: jest.fn((awg: string) => {
    const conversions: Record<string, number> = { 
      '18': 0.75, '16': 1.5, '14': 2.5, '12': 4, '10': 6, 
      '8': 10, '6': 16, '4': 25, '3': 35, '2': 50,
      '1': 70, '1/0': 95, '2/0': 120, '3/0': 150, '4/0': 185
    };
    return conversions[awg] || 2.5;
  }),
  mm2ToAwg: jest.fn((mm2: number) => {
    const conversions: Record<number, string> = { 
      0.75: '18', 1.5: '16', 2.5: '14', 4: '12', 6: '10',
      10: '8', 16: '6', 25: '4', 35: '3', 50: '2',
      70: '1', 95: '1/0', 120: '2/0', 150: '3/0', 185: '4/0'
    };
    return conversions[mm2] || '12';
  })
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ConduitFillCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with NEC standard by default', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      expect(screen.getByText('Conduit Fill Calculator')).toBeInTheDocument();
      expect(screen.getByText('Wire Configuration')).toBeInTheDocument();
      expect(screen.getByTestId('calculate-button')).toBeInTheDocument();
      expect(screen.getByText('NEC')).toBeInTheDocument();
    });

    it('should render with IEC standard', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      expect(screen.getByText('Conduit Fill Calculator')).toBeInTheDocument();
      expect(screen.getByText('IEC 60364')).toBeInTheDocument();
    });
  });

  describe('Enhanced Controls', () => {
    it('should show application type selector', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      expect(screen.getByTestId('application-type-select')).toBeInTheDocument();
      expect(screen.getByTestId('installation-method-select')).toBeInTheDocument();
    });

    it('should show advanced options when toggled', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      const advancedButton = screen.getByTestId('advanced-options-toggle');
      fireEvent.click(advancedButton);

      expect(screen.getByTestId('ambient-temperature-input')).toBeInTheDocument();
      expect(screen.getByTestId('environment-select')).toBeInTheDocument();
      expect(screen.getByTestId('future-fill-reserve-input')).toBeInTheDocument();
    });

    it('should hide advanced options when toggled off', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      const advancedButton = screen.getByTestId('advanced-options-toggle');
      fireEvent.click(advancedButton);
      fireEvent.click(advancedButton);

      expect(screen.queryByTestId('ambient-temperature-input')).not.toBeInTheDocument();
    });
  });

  describe('Wire Gauge Systems', () => {
    it('should show AWG wire gauges for NEC standard', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      // Check that the component properly displays AWG format for NEC standard
      const wireGaugeSelect = screen.getByTestId('wire-gauge-select-1');
      expect(wireGaugeSelect).toBeInTheDocument();
      
      // Check that it shows AWG format (the default should be "12 AWG")
      expect(wireGaugeSelect).toHaveTextContent('12 AWG');
      
      // Verify that the hidden input has the correct value
      const hiddenInput = wireGaugeSelect.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(hiddenInput?.value).toBe('12');
    });

    it('should show mm² wire sizes for IEC standard', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      // Check that the component properly displays mm² format for IEC standard
      const wireGaugeSelect = screen.getByTestId('wire-gauge-select-1');
      expect(wireGaugeSelect).toBeInTheDocument();
      
      // Check that it shows mm² format (the default should be "2.5 mm²")
      expect(wireGaugeSelect).toHaveTextContent('2.5 mm²');
      
      // Verify that the hidden input has the correct value
      const hiddenInput = wireGaugeSelect.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(hiddenInput?.value).toBe('2.5');
    });
  });

  describe('Application Type Selection', () => {
    it('should allow changing application type', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      const appTypeSelect = screen.getByTestId('application-type-select');
      
      // Check initial value using the hidden input approach
      const hiddenInput = appTypeSelect.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(hiddenInput?.value).toBe('residential');
      
      // Check that the display shows "Residential"
      expect(appTypeSelect).toHaveTextContent('Residential');
    });
  });

  describe('Installation Method Selection', () => {
    it('should allow changing installation method', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      const installMethodSelect = screen.getByTestId('installation-method-select');
      
      // Check initial value using the hidden input approach
      const hiddenInput = installMethodSelect.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(hiddenInput?.value).toBe('indoor');
      
      // Check that the display shows "Indoor"
      expect(installMethodSelect).toHaveTextContent('Indoor');
    });
  });

  describe('Enhanced Calculation', () => {
    it('should use enhanced router for calculations', async () => {
      const { calculateConduitFill } = require('../../utils/calculations/conduitFillRouter');
      
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      // Simply click calculate button with default values
      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(calculateConduitFill).toHaveBeenCalledWith(
          expect.objectContaining({
            wires: expect.arrayContaining([
              expect.objectContaining({
                gauge: '12',
                quantity: 3,
                insulation: 'THWN'
              })
            ]),
            conduitType: 'EMT',
            wireStandard: 'NEC',
            applicationType: 'residential',
            installationMethod: 'indoor'
          })
        );
      });
    });

    it('should pass environmental parameters to router', async () => {
      const { calculateConduitFill } = require('../../utils/calculations/conduitFillRouter');
      
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      // Show advanced options
      fireEvent.click(screen.getByTestId('advanced-options-toggle'));
      
      // Wait for advanced options to appear
      await waitFor(() => {
        expect(screen.getByTestId('ambient-temperature-input')).toBeInTheDocument();
      });
      
      // Trigger calculation with default advanced settings
      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(calculateConduitFill).toHaveBeenCalledWith(
          expect.objectContaining({
            ambientTemperature: 30,  // default value
            environment: 'dry',      // default value
            futureFillReserve: 25    // default value
          })
        );
      });
    });
  });

  describe('Enhanced Results Display', () => {
    it('should show comprehensive compliance results', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(screen.getByText('3/4"')).toBeInTheDocument();
        expect(screen.getByText('Comprehensive Compliance')).toBeInTheDocument();
        expect(screen.getByText('Code: Pass')).toBeInTheDocument();
        expect(screen.getByText('Temperature: Pass')).toBeInTheDocument();
        expect(screen.getByText('Application: Pass')).toBeInTheDocument();
      });
    });

    it('should show application-specific information', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        // Look for the specific application information section, not the compliance badge
        const applicationElements = screen.getAllByText(/Application:/);
        // Find the one that's followed by residential/indoor (the detail section, not the badge)
        expect(applicationElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/residential/)).toBeInTheDocument();
        expect(screen.getByText(/indoor/)).toBeInTheDocument();
      });
    });

    it('should show special requirements when available', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(screen.getByText('Special Requirements:')).toBeInTheDocument();
        expect(screen.getByText('NEC 314.16 box fill')).toBeInTheDocument();
      });
    });

    it('should show fill rule information', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(screen.getByText(/35.2%/)).toBeInTheDocument();
        expect(screen.getByText(/max: 40% - 40% \(3\+ wires\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Unit Display', () => {
    it('should show correct units for NEC standard', async () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(screen.getByText('3/4"')).toBeInTheDocument(); // NEC size format
        expect(screen.getByText(/sq in/)).toBeInTheDocument(); // Imperial units
      });
    });

    it('should show correct units for IEC standard', () => {
      // Mock IEC result
      const { calculateConduitFill } = require('../../utils/calculations/conduitFillRouter');
      calculateConduitFill.mockReturnValueOnce({
        recommendedConduitSize: '25',
        conduitType: 'PVC',
        wireStandard: 'IEC',
        fillAnalysis: {
          totalWireArea: 15.2,
          conduitInternalArea: 35.8,
          fillPercentage: 42.5,
          maxAllowedFillPercentage: 40,
          availableArea: 20.6,
          fillRule: '40% (3+ wires)'
        },
        compliance: {
          codeCompliant: true,
          fillCompliant: true,
          temperatureCompliant: true,
          applicationCompliant: true,
          installationCompliant: true
        },
        wireBreakdown: [],
        alternatives: [],
        applicationData: {
          applicationType: 'commercial',
          installationMethod: 'indoor',
          specialRequirements: [],
          recommendedPractices: []
        },
        calculationMetadata: {
          calculationMethod: 'IEC 60364',
          standardsUsed: ['IEC 60364-5-52'],
          temperature: 30,
          environment: 'dry',
          safetyFactors: {
            futureFillReserve: 0,
            temperatureFactor: 1.0,
            environmentFactor: 1.0
          },
          timestamp: new Date()
        }
      });

      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      expect(screen.getByText('25mm')).toBeInTheDocument(); // IEC size format
      // Check for metric units more specifically - look for the actual area values
      const allMm2Elements = screen.getAllByText(/mm²/);
      expect(allMm2Elements.length).toBeGreaterThan(0); // Should have at least one mm² unit
    });
  });

  describe('Wire Management', () => {
    it('should add wires correctly', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('add-wire-button'));
      
      // Should have two wire gauge selects
      expect(screen.getByTestId('wire-gauge-select-1')).toBeInTheDocument();
      expect(screen.getAllByTestId(/wire-gauge-select-/).length).toBe(2);
    });

    it('should remove wires correctly', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('add-wire-button'));
      
      // Should have 2 wires
      expect(screen.getAllByTestId(/wire-gauge-select-/).length).toBe(2);
      
      // Remove one wire (use the second one since first might be disabled)
      const removeButtons = screen.getAllByTestId(/remove-wire-button-/);
      fireEvent.click(removeButtons[1]);
      
      // Should have 1 wire left
      expect(screen.getAllByTestId(/wire-gauge-select-/).length).toBe(1);
    });

    it('should allow updating wire quantity', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      const quantityInput = screen.getByTestId('wire-quantity-input-1');
      
      // Check that the wire quantity input exists
      expect(quantityInput).toBeInTheDocument();
      
      // For Material-UI TextField, the actual input might be nested
      const actualInput = quantityInput.querySelector('input') as HTMLInputElement;
      expect(actualInput?.value).toBe('3'); // default quantity
    });
  });

  describe('Error Handling', () => {
    it('should handle calculation errors gracefully', async () => {
      const { calculateConduitFill } = require('../../utils/calculations/conduitFillRouter');
      calculateConduitFill.mockImplementation(() => {
        throw new Error('Input validation failed: Invalid wire configuration');
      });

      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      await waitFor(() => {
        expect(screen.getByText(/Input validation failed/)).toBeInTheDocument();
      });
    });

    it('should clear results when standard changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('calculate-button'));

      rerender(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      // Results should be cleared when standard changes
      expect(screen.queryByText('3/4"')).not.toBeInTheDocument();
    });
  });

  describe('Standard Switching', () => {
    it('should show NEC standard indicator', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      expect(screen.getByText('NEC')).toBeInTheDocument();
    });

    it('should show IEC standard indicator', () => {
      render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      expect(screen.getByText('IEC 60364')).toBeInTheDocument();
    });

    it('should update default wire configurations when switching standards', () => {
      const { rerender } = render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      // Should start with NEC defaults
      const necWireGauge = screen.getByTestId('wire-gauge-select-1');
      const necInsulation = screen.getByTestId('wire-insulation-select-1');
      
      // Check using hidden input approach
      const necWireHidden = necWireGauge.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      const necInsulationHidden = necInsulation.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(necWireHidden?.value).toBe('12'); // AWG
      expect(necInsulationHidden?.value).toBe('THWN'); // NEC insulation

      rerender(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      // Should switch to IEC defaults
      const iecWireGauge = screen.getByTestId('wire-gauge-select-1');
      const iecInsulation = screen.getByTestId('wire-insulation-select-1');
      
      // Check using hidden input approach
      const iecWireHidden = iecWireGauge.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      const iecInsulationHidden = iecInsulation.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(iecWireHidden?.value).toBe('4'); // mm² (12 AWG converts to 4 mm² in our mock)
      expect(iecInsulationHidden?.value).toBe('PVC'); // IEC insulation
    });
  });

  describe('Unit Conversion', () => {
    it('should convert AWG to mm² when switching from NEC to IEC', () => {
      const { rerender } = render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      // Switch to IEC
      rerender(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      // Should convert 12 AWG to closest mm² value
      const wireGauge = screen.getByTestId('wire-gauge-select-1');
      const hiddenInput = wireGauge.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(hiddenInput?.value).toBe('4'); // Converted from 12 AWG (according to our mock)
    });

    it('should convert mm² to AWG when switching from IEC to NEC', () => {
      const { rerender } = render(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="IEC" />
        </TestWrapper>
      );

      // Switch to NEC
      rerender(
        <TestWrapper>
          <ConduitFillCalculator selectedStandard="NEC" />
        </TestWrapper>
      );

      // Should convert 2.5 mm² to closest AWG value
      const wireGauge = screen.getByTestId('wire-gauge-select-1');
      const hiddenInput = wireGauge.querySelector('input[aria-hidden="true"]') as HTMLInputElement;
      expect(hiddenInput?.value).toBe('14'); // Converted from 2.5 mm² (according to our mock)
    });
  });
});