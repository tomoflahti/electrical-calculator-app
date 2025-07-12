/**
 * VoltageDropCalculator Tests
 * Testing standard switching functionality and unit conversion
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import VoltageDropCalculator from "../VoltageDropCalculator";
import type { ElectricalStandardId } from "../../types/standards";
import "@testing-library/jest-dom";

// Mock the calculation functions
jest.mock("../../utils/calculations/necWireCalculations", () => ({
  calculateVoltageDrop: jest.fn(() => ({
    voltageDropPercent: 2.5,
    voltageDropVolts: 3.0,
    voltageAtLoad: 117.0,
    compliance: true,
  })),
}));

jest.mock("../../utils/calculations/iecWireCalculations", () => ({
  calculateVoltageDropAnalysis: jest.fn(() => ({
    results: [
      {
        cableSize: "2.5",
        voltageDropPercent: 1.8,
        voltageDropVolts: 4.14,
        powerLossWatts: 125,
        efficiencyPercent: 98.2,
        compliance: { withinLimits: true, standard: "IEC 60364" },
      },
    ],
    recommended: {
      cableSize: "2.5",
      voltageDropPercent: 1.8,
      voltageDropVolts: 4.14,
      powerLossWatts: 125,
      efficiencyPercent: 98.2,
      compliance: { withinLimits: true, standard: "IEC 60364" },
    },
  })),
}));

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Enhanced VoltageDropCalculator interface that accepts selectedStandard prop
interface VoltageDropCalculatorProps {
  selectedStandard?: ElectricalStandardId;
}

// We'll need to update the actual component to accept this prop
const VoltageDropCalculatorWithStandard: React.FC<
  VoltageDropCalculatorProps
> = ({ selectedStandard = "NEC" }) => {
  // Pass the selectedStandard prop to the component
  return <VoltageDropCalculator selectedStandard={selectedStandard} />;
};

describe("VoltageDropCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with NEC standard by default", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      expect(screen.getByText("Voltage Drop Calculator")).toBeInTheDocument();
      expect(screen.getByText("Input Parameters")).toBeInTheDocument();
      expect(screen.getByText("Calculate Voltage Drop")).toBeInTheDocument();
    });

    it("should render with IEC standard", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      expect(screen.getByText("Voltage Drop Calculator")).toBeInTheDocument();
    });
  });

  describe("Standard Switching - Units and Labels", () => {
    it("should show AWG wire gauges for NEC standard in voltage drop calculator", async () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Wait for component to fully render
      await waitFor(() => {
        expect(screen.getByText("Voltage Drop Calculator")).toBeInTheDocument();
      });

      // Should show AWG format in the selected wire gauge for NEC standard
      expect(screen.getByText("12 AWG")).toBeInTheDocument();
    });

    it("should show mm² wire sizes for IEC standard", async () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Should show mm² options
      const wireGaugeSelect = screen.getByRole("combobox", {
        name: /cable size/i,
      });
      fireEvent.mouseDown(wireGaugeSelect);

      // Check for mm² format options
      await waitFor(() => {
        expect(screen.getByText("2.5 mm²")).toBeInTheDocument();
        expect(screen.getByText("4 mm²")).toBeInTheDocument();
        expect(screen.getByText("6 mm²")).toBeInTheDocument();
      });
    });

    it("should show feet units for NEC standard", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      expect(screen.getByLabelText("Length (ft)")).toBeInTheDocument();
    });

    it("should show meter units for IEC standard", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      expect(screen.getByLabelText("Length (m)")).toBeInTheDocument();
    });

    it("should show US voltage options for NEC standard", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      const voltageSelect = screen.getByLabelText("Voltage");
      fireEvent.mouseDown(voltageSelect);

      expect(screen.getByText("120V")).toBeInTheDocument();
      expect(screen.getByText("240V")).toBeInTheDocument();
      expect(screen.getByText("277V")).toBeInTheDocument();
      expect(screen.getByText("480V")).toBeInTheDocument();
    });

    it("should show European voltage options for IEC standard", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      const voltageSelect = screen.getByLabelText("Voltage");
      fireEvent.mouseDown(voltageSelect);

      expect(screen.getByText("230V")).toBeInTheDocument();
      expect(screen.getByText("400V")).toBeInTheDocument();
    });
  });

  describe("Calculation Function Switching", () => {
    it("should use NEC calculation for NEC standard", async () => {
      const { calculateVoltageDrop } = require("../../utils/calculations/nec");

      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Fill in some values and calculate
      fireEvent.change(screen.getByLabelText("Current (A)"), {
        target: { value: "20" },
      });
      fireEvent.change(screen.getByLabelText("Length (ft)"), {
        target: { value: "100" },
      });

      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      await waitFor(() => {
        expect(calculateVoltageDrop).toHaveBeenCalled();
      });
    });

    it("should use IEC calculation for IEC standard", async () => {
      const {
        calculateVoltageDropAnalysis,
      } = require("../../utils/calculations/iec");

      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Fill in some values and calculate
      fireEvent.change(screen.getByLabelText("Current (A)"), {
        target: { value: "32" },
      });
      fireEvent.change(screen.getByLabelText("Length (m)"), {
        target: { value: "50" },
      });

      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      await waitFor(() => {
        expect(calculateVoltageDropAnalysis).toHaveBeenCalled();
      });
    });
  });

  describe("Results Display", () => {
    it("should show NEC compliance messages for NEC standard", async () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Trigger calculation
      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      await waitFor(() => {
        expect(screen.getByText(/NEC recommended limits/)).toBeInTheDocument();
        expect(
          screen.getByText(/Branch circuits: ≤3% voltage drop/),
        ).toBeInTheDocument();
      });
    });

    it("should show IEC compliance messages for IEC standard", async () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Trigger calculation
      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      await waitFor(() => {
        expect(screen.getByText(/IEC 60364 limits/)).toBeInTheDocument();
        expect(
          screen.getByText(/Final circuits: ≤4% voltage drop/),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Unit Conversion", () => {
    it("should convert length from feet to meters when switching from NEC to IEC", () => {
      const { rerender } = render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Enter 100 feet
      fireEvent.change(screen.getByLabelText("Length (ft)"), {
        target: { value: "100" },
      });

      // Switch to IEC
      rerender(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Should convert to approximately 30.48 meters
      const lengthInput = screen.getByLabelText(
        "Length (m)",
      ) as HTMLInputElement;
      expect(parseFloat(lengthInput.value)).toBeCloseTo(30.48, 1);
    });

    it("should convert length from meters to feet when switching from IEC to NEC", () => {
      const { rerender } = render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Enter 50 meters
      fireEvent.change(screen.getByLabelText("Length (m)"), {
        target: { value: "50" },
      });

      // Switch to NEC
      rerender(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Should convert to approximately 164.04 feet
      const lengthInput = screen.getByLabelText(
        "Length (ft)",
      ) as HTMLInputElement;
      expect(parseFloat(lengthInput.value)).toBeCloseTo(164.04, 1);
    });
  });

  describe("Input Validation", () => {
    it("should validate current input for both standards", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      const currentInput = screen.getByLabelText("Current (A)");

      // Test negative value
      fireEvent.change(currentInput, { target: { value: "-5" } });
      fireEvent.blur(currentInput);

      // Should show validation error or reset to valid value
      expect((currentInput as HTMLInputElement).value).not.toBe("-5");
    });

    it("should maintain input validity when switching standards", () => {
      const { rerender } = render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Enter valid values
      fireEvent.change(screen.getByLabelText("Current (A)"), {
        target: { value: "20" },
      });

      // Switch standards
      rerender(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Current should remain valid
      const currentInput = screen.getByLabelText(
        "Current (A)",
      ) as HTMLInputElement;
      expect(currentInput.value).toBe("20");
    });
  });

  describe("Visual Indicators", () => {
    it("should show standard indicator for NEC", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      expect(screen.getByText(/NEC/)).toBeInTheDocument();
    });

    it("should show standard indicator for IEC", () => {
      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      expect(screen.getByText(/IEC/)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle calculation errors gracefully", async () => {
      const { calculateVoltageDrop } = require("../../utils/calculations/nec");
      calculateVoltageDrop.mockImplementation(() => {
        throw new Error("Invalid input parameters");
      });

      render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid input parameters/),
        ).toBeInTheDocument();
      });
    });

    it("should clear results when standard changes", () => {
      const { rerender } = render(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Perform calculation to show results
      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      // Switch standard
      rerender(
        <TestWrapper>
          <VoltageDropCalculatorWithStandard selectedStandard="IEC" />
        </TestWrapper>,
      );

      // Results should be cleared
      expect(screen.queryByText(/Voltage Drop.*%/)).not.toBeInTheDocument();
    });
  });
});
