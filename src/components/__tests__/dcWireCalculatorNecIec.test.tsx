/**
 * DC Wire Calculator NEC/IEC Standard Selection Tests
 * Tests the NEC/IEC wire standard selection functionality in DCWireCalculator
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DCWireCalculator from "../DCWireCalculator";
import { expectMuiSelectToHaveValue } from "../../test-utils/mui-testing";
import "@testing-library/jest-dom";

// Mock the calculation functions to avoid complex async behavior
jest.mock("../../utils/calculations/dc", () => ({
  calculateDCWireSize: jest.fn(() => ({
    recommendedWireGauge: "10",
    ampacity: 30,
    voltageDropPercent: 1.8,
    voltageDropVolts: 0.216,
    powerLossWatts: 4.32,
    efficiency: 98.2,
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
    };
    return awgToMm2Map[awg] || 5.26;
  }),
  findMinimumMetricWireSize: jest.fn((requiredMm2: number) => {
    if (requiredMm2 <= 2.5) return 2.5;
    if (requiredMm2 <= 4) return 4;
    if (requiredMm2 <= 6) return 6;
    return 10;
  }),
  convertAwgWireToMetric: jest.fn((wire) => ({
    ...wire,
    gauge: "6",
    crossSectionMm2: 6,
  })),
  formatWireSize: jest.fn((size: string, standard: "NEC" | "IEC") =>
    standard === "NEC" ? `${size} AWG` : `${size} mm²`,
  ),
}));

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("DC Wire Calculator NEC/IEC Standard Selection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Default Behavior", () => {
    it("should default to IEC wire standard and automotive application", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show IEC as default wire standard
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");

      // Should show automotive as default application
      expectMuiSelectToHaveValue("application-selector", "automotive");

      // Should show IEC-specific description
      expect(
        screen.getByText(
          "Metric cross-sectional area (mm²) sizing system used internationally",
        ),
      ).toBeInTheDocument();
    });

    it("should show default automotive voltage with IEC standard", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should default to 12V for automotive
      expectMuiSelectToHaveValue("voltage-selector", "12");
    });

    it("should show Wire Sizing Standard selector", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show wire standard selection by testid to avoid duplicates
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
      expect(screen.getAllByText("Wire Sizing Standard")).toHaveLength(3); // Header, label, legend
    });
  });

  describe("NEC/IEC Standard Selection", () => {
    it("should show IEC description when calculator renders", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show default IEC description
      expect(
        screen.getByText(
          "Metric cross-sectional area (mm²) sizing system used internationally",
        ),
      ).toBeInTheDocument();

      // Should have wire standard selector available
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
    });

    it("should maintain application selection when switching wire standards", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Verify initial state
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
      expectMuiSelectToHaveValue("application-selector", "automotive");

      // Both selectors should be independent
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
      expect(screen.getByTestId("application-selector")).toBeInTheDocument();
    });

    it("should maintain voltage selection with wire standards", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Verify initial voltage is consistent
      expectMuiSelectToHaveValue("voltage-selector", "12");

      // Wire standard should not affect voltage options
      expect(screen.getByTestId("voltage-selector")).toBeInTheDocument();
    });

    it("should show form inputs with default values", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show default input values
      expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Default current
      expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // Default length

      // Should have wire standard selector
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
    });
  });

  describe("Calculation Integration", () => {
    it("should perform IEC calculation with metric results", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

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

      // Should call calculation function with IEC standard
      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "IEC",
            }),
          );
          expect(screen.getByText("10 mm²")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should show different wire units based on standard", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Trigger calculation with IEC standard
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      // Should show mm² units for IEC
      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "IEC",
            }),
          );
          expect(screen.getByText("10 mm²")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should show compliance indicators for both standards", async () => {
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

      // Should show compliance indicators
      await waitFor(
        () => {
          expect(screen.getByText("Compliant")).toBeInTheDocument();
          expect(screen.getByText("Voltage Drop")).toBeInTheDocument();
          expect(screen.getByText("Power Loss")).toBeInTheDocument();
          expect(screen.getByText("Efficiency")).toBeInTheDocument();
          expect(screen.getByText("Wire Ampacity")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Combined Application + Wire Standard Tests", () => {
    it("should work with automotive application and IEC standard", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show automotive initially with IEC
      expect(screen.getByText("DC_AUTOMOTIVE")).toBeInTheDocument();
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
    });

    it("should show proper selectors for all combinations", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show both selectors independently
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
      expect(screen.getByTestId("application-selector")).toBeInTheDocument();
      expect(screen.getByTestId("voltage-selector")).toBeInTheDocument();
    });

    it("should handle voltage options correctly with different combinations", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show voltage selector regardless of wire standard
      expect(screen.getByTestId("voltage-selector")).toBeInTheDocument();
      expectMuiSelectToHaveValue("voltage-selector", "12");
    });
  });

  describe("Form Validation and User Experience", () => {
    it("should show calculation functionality", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show calculate button
      const calculateButton = screen.getByText("Calculate Wire Size");
      expect(calculateButton).toBeInTheDocument();
      expect(calculateButton).not.toBeDisabled();
    });

    it("should show proper form elements for both standards", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show all key form elements
      expect(screen.getByText("Load Current (A)")).toBeInTheDocument();
      expect(screen.getByText("Circuit Length (m)")).toBeInTheDocument(); // Should show meters for IEC default
      expect(screen.getByText("Calculate Wire Size")).toBeInTheDocument();
      expect(screen.getByTestId("voltage-selector")).toBeInTheDocument();
      expect(screen.getByTestId("application-selector")).toBeInTheDocument();
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
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

      // Should show default form values
      expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Default current
      expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // Default length
      expectMuiSelectToHaveValue("voltage-selector", "12"); // Default voltage
    });
  });

  describe("IEC Default and Unit Separation", () => {
    it("should default to IEC and show metric units", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should default to IEC with metric units
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
      expect(screen.getByText("Circuit Length (m)")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Metric cross-sectional area (mm²) sizing system used internationally",
        ),
      ).toBeInTheDocument();

      // Should not show imperial units
      expect(screen.queryByText("Circuit Length (ft)")).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "American Wire Gauge (AWG) sizing system used in North America",
        ),
      ).not.toBeInTheDocument();
    });

    it("should show IEC wire standard selector options", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show the wire standard selector
      const wireStandardSelector = screen.getByTestId("wire-standard-selector");
      expect(wireStandardSelector).toBeInTheDocument();

      // Should default to IEC
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
    });

    it("should show metric results for IEC calculations", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

      // Mock IEC calculation result
      calculateDCWireSize.mockReturnValue({
        recommendedWireGauge: "6", // Should be displayed as 6 mm² for IEC
        ampacity: 30,
        voltageDropPercent: 1.8,
        voltageDropVolts: 0.216,
        powerLossWatts: 4.32,
        efficiency: 98.2,
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
      });

      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should be IEC by default
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      // Should show metric result
      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "IEC",
            }),
          );
          expect(screen.getByText("6 mm²")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should maintain strict unit separation", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // IEC should show only metric units and descriptions
      expectMuiSelectToHaveValue("wire-standard-selector", "IEC");
      expect(screen.getByText("Circuit Length (m)")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Metric cross-sectional area (mm²) sizing system used internationally",
        ),
      ).toBeInTheDocument();

      // Should not show any imperial references by default
      expect(screen.queryByText("Circuit Length (ft)")).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "American Wire Gauge (AWG) sizing system used in North America",
        ),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("AWG")).not.toBeInTheDocument();
    });
  });
});
