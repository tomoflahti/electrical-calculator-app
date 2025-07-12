import { useState, Suspense, lazy, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, CircularProgress } from '@mui/material'
import Layout from './components/Layout'
import StandardSelector from './components/StandardSelector'
import ErrorBoundary from './components/ErrorBoundary'
import type { ElectricalStandardId } from './types/standards'

// Lazy load calculator components for code splitting
const UniversalWireCalculator = lazy(() => import('./components/UniversalWireCalculator'))
const VoltageDropCalculator = lazy(() => import('./components/VoltageDropCalculator'))
const ConduitFillCalculator = lazy(() => import('./components/ConduitFillCalculator'))
const DCWireCalculator = lazy(() => import('./components/DCWireCalculator'))
const DCBreakerCalculator = lazy(() => import('./components/DCBreakerCalculator'))
const ReferenceChartsPage = lazy(() => import('./pages/ReferenceChartsPage'))

// Preload the most commonly used calculator after initial load
const preloadCalculators = () => {
  // Preload UniversalWireCalculator since it's the default tab
  import('./components/UniversalWireCalculator')
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('wire-calc')
  const [selectedStandard, setSelectedStandard] = useState<ElectricalStandardId>('NEC')

  // Preload critical components after app loads
  useEffect(() => {
    // Delay preloading to not interfere with initial render
    const timer = setTimeout(preloadCalculators, 100)
    return () => clearTimeout(timer)
  }, [])

  const renderActiveComponent = () => {
    const LoadingSpinner = () => (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )

    const wrapWithErrorBoundary = (component: React.ReactNode) => (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          {component}
        </Suspense>
      </ErrorBoundary>
    )

    switch (activeTab) {
      case 'wire-calc':
        return wrapWithErrorBoundary(
          <UniversalWireCalculator selectedStandard={selectedStandard} />
        )
      case 'voltage-drop':
        return wrapWithErrorBoundary(
          <VoltageDropCalculator selectedStandard={selectedStandard} />
        )
      case 'conduit-fill':
        return wrapWithErrorBoundary(
          <ConduitFillCalculator selectedStandard={selectedStandard} />
        )
      case 'dc-calc':
        return wrapWithErrorBoundary(
          <DCWireCalculator selectedStandard={selectedStandard} />
        )
      case 'dc-breaker-calc':
        return wrapWithErrorBoundary(
          <DCBreakerCalculator selectedStandard={selectedStandard} />
        )
      case 'reference-charts':
        return wrapWithErrorBoundary(
          <ReferenceChartsPage />
        )
      default:
        return wrapWithErrorBoundary(
          <UniversalWireCalculator selectedStandard={selectedStandard} />
        )
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <Box>
          {/* Only show StandardSelector for AC calculators */}
          {activeTab !== 'dc-calc' && activeTab !== 'dc-breaker-calc' && activeTab !== 'reference-charts' && (
            <StandardSelector 
              selectedStandard={selectedStandard} 
              onStandardChange={setSelectedStandard}
            />
          )}
          {renderActiveComponent()}
        </Box>
      </Layout>
    </ThemeProvider>
  )
}

export default App
