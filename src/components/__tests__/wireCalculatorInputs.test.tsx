/**
 * Wire Calculator Input Field Tests
 * Tests the input field behavior for wire calculators
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import UniversalWireCalculator from "../UniversalWireCalculator";
import DCWireCalculator from "../DCWireCalculator";
import "@testing-library/jest-dom";

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("Wire Calculator Input Fields", () => {
  describe("UniversalWireCalculator Input Handling", () => {
    it("should render and handle load current input properly", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByText("AC Wire Size Calculator")).toBeInTheDocument();
      });

      // Find the input by its helper text or placeholder
      const currentInput = screen.getByDisplayValue("20"); // Default value is 20
      expect(currentInput).toBeInTheDocument();

      // Clear the field
      fireEvent.change(currentInput, { target: { value: "" } });

      // Should remain empty, not default to 0
      expect(currentInput).toHaveValue("");
    });

    it("should prevent leading zeros in load current field", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Find the actual input element inside the TextField
      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");
      expect(currentInput).toBeInTheDocument();

      // Type value with leading zero
      fireEvent.change(currentInput!, { target: { value: "02" } });

      // Should remove leading zero
      expect(currentInput).toHaveValue("2");
    });

    it("should prevent leading zeros in circuit length field", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Find the actual input element inside the TextField
      const lengthInputField = screen.getByTestId("circuit-length-input");
      const lengthInput = lengthInputField.querySelector("input");
      expect(lengthInput).toBeInTheDocument();

      // Type value with leading zeros
      fireEvent.change(lengthInput!, { target: { value: "0050" } });

      // Should remove leading zeros
      expect(lengthInput).toHaveValue("50");
    });

    it("should allow decimal values in current field", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // Type decimal value
      fireEvent.change(currentInput!, { target: { value: "12.5" } });

      // Should accept decimal
      expect(currentInput).toHaveValue("12.5");
    });

    it("should preserve 0. while typing decimal values", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // Type 0.5
      fireEvent.change(currentInput!, { target: { value: "0.5" } });

      // Should preserve the format
      expect(currentInput).toHaveValue("0.5");
    });

    it("should handle advanced fields correctly", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Show advanced options
      const advancedToggle = screen.getByRole("checkbox", {
        name: /Show Advanced Options/i,
      });
      fireEvent.click(advancedToggle);

      await waitFor(() => {
        expect(
          screen.getByLabelText("Ambient Temperature (°C)"),
        ).toBeInTheDocument();
      });

      const tempInput = screen.getByLabelText("Ambient Temperature (°C)");
      const conductorInput = screen.getByLabelText("Number of Conductors");

      // Test temperature field (should allow decimals)
      fireEvent.change(tempInput, { target: { value: "25.5" } });
      expect(tempInput).toHaveValue("25.5");

      // Test number of conductors (should be integer)
      fireEvent.change(conductorInput, { target: { value: "03" } });
      expect(conductorInput).toHaveValue("3");
    });

    it("should handle empty fields without calculation errors", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");
      const lengthInputField = screen.getByTestId("circuit-length-input");
      const lengthInput = lengthInputField.querySelector("input");
      const calculateButton = screen.getByText("Calculate Wire Size");

      // Clear both fields
      fireEvent.change(currentInput!, { target: { value: "" } });
      fireEvent.change(lengthInput!, { target: { value: "" } });

      // Try to calculate - should handle gracefully
      fireEvent.click(calculateButton);

      // Should either show validation error or use defaults
      // The exact behavior depends on implementation
      expect(currentInput).toHaveValue("");
      expect(lengthInput).toHaveValue("");
    });
  });

  describe("DCWireCalculator Input Handling", () => {
    it("should not default to 0 when current field is cleared", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // Clear the field
      fireEvent.change(currentInput!, { target: { value: "" } });

      // Should remain empty, not default to 0
      expect(currentInput).toHaveValue("");
    });

    it("should prevent leading zeros in DC current field", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // Type value with leading zero
      fireEvent.change(currentInput!, { target: { value: "015" } });

      // Should remove leading zero
      expect(currentInput).toHaveValue("15");
    });

    it("should prevent leading zeros in circuit length field", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const lengthInputField = screen.getByTestId("circuit-length-input");
      const lengthInput = lengthInputField.querySelector("input");

      // Type value with leading zeros
      fireEvent.change(lengthInput!, { target: { value: "0025" } });

      // Should remove leading zeros
      expect(lengthInput).toHaveValue("25");
    });

    it("should handle ambient temperature field correctly", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const tempInputField = screen.getByTestId("ambient-temperature-input");
      const tempInput = tempInputField.querySelector("input");

      // Test positive temperature with leading zero
      fireEvent.change(tempInput!, { target: { value: "035" } });
      expect(tempInput).toHaveValue("35");

      // Test negative temperature
      fireEvent.change(tempInput!, { target: { value: "-10" } });
      expect(tempInput).toHaveValue("-10");

      // Test decimal temperature
      fireEvent.change(tempInput!, { target: { value: "22.5" } });
      expect(tempInput).toHaveValue("22.5");
    });

    it("should handle voltage selection properly", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      // Find voltage selector
      const voltageSelect = screen.getByTestId("voltage-selector");
      expect(voltageSelect).toBeInTheDocument();

      // Voltage selector should be functional
      expect(voltageSelect).not.toBeDisabled();
    });

    it("should handle rapid typing scenarios", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // Simulate rapid typing of "20"
      fireEvent.change(currentInput!, { target: { value: "2" } });
      expect(currentInput).toHaveValue("2");

      fireEvent.change(currentInput!, { target: { value: "20" } });
      expect(currentInput).toHaveValue("20");

      // Simulate backspace and retype
      fireEvent.change(currentInput!, { target: { value: "2" } });
      expect(currentInput).toHaveValue("2");

      fireEvent.change(currentInput!, { target: { value: "25" } });
      expect(currentInput).toHaveValue("25");
    });
  });

  describe("Input Field Validation", () => {
    it("should show helpful text for input fields", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Check for helper text
      expect(
        screen.getByText("Continuous operating current"),
      ).toBeInTheDocument();
      expect(screen.getByText("One-way distance to load")).toBeInTheDocument();
    });

    it("should use appropriate input modes for mobile", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");
      const lengthInputField = screen.getByTestId("circuit-length-input");
      const lengthInput = lengthInputField.querySelector("input");

      // Check input attributes for mobile optimization
      expect(currentInput).toHaveAttribute("inputmode", "decimal");
      expect(lengthInput).toHaveAttribute("inputmode", "decimal");
    });

    it("should handle copy-paste operations correctly", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // Simulate pasting a value with leading zeros
      fireEvent.change(currentInput!, { target: { value: "00123.45" } });

      // Should clean up the pasted value
      expect(currentInput).toHaveValue("123.45");
    });
  });

  describe("Real-World Usage Scenarios", () => {
    it("should handle typical electrical calculation values", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");
      const lengthInputField = screen.getByTestId("circuit-length-input");
      const lengthInput = lengthInputField.querySelector("input");

      // Typical residential circuit: 15A, 50ft
      fireEvent.change(currentInput!, { target: { value: "15" } });
      fireEvent.change(lengthInput!, { target: { value: "50" } });

      expect(currentInput).toHaveValue("15");
      expect(lengthInput).toHaveValue("50");
    });

    it("should handle low voltage DC scenarios", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");
      const lengthInputField = screen.getByTestId("circuit-length-input");
      const lengthInput = lengthInputField.querySelector("input");

      // Typical automotive circuit: 5A, 20ft
      fireEvent.change(currentInput!, { target: { value: "5" } });
      fireEvent.change(lengthInput!, { target: { value: "20" } });

      expect(currentInput).toHaveValue("5");
      expect(lengthInput).toHaveValue("20");
    });

    it("should handle fractional current values", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      const currentInputField = screen.getByTestId("load-current-input");
      const currentInput = currentInputField.querySelector("input");

      // LED lighting scenario: 0.5A
      fireEvent.change(currentInput!, { target: { value: "0.5" } });
      expect(currentInput).toHaveValue("0.5");

      // Small electronic load: 0.125A
      fireEvent.change(currentInput!, { target: { value: "0.125" } });
      expect(currentInput).toHaveValue("0.125");
    });
  });
});
