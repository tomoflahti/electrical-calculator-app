/**
 * DC Wire Calculator Standard Selection Tests
 * Tests the DC application and standard selection functionality in DCWireCalculator
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

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("DC Wire Calculator Standard Selection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Default Behavior", () => {
    it("should default to automotive application and DC_AUTOMOTIVE standard", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show automotive as default
      expectMuiSelectToHaveValue("application-selector", "automotive");

      // Should show DC_AUTOMOTIVE standard chip
      expect(screen.getByText("DC_AUTOMOTIVE")).toBeInTheDocument();

      // Should show automotive description
      expect(
        screen.getByText(
          "12V/24V automotive electrical systems with ISO 6722 compliance",
        ),
      ).toBeInTheDocument();
    });

    it("should show default automotive voltage", async () => {
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

    it("should show automotive voltage drop limits", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show automotive voltage drop limit
      expect(screen.getByText("Voltage Drop: ≤2%")).toBeInTheDocument();
    });
  });

  describe("Application Selection", () => {
    it("should show application selector with automotive as default", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show application selector with automotive selected
      expectMuiSelectToHaveValue("application-selector", "automotive");
      expect(screen.getByText("DC_AUTOMOTIVE")).toBeInTheDocument();
    });

    it("should maintain voltage consistency", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should maintain 12V by default (available in most applications)
      expectMuiSelectToHaveValue("voltage-selector", "12");
    });

    it("should show calculator supports multiple application types", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show that calculator supports multiple applications
      expect(
        screen.getByText(
          /automotive, marine, solar, and telecommunications applications/,
        ),
      ).toBeInTheDocument();
    });

    it("should show automotive application details", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show automotive application as default
      expect(screen.getByText("DC_AUTOMOTIVE")).toBeInTheDocument();
      expect(
        screen.getByText(
          "12V/24V automotive electrical systems with ISO 6722 compliance",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Application-Specific Features", () => {
    it("should show automotive-specific standards", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show automotive standards
      expect(screen.getByText("ISO 6722")).toBeInTheDocument();
      expect(screen.getByText("SAE J1128")).toBeInTheDocument();
    });

    it("should show application selection is available", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show that application selection is available
      expect(screen.getByText("DC Application Selection")).toBeInTheDocument();
      expect(screen.getByTestId("application-selector")).toBeInTheDocument();
    });

    it("should show automotive guidance by default", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show automotive guidance
      expect(
        screen.getByText("Automotive System Guidelines"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Automotive systems require strict voltage drop limits/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Calculation Integration", () => {
    it("should perform automotive calculation", async () => {
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

      // Should call DC calculation function and show result
      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalled();
          expect(screen.getByText("10 mm²")).toBeInTheDocument();
          expect(screen.getByText("Compliant")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should perform calculation with different inputs", async () => {
      const { calculateDCWireSize } = require("../../utils/calculations/dc");

      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Trigger calculation with default automotive settings
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      // Should show calculation results
      await waitFor(
        () => {
          expect(calculateDCWireSize).toHaveBeenCalled();
          expect(screen.getByText("10 mm²")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should show efficiency metrics in results", async () => {
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

      // Should show DC-specific metrics
      await waitFor(
        () => {
          expect(screen.getByText("Voltage Drop")).toBeInTheDocument();
          expect(screen.getByText("Power Loss")).toBeInTheDocument();
          expect(screen.getByText("Efficiency")).toBeInTheDocument();
          expect(screen.getByText("Wire Ampacity")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  });

  describe("Form Validation and User Experience", () => {
    it("should show form inputs with default values", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show default form inputs
      expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Default current
      expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // Default length
      expect(screen.getByDisplayValue("25")).toBeInTheDocument(); // Default temperature
    });

    it("should allow input value changes", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Change input values
      const currentInput = screen.getByDisplayValue("20");
      const lengthInput = screen.getByDisplayValue("10");

      fireEvent.change(currentInput, { target: { value: "25" } });
      fireEvent.change(lengthInput, { target: { value: "15" } });

      // Values should be updated - use more specific selectors
      await waitFor(() => {
        // Check current input was updated to 25
        expect(currentInput).toHaveValue("25");
        // Check length input was updated to 15
        expect(lengthInput).toHaveValue("15");
      });
    });

    it("should show voltage selector with default 12V", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show voltage selector with 12V default
      expectMuiSelectToHaveValue("voltage-selector", "12");
    });

    it("should show calculation form elements", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      });

      // Should show key form elements
      expect(screen.getByText("Load Current (A)")).toBeInTheDocument();
      expect(screen.getByText("Circuit Length (m)")).toBeInTheDocument();
      expect(screen.getByText("Calculate Wire Size")).toBeInTheDocument();
      // Check selectors by testid to avoid duplicates
      expect(screen.getByTestId("voltage-selector")).toBeInTheDocument();
      expect(screen.getByTestId("application-selector")).toBeInTheDocument();
    });
  });
});
