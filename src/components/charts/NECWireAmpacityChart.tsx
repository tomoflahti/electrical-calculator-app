/**
 * NEC Wire Ampacity Chart Component
 * Displays current carrying capacity for NEC standard wire gauges
 * Leverages existing NEC_WIRE_GAUGES data
 * Pure NEC/Imperial implementation - no metric units
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { TrendingUp, Info, Cable } from '@mui/icons-material';
import { 
  NEC_WIRE_GAUGES, 
  NEC_TEMPERATURE_CORRECTION_FACTORS,
  NEC_CONDUCTOR_ADJUSTMENT_FACTORS,
  NEC_CONDUCTOR_MATERIALS,
  NEC_INSULATION_TYPES
} from '../../standards/nec/wireTables';

interface NECWireAmpacityChartProps {
  material: 'copper' | 'aluminum';
  temperatureRating: 60 | 75 | 90;
  insulationType: string;
  chartType?: 'bar' | 'line' | 'table';
  maxWireSize?: string;
  showComparisonData?: boolean;
}

const NECWireAmpacityChart: React.FC<NECWireAmpacityChartProps> = ({
  material,
  temperatureRating,
  insulationType,
  chartType = 'bar',
  maxWireSize = '500',
  showComparisonData = false
}) => {
  const [selectedChartType, setSelectedChartType] = React.useState(chartType);
  const [selectedConductorCount, setSelectedConductorCount] = React.useState(3);
  const [ambientTemperature, setAmbientTemperature] = React.useState(30);

  // Convert AWG to numerical value for comparison
  const awgToNumber = (awg: string): number => {
    if (awg.includes('/')) return -parseInt(awg.split('/')[0]); // 1/0, 2/0, etc.
    if (awg === '14') return 14;
    if (awg === '12') return 12;
    if (awg === '10') return 10;
    if (awg === '8') return 8;
    if (awg === '6') return 6;
    if (awg === '4') return 4;
    if (awg === '3') return 3;
    if (awg === '2') return 2;
    if (awg === '1') return 1;
    return -parseInt(awg); // For kcmil sizes
  };

  // Generate chart data based on selected parameters
  const chartData = useMemo(() => {
    const materialMultiplier = material === 'aluminum' ? NEC_CONDUCTOR_MATERIALS.aluminum.multiplier : 1.0;
    const adjustmentFactor = NEC_CONDUCTOR_ADJUSTMENT_FACTORS[selectedConductorCount as keyof typeof NEC_CONDUCTOR_ADJUSTMENT_FACTORS] || 1.0;
    
    // Get temperature correction factor
    const tempCorrection = NEC_TEMPERATURE_CORRECTION_FACTORS[temperatureRating];
    const tempFactor = tempCorrection ? tempCorrection[ambientTemperature as keyof typeof tempCorrection] || 1.0 : 1.0;

    return NEC_WIRE_GAUGES
      .filter(wire => awgToNumber(wire.awg) <= awgToNumber(maxWireSize))
      .map(wire => {
        let baseCapacity: number;
        switch (temperatureRating) {
          case 60:
            baseCapacity = wire.ampacity60C;
            break;
          case 90:
            baseCapacity = wire.ampacity90C;
            break;
          default:
            baseCapacity = wire.ampacity75C;
        }

        // Apply aluminum derating if needed
        if (material === 'aluminum') {
          baseCapacity = Math.round(baseCapacity / materialMultiplier);
        }

        const adjustedCapacity = baseCapacity * adjustmentFactor * tempFactor;
        
        return {
          awg: wire.awg,
          area: wire.area,
          baseCapacity: Math.round(baseCapacity * 10) / 10,
          adjustedCapacity: Math.round(adjustedCapacity * 10) / 10,
          resistance: wire.resistance,
          adjustmentFactor: Math.round(adjustmentFactor * 100) / 100,
          tempFactor: Math.round(tempFactor * 100) / 100,
          totalDerating: Math.round((adjustmentFactor * tempFactor) * 100) / 100,
          materialMultiplier: Math.round(materialMultiplier * 100) / 100
        };
      });
  }, [material, temperatureRating, selectedConductorCount, ambientTemperature, maxWireSize]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalWires = chartData.length;
    const avgDerating = chartData.reduce((sum, wire) => sum + wire.totalDerating, 0) / totalWires;
    const maxCapacity = Math.max(...chartData.map(wire => wire.adjustedCapacity));
    const minCapacity = Math.min(...chartData.map(wire => wire.adjustedCapacity));

    return {
      totalWires,
      avgDerating: Math.round(avgDerating * 100) / 100,
      maxCapacity: Math.round(maxCapacity * 10) / 10,
      minCapacity: Math.round(minCapacity * 10) / 10,
      capacityRange: Math.round((maxCapacity - minCapacity) * 10) / 10
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {label} AWG Wire
          </Typography>
          <Typography variant="body2" color="primary">
            <strong>Adjusted Capacity:</strong> {data.adjustedCapacity}A
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Base Capacity: {data.baseCapacity}A
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Derating: {(data.totalDerating * 100).toFixed(0)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resistance: {data.resistance}Ω/1000ft
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Area: {(data.area * 1000).toFixed(1)} kcmil
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="awg" 
          label={{ value: 'Wire Gauge (AWG)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Current Capacity (A)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="baseCapacity" 
          fill="#8884d8" 
          name="Base Capacity"
          opacity={0.7}
        />
        <Bar 
          dataKey="adjustedCapacity" 
          fill="#82ca9d" 
          name="Adjusted Capacity"
        />
        {showComparisonData && (
          <ReferenceLine y={100} stroke="#ff7300" strokeDasharray="5 5" label="100A Reference" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="awg" 
          label={{ value: 'Wire Gauge (AWG)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Current Capacity (A)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="baseCapacity" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Base Capacity"
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="adjustedCapacity" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Adjusted Capacity"
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>AWG Size</strong></TableCell>
            <TableCell align="right"><strong>Area (kcmil)</strong></TableCell>
            <TableCell align="right"><strong>Base Capacity (A)</strong></TableCell>
            <TableCell align="right"><strong>Adjusted Capacity (A)</strong></TableCell>
            <TableCell align="right"><strong>Resistance (Ω/1000ft)</strong></TableCell>
            <TableCell align="right"><strong>Derating Factor</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.map((wire) => (
            <TableRow key={wire.awg} hover>
              <TableCell component="th" scope="row">
                <Chip 
                  label={`${wire.awg} AWG`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">{(wire.area * 1000).toFixed(1)}</TableCell>
              <TableCell align="right">{wire.baseCapacity}A</TableCell>
              <TableCell align="right">
                <strong>{wire.adjustedCapacity}A</strong>
              </TableCell>
              <TableCell align="right">{wire.resistance}</TableCell>
              <TableCell align="right">
                <Chip 
                  label={`${(wire.totalDerating * 100).toFixed(0)}%`}
                  size="small"
                  color={wire.totalDerating > 0.8 ? 'success' : wire.totalDerating > 0.6 ? 'warning' : 'error'}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Chart Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={selectedChartType}
              label="Chart Type"
              onChange={(e) => setSelectedChartType(e.target.value as 'bar' | 'line' | 'table')}
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Conductors in Group</InputLabel>
            <Select
              value={selectedConductorCount}
              label="Conductors in Group"
              onChange={(e) => setSelectedConductorCount(e.target.value as number)}
            >
              <MenuItem value={3}>3 conductors (100%)</MenuItem>
              <MenuItem value={4}>4-6 conductors (80%)</MenuItem>
              <MenuItem value={7}>7-9 conductors (70%)</MenuItem>
              <MenuItem value={10}>10-20 conductors (70%)</MenuItem>
              <MenuItem value={21}>21-30 conductors (60%)</MenuItem>
              <MenuItem value={31}>31-40 conductors (55%)</MenuItem>
              <MenuItem value={41}>41+ conductors (50%)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Ambient Temperature</InputLabel>
            <Select
              value={ambientTemperature}
              label="Ambient Temperature"
              onChange={(e) => setAmbientTemperature(e.target.value as number)}
            >
              {Object.keys(NEC_TEMPERATURE_CORRECTION_FACTORS[temperatureRating]).map(temp => (
                <MenuItem key={temp} value={parseInt(temp)}>
                  {temp}°C ({Math.round(parseInt(temp) * 9/5 + 32)}°F)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip 
              icon={<Cable />}
              label={`${material === 'copper' ? 'Copper' : 'Aluminum'} - ${temperatureRating}°C`}
              color="primary"
              size="small"
            />
          </Box>
        </Grid>
      </Grid>

      {/* Summary Statistics */}
      {summaryStats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Chart Summary:</strong> {summaryStats.totalWires} wire sizes | 
            Average derating: {(summaryStats.avgDerating * 100).toFixed(0)}% | 
            Capacity range: {summaryStats.minCapacity}A - {summaryStats.maxCapacity}A
          </Typography>
        </Alert>
      )}

      {/* Chart Display */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUp sx={{ mr: 1 }} />
            <Typography variant="h6">
              NEC Wire Ampacity - {material === 'copper' ? 'Copper' : 'Aluminum'} Conductors
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current carrying capacity adjusted for insulation type ({insulationType}), 
            conductor grouping ({selectedConductorCount} conductors), and ambient temperature ({ambientTemperature}°C).
          </Typography>

          {selectedChartType === 'bar' && renderBarChart()}
          {selectedChartType === 'line' && renderLineChart()}
          {selectedChartType === 'table' && renderTable()}
        </CardContent>
      </Card>

      {/* Derating Factors Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Info sx={{ mr: 1 }} />
            Applied NEC Derating Factors
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {((NEC_CONDUCTOR_ADJUSTMENT_FACTORS[selectedConductorCount as keyof typeof NEC_CONDUCTOR_ADJUSTMENT_FACTORS] || 1.0) * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conductor Bundling
                </Typography>
                <Typography variant="caption" display="block">
                  {selectedConductorCount} conductors (NEC 310.15(B)(3)(a))
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="secondary">
                  {((NEC_TEMPERATURE_CORRECTION_FACTORS[temperatureRating]?.[ambientTemperature as keyof typeof NEC_TEMPERATURE_CORRECTION_FACTORS[typeof temperatureRating]] || 1.0) * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Temperature Factor
                </Typography>
                <Typography variant="caption" display="block">
                  {ambientTemperature}°C ambient (NEC 310.15(B)(2)(a))
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main">
                  {material === 'aluminum' ? 
                    `${(100 / NEC_CONDUCTOR_MATERIALS.aluminum.multiplier).toFixed(0)}%` : 
                    '100%'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Material Factor
                </Typography>
                <Typography variant="caption" display="block">
                  {material === 'copper' ? 'Copper (baseline)' : 'Aluminum derating'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* NEC Insulation Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {insulationType} Insulation Specifications
          </Typography>
          
          {NEC_INSULATION_TYPES[insulationType as keyof typeof NEC_INSULATION_TYPES] && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Full Name:</strong> {NEC_INSULATION_TYPES[insulationType as keyof typeof NEC_INSULATION_TYPES].name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Temperature Rating:</strong> {NEC_INSULATION_TYPES[insulationType as keyof typeof NEC_INSULATION_TYPES].temperatureRating}°C
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Applications:</strong> {NEC_INSULATION_TYPES[insulationType as keyof typeof NEC_INSULATION_TYPES].applications.join(', ')}
              </Typography>
              <Typography variant="body2">
                <strong>Standard:</strong> {NEC_INSULATION_TYPES[insulationType as keyof typeof NEC_INSULATION_TYPES].standard}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NECWireAmpacityChart;