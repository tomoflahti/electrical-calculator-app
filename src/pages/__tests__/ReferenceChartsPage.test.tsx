/**
 * Unified Reference Charts Page Tests
 * Basic tests for unified IEC, NEC, and BS7671 reference charts page
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ReferenceChartsPage from '../ReferenceChartsPage';
import '@testing-library/jest-dom';

// Mock the chart components
jest.mock('../../components/charts/IECCableAmpacityChart', () => {
  return function MockIECCableAmpacityChart() {
    return <div data-testid="iec-cable-ampacity-chart">IEC Chart</div>;
  };
});

jest.mock('../../components/charts/NECWireAmpacityChart', () => {
  return function MockNECWireAmpacityChart() {
    return <div data-testid="nec-wire-ampacity-chart">NEC Chart</div>;
  };
});

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ReferenceChartsPage', () => {
  it('should render unified reference charts page', () => {
    render(
      <TestWrapper>
        <ReferenceChartsPage />
      </TestWrapper>
    );

    expect(screen.getByText('IEC Reference Charts')).toBeInTheDocument();
    expect(screen.getByText('IEC 60364')).toBeInTheDocument();
    expect(screen.getByText('NEC (NFPA 70)')).toBeInTheDocument();
    expect(screen.getByText('BS7671')).toBeInTheDocument();
  });

  it('should display IEC content by default', () => {
    render(
      <TestWrapper>
        <ReferenceChartsPage />
      </TestWrapper>
    );

    expect(screen.getByText('IEC Cable Current Carrying Capacity')).toBeInTheDocument();
    expect(screen.getByTestId('iec-cable-ampacity-chart')).toBeInTheDocument();
  });

  it('should render all standard selector tabs', () => {
    render(
      <TestWrapper>
        <ReferenceChartsPage />
      </TestWrapper>
    );

    expect(screen.getByText('International')).toBeInTheDocument();
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });
});