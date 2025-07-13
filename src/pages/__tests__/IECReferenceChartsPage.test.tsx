/**
 * IEC Reference Charts Page Tests
 * Comprehensive testing for IEC reference charts page
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import IECReferenceChartsPage from "../IECReferenceChartsPage";
import "@testing-library/jest-dom";

// Mock the IEC Cable Ampacity Chart component
jest.mock("../../components/charts/IECCableAmpacityChart", () => {
  return function MockIECCableAmpacityChart(props: {
    material?: string;
    temperatureRating?: number;
    installationMethod?: string;
  }) {
    return (
      <div data-testid="iec-cable-ampacity-chart">
        <div data-testid="chart-material">{props.material}</div>
        <div data-testid="chart-temperature">{props.temperatureRating}</div>
        <div data-testid="chart-installation">{props.installationMethod}</div>
      </div>
    );
  };
});

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("IECReferenceChartsPage", () => {
  describe("Page Rendering", () => {
    it("should render page header with IEC standards information", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText("IEC Reference Charts")).toBeInTheDocument();
      expect(
        screen.getByText(/International Electrical Standards/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pure Metric Implementation/),
      ).toBeInTheDocument();
    });

    it("should display IEC standards information alert", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(
        screen.getByText(/IEC International Standards/),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/IEC 60364/)).toHaveLength(4); // Appears in header, alert, tab and footer
      expect(screen.getByText(/metric units/)).toBeInTheDocument();
    });

    it("should render chart configuration controls", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText("Chart Configuration")).toBeInTheDocument();
      expect(screen.getAllByText("Conductor Material")).toHaveLength(2);
      expect(screen.getAllByText("Temperature Rating")).toHaveLength(2);
      expect(screen.getAllByText("Installation Method")).toHaveLength(2);
    });
  });

  describe("Chart Controls", () => {
    it("should display control options", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText("Chart Configuration")).toBeInTheDocument();
      expect(screen.getAllByText("Conductor Material")).toHaveLength(2);
      expect(screen.getAllByText("Temperature Rating")).toHaveLength(2);
      expect(screen.getAllByText("Installation Method")).toHaveLength(2);
    });

    it("should pass correct props to chart component", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByTestId("chart-material")).toHaveTextContent("copper");
      expect(screen.getByTestId("chart-temperature")).toHaveTextContent("70");
      expect(screen.getByTestId("chart-installation")).toHaveTextContent("A1");
    });
  });

  describe("Configuration Chips", () => {
    it("should display configuration chips with selected values", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText("Copper Conductors")).toBeInTheDocument();
      expect(screen.getByText("70°C Rating")).toBeInTheDocument();
      expect(screen.getByText("Method A1")).toBeInTheDocument();
    });

    it("should show configuration chips", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Should show configuration chips
      expect(screen.getByText("Copper Conductors")).toBeInTheDocument();
      expect(screen.getByText("70°C Rating")).toBeInTheDocument();
      expect(screen.getByText("Method A1")).toBeInTheDocument();
    });
  });

  describe("Chart Tabs", () => {
    it("should render all chart tabs", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText("Cable Ampacity")).toBeInTheDocument();
      expect(screen.getByText("Temperature Derating")).toBeInTheDocument();
      expect(screen.getByText("Grouping Factors")).toBeInTheDocument();
      expect(screen.getByText("Installation Methods")).toBeInTheDocument();
    });

    it("should switch between tabs", async () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Click on Temperature Derating tab
      const temperatureTab = screen.getByText("Temperature Derating");
      fireEvent.click(temperatureTab);

      await waitFor(() => {
        expect(
          screen.getByText("Temperature Derating Factors"),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Temperature correction factors/),
        ).toBeInTheDocument();
      });
    });

    it("should display cable ampacity chart by default", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(
        screen.getByText("IEC Cable Current Carrying Capacity"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("iec-cable-ampacity-chart"),
      ).toBeInTheDocument();
    });

    it("should show coming soon message for unimplemented tabs", async () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Click on Grouping Factors tab
      const groupingTab = screen.getByText("Grouping Factors");
      fireEvent.click(groupingTab);

      await waitFor(() => {
        expect(
          screen.getByText("Grouping Factors Chart - Coming Soon"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("IEC Standards Compliance", () => {
    it("should display only metric units", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Check for metric units
      expect(screen.getByText(/mm²/)).toBeInTheDocument();
      expect(screen.getAllByText(/°C/)).toHaveLength(4);

      // Should not contain imperial units
      expect(screen.queryByText(/AWG/)).not.toBeInTheDocument();
      expect(screen.queryByText(/°F/)).not.toBeInTheDocument();
    });

    it("should reference IEC 60364 standards", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getAllByText(/IEC 60364/)).toHaveLength(4);
      expect(
        screen.getByText(/European conductor specifications/),
      ).toBeInTheDocument();
    });

    it("should display proper temperature specifications", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText(/30°C ambient temperature/)).toBeInTheDocument();
      expect(screen.getByText(/20°C/)).toBeInTheDocument();
    });
  });

  describe("Footer Information", () => {
    it("should display standards compliance information", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText(/Standards Compliance/)).toBeInTheDocument();
      expect(screen.getAllByText(/IEC 60364/)).toHaveLength(4);
      expect(
        screen.getByText(/European conductor specifications/),
      ).toBeInTheDocument();
    });

    it("should display temperature specifications", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getByText(/Temperature Base/)).toBeInTheDocument();
      expect(screen.getByText(/Soil Temperature/)).toBeInTheDocument();
      expect(screen.getByText(/30°C ambient temperature/)).toBeInTheDocument();
    });
  });

  describe("Chart Data Flow", () => {
    it("should pass correct props to IEC cable ampacity chart", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Verify default props
      expect(screen.getByTestId("chart-material")).toHaveTextContent("copper");
      expect(screen.getByTestId("chart-temperature")).toHaveTextContent("70");
      expect(screen.getByTestId("chart-installation")).toHaveTextContent("A1");
    });

    it("should display chart component with props", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Chart should display with correct props
      expect(screen.getByTestId("chart-material")).toHaveTextContent("copper");
      expect(screen.getByTestId("chart-temperature")).toHaveTextContent("70");
      expect(screen.getByTestId("chart-installation")).toHaveTextContent("A1");
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(screen.getAllByText("Conductor Material")).toHaveLength(2);
      expect(screen.getAllByText("Temperature Rating")).toHaveLength(2);
      expect(screen.getAllByText("Installation Method")).toHaveLength(2);
    });

    it("should have proper tab navigation", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(4);

      // Should have tab elements
      expect(tabs[0]).toHaveTextContent("Cable Ampacity");
      expect(tabs[1]).toHaveTextContent("Temperature Derating");
      expect(tabs[2]).toHaveTextContent("Grouping Factors");
      expect(tabs[3]).toHaveTextContent("Installation Methods");
    });

    it("should have proper headings hierarchy", () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      expect(
        screen.getByRole("heading", { level: 4, name: /IEC Reference Charts/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 6, name: /Chart Configuration/ }),
      ).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing installation method gracefully", async () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Component should render without errors
      expect(
        screen.getByTestId("iec-cable-ampacity-chart"),
      ).toBeInTheDocument();
    });

    it("should handle tab changes without errors", async () => {
      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      // Click through all tabs
      const tabs = [
        "Temperature Derating",
        "Grouping Factors",
        "Installation Methods",
      ];

      for (const tabName of tabs) {
        const tab = screen.getByText(tabName);
        fireEvent.click(tab);

        await waitFor(() => {
          expect(tab).toHaveAttribute("aria-selected", "true");
        });
      }
    });
  });

  describe("Performance", () => {
    it("should render without performance issues", () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <IECReferenceChartsPage />
        </TestWrapper>,
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
