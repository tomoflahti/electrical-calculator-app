import { useState, Suspense, lazy, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";
import Layout from "./components/Layout";
import StandardSelector from "./components/StandardSelector";
import ErrorBoundary from "./components/ErrorBoundary";
import { isDCStandard } from "./standards";
import type { ElectricalStandardId } from "./types/standards";

// Lazy load calculator components for code splitting
const UniversalWireCalculator = lazy(
  () => import("./components/UniversalWireCalculator"),
);
const VoltageDropCalculator = lazy(
  () => import("./components/VoltageDropCalculator"),
);
const ConduitFillCalculator = lazy(
  () => import("./components/ConduitFillCalculator"),
);
const DCWireCalculator = lazy(() => import("./components/DCWireCalculator"));
const DCBreakerCalculator = lazy(
  () => import("./components/DCBreakerCalculator"),
);
const BS7671ReferenceChartsPage = lazy(
  () => import("./pages/BS7671ReferenceChartsPage"),
);

// Preload the most commonly used calculator after initial load
const preloadCalculators = () => {
  // Preload UniversalWireCalculator since it's the default tab
  import("./components/UniversalWireCalculator");
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState("wire-calc");
  const [selectedStandard, setSelectedStandard] =
    useState<ElectricalStandardId>("NEC");

  // Preload critical components after app loads
  useEffect(() => {
    // Delay preloading to not interfere with initial render
    const timer = setTimeout(preloadCalculators, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle standard switching when changing between AC and DC tabs
  useEffect(() => {
    const isACTab = activeTab !== "dc-calc" && activeTab !== "dc-breaker-calc";
    const currentStandardIsDC = isDCStandard(selectedStandard);

    // If we're on an AC tab but have a DC standard selected, switch to default AC standard
    if (isACTab && currentStandardIsDC) {
      setSelectedStandard("NEC");
    }
    // If we're on a DC tab but have an AC standard selected, switch to default DC standard
    else if (!isACTab && !currentStandardIsDC) {
      setSelectedStandard("DC_AUTOMOTIVE");
    }
  }, [activeTab, selectedStandard]);

  const renderActiveComponent = () => {
    const LoadingSpinner = () => (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );

    const wrapWithErrorBoundary = (component: React.ReactNode) => (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>{component}</Suspense>
      </ErrorBoundary>
    );

    switch (activeTab) {
      case "wire-calc":
        return wrapWithErrorBoundary(
          <UniversalWireCalculator selectedStandard={selectedStandard} />,
        );
      case "voltage-drop":
        return wrapWithErrorBoundary(
          <VoltageDropCalculator
            key={selectedStandard}
            selectedStandard={selectedStandard}
          />,
        );
      case "conduit-fill":
        return wrapWithErrorBoundary(
          <ConduitFillCalculator selectedStandard={selectedStandard} />,
        );
      case "dc-calc":
        return wrapWithErrorBoundary(
          <DCWireCalculator selectedStandard={selectedStandard} />,
        );
      case "dc-breaker-calc":
        return wrapWithErrorBoundary(
          <DCBreakerCalculator selectedStandard={selectedStandard} />,
        );
      case "bs7671-ref-charts":
        return wrapWithErrorBoundary(<BS7671ReferenceChartsPage />);
      default:
        return wrapWithErrorBoundary(
          <UniversalWireCalculator selectedStandard={selectedStandard} />,
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <Box>
          {/* Only show StandardSelector for AC calculators */}
          {activeTab !== "dc-calc" &&
            activeTab !== "dc-breaker-calc" &&
            activeTab !== "bs7671-ref-charts" && (
              <StandardSelector
                selectedStandard={selectedStandard}
                onStandardChange={setSelectedStandard}
                calculatorType="ac"
              />
            )}
          {renderActiveComponent()}
        </Box>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
