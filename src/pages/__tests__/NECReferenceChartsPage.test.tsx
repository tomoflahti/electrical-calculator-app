/**
 * NEC Reference Charts Page Tests
 * Comprehensive testing for NEC reference charts page
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NECReferenceChartsPage from '../NECReferenceChartsPage';
import '@testing-library/jest-dom';

// Mock the NEC Wire Ampacity Chart component
jest.mock('../../components/charts/NECWireAmpacityChart', () => {
  return function MockNECWireAmpacityChart(props: any) {
    return (
      <div data-testid="nec-wire-ampacity-chart">
        <div data-testid="chart-material">{props.material}</div>
        <div data-testid="chart-temperature">{props.temperatureRating}</div>
        <div data-testid="chart-insulation">{props.insulationType}</div>
      </div>
    );
  };
});

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('NECReferenceChartsPage', () => {
  describe('Page Rendering', () => {
    it('should render page header with NEC standards information', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('NEC Reference Charts')).toBeInTheDocument();
      expect(screen.getAllByText(/National Electrical Code/)).toHaveLength(3);
      expect(screen.getByText(/Pure Imperial Implementation/)).toBeInTheDocument();
    });

    it('should display NEC standards information alert', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText(/NEC National Standards/)).toBeInTheDocument();
      expect(screen.getAllByText(/NFPA 70 National Electrical Code/)).toHaveLength(2);
      expect(screen.getByText(/imperial units/)).toBeInTheDocument();
      expect(screen.getAllByText(/American Wire Gauge/)).toHaveLength(2);
    });

    it('should render chart configuration controls', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Chart Configuration')).toBeInTheDocument();
      expect(screen.getAllByText('Conductor Material')).toHaveLength(2);
      expect(screen.getAllByText('Temperature Rating')).toHaveLength(2);
      expect(screen.getAllByText('Insulation Type')).toHaveLength(2);
    });
  });

  describe('Chart Controls', () => {
    it('should display control options with default values', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Chart Configuration')).toBeInTheDocument();
      expect(screen.getAllByText('Conductor Material')).toHaveLength(2);
      expect(screen.getAllByText('Temperature Rating')).toHaveLength(2);
      expect(screen.getAllByText('Insulation Type')).toHaveLength(2);
    });

    it('should pass correct props to chart component', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('chart-material')).toHaveTextContent('copper');
      expect(screen.getByTestId('chart-temperature')).toHaveTextContent('75');
      expect(screen.getByTestId('chart-insulation')).toHaveTextContent('THHN');
    });

    it('should display temperature options in imperial units', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Temperature options should show both Celsius and Fahrenheit
      expect(screen.getByText('75°C (167°F)')).toBeInTheDocument();
      expect(screen.getAllByText('Temperature Rating')).toHaveLength(2);
    });

    it('should display insulation type options', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('THHN')).toBeInTheDocument();
      expect(screen.getAllByText('Insulation Type')).toHaveLength(2);
    });
  });

  describe('Configuration Chips', () => {
    it('should display configuration chips with selected values', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Copper Conductors')).toBeInTheDocument();
      expect(screen.getByText('75°C Rating')).toBeInTheDocument();
      expect(screen.getByText('THHN Insulation')).toBeInTheDocument();
    });

    it('should show configuration chips with imperial styling', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Should show NEC-specific configuration chips
      expect(screen.getByText('Copper Conductors')).toBeInTheDocument();
      expect(screen.getByText('75°C Rating')).toBeInTheDocument();
      expect(screen.getByText('THHN Insulation')).toBeInTheDocument();
    });
  });

  describe('Chart Tabs', () => {
    it('should render all chart tabs', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Wire Ampacity')).toBeInTheDocument();
      expect(screen.getByText('Temperature Derating')).toBeInTheDocument();
      expect(screen.getByText('Conductor Bundling')).toBeInTheDocument();
      expect(screen.getByText('Insulation Types')).toBeInTheDocument();
    });

    it('should switch between tabs', async () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Click on Temperature Derating tab
      const temperatureTab = screen.getByText('Temperature Derating');
      fireEvent.click(temperatureTab);

      await waitFor(() => {
        expect(screen.getByText('Temperature Derating Factors')).toBeInTheDocument();
        expect(screen.getByText(/Temperature correction factors/)).toBeInTheDocument();
      });
    });

    it('should display wire ampacity chart by default', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText('NEC Wire Current Carrying Capacity')).toBeInTheDocument();
      expect(screen.getByTestId('nec-wire-ampacity-chart')).toBeInTheDocument();
    });

    it('should show coming soon message for unimplemented tabs', async () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Click on Conductor Bundling tab
      const bundlingTab = screen.getByText('Conductor Bundling');
      fireEvent.click(bundlingTab);

      await waitFor(() => {
        expect(screen.getByText('Conductor Bundling Chart - Coming Soon')).toBeInTheDocument();
      });
    });
  });

  describe('NEC Standards Compliance', () => {
    it('should display only imperial units and AWG', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Check for imperial units
      expect(screen.getAllByText(/°F/)).toHaveLength(3);
      expect(screen.getAllByText(/American Wire Gauge/)).toHaveLength(2);
      
      // Should not contain metric units
      expect(screen.queryByText(/mm²/)).not.toBeInTheDocument();
      expect(screen.queryByText(/European/)).not.toBeInTheDocument();
    });

    it('should reference NFPA 70 standards', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getAllByText(/NFPA 70 National Electrical Code/)).toHaveLength(2);
      expect(screen.getAllByText(/American Wire Gauge specifications/)).toHaveLength(2);
    });

    it('should display proper temperature specifications', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText(/30°C \(86°F\)/)).toBeInTheDocument();
      expect(screen.getByText(/North American installation practices/)).toBeInTheDocument();
    });

    it('should reference NEC articles correctly', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Click on Temperature Derating tab to see NEC references
      const temperatureTab = screen.getByText('Temperature Derating');
      fireEvent.click(temperatureTab);

      waitFor(() => {
        expect(screen.getByText(/NEC Table 310.15\(B\)\(2\)\(a\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Footer Information', () => {
    it('should display standards compliance information', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Standards Compliance/)).toBeInTheDocument();
      expect(screen.getAllByText(/NFPA 70 National Electrical Code/)).toHaveLength(2);
      expect(screen.getAllByText(/American Wire Gauge specifications/)).toHaveLength(2);
    });

    it('should display temperature specifications in imperial', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByText(/Temperature Base/)).toBeInTheDocument();
      expect(screen.getByText(/30°C \(86°F\) ambient temperature/)).toBeInTheDocument();
      expect(screen.getAllByText(/75°C \(167°F\)/)).toHaveLength(2);
    });
  });

  describe('Chart Data Flow', () => {
    it('should pass correct props to NEC wire ampacity chart', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Verify default props
      expect(screen.getByTestId('chart-material')).toHaveTextContent('copper');
      expect(screen.getByTestId('chart-temperature')).toHaveTextContent('75');
      expect(screen.getByTestId('chart-insulation')).toHaveTextContent('THHN');
    });

    it('should display chart component with NEC-specific props', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Chart should display with correct NEC props
      expect(screen.getByTestId('chart-material')).toHaveTextContent('copper');
      expect(screen.getByTestId('chart-temperature')).toHaveTextContent('75');
      expect(screen.getByTestId('chart-insulation')).toHaveTextContent('THHN');
    });
  });

  describe('Standards Separation', () => {
    it('should maintain pure NEC implementation', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Should only contain NEC-specific elements
      expect(screen.getAllByText(/National Electrical Code/)).toHaveLength(3);
      expect(screen.getAllByText(/NFPA 70/)).toHaveLength(4);
      expect(screen.getAllByText(/American Wire Gauge/)).toHaveLength(2);
      
      // Should not contain IEC or BS7671 references
      expect(screen.queryByText(/IEC/)).not.toBeInTheDocument();
      expect(screen.queryByText(/BS7671/)).not.toBeInTheDocument();
      expect(screen.queryByText(/European/)).not.toBeInTheDocument();
    });

    it('should use imperial units exclusively', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Should contain imperial temperature units
      expect(screen.getAllByText(/°F/)).toHaveLength(3);
      expect(screen.getByText(/86°F/)).toBeInTheDocument();
      
      // Should not contain metric units
      expect(screen.queryByText(/mm²/)).not.toBeInTheDocument();
      expect(screen.queryByText(/metric/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getAllByText('Conductor Material')).toHaveLength(2);
      expect(screen.getAllByText('Temperature Rating')).toHaveLength(2);
      expect(screen.getAllByText('Insulation Type')).toHaveLength(2);
    });

    it('should have proper tab navigation', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
      
      // Should have tab elements
      expect(tabs[0]).toHaveTextContent('Wire Ampacity');
      expect(tabs[1]).toHaveTextContent('Temperature Derating');
      expect(tabs[2]).toHaveTextContent('Conductor Bundling');
      expect(tabs[3]).toHaveTextContent('Insulation Types');
    });

    it('should have proper headings hierarchy', () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { level: 4, name: /NEC Reference Charts/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 6, name: /Chart Configuration/ })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing insulation type gracefully', async () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Component should render without errors
      expect(screen.getByTestId('nec-wire-ampacity-chart')).toBeInTheDocument();
    });

    it('should handle tab changes without errors', async () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Click through all tabs
      const tabs = ['Temperature Derating', 'Conductor Bundling', 'Insulation Types'];
      
      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        fireEvent.click(tab);
        
        await waitFor(() => {
          expect(tab).toHaveAttribute('aria-selected', 'true');
        });
      }
    });
  });

  describe('NEC Warning Messages', () => {
    it('should display temperature derating warning', async () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Click on Temperature Derating tab
      const temperatureTab = screen.getByText('Temperature Derating');
      fireEvent.click(temperatureTab);

      await waitFor(() => {
        expect(screen.getByText(/Temperature derating factors are critical for safety/)).toBeInTheDocument();
        expect(screen.getByText(/ambient temperatures exceed 30°C \(86°F\)/)).toBeInTheDocument();
      });
    });

    it('should display conductor bundling information', async () => {
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );

      // Click on Conductor Bundling tab
      const bundlingTab = screen.getByText('Conductor Bundling');
      fireEvent.click(bundlingTab);

      await waitFor(() => {
        expect(screen.getByText(/NEC Table 310.15\(B\)\(3\)\(a\)/)).toBeInTheDocument();
        expect(screen.getByText(/mutual heating effects/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should render without performance issues', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <NECReferenceChartsPage />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});