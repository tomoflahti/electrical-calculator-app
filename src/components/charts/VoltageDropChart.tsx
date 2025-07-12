import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
// Dummy function to replace removed IEC function
const generateVoltageDropGraphData = (params: {
  cableSize: string;
  current: number;
  voltage: number;
  voltageSystem: string;
  conductorMaterial: string;
  powerFactor: number;
  maxDistance: number;
}) => {
  const lengths = Array.from({ length: 21 }, (_, i) => (i * params.maxDistance) / 20);
  return lengths.map(distance => ({
    distance,
    voltageDropPercent: (2 * params.current * distance * 0.0002) / params.voltage * 100, // Simplified calculation
    voltageDropVolts: (2 * params.current * distance * 0.0002),
    voltageAtLoad: params.voltage - (2 * params.current * distance * 0.0002),
    powerLossWatts: Math.pow(params.current, 2) * distance * 0.0002, // Simple power loss
    efficiencyPercent: Math.max(80, 100 - (distance * 0.1)) // Simple efficiency calculation
  }));
};

interface VoltageDropChartProps {
  current: number;
  voltage: number;
  voltageSystem: string;
  conductorMaterial: string;
  powerFactor: number;
  cableSizes?: string[];
  maxDistance?: number;
  showVoltageLimits?: boolean;
  loadType?: string;
}

const VoltageDropChart: React.FC<VoltageDropChartProps> = ({
  current,
  voltage,
  voltageSystem,
  conductorMaterial,
  powerFactor,
  cableSizes = ['2.5', '4', '6', '10', '16', '25'],
  maxDistance = 100,
  showVoltageLimits = true,
  loadType = 'general'
}) => {
  const [selectedMetric, setSelectedMetric] = React.useState<'voltageDropPercent' | 'powerLossWatts' | 'efficiencyPercent'>('voltageDropPercent');

  // Generate data for multiple cable sizes
  const chartData = useMemo(() => {
    const allData: Record<number, any> = {};

    // Generate data for each cable size
    cableSizes.forEach(cableSize => {
      const graphData = generateVoltageDropGraphData({
        cableSize,
        current,
        voltage,
        voltageSystem,
        conductorMaterial,
        powerFactor,
        maxDistance
      });

      graphData.forEach(point => {
        if (!allData[point.distance]) {
          allData[point.distance] = { distance: point.distance };
        }
        allData[point.distance][`${cableSize}mm²`] = point[selectedMetric as keyof typeof point];
      });
    });

    return Object.values(allData).sort((a: any, b: any) => a.distance - b.distance);
  }, [cableSizes, current, voltage, voltageSystem, conductorMaterial, powerFactor, maxDistance, selectedMetric]);

  // Get voltage limits for reference lines
  const voltageLimits = useMemo(() => {
    const limits: Record<string, number> = {
      lighting: 3.0,
      motor: 5.0,
      general: 4.0,
      critical: 2.0
    };
    return limits[loadType] || 4.0;
  }, [loadType]);

  // Generate colors for different cable sizes
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];

  const getYAxisLabel = () => {
    switch (selectedMetric) {
      case 'voltageDropPercent': return 'Voltage Drop (%)';
      case 'powerLossWatts': return 'Power Loss (W)';
      case 'efficiencyPercent': return 'Efficiency (%)';
      default: return 'Value';
    }
  };

  const getTooltipFormatter = (value: number, name: string) => {
    switch (selectedMetric) {
      case 'voltageDropPercent': return [`${value.toFixed(2)}%`, name];
      case 'powerLossWatts': return [`${value.toFixed(2)}W`, name];
      case 'efficiencyPercent': return [`${value.toFixed(1)}%`, name];
      default: return [value.toFixed(2), name];
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            Voltage Drop Analysis
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              label="Metric"
            >
              <MenuItem value="voltageDropPercent">Voltage Drop (%)</MenuItem>
              <MenuItem value="powerLossWatts">Power Loss (W)</MenuItem>
              <MenuItem value="efficiencyPercent">Efficiency (%)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="distance" 
              label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5 }}
              stroke="#666"
            />
            <YAxis 
              label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
              stroke="#666"
            />
            <Tooltip 
              formatter={getTooltipFormatter}
              labelFormatter={(value) => `Distance: ${value}m`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            
            {/* Reference line for voltage drop limit */}
            {selectedMetric === 'voltageDropPercent' && showVoltageLimits && (
              <ReferenceLine 
                y={voltageLimits} 
                stroke="#d62728" 
                strokeDasharray="5 5"
                label={`${voltageLimits}% Limit`}
              />
            )}

            {/* Reference line for 100% efficiency */}
            {selectedMetric === 'efficiencyPercent' && (
              <ReferenceLine 
                y={100} 
                stroke="#2ca02c" 
                strokeDasharray="3 3"
                label="100% Efficiency"
              />
            )}

            {/* Lines for each cable size */}
            {cableSizes.map((cableSize, index) => (
              <Line
                key={cableSize}
                type="monotone"
                dataKey={`${cableSize}mm²`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Current: {current}A • Voltage: {voltage}V • Power Factor: {powerFactor} • Material: {conductorMaterial}
          </Typography>
          {selectedMetric === 'voltageDropPercent' && showVoltageLimits && (
            <Typography variant="body2" color="text.secondary">
              Maximum voltage drop for {loadType} loads: {voltageLimits}%
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default VoltageDropChart;