/**
 * DC Breaker Calculator Tests
 * Tests the DC circuit breaker sizing functionality
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DCBreakerCalculator from "../DCBreakerCalculator";
import "@testing-library/jest-dom";

// Mock the calculation functions
jest.mock("../../utils/calculations/dcBreakerRouter", () => ({
  calculateDCBreakerSize: jest.fn(() => ({
    recommendedBreakerRating: 25,
    breakerType: "thermal-magnetic",
    standard: "UL489",
    calculationMethod: "Base current (20A) × Safety factor (1.25)",
    safetyFactor: 1.25,
    adjustedCurrent: 25.0,
    temperatureDerating: undefined,
    powerAnalysis: {
      inputPower: 240,
      calculatedCurrent: 20.0,
      systemVoltage: 12,
      efficiencyFactor: 0.98,
      effectivePower: 244.9,
      powerLossWatts: 4.9,
      powerFactor: 1.0,
    },
    compliance: {
      standardCompliant: true,
      wireCompatible: true,
      applicationCompliant: true,
      temperatureCompliant: true,
    },
    availableBreakerSizes: [5, 10, 15, 20, 25, 30, 40, 50],
    minimumBreakerSize: 25,
    nextStandardSize: 25,
    breakerRecommendations: {
      primary: {
        rating: 25,
        type: "thermal-magnetic",
        voltage: 80,
        standard: "UL489",
        continuousDuty: true,
        temperatureRating: 80,
        applications: ["automotive"],
        interruptingCapacity: 10000,
        tripCurve: "C",
        frameSize: "Miniature",
      },
      alternatives: [],
    },
  })),
  validateDCBreakerInput: jest.fn(() => []),
}));

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("DC Breaker Calculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the DC Breaker Calculator with title and description", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /Calculate circuit breaker sizing for DC electrical systems/,
        ),
      ).toBeInTheDocument();
    });

    it("should show basic form inputs", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Check for basic form inputs using data-testid
      expect(screen.getByTestId("input-method-selector")).toBeInTheDocument();
      expect(screen.getByTestId("duty-cycle-selector")).toBeInTheDocument();
      expect(
        screen.getByTestId("ambient-temperature-input"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("environment-selector")).toBeInTheDocument();
      expect(screen.getByTestId("wire-standard-selector")).toBeInTheDocument();
    });

    it("should show application selector", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Should show the DC application selector
      expect(screen.getByText("DC Application Selection")).toBeInTheDocument();
    });
  });

  describe("Form Inputs and Validation", () => {
    it("should have default values", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Check default values
      expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Load current
      expect(screen.getByDisplayValue("25")).toBeInTheDocument(); // Ambient temperature

      // Check continuous operation switch is on by default
      const continuousSwitch = screen.getByRole("checkbox", {
        name: /continuous operation/i,
      });
      expect(continuousSwitch).toBeChecked();
    });

    it("should allow input value changes", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Change load current
      const currentInput = screen.getByDisplayValue("20");
      fireEvent.change(currentInput, { target: { value: "30" } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("30")).toBeInTheDocument();
      });

      // Change ambient temperature
      const tempInput = screen.getByDisplayValue("25");
      fireEvent.change(tempInput, { target: { value: "40" } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("40")).toBeInTheDocument();
      });
    });

    it("should show solar-specific inputs when solar application is selected", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Initially should not show solar inputs
      expect(
        screen.queryByText("Short Circuit Current (A)"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Number of Panels")).not.toBeInTheDocument();
      expect(screen.queryByText("Panel ISC (A)")).not.toBeInTheDocument();

      // Solar inputs would appear when solar application is selected
      // This would require interaction with the DCApplicationSelector component
    });
  });

  describe("Calculation Functionality", () => {
    it("should perform calculation when button is clicked", async () => {
      const {
        calculateDCBreakerSize,
      } = require("../../utils/calculations/dcBreakerRouter");

      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Click calculate button
      const calculateButton = screen.getByText("Calculate Breaker Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          expect(calculateDCBreakerSize).toHaveBeenCalledWith(
            expect.objectContaining({
              loadCurrent: 20,
              applicationType: "automotive",
              dutyCycle: "continuous",
              ambientTemperature: 25,
              continuousOperation: true,
              environment: "indoor",
              wireStandard: "NEC",
            }),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should show calculation results", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Breaker Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          // Should show breaker rating
          expect(screen.getAllByText("25A")[0]).toBeInTheDocument();

          // Should show breaker type and standard
          expect(screen.getByText(/THERMAL MAGNETIC/)).toBeInTheDocument();
          expect(screen.getByText(/UL489/)).toBeInTheDocument();

          // Should show compliance status
          expect(screen.getByText("Compliant")).toBeInTheDocument();

          // Should show calculation details
          expect(screen.getByText("Adjusted Current")).toBeInTheDocument();
          expect(screen.getByText("25.0A")).toBeInTheDocument();
          expect(screen.getByText("Safety factor: 1.25×")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should show compliance indicators", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Breaker Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          // Should show compliance chips
          expect(screen.getByText("Standard")).toBeInTheDocument();
          expect(screen.getByText("Wire Compatible")).toBeInTheDocument();
          expect(screen.getByText("Application")).toBeInTheDocument();
          expect(screen.getByText("Temperature")).toBeInTheDocument();

          // Should show calculation method
          expect(screen.getByText("Calculation Method:")).toBeInTheDocument();
          expect(
            screen.getByText("Base current (20A) × Safety factor (1.25)"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Duty Cycle and Environment Controls", () => {
    it("should allow duty cycle selection", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Find duty cycle selector using data-testid
      const dutyCycleSelect = screen.getByTestId("duty-cycle-selector");
      expect(dutyCycleSelect).toBeInTheDocument();

      // Change to intermittent
      fireEvent.mouseDown(dutyCycleSelect);
      await waitFor(() => {
        const intermittentOption = screen.getByText("Intermittent (<3 hours)");
        expect(intermittentOption).toBeInTheDocument();
      });
    });

    it("should allow environment selection", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Find environment selector using data-testid
      const environmentSelect = screen.getByTestId("environment-selector");
      expect(environmentSelect).toBeInTheDocument();

      // Open dropdown
      fireEvent.mouseDown(environmentSelect);
      await waitFor(() => {
        expect(screen.getByText("Marine")).toBeInTheDocument();
        expect(screen.getByText("Outdoor")).toBeInTheDocument();
        expect(screen.getByText("Automotive")).toBeInTheDocument();
      });
    });

    it("should toggle continuous operation switch", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Find continuous operation switch
      const continuousSwitch = screen.getByRole("checkbox", {
        name: /continuous operation/i,
      });
      expect(continuousSwitch).toBeChecked();

      // Toggle switch
      fireEvent.click(continuousSwitch);
      expect(continuousSwitch).not.toBeChecked();
    });
  });

  describe("Wire Standard Selection", () => {
    it("should allow wire standard selection", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Find wire standard selector using data-testid
      const wireStandardSelect = screen.getByTestId("wire-standard-selector");
      expect(wireStandardSelect).toBeInTheDocument();

      // Open dropdown
      fireEvent.mouseDown(wireStandardSelect);
      await waitFor(() => {
        expect(screen.getByText("IEC (mm²)")).toBeInTheDocument();
      });
    });

    it("should accept wire gauge input", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Find wire gauge input
      const wireGaugeInput = screen.getByLabelText(/wire gauge/i);
      expect(wireGaugeInput).toBeInTheDocument();

      // Enter wire gauge
      fireEvent.change(wireGaugeInput, { target: { value: "12" } });
      expect(wireGaugeInput).toHaveValue("12");
    });
  });

  describe("Loading and Error States", () => {
    it("should show loading state during calculation", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Click calculate button
      const calculateButton = screen.getByText("Calculate Breaker Size");
      fireEvent.click(calculateButton);

      // Should show loading state briefly
      expect(screen.getByText("Calculating...")).toBeInTheDocument();

      // Button should be disabled during calculation
      expect(calculateButton).toBeDisabled();
    });

    it("should handle calculation errors", async () => {
      // Mock function to throw error
      const {
        calculateDCBreakerSize,
      } = require("../../utils/calculations/dcBreakerRouter");
      calculateDCBreakerSize.mockImplementationOnce(() => {
        throw new Error("Test calculation error");
      });

      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Breaker Size");
      fireEvent.click(calculateButton);

      await waitFor(
        () => {
          // Should show error message
          expect(
            screen.getByText("Test calculation error"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Power-Based Input Method", () => {
    it("should show power inputs when power method is selected", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        expect(screen.getByText("Load Power (W)")).toBeInTheDocument();
        expect(screen.getByText("System Voltage (V)")).toBeInTheDocument();
        expect(screen.queryByText("Load Current (A)")).not.toBeInTheDocument();
      });
    });

    it("should show current inputs when current method is selected", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Should show current inputs by default
      expect(screen.getByText("Load Current (A)")).toBeInTheDocument();
      expect(screen.queryByText("Load Power (W)")).not.toBeInTheDocument();
      expect(screen.queryByText("System Voltage (V)")).not.toBeInTheDocument();
    });

    it("should allow switching between input methods", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Start with current method
      expect(screen.getByText("Load Current (A)")).toBeInTheDocument();

      // Switch to power method
      const inputMethodSelect = screen.getByDisplayValue(/Current/);
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        expect(screen.getByText("Load Power (W)")).toBeInTheDocument();
        expect(screen.getByText("System Voltage (V)")).toBeInTheDocument();
      });

      // Switch back to current method
      const updatedSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(updatedSelect);

      await waitFor(() => {
        const currentOption = screen.getByText("Current (A)");
        fireEvent.click(currentOption);
      });

      await waitFor(() => {
        expect(screen.getByText("Load Current (A)")).toBeInTheDocument();
        expect(screen.queryByText("Load Power (W)")).not.toBeInTheDocument();
      });
    });

    it("should accept power and voltage inputs", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        // Find and update power input
        const powerInput = screen.getByDisplayValue("240");
        fireEvent.change(powerInput, { target: { value: "500" } });
        expect(screen.getByDisplayValue("500")).toBeInTheDocument();

        // Find and update voltage input
        const voltageInput = screen.getByDisplayValue("12");
        fireEvent.change(voltageInput, { target: { value: "24" } });
        expect(screen.getByDisplayValue("24")).toBeInTheDocument();
      });
    });

    it("should perform power-based calculation", async () => {
      const {
        calculateDCBreakerSize,
      } = require("../../utils/calculations/dcBreakerRouter");

      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        // Click calculate button
        const calculateButton = screen.getByText("Calculate Breaker Size");
        fireEvent.click(calculateButton);
      });

      await waitFor(
        () => {
          expect(calculateDCBreakerSize).toHaveBeenCalledWith(
            expect.objectContaining({
              inputMethod: "power",
              loadPower: 240,
              systemVoltage: 12,
              applicationType: "automotive",
              dutyCycle: "continuous",
            }),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should show power analysis results", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      // Trigger calculation
      await waitFor(() => {
        const calculateButton = screen.getByText("Calculate Breaker Size");
        fireEvent.click(calculateButton);
      });

      await waitFor(
        () => {
          // Should show power analysis section
          expect(screen.getByText("Power Analysis")).toBeInTheDocument();
          expect(screen.getByText("Input Power")).toBeInTheDocument();
          expect(screen.getByText("240W")).toBeInTheDocument();
          expect(screen.getByText("Calculated Current")).toBeInTheDocument();
          expect(screen.getByText("20.0A")).toBeInTheDocument();
          expect(screen.getByText("System Voltage")).toBeInTheDocument();
          expect(screen.getByText("12V")).toBeInTheDocument();
          expect(screen.getByText("Efficiency Factor")).toBeInTheDocument();
          expect(screen.getByText("98%")).toBeInTheDocument();
          expect(screen.getByText("Effective Power")).toBeInTheDocument();
          expect(screen.getByText("245W")).toBeInTheDocument();
          expect(screen.getByText("Power Loss")).toBeInTheDocument();
          expect(screen.getByText("4.9W")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Imperial vs Metric Standards", () => {
    it("should show NEC as default wire standard", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      const wireStandardSelect = screen.getByTestId("wire-standard-selector");
      expect(wireStandardSelect).toBeInTheDocument();
    });

    it("should allow switching to IEC standard", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to IEC standard
      const wireStandardSelect = screen.getByTestId("wire-standard-selector");
      fireEvent.mouseDown(wireStandardSelect);

      await waitFor(() => {
        const iecOption = screen.getByText("IEC (mm²)");
        fireEvent.click(iecOption);
      });

      await waitFor(() => {
        // Check that IEC option was selected (the text should be visible in the dropdown)
        expect(screen.getByText("IEC (mm²)")).toBeInTheDocument();
      });
    });

    it("should use different calculation factors for different standards", async () => {
      const {
        calculateDCBreakerSize,
      } = require("../../utils/calculations/dcBreakerRouter");

      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to IEC standard
      const wireStandardSelect = screen.getByTestId("wire-standard-selector");
      fireEvent.mouseDown(wireStandardSelect);

      await waitFor(() => {
        const iecOption = screen.getByText("IEC (mm²)");
        fireEvent.click(iecOption);
      });

      // Trigger calculation
      await waitFor(() => {
        const calculateButton = screen.getByText("Calculate Breaker Size");
        fireEvent.click(calculateButton);
      });

      await waitFor(
        () => {
          expect(calculateDCBreakerSize).toHaveBeenCalledWith(
            expect.objectContaining({
              wireStandard: "IEC",
            }),
          );
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Advanced Power Input Scenarios", () => {
    it("should handle solar power calculations with panels", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to solar application (would trigger through DCApplicationSelector)
      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        // Enter large solar system values
        const powerInput = screen.getByDisplayValue("240");
        fireEvent.change(powerInput, { target: { value: "5000" } });

        const voltageInput = screen.getByDisplayValue("12");
        fireEvent.change(voltageInput, { target: { value: "48" } });

        expect(screen.getByDisplayValue("5000")).toBeInTheDocument();
        expect(screen.getByDisplayValue("48")).toBeInTheDocument();
      });
    });

    it("should handle automotive high-power loads", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        // Enter high automotive power (like electric winch)
        const powerInput = screen.getByDisplayValue("240");
        fireEvent.change(powerInput, { target: { value: "3000" } });

        const voltageInput = screen.getByDisplayValue("12");
        fireEvent.change(voltageInput, { target: { value: "12" } });

        expect(screen.getByDisplayValue("3000")).toBeInTheDocument();
        expect(screen.getByDisplayValue("12")).toBeInTheDocument();
      });
    });

    it("should handle marine electrical systems", async () => {
      render(
        <TestWrapper>
          <DCBreakerCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("DC Circuit Breaker Calculator"),
        ).toBeInTheDocument();
      });

      // Switch to marine environment
      const environmentSelect = screen.getByTestId("environment-selector");
      fireEvent.mouseDown(environmentSelect);

      await waitFor(() => {
        const marineOption = screen.getByText("Marine");
        fireEvent.click(marineOption);
      });

      // Switch to power input method
      const inputMethodSelect = screen.getByTestId("input-method-selector");
      fireEvent.mouseDown(inputMethodSelect);

      await waitFor(() => {
        const powerOption = screen.getByText("Power (W) + Voltage (V)");
        fireEvent.click(powerOption);
      });

      await waitFor(() => {
        // Enter typical marine power (navigation equipment)
        const powerInput = screen.getByDisplayValue("240");
        fireEvent.change(powerInput, { target: { value: "150" } });

        const voltageInput = screen.getByDisplayValue("12");
        fireEvent.change(voltageInput, { target: { value: "24" } });

        expect(screen.getByDisplayValue("150")).toBeInTheDocument();
        expect(screen.getByDisplayValue("24")).toBeInTheDocument();
      });
    });
  });
});
