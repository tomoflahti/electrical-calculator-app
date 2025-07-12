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
  LinearProgress
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { Calculate, CheckCircle, Error as ErrorIcon, Battery4Bar, Speed, TrendingUp } from '@mui/icons-material';
import type { 
  DCApplicationType, 
  ElectricalStandardId, 
  DCCalculationInput, 
  DCCalculationResult 
} from '../types/standards';
import { calculateDCWireSize, validateDCInput } from '../utils/calculations/dc';
import { getDCVoltages } from '../standards';
import DCApplicationSelector from './DCApplicationSelector';

interface DCWireCalculatorProps {
  selectedStandard?: ElectricalStandardId;
}

// Local form state with string inputs for better UX
interface DCFormInputState {
  current: string;
  length: string;
  voltage: string;
  ambientTemperature: string;
}

export default function DCWireCalculator({ selectedStandard = 'DC_AUTOMOTIVE' }: DCWireCalculatorProps) {
  const [selectedApplication, setSelectedApplication] = useState<DCApplicationType>('automotive');
  const [currentStandard, setCurrentStandard] = useState<ElectricalStandardId>(selectedStandard);
  const [selectedWireStandard, setSelectedWireStandard] = useState<'NEC' | 'IEC'>('NEC');
  
  // Get initial voltage from standard to ensure it's valid
  const getInitialVoltage = (standard: ElectricalStandardId) => {
    const availableVoltages = getDCVoltages(standard);
    return availableVoltages.length > 0 ? availableVoltages[0] : 12;
  };

  const initialVoltage = getInitialVoltage(selectedStandard);
  
  const [input, setInput] = useState<DCCalculationInput>({
    current: 20,
    length: 10,
    voltage: initialVoltage,
    voltageSystem: `${initialVoltage}V` as any,
    applicationType: 'automotive',
    conductorMaterial: 'copper',
    ambientTemperature: 25,
    loadType: 'continuous'
  });

  // Form input state for better UX (prevents leading zeros and empty->0 conversion)
  const [formInputs, setFormInputs] = useState<DCFormInputState>({
    current: '20',
    length: '10',
    voltage: String(initialVoltage),
    ambientTemperature: '25'
  });

  const [result, setResult] = useState<DCCalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: keyof DCCalculationInput, value: any) => {
    setInput(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear results when input changes
    setResult(null);
    setError('');
  };

  // Handler for form inputs (prevents leading zeros and handles empty values)
  const handleFormInputChange = (field: keyof DCFormInputState, value: string) => {
    const processedValue = handleNumberInput(value, {
      min: field === 'current' ? 0.1 : field === 'length' ? 1 : 0,
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
    setResult(null);
    setError('');
  };

  const handleStandardChange = (standard: ElectricalStandardId) => {
    setCurrentStandard(standard);
    
    // Update voltage if current voltage not available in new standard
    const newVoltages = getDCVoltages(standard);
    if (newVoltages.length > 0 && !newVoltages.includes(input.voltage)) {
      const newVoltage = newVoltages[0];
      setInput(prev => ({
        ...prev,
        voltage: newVoltage,
        voltageSystem: `${newVoltage}V` as any
      }));
      // Update form state as well
      setFormInputs(prev => ({
        ...prev,
        voltage: String(newVoltage)
      }));
    }
    
    setResult(null);
    setError('');
  };

  const handleWireStandardChange = (wireStandard: 'NEC' | 'IEC') => {
    setSelectedWireStandard(wireStandard);
    // Clear results when wire standard changes
    setResult(null);
    setError('');
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      setError('');
      
      // Convert form inputs to numbers for calculation
      const calculationInput: DCCalculationInput = {
        ...input,
        current: getNumericValue(formInputs.current, 20),
        length: getNumericValue(formInputs.length, 10),
        voltage: getNumericValue(formInputs.voltage, 12),
        ambientTemperature: getNumericValue(formInputs.ambientTemperature, 25),
        wireStandard: selectedWireStandard
      };
      
      // Validate input
      const validationErrors = validateDCInput(calculationInput);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsCalculating(false);
        return;
      }
      
      // Simulate calculation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const calculationResult = calculateDCWireSize(calculationInput);
      setResult(calculationResult);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'DC calculation failed';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Get available voltages for current standard
  const availableVoltages = getDCVoltages(currentStandard);

  // Get efficiency color based on value
  const getEfficiencyColor = (efficiency: number): 'success' | 'warning' | 'error' => {
    if (efficiency >= 95) return 'success';
    if (efficiency >= 90) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        DC Wire Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate wire size for DC electrical systems including automotive, marine, solar, and telecommunications applications.
      </Typography>

      {/* Wire Standard Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Wire Sizing Standard
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 350 }}>
            <InputLabel>Wire Sizing Standard</InputLabel>
            <Select
              value={selectedWireStandard}
              label="Wire Sizing Standard"
              onChange={(e) => handleWireStandardChange(e.target.value as 'NEC' | 'IEC')}
              data-testid="wire-standard-selector"
            >
              <MenuItem value="NEC">NEC (AWG Wire Gauge)</MenuItem>
              <MenuItem value="IEC">IEC (Metric mm² Cross-Section)</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedWireStandard === 'NEC' 
              ? 'American Wire Gauge (AWG) sizing system used in North America'
              : 'Metric cross-sectional area (mm²) sizing system used internationally'
            }
          </Typography>
        </CardContent>
      </Card>

      {/* Application Selector */}
      <DCApplicationSelector
        selectedApplication={selectedApplication}
        onApplicationChange={handleApplicationChange}
        selectedStandard={currentStandard}
        onStandardChange={handleStandardChange}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Circuit Parameters
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Load Current (A)"
                    type="text"
                    value={formInputs.current}
                    onChange={(e) => handleFormInputChange('current', e.target.value)}
                    fullWidth
                    required
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*'
                    }}
                    helperText="Continuous operating current"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={`Circuit Length (${selectedWireStandard === 'NEC' ? 'ft' : 'm'})`}
                    type="text"
                    value={formInputs.length}
                    onChange={(e) => handleFormInputChange('length', e.target.value)}
                    fullWidth
                    required
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*'
                    }}
                    helperText={`One-way distance to load${selectedWireStandard === 'IEC' ? ' (metric)' : ''}`}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>System Voltage</InputLabel>
                    <Select
                      value={input.voltage}
                      label="System Voltage"
                      onChange={(e) => {
                        const voltage = Number(e.target.value);
                        handleInputChange('voltage', voltage);
                        handleInputChange('voltageSystem', `${voltage}V`);
                        // Update form state as well
                        setFormInputs(prev => ({
                          ...prev,
                          voltage: String(voltage)
                        }));
                      }}
                      data-testid="voltage-selector"
                    >
                      {availableVoltages.map(voltage => (
                        <MenuItem key={voltage} value={voltage}>
                          {voltage}V DC
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Conductor Material</InputLabel>
                    <Select
                      value={input.conductorMaterial}
                      label="Conductor Material"
                      onChange={(e) => handleInputChange('conductorMaterial', e.target.value)}
                    >
                      <MenuItem value="copper">Copper</MenuItem>
                      <MenuItem value="aluminum">Aluminum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ambient Temperature (°C)"
                    type="text"
                    value={formInputs.ambientTemperature}
                    onChange={(e) => handleFormInputChange('ambientTemperature', e.target.value)}
                    fullWidth
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9-]*\\.?[0-9]*'
                    }}
                    helperText="Operating environment temperature (-40°C to 150°C)"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Load Type</InputLabel>
                    <Select
                      value={input.loadType}
                      label="Load Type"
                      onChange={(e) => handleInputChange('loadType', e.target.value)}
                    >
                      <MenuItem value="continuous">Continuous (3+ hours)</MenuItem>
                      <MenuItem value="intermittent">Intermittent (&lt;3 hours)</MenuItem>
                    </Select>
                  </FormControl>
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
                    'Calculate Wire Size'
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
                Calculation Results
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
                          {result.recommendedWireGauge} {selectedWireStandard === 'NEC' ? 'AWG' : 'mm²'}
                        </Typography>
                        <Chip
                          icon={result.compliance.ampacityCompliant && result.compliance.voltageDropCompliant ? 
                            <CheckCircle /> : <ErrorIcon />}
                          label={result.compliance.ampacityCompliant && result.compliance.voltageDropCompliant ? 
                            "Compliant" : "Non-Compliant"}
                          color={result.compliance.ampacityCompliant && result.compliance.voltageDropCompliant ? 
                            "success" : "error"}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    
                    {/* Voltage Drop */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Voltage Drop
                        </Typography>
                      </Box>
                      <Typography variant="h6">
                        {result.voltageDropPercent.toFixed(2)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({result.voltageDropVolts.toFixed(2)}V)
                      </Typography>
                    </Grid>
                    
                    {/* Power Loss */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Battery4Bar fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Power Loss
                        </Typography>
                      </Box>
                      <Typography variant="h6">
                        {result.powerLossWatts.toFixed(1)}W
                      </Typography>
                    </Grid>
                    
                    {/* Efficiency */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <TrendingUp fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Efficiency
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">
                          {result.efficiency.toFixed(1)}%
                        </Typography>
                        <Chip
                          label={getEfficiencyColor(result.efficiency).toUpperCase()}
                          color={getEfficiencyColor(result.efficiency)}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    
                    {/* Ampacity */}
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Speed fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Wire Ampacity
                        </Typography>
                      </Box>
                      <Typography variant="h6">
                        {result.ampacity.toFixed(0)}A
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {/* Compliance Details */}
                  <Box mt={3}>
                    <Alert 
                      severity={result.compliance.ampacityCompliant && result.compliance.voltageDropCompliant ? "success" : "warning"}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Compliance Status
                      </Typography>
                      <Typography variant="body2">
                        ✓ Ampacity: {result.compliance.ampacityCompliant ? 'Compliant' : 'Non-Compliant'}<br/>
                        ✓ Voltage Drop: {result.compliance.voltageDropCompliant ? 'Compliant' : 'Non-Compliant'}<br/>
                        ✓ Temperature: {result.compliance.temperatureCompliant ? 'Compliant' : 'Non-Compliant'}<br/>
                        ✓ Application: {result.compliance.applicationCompliant ? 'Compliant' : 'Non-Compliant'}
                      </Typography>
                    </Alert>
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>Correction Factors Applied:</strong><br />
                      • Temperature: {(result.correctionFactors.temperature * 100).toFixed(0)}%<br />
                      • Application safety margin included<br />
                      • {input.conductorMaterial === 'aluminum' ? 'Aluminum resistance correction applied' : 'Standard copper resistance'}
                    </Typography>
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