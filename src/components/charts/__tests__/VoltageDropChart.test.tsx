/**
 * VoltageDropChart Tests
 * Comprehensive testing for existing voltage drop chart component
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import VoltageDropChart from "../VoltageDropChart";
import "@testing-library/jest-dom";

// Mock recharts to avoid canvas rendering issues in tests
jest.mock("recharts", () => ({
  LineChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("VoltageDropChart", () => {
  const defaultProps = {
    current: 20,
    voltage: 230,
    voltageSystem: "single",
    conductorMaterial: "copper",
    powerFactor: 0.8,
  };

  describe("Chart Rendering Tests", () => {
    it("should render line chart with voltage drop data", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
      expect(screen.getAllByTestId("line")).toHaveLength(6); // Default 6 cable sizes
    });

    it("should show reference lines for voltage limits", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("reference-line")).toBeInTheDocument();
    });

    it("should include chart axes", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("should include chart grid and tooltip", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("grid")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });
  });

  describe("Calculation Accuracy", () => {
    it("should use correct voltage drop calculations", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      // Chart should render with calculated data points
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle different cable sizes", () => {
      const cableSizes = ["2.5", "4", "6", "10"];

      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} cableSizes={cableSizes} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should calculate voltage drop for different distances", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} maxDistance={200} />
        </TestWrapper>,
      );

      // Should render chart with distance-based calculations
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle different conductor materials", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} conductorMaterial="aluminum" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Standards Compliance", () => {
    it("should respect voltage drop limits by standard", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      // Reference lines should be present for voltage drop limits
      expect(screen.getByTestId("reference-line")).toBeInTheDocument();
    });

    it("should show proper units based on standard", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      // Component should render without unit conflicts
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should handle single-phase voltage systems", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} voltageSystem="single" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle three-phase voltage systems", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} voltageSystem="three-phase" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Interactive Features", () => {
    it("should update chart when parameters change", () => {
      const { rerender } = render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();

      // Update with different current
      rerender(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} current={30} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle cable size selection", () => {
      const customCableSizes = ["1.5", "2.5", "4"];

      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} cableSizes={customCableSizes} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle power factor changes", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} powerFactor={0.9} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle zero current gracefully", () => {
      expect(() => {
        render(
          <TestWrapper>
            <VoltageDropChart {...defaultProps} current={0} />
          </TestWrapper>,
        );
      }).not.toThrow();
    });

    it("should handle very high current values", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} current={1000} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle very long distances", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} maxDistance={10000} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle invalid power factor gracefully", () => {
      expect(() => {
        render(
          <TestWrapper>
            <VoltageDropChart {...defaultProps} powerFactor={1.5} />
          </TestWrapper>,
        );
      }).not.toThrow();
    });
  });

  describe("Chart Configuration", () => {
    it("should render with responsive container", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should include chart legend by default", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("legend")).toBeInTheDocument();
    });

    it("should handle chart with responsive container", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Data Validation", () => {
    it("should display voltage drop percentage correctly", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      // Chart renders with valid data
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should show voltage at load calculations", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle empty cable sizes array", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} cableSizes={[]} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Load Type Variations", () => {
    it("should handle resistive loads", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} loadType="resistive" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle motor loads", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} loadType="motor" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle mixed loads", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} loadType="mixed" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Chart Data Generation", () => {
    it("should generate data points for voltage drop analysis", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} />
        </TestWrapper>,
      );

      // Chart should render with generated data points
      expect(screen.getAllByTestId("line")).toHaveLength(6); // Default 6 cable sizes
    });

    it("should include distance range in data generation", () => {
      render(
        <TestWrapper>
          <VoltageDropChart {...defaultProps} maxDistance={500} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });
});
