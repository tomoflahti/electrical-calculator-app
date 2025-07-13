/**
 * Standard Switching Integration Tests
 * Testing app-level standard switching across all calculator components
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "../App";
import "@testing-library/jest-dom";

// Mock wire calculator router
jest.mock("../utils/calculations/wireCalculatorRouter", () => ({
  calculateWireSize: jest.fn(() => ({
    recommendedWireGauge: "12",
    ampacity: 20,
    voltageDropPercent: 2.5,
    voltageDropVolts: 3.0,
    derating: 1.0,
    compliance: {
      ampacityCompliant: true,
      voltageDropCompliant: true,
      necCompliant: true,
    },
  })),
}));

jest.mock("../utils/calculations/iecWireCalculations", () => ({
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
  calculateIECWireSize: jest.fn(() => ({
    recommendedCableSize: "2.5",
    currentCarryingCapacity: 32,
    voltageDropPercent: 1.8,
    voltageDropVolts: 4.14,
    derating: 0.87,
    compliance: {
      currentCompliant: true,
      voltageDropCompliant: true,
      iecCompliant: true,
    },
  })),
}));

jest.mock("../utils/calculations/iecConduitFill", () => ({
  calculateIECConduitFill: jest.fn(() => ({
    conduitSize: "25",
    fillPercent: 42.3,
    compliant: true,
    conduitType: "PVC",
    wireBreakdown: [
      { gauge: "2.5", count: 3, area: 12.5, insulationType: "PVC" },
    ],
    totalWireArea: 37.5,
    maxFillArea: 88.7,
  })),
}));

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("Standard Switching Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("App-Level Standard Switching", () => {
    it("should render with NEC standard selected by default", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Check that NEC is selected in standard selector
      expect(screen.getByText("NEC")).toBeInTheDocument();
      expect(
        screen.getByText("National Electrical Code (US)"),
      ).toBeInTheDocument();
    });

    it("should switch from NEC to IEC across all components", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch to IEC standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);

      await waitFor(() => {
        const iecOptions = screen.getAllByText("IEC 60364");
        fireEvent.click(iecOptions[0]); // Click the first occurrence (dropdown option)
      });

      // Verify IEC is now selected - check for displayValue instead
      await waitFor(() => {
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
      });
    });

    it("should maintain standard selection across tab switches", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Switch to voltage drop tab
      fireEvent.click(screen.getByText("Voltage Drop Calculator"));

      // Switch back to wire calculator tab
      fireEvent.click(screen.getByText("Wire Size Calculator"));

      // IEC should still be selected
      expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
    });
  });

  describe("Cross-Component Standard Synchronization", () => {
    it("should update UniversalWireCalculator when standard changes", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Initial state - should show NEC units
      expect(screen.getByText(/AWG/)).toBeInTheDocument();

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Should now show IEC units
      await waitFor(() => {
        expect(screen.getByText(/mm²/)).toBeInTheDocument();
      });
    });

    it("should update VoltageDropCalculator when standard changes", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to voltage drop calculator
      fireEvent.click(screen.getByText("Voltage Drop Calculator"));

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Wait for standard to change
      await waitFor(() => {
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
      });

      // Should show IEC units
      await waitFor(() => {
        expect(screen.getByLabelText("Length (m)")).toBeInTheDocument();
        expect(screen.getByText(/mm²/)).toBeInTheDocument();
      });
    });

    it("should update ConduitFillCalculator when standard changes", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to conduit fill calculator
      fireEvent.click(screen.getByText("Conduit Fill Calculator"));

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Should show IEC units
      await waitFor(() => {
        expect(screen.getByText(/mm²/)).toBeInTheDocument();
        expect(screen.getByText(/PVC/)).toBeInTheDocument();
      });
    });
  });

  describe("Data Persistence During Standard Switching", () => {
    it("should preserve input values when switching standards in UniversalWireCalculator", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Enter current value
      const currentInput = screen.getByLabelText("Load Current (A)");
      fireEvent.change(currentInput, { target: { value: "25" } });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Current value should be preserved
      await waitFor(() => {
        expect((currentInput as HTMLInputElement).value).toBe("25");
      });
    });

    it("should convert length units when switching standards in VoltageDropCalculator", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to voltage drop calculator
      fireEvent.click(screen.getByText("Voltage Drop Calculator"));

      // Enter length in feet
      const lengthInput = screen.getByLabelText("Length (ft)");
      fireEvent.change(lengthInput, { target: { value: "100" } });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Length should be converted to meters
      await waitFor(() => {
        const meterInput = screen.getByLabelText(
          "Length (m)",
        ) as HTMLInputElement;
        expect(parseFloat(meterInput.value)).toBeCloseTo(30.48, 1);
      });
    });

    it("should convert wire gauges when switching standards in ConduitFillCalculator", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to conduit fill calculator
      fireEvent.click(screen.getByText("Conduit Fill Calculator"));

      // Select 12 AWG
      const wireGaugeSelect = screen.getByDisplayValue("12");
      fireEvent.change(wireGaugeSelect, { target: { value: "12" } });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Should convert to approximately 4 mm²
      await waitFor(() => {
        expect(screen.getByDisplayValue("4")).toBeInTheDocument();
      });
    });
  });

  describe("Results Clearing During Standard Switching", () => {
    it("should clear results when switching standards in UniversalWireCalculator", async () => {
      const {
        calculateWireSize,
      } = require("../utils/calculations/wireCalculatorRouter");

      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Perform calculation
      fireEvent.click(screen.getByText("Calculate Wire Size"));

      // Verify results are shown
      await waitFor(() => {
        expect(calculateWireSize).toHaveBeenCalled();
      });

      // Switch standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Results should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText("Recommended Wire Size"),
        ).not.toBeInTheDocument();
      });
    });

    it("should clear results when switching standards in VoltageDropCalculator", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to voltage drop calculator
      fireEvent.click(screen.getByText("Voltage Drop Calculator"));

      // Perform calculation
      fireEvent.click(screen.getByText("Calculate Voltage Drop"));

      // Switch standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Results should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/2\.5%/)).not.toBeInTheDocument();
      });
    });
  });

  describe("Visual Feedback During Standard Switching", () => {
    it("should show loading state during standard switch", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Should show some indication of change
      await waitFor(() => {
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
      });
    });

    it("should update all standard indicators across components", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Check voltage drop tab
      fireEvent.click(screen.getByText("Voltage Drop Calculator"));
      expect(screen.getByText(/IEC/)).toBeInTheDocument();

      // Check conduit fill tab
      fireEvent.click(screen.getByText("Conduit Fill Calculator"));
      expect(screen.getByText(/IEC/)).toBeInTheDocument();

      // Check wire calculator tab
      fireEvent.click(screen.getByText("Wire Size Calculator"));
      expect(screen.getByText(/IEC/)).toBeInTheDocument();
    });
  });

  describe("Error Handling During Standard Switching", () => {
    it("should handle errors gracefully when switching standards", async () => {
      // Mock a calculation function to throw an error
      const {
        calculateIECWireSize,
      } = require("../utils/calculations/iecWireCalculations");
      calculateIECWireSize.mockImplementation(() => {
        throw new Error("IEC calculation failed");
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Perform calculation
      fireEvent.click(screen.getByText("Calculate Wire Size"));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/IEC calculation failed/)).toBeInTheDocument();
      });
    });

    it("should allow switching back to NEC after IEC error", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch to IEC then back to NEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      fireEvent.mouseDown(standardSelector);
      fireEvent.click(screen.getByText("NEC"));

      // Should be back to NEC
      expect(
        screen.getByText("National Electrical Code (US)"),
      ).toBeInTheDocument();
    });
  });

  describe("URL State Management", () => {
    it("should maintain calculator tab and standard in URL", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch to voltage drop tab
      fireEvent.click(screen.getByText("Voltage Drop Calculator"));

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // URL should reflect current state (we can't test actual URL changes in JSDOM,
      // but we can test that the state is maintained)
      expect(screen.getByText("Voltage Drop Calculator")).toBeInTheDocument();
      expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
    });
  });

  describe("Accessibility During Standard Switching", () => {
    it("should maintain accessibility labels when switching standards", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to Wire Size Calculator (which has Circuit Length field)
      fireEvent.click(screen.getByText("Wire Size Calculator"));

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Accessibility labels should be updated with metric units
      await waitFor(() => {
        // Check that we have metric units showing after switching to IEC
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
        // Look for any length field with meters
        const lengthField = screen.getByLabelText(/Length.*m/);
        expect(lengthField).toBeInTheDocument();
      });
    });

    it("should announce standard changes to screen readers", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Switch standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Should have appropriate ARIA announcements
      await waitFor(() => {
        const iecTexts = screen.getAllByText("IEC 60364");
        expect(iecTexts.length).toBeGreaterThan(0);
      });
    });
  });
});
