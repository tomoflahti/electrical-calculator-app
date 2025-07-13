import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  GridLegacy as Grid
} from '@mui/material';
import { Calculate, Assessment } from '@mui/icons-material';
import VoltageDropChart from './charts/VoltageDropChart';
import ConduitFillChart from './charts/ConduitFillChart';
import WireAreaChart from './charts/WireAreaChart';
import { 
  calculateVoltageDropAnalysis 
} from '../utils/calculations/iec';
import type { VoltageDropAnalysis } from '../types/standards';

interface CalculationInputs {
  current: number;
  length: number;
  voltage: number;
  voltageSystem: 'single' | 'three-phase';
  conductorMaterial: 'copper' | 'aluminum';
  powerFactor: number;
  ambientTemperature: number;
  installationMethod: string;
  loadType: string;
}

const IECVoltageDropCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    current: 32,
    length: 50,
    voltage: 400,
    voltageSystem: 'three-phase',
    conductorMaterial: 'copper',
    powerFactor: 0.8,
    ambientTemperature: 30,
    installationMethod: 'B1',
    loadType: 'motor'
  });

  const [showCharts, setShowCharts] = useState(true);

  // Calculate voltage drop analysis
  const analysis = useMemo<VoltageDropAnalysis | null>(() => {
    try {
      return calculateVoltageDropAnalysis({
        current: inputs.current,
        length: inputs.length,
        voltage: inputs.voltage,
        voltageSystem: inputs.voltageSystem,
        conductorMaterial: inputs.conductorMaterial,
        powerFactor: inputs.powerFactor,
        ambientTemperature: inputs.ambientTemperature,
        installationMethod: inputs.installationMethod,
        loadType: inputs.loadType
      });
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [inputs]);

  // Sample wire configuration for conduit fill analysis
  const [wireConfig, setWireConfig] = useState([
    { gauge: '4', count: 3, insulationType: 'PVC' as const },
    { gauge: '2.5', count: 2, insulationType: 'XLPE' as const }
  ]);

  const handleInputChange = (field: keyof CalculationInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const addWire = () => {
    setWireConfig(prev => [...prev, { gauge: '2.5', count: 1, insulationType: 'PVC' }]);
  };

  const removeWire = (index: number) => {
    setWireConfig(prev => prev.filter((_, i) => i !== index));
  };

  const updateWire = (index: number, field: string, value: string | number) => {
    setWireConfig(prev => prev.map((wire, i) => 
      i === index ? { ...wire, [field]: value } : wire
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        IEC 60364 Voltage Drop & Conduit Fill Calculator
      </Typography>
      
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Calculate sx={{ mr: 1, verticalAlign: 'middle' }} />
                Calculation Parameters
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Load Current (A)"
                    type="number"
                    value={inputs.current}
                    onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Circuit Length (m)"
                    type="number"
                    value={inputs.length}
                    onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Voltage (V)"
                    type="number"
                    value={inputs.voltage}
                    onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Voltage System</InputLabel>
                    <Select
                      value={inputs.voltageSystem}
                      onChange={(e) => handleInputChange('voltageSystem', e.target.value)}
                      label="Voltage System"
                    >
                      <MenuItem value="single">Single Phase</MenuItem>
                      <MenuItem value="three-phase">Three Phase</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Conductor Material</InputLabel>
                    <Select
                      value={inputs.conductorMaterial}
                      onChange={(e) => handleInputChange('conductorMaterial', e.target.value)}
                      label="Conductor Material"
                    >
                      <MenuItem value="copper">Copper</MenuItem>
                      <MenuItem value="aluminum">Aluminum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Power Factor"
                    type="number"
                    inputProps={{ min: 0.1, max: 1, step: 0.1 }}
                    value={inputs.powerFactor}
                    onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0.8)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ambient Temperature (°C)"
                    type="number"
                    value={inputs.ambientTemperature}
                    onChange={(e) => handleInputChange('ambientTemperature', parseFloat(e.target.value) || 30)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Load Type</InputLabel>
                    <Select
                      value={inputs.loadType}
                      onChange={(e) => handleInputChange('loadType', e.target.value)}
                      label="Load Type"
                    >
                      <MenuItem value="lighting">Lighting</MenuItem>
                      <MenuItem value="motor">Motor</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Button
                variant="outlined"
                onClick={() => setShowCharts(!showCharts)}
                sx={{ mt: 2 }}
              >
                {showCharts ? 'Hide' : 'Show'} Charts
              </Button>
            </CardContent>
          </Card>

          {/* Wire Configuration for Conduit Fill */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wire Configuration
              </Typography>
              
              {wireConfig.map((wire, index) => (
                <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Gauge (mm²)"
                      value={wire.gauge}
                      onChange={(e) => updateWire(index, 'gauge', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Count"
                      type="number"
                      value={wire.count}
                      onChange={(e) => updateWire(index, 'count', parseInt(e.target.value) || 1)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={wire.insulationType}
                        onChange={(e) => updateWire(index, 'insulationType', e.target.value)}
                        label="Type"
                      >
                        <MenuItem value="PVC">PVC</MenuItem>
                        <MenuItem value="XLPE">XLPE</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <Button 
                      onClick={() => removeWire(index)}
                      size="small"
                      color="error"
                    >
                      ×
                    </Button>
                  </Grid>
                </Grid>
              ))}
              
              <Button onClick={addWire} variant="outlined" size="small">
                Add Wire
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={8}>
          {analysis && (
            <>
              {/* Summary Results */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Calculation Results
                  </Typography>
                  
                  {analysis.recommended ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {analysis.recommended.cableSize}mm²
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Recommended Cable
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color={analysis.recommended.voltageDropPercent <= analysis.voltageLimits.normal ? 'success.main' : 'error.main'}>
                            {analysis.recommended.voltageDropPercent.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Voltage Drop
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="info.main">
                            {analysis.recommended.powerLossWatts.toFixed(1)}W
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Power Loss
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {analysis.recommended.efficiencyPercent.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Efficiency
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="error">
                      No compliant cable size found for the given parameters.
                    </Alert>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Voltage drop limit for {inputs.loadType} loads: {analysis.voltageLimits.normal}% (normal), {analysis.voltageLimits.sensitive}% (sensitive)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Detailed Results Table */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cable Size Comparison
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Cable Size</TableCell>
                          <TableCell align="right">Cross Section</TableCell>
                          <TableCell align="right">Voltage Drop</TableCell>
                          <TableCell align="right">Power Loss</TableCell>
                          <TableCell align="right">Efficiency</TableCell>
                          <TableCell align="center">Compliant</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analysis.results.slice(0, 8).map((result) => (
                          <TableRow 
                            key={result.cableSize}
                            sx={{ 
                              backgroundColor: result.isCompliant ? 'success.light' : 'inherit',
                              opacity: result.isCompliant ? 1 : 0.6
                            }}
                          >
                            <TableCell>{result.cableSize}mm²</TableCell>
                            <TableCell align="right">{result.crossSectionMm2} mm²</TableCell>
                            <TableCell align="right">{result.voltageDropPercent.toFixed(2)}%</TableCell>
                            <TableCell align="right">{result.powerLossWatts.toFixed(1)}W</TableCell>
                            <TableCell align="right">{result.efficiencyPercent.toFixed(1)}%</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={result.isCompliant ? 'Yes' : 'No'}
                                color={result.isCompliant ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Charts Section */}
          {showCharts && (
            <>
              <VoltageDropChart
                current={inputs.current}
                voltage={inputs.voltage}
                voltageSystem={inputs.voltageSystem}
                conductorMaterial={inputs.conductorMaterial}
                powerFactor={inputs.powerFactor}
                cableSizes={['2.5', '4', '6', '10', '16', '25']}
                maxDistance={Math.max(inputs.length * 1.5, 100)}
                loadType={inputs.loadType}
              />
              
              <Box sx={{ mt: 2 }}>
                <ConduitFillChart
                  wires={wireConfig}
                  conduitType="PVC"
                  showComparison={true}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <WireAreaChart
                  wires={wireConfig}
                  chartType="bar"
                  showInsulationBreakdown={true}
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default IECVoltageDropCalculator;