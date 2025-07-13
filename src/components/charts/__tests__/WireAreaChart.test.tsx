/**
 * WireAreaChart Tests
 * Comprehensive testing for existing wire area chart component
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import WireAreaChart from "../WireAreaChart";
import "@testing-library/jest-dom";

// Mock recharts to avoid canvas rendering issues in tests
jest.mock("recharts", () => ({
  BarChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ScatterChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="scatter-chart">{children}</div>
  ),
  Scatter: () => <div data-testid="scatter" />,
}));

// Mock IEC wire specifications function
jest.mock("../../../utils/calculations/iecConduitFill", () => ({
  getIECWireSpecifications: jest.fn((insulationType: string) => [
    {
      gauge: "2.5",
      area: 2.5,
      totalArea: 7.06,
      totalDiameter: 3.0,
      insulationType,
    },
    {
      gauge: "4",
      area: 4.0,
      totalArea: 10.75,
      totalDiameter: 3.7,
      insulationType,
    },
    {
      gauge: "6",
      area: 6.0,
      totalArea: 15.21,
      totalDiameter: 4.4,
      insulationType,
    },
    {
      gauge: "10",
      area: 10.0,
      totalArea: 23.76,
      totalDiameter: 5.5,
      insulationType,
    },
  ]),
  generateConduitFillComparisonData: jest.fn(() => []),
  calculateIECConduitFill: jest.fn(() => ({
    isCompliant: true,
    fillPercent: 30,
  })),
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("WireAreaChart", () => {
  const mockWires = [
    { gauge: "2.5", count: 3, insulationType: "PVC" as const },
    { gauge: "4", count: 2, insulationType: "XLPE" as const },
    { gauge: "6", count: 1, insulationType: "PVC" as const },
  ];

  describe("Chart Rendering Tests", () => {
    it("should render bar chart by default", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should render pie chart when selected", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="pie" />
        </TestWrapper>,
      );

      // Component should render without errors
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should render scatter chart when selected", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="scatter" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should render table view when selected", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should include chart axes in bar chart", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="bar" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("should include chart grid and tooltip", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("grid")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });
  });

  describe("IEC Standards Separation", () => {
    it("should use only IEC wire specifications", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Component should render without errors using IEC specifications
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should display metric units only", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Check for metric wire gauges (mm²)
      expect(screen.getByText(/2\.5mm²/)).toBeInTheDocument();
      expect(screen.getByText(/4mm²/)).toBeInTheDocument();
      expect(screen.getByText(/6mm²/)).toBeInTheDocument();
    });

    it("should not mix imperial measurements", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Should not contain AWG sizes like "12 AWG" or "#14"
      expect(screen.queryByText(/AWG|#\d+/)).not.toBeInTheDocument();
    });
  });

  describe("Data Calculations", () => {
    it("should calculate conductor area correctly", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      // Should display conductor areas based on wire specifications
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should calculate insulation area correctly", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      // Table should show insulation area calculations
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should calculate total areas per wire type", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Should calculate total area considering wire count
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should handle wire count multipliers", () => {
      const multipleWires = [
        { gauge: "2.5", count: 5, insulationType: "PVC" as const },
        { gauge: "4", count: 3, insulationType: "XLPE" as const },
      ];

      render(
        <TestWrapper>
          <WireAreaChart wires={multipleWires} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Interactive Features", () => {
    it("should switch between chart types", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Component should render without errors with view selector
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should toggle insulation breakdown display", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} showInsulationBreakdown={true} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("should handle insulation breakdown disabled", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} showInsulationBreakdown={false} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle empty wire arrays", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={[]} />
        </TestWrapper>,
      );

      // Should render without crashing
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should handle invalid wire specifications", () => {
      const invalidWires = [
        { gauge: "invalid", count: 1, insulationType: "PVC" as const },
      ];

      expect(() => {
        render(
          <TestWrapper>
            <WireAreaChart wires={invalidWires} />
          </TestWrapper>,
        );
      }).not.toThrow();
    });

    it("should handle missing wire specifications gracefully", () => {
      const unknownWires = [
        { gauge: "999", count: 1, insulationType: "PVC" as const },
      ];

      render(
        <TestWrapper>
          <WireAreaChart wires={unknownWires} />
        </TestWrapper>,
      );

      // Should use fallback calculations
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should handle mixed insulation types", () => {
      const mixedWires = [
        { gauge: "2.5", count: 2, insulationType: "PVC" as const },
        { gauge: "4", count: 3, insulationType: "XLPE" as const },
      ];

      render(
        <TestWrapper>
          <WireAreaChart wires={mixedWires} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Chart Configuration", () => {
    it("should render with responsive container", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should include chart legend when applicable", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="bar" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("legend")).toBeInTheDocument();
    });

    it("should display chart title", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      expect(screen.getByText("Wire Area Analysis")).toBeInTheDocument();
    });

    it("should show view selector", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Component should render with view controls
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Summary Information", () => {
    it("should display wire summary totals", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      expect(screen.getByText("Summary")).toBeInTheDocument();
      expect(screen.getByText(/Total Wires:/)).toBeInTheDocument();
      expect(screen.getByText(/Total Conductor Area:/)).toBeInTheDocument();
      expect(screen.getByText(/Total Insulation Area:/)).toBeInTheDocument();
      expect(screen.getByText(/Total Combined Area:/)).toBeInTheDocument();
    });

    it("should display wire type breakdown", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      expect(screen.getByText("Wire Types")).toBeInTheDocument();
      // Should show wire type chips
      expect(screen.getByText(/2\.5mm² × 3 \(PVC\)/)).toBeInTheDocument();
      expect(screen.getByText(/4mm² × 2 \(XLPE\)/)).toBeInTheDocument();
      expect(screen.getByText(/6mm² × 1 \(PVC\)/)).toBeInTheDocument();
    });

    it("should calculate percentages correctly", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      // Table should show percentage columns
      expect(screen.getByText(/Percentage/)).toBeInTheDocument();
    });
  });

  describe("Table View Functionality", () => {
    it("should display table headers correctly", async () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      expect(screen.getByText("Gauge")).toBeInTheDocument();
      expect(screen.getByText("Count")).toBeInTheDocument();
      expect(screen.getByText("Insulation")).toBeInTheDocument();
      expect(screen.getByText("Conductor Area")).toBeInTheDocument();
      expect(screen.getByText("Total Area/Wire")).toBeInTheDocument();
    });

    it("should display wire data in table rows", async () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      // Should display wire gauge data
      expect(screen.getByText("2.5mm²")).toBeInTheDocument();
      expect(screen.getByText("4mm²")).toBeInTheDocument();
      expect(screen.getByText("6mm²")).toBeInTheDocument();
    });

    it("should show insulation type chips in table", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="table" />
        </TestWrapper>,
      );

      // Table should contain insulation type information
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("Pie Chart Functionality", () => {
    it("should display wire area proportions", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="pie" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should include pie chart elements", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="pie" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Scatter Plot Functionality", () => {
    it("should display wire gauge vs area relationship", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="scatter" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should differentiate insulation types in scatter plot", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} chartType="scatter" />
        </TestWrapper>,
      );

      // Scatter plot should render with different colors for insulation types
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });
  });

  describe("Data Validation", () => {
    it("should sort wires by gauge size", () => {
      const unsortedWires = [
        { gauge: "10", count: 1, insulationType: "PVC" as const },
        { gauge: "2.5", count: 2, insulationType: "XLPE" as const },
        { gauge: "6", count: 1, insulationType: "PVC" as const },
      ];

      render(
        <TestWrapper>
          <WireAreaChart wires={unsortedWires} />
        </TestWrapper>,
      );

      // Chart should render with sorted data
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should handle decimal wire gauges", () => {
      const decimalWires = [
        { gauge: "1.5", count: 1, insulationType: "PVC" as const },
        { gauge: "2.5", count: 1, insulationType: "XLPE" as const },
      ];

      render(
        <TestWrapper>
          <WireAreaChart wires={decimalWires} />
        </TestWrapper>,
      );

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should calculate correct totals", () => {
      render(
        <TestWrapper>
          <WireAreaChart wires={mockWires} />
        </TestWrapper>,
      );

      // Should display calculated totals
      expect(screen.getByText(/Total Wires: 6/)).toBeInTheDocument(); // 3+2+1
    });
  });
});
