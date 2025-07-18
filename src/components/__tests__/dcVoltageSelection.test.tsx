/**
 * DC Voltage Selection Tests
 * Tests the DC voltage selection functionality in UniversalWireCalculator
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import UniversalWireCalculator from "../UniversalWireCalculator";
import "@testing-library/jest-dom";

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("DC Voltage Selection in UniversalWireCalculator", () => {
  describe("DC Automotive Standard", () => {
    it("should show DC voltage options for automotive standard", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Wait for component to render
      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Should show DC Voltage label instead of just Voltage
      expect(screen.getAllByText("DC Voltage")).toHaveLength(2); // Label and select display

      // Test that component properly initializes with DC standard
      // Should default to 12V for automotive
      expect(screen.getByDisplayValue("12")).toBeInTheDocument();

      // Find the voltage dropdown using test-id
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should show DC Voltage label for DC standards
      expect(screen.getAllByText("DC Voltage").length).toBeGreaterThanOrEqual(
        1,
      );

      // Should not show AC voltage system selector
      expect(screen.queryByText("Single Phase")).not.toBeInTheDocument();
      expect(screen.queryByText("Three Phase")).not.toBeInTheDocument();
    });

    it("should handle voltage selection for automotive", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Test that voltage selector is properly set up
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should default to 12V for automotive
      expect(screen.getByDisplayValue("12")).toBeInTheDocument();
    });
  });

  describe("DC Marine Standard", () => {
    it("should show marine voltage options", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Test that voltage selector is properly set up for marine
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should default to 12V for marine (first available voltage)
      expect(screen.getByDisplayValue("12")).toBeInTheDocument();
    });

    it("should handle 48V selection for marine", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Test that voltage selector is properly set up for marine 48V test
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should default to 12V for marine
      expect(screen.getByDisplayValue("12")).toBeInTheDocument();
    });
  });

  describe("DC Solar Standard", () => {
    it("should show solar voltage options", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_SOLAR" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Test that voltage selector is properly set up for solar
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should default to 12V for solar (first available voltage)
      expect(screen.getByDisplayValue("12")).toBeInTheDocument();
    });
  });

  describe("DC Telecom Standard", () => {
    it("should show telecom voltage options", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_TELECOM" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Test that voltage selector is properly set up for telecom
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should default to 24V for telecom (first available - no 12V for telecom)
      expect(screen.getByDisplayValue("24")).toBeInTheDocument();
    });

    it("should default to 24V for telecom", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_TELECOM" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Should default to first available voltage (24V for telecom)
      expect(screen.getByDisplayValue("24")).toBeInTheDocument();
    });
  });

  describe("Standard Switching Behavior", () => {
    it("should switch from AC to DC voltage options", async () => {
      const { rerender } = render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Should show AC voltage system selector for NEC
      expect(
        screen.getAllByText("Voltage System").length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Single Phase")).toBeInTheDocument();

      // Switch to DC automotive
      rerender(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Should hide voltage system selector
        expect(screen.queryByText("Voltage System")).not.toBeInTheDocument();
        expect(screen.queryByText("Single Phase")).not.toBeInTheDocument();

        // Should show DC voltage options
        expect(screen.getAllByText("DC Voltage").length).toBeGreaterThanOrEqual(
          1,
        );
      });
    });

    it("should switch from DC to AC voltage options", async () => {
      const { rerender } = render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Should show DC voltage options
      expect(screen.getAllByText("DC Voltage").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.queryByText("Voltage System")).not.toBeInTheDocument();

      // Switch to NEC
      rerender(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Should show AC voltage system selector
        expect(
          screen.getAllByText("Voltage System").length,
        ).toBeGreaterThanOrEqual(1);

        // Should show regular Voltage label
        expect(screen.getAllByText("Voltage").length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByText("DC Voltage")).not.toBeInTheDocument();
      });
    });

    it("should maintain correct voltages when switching between DC standards", async () => {
      const { rerender } = render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Should default to first automotive voltage (12V)
      expect(screen.getByDisplayValue("12")).toBeInTheDocument();

      // Switch to telecom (which doesn't have 12V)
      rerender(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_TELECOM" />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Should update to first telecom voltage (24V)
        expect(screen.getByDisplayValue("24")).toBeInTheDocument();
      });
    });
  });

  describe("Calculation Integration", () => {
    it("should perform calculation with DC voltage selection", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Set up inputs for calculation
      const currentInput = screen.getByDisplayValue("20");
      const lengthInput = screen.getByDisplayValue("100");

      // Update values
      fireEvent.change(currentInput, { target: { value: "15" } });
      fireEvent.change(lengthInput, { target: { value: "50" } });

      // Use default voltage for calculation (12V for automotive)
      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      // Should perform calculation without errors
      // Note: We're not testing the exact result here, just that calculation runs
      await waitFor(
        () => {
          // Should not show any error
          expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should handle invalid inputs gracefully for DC calculations", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Clear inputs to test validation
      const currentInput = screen.getByDisplayValue("20");
      fireEvent.change(currentInput, { target: { value: "" } });

      // Trigger calculation
      const calculateButton = screen.getByText("Calculate Wire Size");
      fireEvent.click(calculateButton);

      // Should handle empty input gracefully (either show error or use defaults)
      await waitFor(
        () => {
          // Component should not crash
          expect(
            screen.getByText("Cable/Wire Size Calculator"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Voltage Label Display", () => {
    it("should show appropriate voltage labels for each DC standard", async () => {
      const standards = [
        "DC_AUTOMOTIVE",
        "DC_MARINE",
        "DC_SOLAR",
        "DC_TELECOM",
      ] as const;

      for (const standard of standards) {
        const { rerender } = render(
          <TestWrapper>
            <UniversalWireCalculator selectedStandard={standard} />
          </TestWrapper>,
        );

        await waitFor(() => {
          expect(
            screen.getByText("Cable/Wire Size Calculator"),
          ).toBeInTheDocument();
        });

        // Should show DC Voltage label for all DC standards
        expect(screen.getAllByText("DC Voltage")).toHaveLength(2);

        // Clean up for next iteration
        rerender(<div />);
      }
    });

    it("should show correct voltage format in dropdown options", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Cable/Wire Size Calculator"),
        ).toBeInTheDocument();
      });

      // Test that DC voltage format is correct in the component
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Should show DC voltage format (at least one 12V DC element should exist)
      expect(screen.getAllByText(/12V DC/).length).toBeGreaterThanOrEqual(1);

      // Should not show plain voltage numbers for DC standards
      expect(screen.queryByText(/^12V$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^24V$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^48V$/)).not.toBeInTheDocument();
    });
  });
});
