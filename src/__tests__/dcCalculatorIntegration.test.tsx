import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DCWireCalculator from "../components/DCWireCalculator";
import DCApplicationSelector from "../components/DCApplicationSelector";

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("DC Calculator Integration Tests", () => {
  describe("DCWireCalculator Component", () => {
    it("should render with default automotive configuration", () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      expect(screen.getByText("DC Wire Calculator")).toBeInTheDocument();
      expect(
        screen.getByText(/automotive.*electrical systems/i),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("12")).toBeInTheDocument(); // Default 12V
      expect(screen.getByDisplayValue("20")).toBeInTheDocument(); // Default 20A current
    });

    it("should perform automotive calculation and show results", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Fill in inputs for automotive calculation
      const currentInput = screen.getByLabelText(/load current/i);
      const lengthInput = screen.getByLabelText(/circuit length/i);

      fireEvent.change(currentInput, { target: { value: "25" } });
      fireEvent.change(lengthInput, { target: { value: "10" } });

      // Click calculate
      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      // Wait for calculation to complete
      await waitFor(() => {
        expect(screen.getByText(/AWG/)).toBeInTheDocument();
      });

      // Verify automotive-specific compliance
      const complianceSection = screen.getByText(/compliance status/i);
      expect(complianceSection).toBeInTheDocument();

      // Should show efficiency percentage
      expect(screen.getByText(/efficiency/i)).toBeInTheDocument();
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it("should validate input and show errors", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Set invalid current (negative)
      const currentInput = screen.getByLabelText(/load current/i);
      fireEvent.change(currentInput, { target: { value: "-5" } });

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        expect(
          screen.getByText(/current must be greater than 0/i),
        ).toBeInTheDocument();
      });
    });

    it("should switch between different DC applications", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      // Should show marine-specific content
      expect(screen.getByText(/marine.*systems/i)).toBeInTheDocument();

      // Check for marine voltage options (12V, 24V, 48V)
      const voltageSelect = screen.getByLabelText(/system voltage/i);
      fireEvent.mouseDown(voltageSelect);

      await waitFor(() => {
        expect(screen.getByText("12V DC")).toBeInTheDocument();
        expect(screen.getByText("24V DC")).toBeInTheDocument();
        expect(screen.getByText("48V DC")).toBeInTheDocument();
      });
    });

    it("should handle high temperature automotive environment", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Set high temperature (engine compartment)
      const tempInput = screen.getByLabelText(/ambient temperature/i);
      fireEvent.change(tempInput, { target: { value: "100" } });

      // Set high current
      const currentInput = screen.getByLabelText(/load current/i);
      fireEvent.change(currentInput, { target: { value: "40" } });

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Should show temperature correction in results
        expect(
          screen.getByText(/temperature.*correction/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("DCApplicationSelector Component", () => {
    const mockOnApplicationChange = jest.fn();
    const mockOnStandardChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should render all DC application options", () => {
      render(
        <TestWrapper>
          <DCApplicationSelector
            selectedApplication="automotive"
            onApplicationChange={mockOnApplicationChange}
            selectedStandard="DC_AUTOMOTIVE"
            onStandardChange={mockOnStandardChange}
          />
        </TestWrapper>,
      );

      expect(screen.getByText("DC Application Selection")).toBeInTheDocument();

      const applicationSelect = screen.getByLabelText(/dc application type/i);
      fireEvent.mouseDown(applicationSelect);

      // Check all applications are present
      expect(screen.getByText("Automotive")).toBeInTheDocument();
      expect(screen.getByText("Marine")).toBeInTheDocument();
      expect(screen.getByText("Solar/Renewable")).toBeInTheDocument();
      expect(screen.getByText("Telecommunications")).toBeInTheDocument();
      expect(screen.getByText("Battery Systems")).toBeInTheDocument();
      expect(screen.getByText("LED Lighting")).toBeInTheDocument();
    });

    it("should show application-specific information", () => {
      render(
        <TestWrapper>
          <DCApplicationSelector
            selectedApplication="solar"
            onApplicationChange={mockOnApplicationChange}
            selectedStandard="DC_SOLAR"
            onStandardChange={mockOnStandardChange}
          />
        </TestWrapper>,
      );

      // Should show solar-specific content
      expect(screen.getByText(/solar.*renewable energy/i)).toBeInTheDocument();
      expect(screen.getByText(/DC_SOLAR/)).toBeInTheDocument();
      expect(screen.getByText(/efficiency.*optimization/i)).toBeInTheDocument();
    });

    it("should change standard when application changes", () => {
      render(
        <TestWrapper>
          <DCApplicationSelector
            selectedApplication="automotive"
            onApplicationChange={mockOnApplicationChange}
            selectedStandard="DC_AUTOMOTIVE"
            onStandardChange={mockOnStandardChange}
          />
        </TestWrapper>,
      );

      const applicationSelect = screen.getByLabelText(/dc application type/i);
      fireEvent.mouseDown(applicationSelect);

      const marineOption = screen.getByText("Marine");
      fireEvent.click(marineOption);

      expect(mockOnApplicationChange).toHaveBeenCalledWith("marine");
    });

    it("should display voltage and temperature ranges", () => {
      render(
        <TestWrapper>
          <DCApplicationSelector
            selectedApplication="telecom"
            onApplicationChange={mockOnApplicationChange}
            selectedStandard="DC_TELECOM"
            onStandardChange={mockOnStandardChange}
          />
        </TestWrapper>,
      );

      // Should show telecom voltage range (24V, 48V)
      expect(screen.getByText(/24.*48.*V/)).toBeInTheDocument();
      // Should show voltage drop limit
      expect(screen.getByText(/Voltage Drop.*1%/)).toBeInTheDocument();
      // Should show temperature range
      expect(screen.getByText(/Temp.*0.*50/)).toBeInTheDocument();
    });

    it("should show applicable standards for each application", () => {
      render(
        <TestWrapper>
          <DCApplicationSelector
            selectedApplication="automotive"
            onApplicationChange={mockOnApplicationChange}
            selectedStandard="DC_AUTOMOTIVE"
            onStandardChange={mockOnStandardChange}
          />
        </TestWrapper>,
      );

      // Should show automotive standards
      expect(screen.getByText("ISO 6722")).toBeInTheDocument();
      expect(screen.getByText("SAE J1128")).toBeInTheDocument();
    });
  });

  describe("Application Switching Integration", () => {
    it("should handle switching from automotive to marine application", async () => {
      const { rerender } = render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Initial automotive state
      expect(screen.getByText(/automotive.*systems/i)).toBeInTheDocument();

      // Switch to marine
      rerender(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      // Should show marine content
      expect(screen.getByText(/marine.*systems/i)).toBeInTheDocument();
      expect(screen.getByText(/ABYC.*standards/i)).toBeInTheDocument();
    });

    it("should handle switching from 12V to 48V system", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_TELECOM" />
        </TestWrapper>,
      );

      // Should default to 24V or 48V for telecom
      const voltageSelect = screen.getByLabelText(/system voltage/i);
      fireEvent.mouseDown(voltageSelect);

      await waitFor(() => {
        expect(screen.getByText("24V DC")).toBeInTheDocument();
        expect(screen.getByText("48V DC")).toBeInTheDocument();
        // Should NOT show 12V for telecom
        expect(screen.queryByText("12V DC")).not.toBeInTheDocument();
      });
    });

    it("should preserve input values during application switch", async () => {
      const { rerender } = render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Set specific inputs
      const currentInput = screen.getByLabelText(/load current/i);
      fireEvent.change(currentInput, { target: { value: "30" } });

      // Switch application but current should remain
      rerender(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      // Current should be preserved
      expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle very high current requirements", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_SOLAR" />
        </TestWrapper>,
      );

      // Set very high current (solar array)
      const currentInput = screen.getByLabelText(/load current/i);
      fireEvent.change(currentInput, { target: { value: "200" } });

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Should either show a valid result or appropriate error
        const hasResult = screen.queryByText(/AWG/);
        const hasError = screen.queryByText(/no.*wire.*size.*found/i);
        expect(hasResult || hasError).toBeTruthy();
      });
    });

    it("should handle extreme temperatures", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_AUTOMOTIVE" />
        </TestWrapper>,
      );

      // Set extreme cold temperature
      const tempInput = screen.getByLabelText(/ambient temperature/i);
      fireEvent.change(tempInput, { target: { value: "-30" } });

      const currentInput = screen.getByLabelText(/load current/i);
      fireEvent.change(currentInput, { target: { value: "15" } });

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Should handle extreme temperature with appropriate correction
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });

    it("should handle very long cable runs", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_TELECOM" />
        </TestWrapper>,
      );

      // Set very long cable run
      const lengthInput = screen.getByLabelText(/circuit length/i);
      fireEvent.change(lengthInput, { target: { value: "500" } });

      const currentInput = screen.getByLabelText(/load current/i);
      fireEvent.change(currentInput, { target: { value: "10" } });

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Should recommend larger wire for long runs
        const result = screen.queryByText(/AWG/);
        expect(result).toBeInTheDocument();
      });
    });
  });

  describe("Real-world Integration Scenarios", () => {
    it("should handle RV electrical system (automotive + solar)", async () => {
      // Test solar charging for RV batteries
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_SOLAR" />
        </TestWrapper>,
      );

      // Solar panel to charge controller
      fireEvent.change(screen.getByLabelText(/load current/i), {
        target: { value: "30" },
      });
      fireEvent.change(screen.getByLabelText(/circuit length/i), {
        target: { value: "20" },
      });

      // Set voltage to 12V (RV system)
      const voltageSelect = screen.getByLabelText(/system voltage/i);
      fireEvent.mouseDown(voltageSelect);
      fireEvent.click(screen.getByText("12V DC"));

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Should optimize for efficiency (solar)
        expect(screen.getByText(/efficiency/i)).toBeInTheDocument();
        expect(screen.getByText(/AWG/)).toBeInTheDocument();
      });
    });

    it("should handle marine navigation equipment", async () => {
      render(
        <TestWrapper>
          <DCWireCalculator selectedStandard="DC_MARINE" />
        </TestWrapper>,
      );

      // Low current navigation lights with long cable run
      fireEvent.change(screen.getByLabelText(/load current/i), {
        target: { value: "2" },
      });
      fireEvent.change(screen.getByLabelText(/circuit length/i), {
        target: { value: "80" },
      });
      fireEvent.change(screen.getByLabelText(/ambient temperature/i), {
        target: { value: "5" },
      });

      const calculateButton = screen.getByRole("button", {
        name: /calculate wire size/i,
      });
      fireEvent.click(calculateButton);

      await waitFor(() => {
        // Should meet ABYC standards
        expect(screen.getByText(/compliance status/i)).toBeInTheDocument();
        expect(screen.getAllByText(/AWG/)[0]).toBeInTheDocument();
      });
    });
  });
});
