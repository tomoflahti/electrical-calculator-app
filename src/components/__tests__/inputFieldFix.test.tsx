/**
 * Input Field Fix Verification Tests
 * Simple tests to verify the input field fixes are working
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import UniversalWireCalculator from "../UniversalWireCalculator";
import DCWireCalculator from "../DCWireCalculator";
import "@testing-library/jest-dom";

const theme = createTheme();

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("Input Field Fix Verification", () => {
  describe("Basic Input Field Functionality", () => {
    it("should render UniversalWireCalculator without errors", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Should render main title
      expect(
        screen.getByText("Cable/Wire Size Calculator"),
      ).toBeInTheDocument();

      // Should have input fields with default values
      const inputs = screen.getAllByDisplayValue("20");
      expect(inputs.length).toBeGreaterThan(0);
    });

    it("should render DCWireCalculator without errors", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      // Should render main title
      expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();

      // Should have current input field with default value
      const currentInputs = screen.getAllByDisplayValue("20");
      expect(currentInputs.length).toBeGreaterThan(0);
    });

    it("should handle input changes in UniversalWireCalculator", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Find an input field and change its value
      const firstInput = screen.getAllByDisplayValue("20")[0];

      // Change value to test input handling
      fireEvent.change(firstInput, { target: { value: "25" } });

      // Should update to new value
      expect(firstInput).toHaveValue("25");
    });

    it("should handle input changes in DCWireCalculator", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      // Find current input field
      const currentInput = screen.getByDisplayValue("20");

      // Change value to test input handling
      fireEvent.change(currentInput, { target: { value: "15" } });

      // Should update to new value
      expect(currentInput).toHaveValue("15");
    });

    it("should prevent leading zeros in inputs", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Find an input field
      const firstInput = screen.getAllByDisplayValue("20")[0];

      // Try to enter value with leading zero
      fireEvent.change(firstInput, { target: { value: "025" } });

      // Should remove leading zero
      expect(firstInput).toHaveValue("25");
    });

    it("should handle empty values correctly", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      // Find current input field
      const currentInput = screen.getByDisplayValue("20");

      // Clear the field
      fireEvent.change(currentInput, { target: { value: "" } });

      // Should remain empty (not convert to 0)
      expect(currentInput).toHaveValue("");
    });

    it("should handle decimal values correctly", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Find an input field
      const firstInput = screen.getAllByDisplayValue("20")[0];

      // Enter decimal value
      fireEvent.change(firstInput, { target: { value: "12.5" } });

      // Should accept decimal
      expect(firstInput).toHaveValue("12.5");
    });

    it("should preserve 0.x decimal format", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      // Find current input field
      const currentInput = screen.getByDisplayValue("20");

      // Enter 0.5
      fireEvent.change(currentInput, { target: { value: "0.5" } });

      // Should preserve the leading zero for decimal
      expect(currentInput).toHaveValue("0.5");
    });
  });

  describe("Input Validation", () => {
    it("should have proper input attributes for mobile", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Find text input fields (not selects)
      const textInputs = screen.getAllByRole("textbox");

      // Should have at least some text inputs with proper attributes
      expect(textInputs.length).toBeGreaterThan(0);

      // Check first text input for mobile optimization
      if (textInputs.length > 0) {
        const firstTextInput = textInputs[0];
        expect(firstTextInput).toHaveAttribute("inputmode");
      }
    });

    it("should show helper text for inputs", async () => {
      render(
        <TestWrapper>
          <UniversalWireCalculator selectedStandard="NEC" />
        </TestWrapper>,
      );

      // Should show helper text
      expect(
        screen.getByText("Continuous operating current"),
      ).toBeInTheDocument();
      expect(screen.getByText("One-way distance to load")).toBeInTheDocument();
    });

    it("should show helper text for DC calculator", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator />
        </TestWrapper>,
      );

      // Should show helper text
      expect(
        screen.getByText("Continuous operating current"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("One-way distance to load (metric)"),
      ).toBeInTheDocument();
    });
  });
});
