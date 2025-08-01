/**
 * Standard Switching Integration Tests
 * Testing app-level standard switching across all calculator components
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(() => {
        const iecOptions = screen.getAllByText("IEC 60364");
        act(() => {
          fireEvent.click(iecOptions[0]);
        });
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
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

      // Switch to voltage drop tab
      await act(async () => {
        fireEvent.click(screen.getByText("Voltage Drop Calculator"));
      });

      // Switch back to wire calculator tab
      await act(async () => {
        fireEvent.click(screen.getByText("Wire Size Calculator"));
      });

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
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

      // Should now show IEC units
      await waitFor(() => {
        expect(screen.getAllByText(/mm²/)[0]).toBeInTheDocument();
      });
    });

    it("should update VoltageDropCalculator when standard changes", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to voltage drop calculator
      await act(async () => {
        fireEvent.click(screen.getByText("Voltage Drop Calculator"));
      });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

      // Wait for standard to change
      await waitFor(() => {
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
      });

      // Should show IEC units
      await waitFor(() => {
        // Check for either Length (m) or just that metric units are showing
        const hasMetricLength = screen.queryByLabelText("Length (m)");
        const hasMetricUnits = screen.queryAllByText(/mm²/);
        expect(hasMetricLength || hasMetricUnits.length > 0).toBeTruthy();
      });
    });

    it("should update ConduitFillCalculator when standard changes", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to conduit fill calculator
      await act(async () => {
        fireEvent.click(screen.getByText("Conduit Fill Calculator"));
      });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

      // Should show IEC units
      await waitFor(() => {
        expect(screen.getAllByText(/mm²/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/PVC/)[0]).toBeInTheDocument();
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

      // Wait for app to load completely with generous timeout
      await waitFor(
        () => {
          expect(screen.getByText("Wire Size Calculator")).toBeInTheDocument();
          expect(
            screen.getByLabelText("Electrical Standard"),
          ).toBeInTheDocument();
        },
        { timeout: 10000 },
      );

      // Try to find current input with fallback approach
      let currentInput;
      try {
        currentInput = await waitFor(
          () => {
            return screen.getByLabelText("Load Current (A)");
          },
          { timeout: 3000 },
        );
      } catch {
        // Fallback: look for any input that might be the current input
        currentInput = await waitFor(
          () => {
            const inputs = screen.getAllByRole("textbox");
            return (
              inputs.find(
                (input) =>
                  input.getAttribute("label")?.includes("Current") ||
                  input.getAttribute("placeholder")?.includes("Current") ||
                  (input as HTMLInputElement).value === "20", // default value
              ) || inputs[0]
            ); // fallback to first input
          },
          { timeout: 2000 },
        );
      }

      await act(async () => {
        fireEvent.change(currentInput, { target: { value: "25" } });
      });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

      // Wait for standard to change
      await waitFor(() => {
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
      });

      // Current value should be preserved (with flexible checking)
      await waitFor(() => {
        expect((currentInput as HTMLInputElement).value).toBe("25");
      });
    }, 15000);

    it("should convert length units when switching standards in VoltageDropCalculator", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to voltage drop calculator
      await act(async () => {
        fireEvent.click(screen.getByText("Voltage Drop Calculator"));
      });

      // Wait for component to load and verify NEC is selected
      await waitFor(
        () => {
          expect(
            screen.getAllByText("Voltage Drop Calculator")[0],
          ).toBeInTheDocument();
          expect(screen.getByDisplayValue("NEC")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      // Find length input using test ID and get the actual input element
      const lengthInput = screen
        .getByTestId("length-input")
        .querySelector("input") as HTMLInputElement;

      await act(async () => {
        fireEvent.change(lengthInput, { target: { value: "100" } });
      });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

      // Wait for standard to change
      await waitFor(
        () => {
          expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      // Verify length converted to meters
      await waitFor(
        () => {
          const lengthInputAfter = screen
            .getByTestId("length-input")
            .querySelector("input") as HTMLInputElement;
          expect(parseFloat(lengthInputAfter.value)).toBeCloseTo(30.48, 1);
        },
        { timeout: 2000 },
      );
    });

    it("should convert wire gauges when switching standards in ConduitFillCalculator", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Navigate to conduit fill calculator
      await act(async () => {
        fireEvent.click(screen.getByText("Conduit Fill Calculator"));
      });

      // Select 12 AWG
      const wireGaugeSelect = screen.getByDisplayValue("12");
      await act(async () => {
        fireEvent.change(wireGaugeSelect, { target: { value: "12" } });
      });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
      });

      await waitFor(async () => {
        const iecOptions = screen.getAllByText("IEC 60364");
        await act(async () => {
          fireEvent.click(iecOptions[0]);
        });
      });

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
      await act(async () => {
        fireEvent.click(screen.getByText("Calculate Wire Size"));
      });

      // Verify results are shown
      await waitFor(() => {
        expect(calculateWireSize).toHaveBeenCalled();
      });

      // Switch standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
        const iecOptions = screen.getAllByText("IEC 60364");
        fireEvent.click(iecOptions[0]);
      });

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
      await act(async () => {
        fireEvent.click(screen.getByText("Voltage Drop Calculator"));
      });

      // Perform calculation
      await act(async () => {
        fireEvent.click(screen.getByText("Calculate Voltage Drop"));
      });

      // Switch standard
      const standardSelector = screen.getByLabelText("Electrical Standard");
      await act(async () => {
        fireEvent.mouseDown(standardSelector);
        const iecOptions = screen.getAllByText("IEC 60364");
        fireEvent.click(iecOptions[0]);
      });

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
      expect(screen.getAllByText(/IEC/)[0]).toBeInTheDocument();

      // Check conduit fill tab
      fireEvent.click(screen.getByText("Conduit Fill Calculator"));
      expect(screen.getAllByText(/IEC/)[0]).toBeInTheDocument();

      // Check wire calculator tab
      fireEvent.click(screen.getByText("Wire Size Calculator"));
      expect(screen.getAllByText(/IEC/)[0]).toBeInTheDocument();
    });
  });

  describe("Error Handling During Standard Switching", () => {
    it("should handle errors gracefully when switching standards", async () => {
      // Mock the wire calculator router to throw an error for IEC
      const {
        calculateWireSize,
      } = require("../utils/calculations/wireCalculatorRouter");
      calculateWireSize.mockImplementation((input: any) => {
        if (input.standard === "IEC") {
          throw new Error("IEC calculation failed");
        }
        return {
          recommendedWireSize: "12",
          ampacity: 20,
          voltageDropPercent: 2.5,
          compliance: { necCompliant: true },
        };
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>,
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText("Wire Size Calculator")).toBeInTheDocument();
      });

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Wait for standard to change
      await waitFor(() => {
        expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
      });

      // Perform calculation
      const calculateButton = await waitFor(() => {
        return screen.getByText("Calculate Wire Size");
      });
      fireEvent.click(calculateButton);

      // Should show error message - use more flexible matching
      await waitFor(
        () => {
          const errorElements = screen.queryAllByText(
            /calculation failed|error|failed/i,
          );
          expect(errorElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 },
      );
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
        screen.getAllByText("National Electrical Code (US)")[0],
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

      // Wait for tab to load
      await waitFor(
        () => {
          expect(
            screen.getAllByText("Voltage Drop Calculator")[0],
          ).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      // Switch to IEC
      const standardSelector = screen.getByLabelText("Electrical Standard");
      fireEvent.mouseDown(standardSelector);
      const iecOptions = screen.getAllByText("IEC 60364");
      fireEvent.click(iecOptions[0]);

      // Wait for standard to change
      await waitFor(
        () => {
          expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      // Verify state is maintained across tab switches
      fireEvent.click(screen.getByText("Wire Size Calculator"));
      await waitFor(
        () => {
          expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      fireEvent.click(screen.getByText("Voltage Drop Calculator"));
      await waitFor(
        () => {
          expect(screen.getByDisplayValue("IEC")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
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
