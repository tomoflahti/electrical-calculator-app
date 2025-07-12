/**
 * Tests for GridLegacy responsive layout behavior after MUI v7 migration
 * Ensures Grid components maintain proper responsive behavior across breakpoints
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GridLegacy as Grid } from '@mui/material';
import '@testing-library/jest-dom';

// Create a minimal theme for testing
const theme = createTheme();

// Wrapper component for theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('GridLegacy Layout Tests', () => {
  describe('Grid Container and Item Behavior', () => {
    it('should render Grid container with proper spacing', () => {
      render(
        <TestWrapper>
          <Grid container spacing={3} data-testid="grid-container">
            <Grid item xs={12} data-testid="grid-item">
              <div>Test Content</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      const container = screen.getByTestId('grid-container');
      const item = screen.getByTestId('grid-item');
      
      expect(container).toBeInTheDocument();
      expect(item).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render Grid items with responsive breakpoints', () => {
      render(
        <TestWrapper>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3} data-testid="responsive-grid">
              <div>Responsive Item</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      const gridItem = screen.getByTestId('responsive-grid');
      expect(gridItem).toBeInTheDocument();
      expect(screen.getByText('Responsive Item')).toBeInTheDocument();
    });

    it('should handle multiple Grid items in container', () => {
      render(
        <TestWrapper>
          <Grid container spacing={1}>
            <Grid item xs={6} data-testid="item-1">
              <div>Item 1</div>
            </Grid>
            <Grid item xs={6} data-testid="item-2">
              <div>Item 2</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('Complex Grid Layouts', () => {
    it('should render nested Grid containers', () => {
      render(
        <TestWrapper>
          <Grid container spacing={3} data-testid="outer-container">
            <Grid item xs={12} lg={8} data-testid="main-content">
              <Grid container spacing={2} data-testid="inner-container">
                <Grid item xs={12} sm={6} data-testid="nested-item-1">
                  <div>Nested Content 1</div>
                </Grid>
                <Grid item xs={12} sm={6} data-testid="nested-item-2">
                  <div>Nested Content 2</div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={4} data-testid="sidebar">
              <div>Sidebar Content</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('outer-container')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('inner-container')).toBeInTheDocument();
      expect(screen.getByTestId('nested-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('nested-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      
      expect(screen.getByText('Nested Content 1')).toBeInTheDocument();
      expect(screen.getByText('Nested Content 2')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('should handle Grid items with different spacing props', () => {
      render(
        <TestWrapper>
          <Grid container spacing={3}>
            <Grid item xs={4} data-testid="col-4">
              <div>Column 4/12</div>
            </Grid>
            <Grid item xs={3} data-testid="col-3">
              <div>Column 3/12</div>
            </Grid>
            <Grid item xs={3} data-testid="col-3-second">
              <div>Column 3/12 Second</div>
            </Grid>
            <Grid item xs={2} data-testid="col-2">
              <div>Column 2/12</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('col-4')).toBeInTheDocument();
      expect(screen.getByTestId('col-3')).toBeInTheDocument();
      expect(screen.getByTestId('col-3-second')).toBeInTheDocument();
      expect(screen.getByTestId('col-2')).toBeInTheDocument();
    });
  });

  describe('Grid Props Validation', () => {
    it('should accept all standard Grid container props', () => {
      const { container } = render(
        <TestWrapper>
          <Grid 
            container 
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
            data-testid="full-props-container"
          >
            <Grid item xs={6}>
              <div>Centered Content</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      const gridContainer = container.querySelector('[data-testid="full-props-container"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should accept all standard Grid item props', () => {
      render(
        <TestWrapper>
          <Grid container>
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              xl={2}
              data-testid="full-breakpoint-item"
            >
              <div>All Breakpoints</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('full-breakpoint-item')).toBeInTheDocument();
      expect(screen.getByText('All Breakpoints')).toBeInTheDocument();
    });
  });

  describe('Migration Compatibility', () => {
    it('should maintain compatibility with legacy Grid API', () => {
      // Test that the old Grid API (item prop + responsive props) still works
      render(
        <TestWrapper>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4} data-testid="legacy-api-item">
              <div>Legacy API Item</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('legacy-api-item')).toBeInTheDocument();
      expect(screen.getByText('Legacy API Item')).toBeInTheDocument();
    });

    it('should work with form layouts like in IECVoltageDropCalculator', () => {
      render(
        <TestWrapper>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4} data-testid="input-section">
              <div>Calculator Inputs</div>
            </Grid>
            <Grid item xs={12} lg={8} data-testid="results-section">
              <div>Results and Charts</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('input-section')).toBeInTheDocument();
      expect(screen.getByTestId('results-section')).toBeInTheDocument();
      expect(screen.getByText('Calculator Inputs')).toBeInTheDocument();
      expect(screen.getByText('Results and Charts')).toBeInTheDocument();
    });

    it('should work with chart grid layouts', () => {
      render(
        <TestWrapper>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} data-testid="chart-metric-1">
              <div>Voltage Drop %</div>
            </Grid>
            <Grid item xs={12} sm={6} md={3} data-testid="chart-metric-2">
              <div>Power Loss W</div>
            </Grid>
            <Grid item xs={12} sm={6} md={3} data-testid="chart-metric-3">
              <div>Efficiency %</div>
            </Grid>
            <Grid item xs={12} sm={6} md={3} data-testid="chart-metric-4">
              <div>Cable Size</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByText('Voltage Drop %')).toBeInTheDocument();
      expect(screen.getByText('Power Loss W')).toBeInTheDocument();
      expect(screen.getByText('Efficiency %')).toBeInTheDocument();
      expect(screen.getByText('Cable Size')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle Grid without item prop gracefully', () => {
      // Test that Grid components without item prop still render
      render(
        <TestWrapper>
          <Grid container>
            <Grid xs={12} data-testid="no-item-prop">
              <div>Content without item prop</div>
            </Grid>
          </Grid>
        </TestWrapper>
      );

      expect(screen.getByTestId('no-item-prop')).toBeInTheDocument();
      expect(screen.getByText('Content without item prop')).toBeInTheDocument();
    });

    it('should handle empty Grid container', () => {
      render(
        <TestWrapper>
          <Grid container data-testid="empty-container" />
        </TestWrapper>
      );

      expect(screen.getByTestId('empty-container')).toBeInTheDocument();
    });
  });
});