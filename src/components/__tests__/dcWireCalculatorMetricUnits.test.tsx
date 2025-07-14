/**
 * DC Wire Calculator Metric Units Tests
 * Tests the metric/imperial unit handling in DCWireCalculator
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DCWireCalculator from "../DCWireCalculator";
import { expectMuiSelectToHaveValue } from "../../test-utils/mui-testing";
import "@testing-library/jest-dom";

// Mock the calculation functions
jest.mock("../../utils/calculations/dc", () => ({
  calculateDCWireSize: jest.fn(() => ({
    recommendedWireGauge: "6",
    ampacity: 30,
    voltageDropPercent: 1.5,
    voltageDropVolts: 0.18,
    powerLossWatts: 3.6,
    efficiency: 98.5,
    compliance: {
      ampacityCompliant: true,
      voltageDropCompliant: true,
      temperatureCompliant: true,
      applicationCompliant: true,
    },
    correctionFactors: {
      temperature: 1.0,
      bundling: 1.0,
      ambient: 1.0,
    },
  })),
  validateDCInput: jest.fn(() => []),
}));

// Mock wire conversion utilities
jest.mock("../../utils/wireConversion", () => ({
  awgToMm2: jest.fn((awg: string) => {
    const awgToMm2Map: Record<string, number> = {
      "14": 2.08,
      "12": 3.31,
      "10": 5.26,
      "8": 8.37,
      "6": 13.3,
    };
    return awgToMm2Map[awg] || 6;
  }),
  findMinimumMetricWireSize: jest.fn((requiredMm2: number) => {
    if (requiredMm2 <= 2.5) return 2.5;
    if (requiredMm2 <= 4) return 4;
    if (requiredMm2 <= 6) return 6;
    if (requiredMm2 <= 10) return 10;
    return 16;
  }),
  formatWireSize: jest.fn((size: string, standard: "NEC" | "IEC") =>
    standard === "NEC" ? `${size} AWG` : `${size} mm²`,
  ),
}));

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("DC Wire Calculator Metric/Imperial Units", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Circuit Length Unit Display", () => {
    it("should show meters (m) units for IEC standard by default", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show IEC by default with meter units
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
      expect(screen.getByText("Circuit Length (m)")).toBeInTheDocument();
      expect(
        screen.getByText("One-way distance to load (metric)"),
      ).toBeInTheDocument();
    });

    it("should verify wire standard selector exists and has correct default", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Verify the selector exists and has correct default value
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
      expectMuiSelectToHaveValue("wire-standard-selector", "NEC");

      // Should show feet units for NEC
      expect(screen.getByText("Circuit Length (ft)")).toBeInTheDocument();
    });

    it("should show proper form elements with unit labels", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show all key form elements with proper units
      expect(screen.getByText("Load Current (A)")).toBeInTheDocument();
      expect(screen.getByText("Circuit Length (ft)")).toBeInTheDocument();
      expect(screen.getByText("One-way distance to load")).toBeInTheDocument();
      expect(screen.getByText("Calculate Wire Size")).toBeInTheDocument();
    });
  });

  describe("Separate Metric and Imperial Systems", () => {
    it("should pass NEC standard to calculation function with imperial units", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Set up calculation inputs in feet
      const lengthInput = screen.getByDisplayValue("10");
      fireEvent.change(lengthInput, { target: { value: "20" } });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "NEC",
              length: 20, // Passed as feet (imperial)
            }),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should show AWG wire size results for NEC standard", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should be NEC by default
      expectMuiSelectToHaveValue("wire-standard-selector", "NEC");

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "NEC",
            }),
          );

          // Should show AWG units in results
          expect(screen.getByText("6 AWG")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Form Validation with Imperial Units", () => {
    it("should validate length input for NEC standard (feet)", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Test with valid feet value
      const lengthInput = screen.getByDisplayValue("10");
      fireEvent.change(lengthInput, { target: { value: "100" } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("100")).toBeInTheDocument();
      });

      // Should show feet units
      expect(screen.getByText("Circuit Length (ft)")).toBeInTheDocument();
    });

    it("should handle decimal values for imperial units", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Test decimal feet value
      const lengthInput = screen.getByDisplayValue("10");
      fireEvent.change(lengthInput, { target: { value: "15.5" } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("15.5")).toBeInTheDocument();
      });

      // Should still show feet units
      expect(screen.getByText("Circuit Length (ft)")).toBeInTheDocument();
    });
  });

  describe("Wire Standard Components", () => {
    it("should show wire sizing standard selector card", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show wire standard selection components
      expect(screen.getAllByText("Wire Sizing Standard")).toHaveLength(3); // Header, label, legend
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
      expect(
        screen.getByText(
          "American Wire Gauge (AWG) sizing system used in North America",
        ),
      ).toBeInTheDocument();
    });

    it("should maintain form state consistency", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show default form values with proper units
      expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Default current
      expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // Default length
      expect(screen.getByText("Circuit Length (ft)")).toBeInTheDocument(); // Imperial units
      expectMuiSelectToHaveValue("voltage-selector", "12"); // Default voltage
      expectMuiSelectToHaveValue("wire-standard-selector", "NEC"); // Default standard
    });

    it("should show calculation functionality with imperial units", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show calculate button and form elements
      const calculateButton = screen.getByText("Calculate Wire Size");
      expect(calculateButton).toBeInTheDocument();
      expect(calculateButton).not.toBeDisabled();

      // Should show imperial units
      expect(screen.getByText("Circuit Length (ft)")).toBeInTheDocument();
    });
  });

  describe("Unit System Integration", () => {
    it("should pass correct parameters for imperial system calculations", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Set imperial values
      const currentInput = screen.getByDisplayValue("20");
      const lengthInput = screen.getByDisplayValue("10");

      fireEvent.change(currentInput, { target: { value: "25" } });
      fireEvent.change(lengthInput, { target: { value: "50" } });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "NEC",
              current: 25,
              length: 50, // Imperial feet - no conversion
              voltage: 12,
            }),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should show compliance results with imperial units", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          // Should show compliance indicators
          expect(screen.getByText("Compliant")).toBeInTheDocument();
          expect(screen.getByText("Voltage Drop")).toBeInTheDocument();
          expect(screen.getByText("Power Loss")).toBeInTheDocument();
          expect(screen.getByText("Efficiency")).toBeInTheDocument();
          expect(screen.getByText("Wire Ampacity")).toBeInTheDocument();

          // Should show AWG result for NEC
          expect(screen.getByText("6 AWG")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });
});
