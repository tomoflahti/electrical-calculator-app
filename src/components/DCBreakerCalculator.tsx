import { useState } from 'react';
import { handleNumberInput, getNumericValue } from '../utils/inputHelpers';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Calculate, 
  CheckCircle, 
  Error as ErrorIcon, 
  ElectricalServices,
  Security,
  Thermostat
} from '@mui/icons-material';
import type { 
  DCApplicationType, 
  DCBreakerCalculationInput, 
  DCBreakerCalculationResult,
  DCDutyCycle 
} from '../types/standards';
import { calculateDCBreakerSize, validateDCBreakerInput } from '../utils/calculations/dcBreakerRouter';
import DCApplicationSelector from './DCApplicationSelector';

interface DCBreakerCalculatorProps {
  selectedStandard?: string;
}

// Local form state with string inputs for better UX
interface DCBreakerFormInputState {
  loadCurrent: string;
  loadPower: string;
  systemVoltage: string;
  shortCircuitCurrent: string;
  numberOfPanels: string;
  panelIsc: string;
  ambientTemperature: string;
  wireGauge: string;
}

export default function DCBreakerCalculator({ }: DCBreakerCalculatorProps) {
  const [selectedApplication, setSelectedApplication] = useState<DCApplicationType>('automotive');
  const [dutyCycle, setDutyCycle] = useState<DCDutyCycle>('continuous');
  const [continuousOperation, setContinuousOperation] = useState(true);
  const [environment, setEnvironment] = useState<'indoor' | 'outdoor' | 'marine' | 'automotive'>('indoor');
  const [wireStandard, setWireStandard] = useState<'NEC' | 'IEC'>('NEC');
  const [inputMethod, setInputMethod] = useState<'current' | 'power'>('current');
  
  const [input, setInput] = useState<DCBreakerCalculationInput>({
    inputMethod: 'current',
    loadCurrent: 20,
    applicationType: 'automotive',
    dutyCycle: 'continuous',
    ambientTemperature: 25,
    continuousOperation: true,
    environment: 'indoor',
    wireStandard: 'NEC'
  });

  // Form input state for better UX
  const [formInputs, setFormInputs] = useState<DCBreakerFormInputState>({
    loadCurrent: '20',
    loadPower: '240',
    systemVoltage: '12',
    shortCircuitCurrent: '',
    numberOfPanels: '',
    panelIsc: '',
    ambientTemperature: '25',
    wireGauge: ''
  });

  const [result, setResult] = useState<DCBreakerCalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Clear results when input changes
  const clearResults = () => {
    setResult(null);
    setError('');
  };

  // Handler for form inputs (prevents leading zeros and handles empty values)
  const handleFormInputChange = (field: keyof DCBreakerFormInputState, value: string) => {
    const processedValue = handleNumberInput(value, {
      min: 0.1,
      allowDecimals: true,
      allowEmpty: true,
      emptyValue: ''
    });
    
    if (processedValue !== null) {
      setFormInputs(prev => ({
        ...prev,
        [field]: String(processedValue)
      }));
    }
  };

  const handleApplicationChange = (application: DCApplicationType) => {
    setSelectedApplication(application);
    setInput(prev => ({
      ...prev,
      applicationType: application
    }));
    clearResults();
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      setError('');
      
      // Convert form inputs to numbers for calculation
      const calculationInput: DCBreakerCalculationInput = {
        ...input,
        inputMethod,
        loadCurrent: inputMethod === 'current' ? getNumericValue(formInputs.loadCurrent, 20) : undefined,
        loadPower: inputMethod === 'power' ? getNumericValue(formInputs.loadPower, 240) : undefined,
        systemVoltage: inputMethod === 'power' ? getNumericValue(formInputs.systemVoltage, 12) : undefined,
        shortCircuitCurrent: formInputs.shortCircuitCurrent ? 
          getNumericValue(formInputs.shortCircuitCurrent, 0) : undefined,
        numberOfPanels: formInputs.numberOfPanels ? 
          getNumericValue(formInputs.numberOfPanels, 0) : undefined,
        panelIsc: formInputs.panelIsc ? 
          getNumericValue(formInputs.panelIsc, 0) : undefined,
        ambientTemperature: getNumericValue(formInputs.ambientTemperature, 25),
        wireGauge: formInputs.wireGauge || undefined,
        dutyCycle,
        continuousOperation,
        environment,
        wireStandard
      };
      
      // Validate input
      const validationErrors = validateDCBreakerInput(calculationInput);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsCalculating(false);
        return;
      }
      
      // Simulate calculation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const calculationResult = calculateDCBreakerSize(calculationInput);
      setResult(calculationResult);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'DC breaker calculation failed';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Get compliance color
  const getComplianceColor = (compliant: boolean): 'success' | 'error' => {
    return compliant ? 'success' : 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        DC Circuit Breaker Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate circuit breaker sizing for DC electrical systems including automotive, marine, solar, and telecommunications applications with proper standards compliance.
      </Typography>

      {/* Application Selector */}
      <DCApplicationSelector
        selectedApplication={selectedApplication}
        onApplicationChange={handleApplicationChange}
        selectedStandard="DC_AUTOMOTIVE" // Use DC standard
        onStandardChange={() => {}} // Not needed for breaker calc
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Circuit Parameters
              </Typography>
              
              <Grid container spacing={2}>
                {/* Input Method Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Input Method</InputLabel>
                    <Select
                      value={inputMethod}
                      label="Input Method"
                      data-testid="input-method-selector"
                      onChange={(e) => {
                        setInputMethod(e.target.value as 'current' | 'power');
                        clearResults();
                      }}
                    >
                      <MenuItem value="current">Current (A)</MenuItem>
                      <MenuItem value="power">Power (W) + Voltage (V)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Current-based inputs */}
                {inputMethod === 'current' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Load Current (A)"
                      type="text"
                      value={formInputs.loadCurrent}
                      onChange={(e) => handleFormInputChange('loadCurrent', e.target.value)}
                      fullWidth
                      required
                      inputProps={{ 
                        inputMode: 'decimal',
                        pattern: '[0-9]*\\.?[0-9]*'
                      }}
                      helperText="Continuous operating current"
                    />
                  </Grid>
                )}
                
                {/* Power-based inputs */}
                {inputMethod === 'power' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Load Power (W)"
                        type="text"
                        value={formInputs.loadPower}
                        onChange={(e) => handleFormInputChange('loadPower', e.target.value)}
                        fullWidth
                        required
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\\.?[0-9]*'
                        }}
                        helperText="Total power consumption"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="System Voltage (V)"
                        type="text"
                        value={formInputs.systemVoltage}
                        onChange={(e) => handleFormInputChange('systemVoltage', e.target.value)}
                        fullWidth
                        required
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\\.?[0-9]*'
                        }}
                        helperText="DC system voltage"
                      />
                    </Grid>
                  </>
                )}
                
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Duty Cycle</InputLabel>
                    <Select
                      value={dutyCycle}
                      label="Duty Cycle"
                      data-testid="duty-cycle-selector"
                      onChange={(e) => setDutyCycle(e.target.value as DCDutyCycle)}
                    >
                      <MenuItem value="continuous">Continuous (&gt;3 hours)</MenuItem>
                      <MenuItem value="intermittent">Intermittent (&lt;3 hours)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Solar-specific inputs */}
                {selectedApplication === 'solar' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Short Circuit Current (A)"
                        type="text"
                        value={formInputs.shortCircuitCurrent}
                        onChange={(e) => handleFormInputChange('shortCircuitCurrent', e.target.value)}
                        fullWidth
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\\.?[0-9]*'
                        }}
                        helperText="Panel or string ISC"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Number of Panels"
                        type="text"
                        value={formInputs.numberOfPanels}
                        onChange={(e) => handleFormInputChange('numberOfPanels', e.target.value)}
                        fullWidth
                        inputProps={{ 
                          inputMode: 'numeric',
                          pattern: '[0-9]*'
                        }}
                        helperText="Parallel panels"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Panel ISC (A)"
                        type="text"
                        value={formInputs.panelIsc}
                        onChange={(e) => handleFormInputChange('panelIsc', e.target.value)}
                        fullWidth
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\\.?[0-9]*'
                        }}
                        helperText="Individual panel ISC"
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ambient Temperature (°C)"
                    type="text"
                    value={formInputs.ambientTemperature}
                    onChange={(e) => handleFormInputChange('ambientTemperature', e.target.value)}
                    fullWidth
                    data-testid="ambient-temperature-input"
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9-]*\\.?[0-9]*'
                    }}
                    helperText="Operating environment temperature"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Environment</InputLabel>
                    <Select
                      value={environment}
                      label="Environment"
                      data-testid="environment-selector"
                      onChange={(e) => setEnvironment(e.target.value as any)}
                    >
                      <MenuItem value="indoor">Indoor</MenuItem>
                      <MenuItem value="outdoor">Outdoor</MenuItem>
                      <MenuItem value="marine">Marine</MenuItem>
                      <MenuItem value="automotive">Automotive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Wire Gauge (optional)"
                    type="text"
                    value={formInputs.wireGauge}
                    onChange={(e) => setFormInputs(prev => ({ ...prev, wireGauge: e.target.value }))}
                    fullWidth
                    helperText="For compatibility check"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Wire Standard</InputLabel>
                    <Select
                      value={wireStandard}
                      label="Wire Standard"
                      data-testid="wire-standard-selector"
                      onChange={(e) => setWireStandard(e.target.value as 'NEC' | 'IEC')}
                    >
                      <MenuItem value="NEC">NEC (AWG)</MenuItem>
                      <MenuItem value="IEC">IEC (mm²)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={continuousOperation}
                        onChange={(e) => setContinuousOperation(e.target.checked)}
                      />
                    }
                    label="Continuous Operation"
                  />
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={handleCalculate}
                  startIcon={isCalculating ? null : <Calculate />}
                  fullWidth
                  size="large"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress sx={{ width: 100, height: 2 }} />
                      Calculating...
                    </Box>
                  ) : (
                    'Calculate Breaker Size'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Breaker Recommendations
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {result && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h3" color="primary">
                          {result.recommendedBreakerRating}A
                        </Typography>
                        <Chip
                          icon={result.compliance.standardCompliant && result.compliance.wireCompatible ? 
                            <CheckCircle /> : <ErrorIcon />}
                          label={result.compliance.standardCompliant && result.compliance.wireCompatible ? 
                            "Compliant" : "Check Required"}
                          color={result.compliance.standardCompliant && result.compliance.wireCompatible ? 
                            "success" : "warning"}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {result.breakerType.replace('-', ' ').toUpperCase()} • {result.standard}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    
                    {/* Calculation Details */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <ElectricalServices fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Adjusted Current
                        </Typography>
                      </Box>
                      <Typography variant="h6">
                        {result.adjustedCurrent.toFixed(1)}A
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Safety factor: {result.safetyFactor}×
                      </Typography>
                    </Grid>
                    
                    {/* Minimum Size */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Security fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Minimum Size
                        </Typography>
                      </Box>
                      <Typography variant="h6">
                        {result.minimumBreakerSize}A
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Next standard: {result.nextStandardSize}A
                      </Typography>
                    </Grid>
                    
                    {/* Temperature Derating */}
                    {result.temperatureDerating && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Thermostat fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Temperature Derating
                          </Typography>
                        </Box>
                        <Typography variant="h6">
                          {(result.temperatureDerating * 100).toFixed(0)}%
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  {/* Power Analysis (for power-based calculations) */}
                  {result.powerAnalysis && (
                    <Box mt={3}>
                      <Typography variant="h6" gutterBottom>
                        Power Analysis
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Input Power
                          </Typography>
                          <Typography variant="h6">
                            {result.powerAnalysis.inputPower}W
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Calculated Current
                          </Typography>
                          <Typography variant="h6">
                            {result.powerAnalysis.calculatedCurrent.toFixed(1)}A
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            System Voltage
                          </Typography>
                          <Typography variant="h6">
                            {result.powerAnalysis.systemVoltage}V
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Efficiency Factor
                          </Typography>
                          <Typography variant="h6">
                            {(result.powerAnalysis.efficiencyFactor * 100).toFixed(0)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Effective Power
                          </Typography>
                          <Typography variant="h6">
                            {result.powerAnalysis.effectivePower.toFixed(0)}W
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Power Loss
                          </Typography>
                          <Typography variant="h6">
                            {result.powerAnalysis.powerLossWatts.toFixed(1)}W
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Compliance Details */}
                  <Box mt={3}>
                    <Alert 
                      severity={result.compliance.standardCompliant && result.compliance.wireCompatible && 
                               result.compliance.applicationCompliant && result.compliance.temperatureCompliant ? 
                               "success" : "warning"}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Compliance Status
                      </Typography>
                      <Box>
                        <Chip 
                          label="Standard" 
                          color={getComplianceColor(result.compliance.standardCompliant)}
                          size="small" 
                          sx={{ mr: 1, mb: 0.5 }}
                        />
                        <Chip 
                          label="Wire Compatible" 
                          color={getComplianceColor(result.compliance.wireCompatible)}
                          size="small" 
                          sx={{ mr: 1, mb: 0.5 }}
                        />
                        <Chip 
                          label="Application" 
                          color={getComplianceColor(result.compliance.applicationCompliant)}
                          size="small" 
                          sx={{ mr: 1, mb: 0.5 }}
                        />
                        <Chip 
                          label="Temperature" 
                          color={getComplianceColor(result.compliance.temperatureCompliant)}
                          size="small" 
                          sx={{ mb: 0.5 }}
                        />
                      </Box>
                    </Alert>
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>Calculation Method:</strong><br />
                      {result.calculationMethod}
                    </Typography>

                    {/* Breaker Specifications */}
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Primary Recommendation:</strong><br />
                        {result.breakerRecommendations.primary.rating}A {result.breakerRecommendations.primary.type} breaker<br />
                        Voltage Rating: {result.breakerRecommendations.primary.voltage}V DC<br />
                        Standard: {result.breakerRecommendations.primary.standard}<br />
                        {result.breakerRecommendations.primary.continuousDuty ? 'Continuous Duty' : 'Standard Duty'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}