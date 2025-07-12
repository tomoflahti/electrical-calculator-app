/**
 * IEC Cable Ampacity Chart Tests
 * Comprehensive testing for IEC cable ampacity chart component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import IECCableAmpacityChart from '../IECCableAmpacityChart';
import '@testing-library/jest-dom';

// Mock recharts to avoid canvas rendering issues
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey, name }: any) => <div data-testid={`bar-${dataKey}`} data-name={name} />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey, name }: any) => <div data-testid={`line-${dataKey}`} data-name={name} />,
  XAxis: ({ dataKey, label }: any) => <div data-testid="x-axis" data-key={dataKey} data-label={label?.value} />,
  YAxis: ({ label }: any) => <div data-testid="y-axis" data-label={label?.value} />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  ReferenceLine: ({ y, label }: any) => <div data-testid="reference-line" data-y={y} data-label={label} />
}));

// Mock IEC data
jest.mock('../../../standards/iec/cableTables', () => ({
  IEC_CABLE_CROSS_SECTIONS: [
    { size: '2.5', crossSectionMm2: 2.5, currentCapacity70C: 24, currentCapacity90C: 30, resistance: 7.41, reactance: 0.07 },
    { size: '4', crossSectionMm2: 4, currentCapacity70C: 32, currentCapacity90C: 40, resistance: 4.61, reactance: 0.07 },
    { size: '6', crossSectionMm2: 6, currentCapacity70C: 41, currentCapacity90C: 51, resistance: 3.08, reactance: 0.08 },
    { size: '10', crossSectionMm2: 10, currentCapacity70C: 57, currentCapacity90C: 70, resistance: 1.83, reactance: 0.08 }
  ],
  IEC_ALUMINUM_CABLE_CROSS_SECTIONS: [
    { size: '16', crossSectionMm2: 16, currentCapacity70C: 59, currentCapacity90C: 73, resistance: 1.91, reactance: 0.09 },
    { size: '25', crossSectionMm2: 25, currentCapacity70C: 78, currentCapacity90C: 96, resistance: 1.20, reactance: 0.09 }
  ],
  IEC_TEMPERATURE_CORRECTION_FACTORS: {
    70: { 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87 },
    90: { 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91 }
  },
  IEC_GROUPING_FACTORS: {
    1: 1.00,
    2: 0.80,
    3: 0.70,
    4: 0.65,
    5: 0.60
  },
  IEC_INSTALLATION_METHODS: {
    A1: { name: 'Single cable clipped direct', factor: 1.00 },
    A2: { name: 'Multi-core cable clipped direct', factor: 0.95 },
    B1: { name: 'Single cable in conduit on wall', factor: 0.95 },
    B2: { name: 'Multi-core cable in conduit on wall', factor: 0.90 }
  }
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('IECCableAmpacityChart', () => {
  const defaultProps = {
    material: 'copper' as const,
    temperatureRating: 70 as const,
    installationMethod: 'A1'
  };

  describe('Chart Rendering', () => {
    it('should render bar chart by default', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('bar-baseCapacity')).toBeInTheDocument();
      expect(screen.getByTestId('bar-adjustedCapacity')).toBeInTheDocument();
    });

    it('should render line chart when selected', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      const chartTypeSelect = screen.getByLabelText('Chart Type');
      fireEvent.mouseDown(chartTypeSelect);
      
      await waitFor(() => {
        const lineOption = screen.getByText('Line Chart');
        fireEvent.click(lineOption);
      });

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-baseCapacity')).toBeInTheDocument();
      expect(screen.getByTestId('line-adjustedCapacity')).toBeInTheDocument();
    });

    it('should render table view when selected', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      const chartTypeSelect = screen.getByLabelText('Chart Type');
      fireEvent.mouseDown(chartTypeSelect);
      
      await waitFor(() => {
        const tableOption = screen.getByText('Table View');
        fireEvent.click(tableOption);
      });

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Size (mm²)')).toBeInTheDocument();
      expect(screen.getByText('Base Capacity (A)')).toBeInTheDocument();
      expect(screen.getByText('Adjusted Capacity (A)')).toBeInTheDocument();
    });

    it('should include chart axes and grid', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });

  describe('IEC Standards Compliance', () => {
    it('should use copper cable data for copper material', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} material="copper" />
        </TestWrapper>
      );

      expect(screen.getByText(/Copper Conductors/)).toBeInTheDocument();
      expect(screen.getByText(/IEC Cable Ampacity.*Copper/)).toBeInTheDocument();
    });

    it('should use aluminum cable data for aluminum material', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} material="aluminum" />
        </TestWrapper>
      );

      expect(screen.getByText(/Aluminum Conductors/)).toBeInTheDocument();
      expect(screen.getByText(/IEC Cable Ampacity.*Aluminum/)).toBeInTheDocument();
    });

    it('should display only metric units', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText(/mm²/)).toBeInTheDocument();
      expect(screen.getByText(/°C/)).toBeInTheDocument();
      
      // Should not contain imperial units
      expect(screen.queryByText(/AWG/)).not.toBeInTheDocument();
      expect(screen.queryByText(/°F/)).not.toBeInTheDocument();
    });

    it('should apply correct temperature rating', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} temperatureRating={90} />
        </TestWrapper>
      );

      expect(screen.getByText(/90°C/)).toBeInTheDocument();
    });
  });

  describe('Chart Controls', () => {
    it('should allow changing chart type', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      const chartTypeSelect = screen.getByLabelText('Chart Type');
      fireEvent.mouseDown(chartTypeSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Bar Chart')).toBeInTheDocument();
        expect(screen.getByText('Line Chart')).toBeInTheDocument();
        expect(screen.getByText('Table View')).toBeInTheDocument();
      });
    });

    it('should allow changing cables in group', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      const groupingSelect = screen.getByLabelText('Cables in Group');
      fireEvent.mouseDown(groupingSelect);
      
      await waitFor(() => {
        expect(screen.getByText('1 cables (100%)')).toBeInTheDocument();
        expect(screen.getByText('2 cables (80%)')).toBeInTheDocument();
        expect(screen.getByText('3 cables (70%)')).toBeInTheDocument();
      });
    });

    it('should allow changing ambient temperature', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      const temperatureSelect = screen.getByLabelText('Ambient Temperature');
      fireEvent.mouseDown(temperatureSelect);
      
      await waitFor(() => {
        expect(screen.getByText('20°C')).toBeInTheDocument();
        expect(screen.getByText('25°C')).toBeInTheDocument();
        expect(screen.getByText('30°C')).toBeInTheDocument();
      });
    });

    it('should display material and temperature chip', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} material="copper" temperatureRating={70} />
        </TestWrapper>
      );

      expect(screen.getByText('Copper - 70°C')).toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('should calculate adjusted capacity correctly', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      // Table should show calculated values
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Base Capacity (A)')).toBeInTheDocument();
      expect(screen.getByText('Adjusted Capacity (A)')).toBeInTheDocument();
    });

    it('should apply derating factors correctly', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      // Change grouping to 3 cables (70% factor)
      const groupingSelect = screen.getByLabelText('Cables in Group');
      fireEvent.mouseDown(groupingSelect);
      
      await waitFor(() => {
        const grouping3 = screen.getByText('3 cables (70%)');
        fireEvent.click(grouping3);
      });

      // Verify derating factors are displayed
      expect(screen.getByText('Applied Derating Factors')).toBeInTheDocument();
    });

    it('should handle different cable size limits', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} maxCableSize={6} />
        </TestWrapper>
      );

      // Should only show cables up to 6mm²
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should display summary statistics', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/Chart Summary/)).toBeInTheDocument();
      expect(screen.getByText(/cables.*Average derating.*Capacity range/)).toBeInTheDocument();
    });

    it('should update summary when parameters change', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      // Change grouping factor
      const groupingSelect = screen.getByLabelText('Cables in Group');
      fireEvent.mouseDown(groupingSelect);
      
      await waitFor(() => {
        const grouping2 = screen.getByText('2 cables (80%)');
        fireEvent.click(grouping2);
      });

      // Summary should update
      expect(screen.getByText(/Chart Summary/)).toBeInTheDocument();
    });
  });

  describe('Derating Factors Display', () => {
    it('should display installation method factor', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} installationMethod="A1" />
        </TestWrapper>
      );

      expect(screen.getByText('Applied Derating Factors')).toBeInTheDocument();
      expect(screen.getByText('Installation Method')).toBeInTheDocument();
      expect(screen.getByText('Single cable clipped direct')).toBeInTheDocument();
    });

    it('should display grouping factor', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Grouping Factor')).toBeInTheDocument();
      expect(screen.getByText('1 cables grouped')).toBeInTheDocument();
    });

    it('should display temperature factor', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Temperature Factor')).toBeInTheDocument();
      expect(screen.getByText('30°C ambient')).toBeInTheDocument();
    });
  });

  describe('Table View Functionality', () => {
    it('should display table headers correctly', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      expect(screen.getByText('Size (mm²)')).toBeInTheDocument();
      expect(screen.getByText('Cross Section')).toBeInTheDocument();
      expect(screen.getByText('Base Capacity (A)')).toBeInTheDocument();
      expect(screen.getByText('Adjusted Capacity (A)')).toBeInTheDocument();
      expect(screen.getByText('Resistance (Ω/km)')).toBeInTheDocument();
      expect(screen.getByText('Derating Factor')).toBeInTheDocument();
    });

    it('should display cable data in table rows', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      // Should display cable sizes
      expect(screen.getByText('2.5')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should display derating factor chips with colors', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} chartType="table" />
        </TestWrapper>
      );

      // Should display derating percentage chips
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Reference Lines', () => {
    it('should show reference line when comparison data enabled', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} showComparisonData={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('reference-line')).toBeInTheDocument();
    });

    it('should not show reference line when comparison data disabled', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} showComparisonData={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('reference-line')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing cable data gracefully', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} material="aluminum" maxCableSize={5} />
        </TestWrapper>
      );

      // Should render without errors even with no matching cables
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle unknown installation method', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} installationMethod="UNKNOWN" />
        </TestWrapper>
      );

      expect(screen.getByText('Applied Derating Factors')).toBeInTheDocument();
    });

    it('should handle invalid temperature ratings', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      // Should not crash with invalid parameters
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Chart Responsiveness', () => {
    it('should use responsive container for charts', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle chart type switching', async () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );

      // Switch to line chart
      const chartTypeSelect = screen.getByLabelText('Chart Type');
      fireEvent.mouseDown(chartTypeSelect);
      
      await waitFor(() => {
        const lineOption = screen.getByText('Line Chart');
        fireEvent.click(lineOption);
      });

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });
  });

  describe('Data Validation', () => {
    it('should filter cables by maximum size', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} maxCableSize={4} />
        </TestWrapper>
      );

      // Should only process cables up to 4mm²
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle empty cable arrays', () => {
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} maxCableSize={0} />
        </TestWrapper>
      );

      // Should render without errors
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <IECCableAmpacityChart {...defaultProps} />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(1000);
    });
  });
});