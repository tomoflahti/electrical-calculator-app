import { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  GridLegacy as Grid
} from '@mui/material';
import { Calculate, CheckCircle, Error } from '@mui/icons-material';
import { calculateWireSize, type WireCalculationInput as RouterWireInput, type WireCalculationResult as RouterWireResult } from '../utils/calculations/wireCalculatorRouter';
import { getVoltageOptions, getInstallationMethods, formatWireSize } from '../utils/conversions';
import { isDCStandard } from '../standards';
import type { ElectricalStandardId, CableCalculationInput, CableCalculationResult, DCCalculationResult, DCVoltageSystem, DCApplicationType } from '../types/standards';
import type { WireCalculationResult } from '../types';

interface UniversalWireCalculatorProps {
  selectedStandard: ElectricalStandardId;
}

// Local form state with string inputs for better UX
interface FormInputState {
  loadCurrent: string;
  circuitLength: string;
  ambientTemperature: string;
  numberOfConductors: string;
  powerFactor: string;
}

export default function UniversalWireCalculator({ selectedStandard }: UniversalWireCalculatorProps) {
  const [input, setInput] = useState<CableCalculationInput>({
    standard: selectedStandard,
    loadCurrent: 20,
    circuitLength: 100,
    voltage: selectedStandard === 'NEC' ? 120 : 230,
    voltageSystem: 'single',
    installationMethod: selectedStandard === 'NEC' ? 'conduit' : 'A1',
    conductorMaterial: 'copper',
    ambientTemperature: 30,
    numberOfConductors: 3,
    powerFactor: 0.8
  });

  // Form input state for better UX (prevents leading zeros and empty->0 conversion)
  const [formInputs, setFormInputs] = useState<FormInputState>({
    loadCurrent: '20',
    circuitLength: '100',
    ambientTemperature: '30',
    numberOfConductors: '3',
    powerFactor: '0.8'
  });

  const [result, setResult] = useState<CableCalculationResult | WireCalculationResult | DCCalculationResult | RouterWireResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const voltageOptions = getVoltageOptions(selectedStandard);
  const installationMethods = getInstallationMethods(selectedStandard);
  const isCurrentStandardDC = isDCStandard(selectedStandard);

  // Update input when standard changes
  useEffect(() => {
    const voltageOpts = getVoltageOptions(selectedStandard);
    const isDC = isDCStandard(selectedStandard);
    
    let defaultVoltage: number;
    let defaultVoltageSystem: 'single' | 'three-phase' | 'dc';
    
    if (isDC) {
      // Use first available DC voltage
      defaultVoltage = voltageOpts.dc?.[0] || 12;
      defaultVoltageSystem = 'dc';
    } else {
      // Use AC logic
      defaultVoltage = input.voltageSystem === 'single' ? voltageOpts.single[0] : voltageOpts.threephase[0];
      defaultVoltageSystem = input.voltageSystem;
    }
    
    setInput(prev => ({
      ...prev,
      standard: selectedStandard,
      voltage: defaultVoltage,
      voltageSystem: defaultVoltageSystem as 'single' | 'three-phase',
      installationMethod: selectedStandard === 'NEC' ? 'conduit' : 'A1'
    }));
  }, [selectedStandard, input.voltageSystem]);

  const handleCalculate = () => {
    try {
      setError('');
      
      // Create unified router input from form data
      const routerInput: RouterWireInput = {
        standard: selectedStandard,
        loadCurrent: getNumericValue(formInputs.loadCurrent, 20),
        circuitLength: getNumericValue(formInputs.circuitLength, 100),
        voltage: input.voltage,
        voltageSystem: input.voltageSystem,
        installationMethod: input.installationMethod,
        conductorMaterial: input.conductorMaterial,
        ambientTemperature: getNumericValue(formInputs.ambientTemperature, 30),
        numberOfConductors: getNumericValue(formInputs.numberOfConductors, 3),
        powerFactor: getNumericValue(formInputs.powerFactor, 0.8),
        
        // DC-specific fields (if applicable)
        ...(isCurrentStandardDC && {
          dcVoltageSystem: `${input.voltage}V` as DCVoltageSystem,
          dcApplicationType: selectedStandard.replace('DC_', '').toLowerCase() as DCApplicationType,
          loadType: 'continuous',
          allowableVoltageDropPercent: 2
        }),
        
        // AC-specific fields (if applicable)
        ...(!isCurrentStandardDC && {
          temperatureRating: 75 as 60 | 75 | 90,
          includeNECMultiplier: selectedStandard === 'NEC',
          calculateDerating: true,
          strictCompliance: true
        })
      };
      
      // Use unified router for all calculations
      const calculationResult = calculateWireSize(routerInput);
      setResult(calculationResult);
      
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Calculation failed';
      setError(errorMessage);
      setResult(null);
    }
  };

  const handleInputChange = (field: keyof CableCalculationInput, value: string | number) => {
    setInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler for form inputs (prevents leading zeros and handles empty values)
  const handleFormInputChange = (field: keyof FormInputState, value: string) => {
    const processedValue = handleNumberInput(value, {
      min: field === 'loadCurrent' ? 0.1 : field === 'circuitLength' ? 1 : 0,
      allowDecimals: field !== 'numberOfConductors',
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

  const isEuropeanStandard = selectedStandard === 'IEC' || selectedStandard === 'BS7671';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cable/Wire Size Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate required cable size based on {selectedStandard} standards with proper current capacity and voltage drop considerations.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Input Parameters
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Load Current (A)"
                    type="text"
                    value={formInputs.loadCurrent}
                    onChange={(e) => handleFormInputChange('loadCurrent', e.target.value)}
                    fullWidth
                    required
                    data-testid="load-current-input"
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*'
                    }}
                    helperText="Continuous operating current"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={`Circuit Length (${selectedStandard === 'NEC' ? 'ft' : 'm'})`}
                    type="text"
                    value={formInputs.circuitLength}
                    onChange={(e) => handleFormInputChange('circuitLength', e.target.value)}
                    fullWidth
                    required
                    data-testid="circuit-length-input"
                    inputProps={{ 
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*'
                    }}
                    helperText="One-way distance to load"
                  />
                </Grid>
                
                {!isCurrentStandardDC && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Voltage System</InputLabel>
                      <Select
                        value={input.voltageSystem}
                        label="Voltage System"
                        onChange={(e) => {
                          const newVoltageSystem = e.target.value as 'single' | 'three-phase';
                          const voltageOpts = getVoltageOptions(selectedStandard);
                          handleInputChange('voltageSystem', newVoltageSystem);
                          handleInputChange('voltage', newVoltageSystem === 'single' ? voltageOpts.single[0] : voltageOpts.threephase[0]);
                        }}
                      >
                        <MenuItem value="single">Single Phase</MenuItem>
                        <MenuItem value="three-phase">Three Phase</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{isCurrentStandardDC ? 'DC Voltage' : 'Voltage'}</InputLabel>
                    <Select
                      value={input.voltage}
                      label={isCurrentStandardDC ? 'DC Voltage' : 'Voltage'}
                      onChange={(e) => handleInputChange('voltage', Number(e.target.value))}
                    >
                      {isCurrentStandardDC ? (
                        // Show DC voltage options
                        (voltageOptions.dc || []).map(v => (
                          <MenuItem key={v} value={v}>{v}V DC</MenuItem>
                        ))
                      ) : (
                        // Show AC voltage options
                        (input.voltageSystem === 'single' ? voltageOptions.single : voltageOptions.threephase).map(v => (
                          <MenuItem key={v} value={v}>{v}V</MenuItem>
                        ))
                      )}
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
                  <FormControl fullWidth>
                    <InputLabel>Installation Method</InputLabel>
                    <Select
                      value={input.installationMethod}
                      label="Installation Method"
                      onChange={(e) => handleInputChange('installationMethod', e.target.value)}
                    >
                      {installationMethods.map(method => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAdvanced}
                        onChange={(e) => setShowAdvanced(e.target.checked)}
                      />
                    }
                    label="Show Advanced Options"
                  />
                </Grid>

                {showAdvanced && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Ambient Temperature (°C)"
                        type="text"
                        value={formInputs.ambientTemperature}
                        onChange={(e) => handleFormInputChange('ambientTemperature', e.target.value)}
                        fullWidth
                        inputProps={{ 
                          inputMode: 'decimal',
                          pattern: '[0-9]*\\.?[0-9]*'
                        }}
                        helperText="Operating environment temperature"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Number of Conductors"
                        type="text"
                        value={formInputs.numberOfConductors}
                        onChange={(e) => handleFormInputChange('numberOfConductors', e.target.value)}
                        fullWidth
                        inputProps={{ 
                          inputMode: 'numeric',
                          pattern: '[0-9]*'
                        }}
                        helperText="Total conductors in conduit/cable"
                      />
                    </Grid>

                    {isEuropeanStandard && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Power Factor"
                          type="text"
                          value={formInputs.powerFactor}
                          onChange={(e) => handleFormInputChange('powerFactor', e.target.value)}
                          fullWidth
                          inputProps={{ 
                            inputMode: 'decimal',
                            pattern: '[0-9]*\\.?[0-9]*'
                          }}
                          helperText="Range: 0.1 to 1.0"
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={handleCalculate}
                  startIcon={<Calculate />}
                  fullWidth
                  size="large"
                >
                  Calculate Cable Size
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
                        <Typography variant="h4" color="primary">
                          {formatWireSize(
                            'recommendedWireSize' in result 
                              ? result.recommendedWireSize  // Router result format
                              : 'recommendedWireGauge' in result 
                                ? result.recommendedWireGauge  // DC result format
                                : result.recommendedCableSize, // IEC result format
                            selectedStandard
                          )}
                        </Typography>
                        <Chip
                          icon={(() => {
                            if (!result.compliance) return <Error />;
                            
                            // Check if this is a router result with standardized compliance
                            if ('standardCompliant' in result.compliance) {
                              return result.compliance.standardCompliant ? <CheckCircle /> : <Error />;
                            }
                            
                            // Legacy result formats
                            if ('necCompliant' in result.compliance) return result.compliance.necCompliant ? <CheckCircle /> : <Error />;
                            if ('ampacityCompliant' in result.compliance) {
                              // DC compliance - check if all requirements are met
                              const dcCompliance = result.compliance;
                              const isCompliant = dcCompliance.ampacityCompliant && dcCompliance.voltageDropCompliant && 
                                                 dcCompliance.temperatureCompliant && dcCompliance.applicationCompliant;
                              return isCompliant ? <CheckCircle /> : <Error />;
                            }
                            return <Error />;
                          })()}
                          label={(() => {
                            if (!result.compliance) return "Non-Compliant";
                            
                            // Check if this is a router result with standardized compliance
                            if ('standardCompliant' in result.compliance) {
                              return result.compliance.standardCompliant ? "Standard Compliant" : "Non-Compliant";
                            }
                            
                            // Legacy result formats
                            if ('necCompliant' in result.compliance) return result.compliance.necCompliant ? "Standard Compliant" : "Non-Compliant";
                            if ('ampacityCompliant' in result.compliance) {
                              // DC compliance - check if all requirements are met
                              const dcCompliance = result.compliance;
                              const isCompliant = dcCompliance.ampacityCompliant && dcCompliance.voltageDropCompliant && 
                                                 dcCompliance.temperatureCompliant && dcCompliance.applicationCompliant;
                              return isCompliant ? "Standard Compliant" : "Non-Compliant";
                            }
                            return "Non-Compliant";
                          })()}
                          color={(() => {
                            if (!result.compliance) return "error";
                            
                            // Check if this is a router result with standardized compliance
                            if ('standardCompliant' in result.compliance) {
                              return result.compliance.standardCompliant ? "success" : "error";
                            }
                            
                            // Legacy result formats
                            if ('necCompliant' in result.compliance) return result.compliance.necCompliant ? "success" : "error";
                            if ('ampacityCompliant' in result.compliance) {
                              // DC compliance - check if all requirements are met
                              const dcCompliance = result.compliance;
                              const isCompliant = dcCompliance.ampacityCompliant && dcCompliance.voltageDropCompliant && 
                                                 dcCompliance.temperatureCompliant && dcCompliance.applicationCompliant;
                              return isCompliant ? "success" : "error";
                            }
                            return "error";
                          })()}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Capacity
                      </Typography>
                      <Typography variant="h6">
                        {
                          'currentCapacity' in result 
                            ? result.currentCapacity  // Router result format
                            : 'ampacity' in result 
                              ? result.ampacity       // DC result format
                              : (result as WireCalculationResult & { currentCapacity?: number }).currentCapacity || 0  // IEC result format or fallback
                        }A
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Voltage Drop
                      </Typography>
                      <Typography variant="h6">
                        {result.voltageDropPercent.toFixed(2)}%
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Voltage Drop (V)
                      </Typography>
                      <Typography variant="h6">
                        {result.voltageDropVolts.toFixed(2)}V
                      </Typography>
                    </Grid>
                    
                    {'correctionFactors' in result && result.correctionFactors && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Derating
                        </Typography>
                        <Typography variant="h6">
                          {(Object.values(result.correctionFactors).reduce((a, b) => (a || 1) * (b || 1), 1) * 100).toFixed(1)}%
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Compliance Check
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        icon={result.compliance && ('ampacityCompliant' in result.compliance ? result.compliance.ampacityCompliant : result.compliance.currentCompliant) ? <CheckCircle /> : <Error />}
                        label="Current Capacity"
                        color={result.compliance && ('ampacityCompliant' in result.compliance ? result.compliance.ampacityCompliant : result.compliance.currentCompliant) ? "success" : "error"}
                        size="small"
                      />
                      <Chip
                        icon={result.compliance && result.compliance.voltageDropCompliant ? <CheckCircle /> : <Error />}
                        label="Voltage Drop"
                        color={result.compliance && result.compliance.voltageDropCompliant ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {isEuropeanStandard && 'correctionFactors' in result && result.correctionFactors && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        Correction Factors
                      </Typography>
                      <Grid container spacing={1}>
                        {Object.entries(result.correctionFactors).map(([key, value]) => value && (
                          <Grid item xs={6} key={key}>
                            <Typography variant="caption" color="text.secondary">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Typography>
                            <Typography variant="body2">
                              {(value * 100).toFixed(1)}%
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}