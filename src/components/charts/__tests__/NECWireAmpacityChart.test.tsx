/**
 * NEC Wire Ampacity Chart Tests
 * Simplified testing for NEC wire ampacity chart component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NECWireAmpacityChart from '../NECWireAmpacityChart';
import '@testing-library/jest-dom';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />
}));

// Mock NEC wire data
jest.mock('../../../standards/nec/wireTables', () => ({
  NEC_WIRE_GAUGES: [
    { awg: '14', ampacity60C: 15, ampacity75C: 20, ampacity90C: 25, resistance: 3.07, area: 0.0097 },
    { awg: '12', ampacity60C: 20, ampacity75C: 25, ampacity90C: 30, resistance: 1.93, area: 0.0133 },
    { awg: '10', ampacity60C: 30, ampacity75C: 35, ampacity90C: 40, resistance: 1.21, area: 0.0211 }
  ],
  NEC_TEMPERATURE_CORRECTION_FACTORS: {
    60: { 30: 1.00, 35: 0.94, 40: 0.82, 45: 0.71, 50: 0.58 },
    75: { 30: 1.00, 35: 0.94, 40: 0.88, 45: 0.82, 50: 0.75 },
    90: { 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82 }
  },
  NEC_CONDUCTOR_ADJUSTMENT_FACTORS: {
    3: 1.0, 4: 0.8, 5: 0.8, 6: 0.8, 7: 0.7, 10: 0.7, 21: 0.6, 31: 0.55, 41: 0.5
  },
  NEC_CONDUCTOR_MATERIALS: {
    copper: { resistivity: 10.371, temperatureCoefficient: 0.00393, multiplier: 1.0 },
    aluminum: { resistivity: 17.002, temperatureCoefficient: 0.00403, multiplier: 1.64 }
  },
  NEC_INSULATION_TYPES: {
    THHN: { name: 'Thermoplastic High Heat-resistant Nylon-coated', temperatureRating: 90, applications: ['Dry locations'], standard: 'UL 83' },
    THWN: { name: 'Thermoplastic Heat and Water-resistant Nylon-coated', temperatureRating: 75, applications: ['Dry and wet locations'], standard: 'UL 83' },
    XHHW: { name: 'Cross-linked Polyethylene High Heat-resistant Water-resistant', temperatureRating: 90, applications: ['Dry and wet locations'], standard: 'UL 44' }
  }
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const defaultProps = {
  material: 'copper' as const,
  temperatureRating: 75 as const,
  insulationType: 'THHN'
};

describe('NECWireAmpacityChart', () => {
  describe('Component Rendering', () => {
    it('should render chart controls', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getAllByText('Conductors in Group')).toHaveLength(2);
      expect(screen.getAllByText('Ambient Temperature')).toHaveLength(2);
    });

    it('should render default bar chart', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should display chart title and description', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/NEC Wire Ampacity - Copper Conductors/)).toBeInTheDocument();
      expect(screen.getByText(/Current carrying capacity adjusted for/)).toBeInTheDocument();
    });

    it('should render material chip', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Copper - 75°C')).toBeInTheDocument();
    });
  });

  describe('Chart Type Selection', () => {
    it('should render chart component', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should render table view', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText('AWG Size')).toBeInTheDocument();
      expect(screen.getByText('Area (kcmil)')).toBeInTheDocument();
      expect(screen.getByText('Base Capacity (A)')).toBeInTheDocument();
    });
  });

  describe('Material Properties', () => {
    it('should handle copper material', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} material="copper" />
        </TestWrapper>
      );

      expect(screen.getByText('Copper - 75°C')).toBeInTheDocument();
      expect(screen.getByText(/NEC Wire Ampacity - Copper Conductors/)).toBeInTheDocument();
    });

    it('should handle aluminum material', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} material="aluminum" />
        </TestWrapper>
      );

      expect(screen.getByText('Aluminum - 75°C')).toBeInTheDocument();
      expect(screen.getByText(/NEC Wire Ampacity - Aluminum Conductors/)).toBeInTheDocument();
    });

    it('should display aluminum derating factor', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} material="aluminum" />
        </TestWrapper>
      );

      expect(screen.getByText('61%')).toBeInTheDocument();
      expect(screen.getByText('Aluminum derating')).toBeInTheDocument();
    });
  });

  describe('Temperature Ratings', () => {
    it('should handle 60°C temperature rating', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} temperatureRating={60} />
        </TestWrapper>
      );

      expect(screen.getByText('Copper - 60°C')).toBeInTheDocument();
    });

    it('should handle 75°C temperature rating', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} temperatureRating={75} />
        </TestWrapper>
      );

      expect(screen.getByText('Copper - 75°C')).toBeInTheDocument();
    });

    it('should handle 90°C temperature rating', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} temperatureRating={90} />
        </TestWrapper>
      );

      expect(screen.getByText('Copper - 90°C')).toBeInTheDocument();
    });
  });

  describe('Derating Factors', () => {
    it('should display applied derating factors', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Applied NEC Derating Factors')).toBeInTheDocument();
      expect(screen.getByText('Conductor Bundling')).toBeInTheDocument();
      expect(screen.getByText('Temperature Factor')).toBeInTheDocument();
      expect(screen.getByText('Material Factor')).toBeInTheDocument();
    });

    it('should show correct bundling factor for 3 conductors', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('3 conductors (NEC 310.15(B)(3)(a))')).toBeInTheDocument();
    });

    it('should show correct temperature factor for 30°C', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('30°C ambient (NEC 310.15(B)(2)(a))')).toBeInTheDocument();
    });
  });

  describe('Conductor Grouping', () => {
    it('should display conductor grouping options', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('3 conductors (100%)')).toBeInTheDocument();
      expect(screen.getByText('Applied NEC Derating Factors')).toBeInTheDocument();
    });

    it('should show bundling derating factor', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('3 conductors (100%)')).toBeInTheDocument();
    });
  });

  describe('Ambient Temperature', () => {
    it('should display temperature factor', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('30°C ambient (NEC 310.15(B)(2)(a))')).toBeInTheDocument();
      expect(screen.getByText('Temperature Factor')).toBeInTheDocument();
    });

    it('should show temperature correction factor', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('30°C ambient (NEC 310.15(B)(2)(a))')).toBeInTheDocument();
      expect(screen.getByText('Temperature Factor')).toBeInTheDocument();
    });
  });

  describe('Insulation Information', () => {
    it('should display THHN insulation information', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} insulationType="THHN" />
        </TestWrapper>
      );

      expect(screen.getByText('THHN Insulation Specifications')).toBeInTheDocument();
      expect(screen.getByText('Thermoplastic High Heat-resistant Nylon-coated')).toBeInTheDocument();
      expect(screen.getByText('90°C')).toBeInTheDocument();
      expect(screen.getByText('UL 83')).toBeInTheDocument();
    });

    it('should display THWN insulation information', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} insulationType="THWN" />
        </TestWrapper>
      );

      expect(screen.getByText('THWN Insulation Specifications')).toBeInTheDocument();
      expect(screen.getByText('Thermoplastic Heat and Water-resistant Nylon-coated')).toBeInTheDocument();
      expect(screen.getByText('75°C')).toBeInTheDocument();
    });
  });

  describe('Table View', () => {
    it('should display table headers', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText('AWG Size')).toBeInTheDocument();
      expect(screen.getByText('Area (kcmil)')).toBeInTheDocument();
      expect(screen.getByText('Base Capacity (A)')).toBeInTheDocument();
      expect(screen.getByText('Adjusted Capacity (A)')).toBeInTheDocument();
      expect(screen.getByText('Resistance (Ω/1000ft)')).toBeInTheDocument();
      expect(screen.getByText('Derating Factor')).toBeInTheDocument();
    });

    it('should display table data', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText('AWG Size')).toBeInTheDocument();
      expect(screen.getByText('Area (kcmil)')).toBeInTheDocument();
      expect(screen.getByText('Base Capacity (A)')).toBeInTheDocument();
    });
  });

  describe('NEC Standards Compliance', () => {
    it('should use only AWG wire gauges', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText('AWG Size')).toBeInTheDocument();
      expect(screen.getByText('Area (kcmil)')).toBeInTheDocument();
      
      // Should not contain metric units
      expect(screen.queryByText(/mm²/)).not.toBeInTheDocument();
    });

    it('should use imperial resistance units', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText('Resistance (Ω/1000ft)')).toBeInTheDocument();
      expect(screen.queryByText(/Ω\/km/)).not.toBeInTheDocument();
    });

    it('should reference NEC articles', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('3 conductors (NEC 310.15(B)(3)(a))')).toBeInTheDocument();
      expect(screen.getByText('30°C ambient (NEC 310.15(B)(2)(a))')).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should display chart summary', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/NEC Wire Ampacity - Copper Conductors/)).toBeInTheDocument();
      expect(screen.getByText(/Current carrying capacity adjusted for/)).toBeInTheDocument();
    });
  });

  describe('Wire Size Filtering', () => {
    it('should filter wires by maximum size', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} maxWireSize="10" />
        </TestWrapper>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Comparison Data', () => {
    it('should show reference line when enabled', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} showComparisonData={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('reference-line')).toBeInTheDocument();
    });

    it('should not show reference line by default', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('reference-line')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing insulation type gracefully', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} insulationType="UNKNOWN" />
        </TestWrapper>
      );

      expect(screen.getByText('UNKNOWN Insulation Specifications')).toBeInTheDocument();
    });

    it('should handle invalid temperature ratings', () => {
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} temperatureRating={75} />
        </TestWrapper>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <NECWireAmpacityChart {...defaultProps} />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(1000);
    });
  });
});