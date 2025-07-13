/**
 * IEC Cable Ampacity Chart Component
 * Displays current carrying capacity for IEC standard cables
 * Leverages existing IEC_CABLE_CROSS_SECTIONS data
 */

import React, { useMemo } from "react";
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
  ReferenceLine,
} from "recharts";
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
  TableRow,
  GridLegacy as Grid,
} from "@mui/material";
import { TrendingUp, Info, Cable } from "@mui/icons-material";
import {
  IEC_CABLE_CROSS_SECTIONS,
  IEC_ALUMINUM_CABLE_CROSS_SECTIONS,
  IEC_TEMPERATURE_CORRECTION_FACTORS,
  IEC_GROUPING_FACTORS,
  IEC_INSTALLATION_METHODS,
} from "../../standards/iec/cableTables";

interface IECCableAmpacityChartProps {
  material: "copper" | "aluminum";
  temperatureRating: 70 | 90;
  installationMethod: string;
  chartType?: "bar" | "line" | "table";
  maxCableSize?: number;
  showComparisonData?: boolean;
}

const IECCableAmpacityChart: React.FC<IECCableAmpacityChartProps> = ({
  material,
  temperatureRating,
  installationMethod,
  chartType = "bar",
  maxCableSize = 500,
  showComparisonData = false,
}) => {
  const [selectedChartType, setSelectedChartType] = React.useState(chartType);
  const [selectedGrouping, setSelectedGrouping] = React.useState(1);
  const [ambientTemperature, setAmbientTemperature] = React.useState(30);

  // Generate chart data based on selected parameters
  const chartData = useMemo(() => {
    const cableData =
      material === "copper"
        ? IEC_CABLE_CROSS_SECTIONS
        : IEC_ALUMINUM_CABLE_CROSS_SECTIONS;
    const installationFactor =
      IEC_INSTALLATION_METHODS[
        installationMethod as keyof typeof IEC_INSTALLATION_METHODS
      ]?.factor || 1.0;
    const groupingFactor =
      IEC_GROUPING_FACTORS[
        selectedGrouping as keyof typeof IEC_GROUPING_FACTORS
      ] || 1.0;

    // Get temperature correction factor
    const tempCorrection =
      IEC_TEMPERATURE_CORRECTION_FACTORS[temperatureRating];
    const tempFactor = tempCorrection
      ? tempCorrection[ambientTemperature as keyof typeof tempCorrection] || 1.0
      : 1.0;

    return cableData
      .filter((cable) => cable.crossSectionMm2 <= maxCableSize)
      .map((cable) => {
        const baseCapacity =
          temperatureRating === 70
            ? cable.currentCapacity70C
            : cable.currentCapacity90C;

        return {
          size: cable.size,
          crossSection: cable.crossSectionMm2,
          baseCapacity: Math.round((baseCapacity || 0) * 10) / 10,
          adjustedCapacity:
            Math.round(
              (baseCapacity || 0) *
                installationFactor *
                groupingFactor *
                tempFactor *
                10,
            ) / 10,
          resistance: cable.resistance,
          reactance: cable.reactance,
          installationFactor: Math.round(installationFactor * 100) / 100,
          groupingFactor: Math.round(groupingFactor * 100) / 100,
          tempFactor: Math.round(tempFactor * 100) / 100,
          totalDerating:
            Math.round(installationFactor * groupingFactor * tempFactor * 100) /
            100,
        };
      });
  }, [
    material,
    temperatureRating,
    installationMethod,
    selectedGrouping,
    ambientTemperature,
    maxCableSize,
  ]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalCables = chartData.length;
    const avgDerating =
      chartData.reduce((sum, cable) => sum + cable.totalDerating, 0) /
      totalCables;
    const maxCapacity = Math.max(
      ...chartData.map((cable) => cable.adjustedCapacity),
    );
    const minCapacity = Math.min(
      ...chartData.map((cable) => cable.adjustedCapacity),
    );

    return {
      totalCables,
      avgDerating: Math.round(avgDerating * 100) / 100,
      maxCapacity: Math.round(maxCapacity * 10) / 10,
      minCapacity: Math.round(minCapacity * 10) / 10,
      capacityRange: Math.round((maxCapacity - minCapacity) * 10) / 10,
    };
  }, [chartData]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        size: string;
        crossSection: number;
        baseCapacity: number;
        adjustedCapacity: number;
        resistance: number;
        reactance: number;
        installationFactor: number;
        groupingFactor: number;
        tempFactor: number;
        totalDerating: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}mm² Cable
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
            Resistance: {data.resistance}Ω/km
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="size"
          label={{
            value: "Cable Size (mm²)",
            position: "insideBottom",
            offset: -5,
          }}
        />
        <YAxis
          label={{
            value: "Current Capacity (A)",
            angle: -90,
            position: "insideLeft",
          }}
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
          <ReferenceLine
            y={100}
            stroke="#ff7300"
            strokeDasharray="5 5"
            label="100A Reference"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="crossSection"
          label={{
            value: "Cross Section (mm²)",
            position: "insideBottom",
            offset: -5,
          }}
        />
        <YAxis
          label={{
            value: "Current Capacity (A)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="baseCapacity"
          stroke="#8884d8"
          strokeWidth={2}
          name="Base Capacity"
          dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="adjustedCapacity"
          stroke="#82ca9d"
          strokeWidth={2}
          name="Adjusted Capacity"
          dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Size (mm²)</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Cross Section</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Base Capacity (A)</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Adjusted Capacity (A)</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Resistance (Ω/km)</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Derating Factor</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chartData.map((cable) => (
            <TableRow key={cable.size} hover>
              <TableCell component="th" scope="row">
                <Chip
                  label={cable.size}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">{cable.crossSection} mm²</TableCell>
              <TableCell align="right">{cable.baseCapacity}A</TableCell>
              <TableCell align="right">
                <strong>{cable.adjustedCapacity}A</strong>
              </TableCell>
              <TableCell align="right">{cable.resistance}</TableCell>
              <TableCell align="right">
                <Chip
                  label={`${(cable.totalDerating * 100).toFixed(0)}%`}
                  size="small"
                  color={
                    cable.totalDerating > 0.8
                      ? "success"
                      : cable.totalDerating > 0.6
                        ? "warning"
                        : "error"
                  }
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
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              value={selectedChartType}
              label="Chart Type"
              onChange={(e) =>
                setSelectedChartType(e.target.value as "bar" | "line" | "table")
              }
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="cables-in-group-label">Cables in Group</InputLabel>
            <Select
              labelId="cables-in-group-label"
              value={selectedGrouping}
              label="Cables in Group"
              onChange={(e) => setSelectedGrouping(e.target.value as number)}
            >
              {Object.entries(IEC_GROUPING_FACTORS).map(([count, factor]) => (
                <MenuItem key={count} value={parseInt(count)}>
                  {count} cables ({(factor * 100).toFixed(0)}%)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="ambient-temperature-label">
              Ambient Temperature
            </InputLabel>
            <Select
              labelId="ambient-temperature-label"
              value={ambientTemperature}
              label="Ambient Temperature"
              onChange={(e) => setAmbientTemperature(e.target.value as number)}
            >
              {Object.keys(
                IEC_TEMPERATURE_CORRECTION_FACTORS[temperatureRating],
              ).map((temp) => (
                <MenuItem key={temp} value={parseInt(temp)}>
                  {temp}°C
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
              icon={<Cable />}
              label={`${material === "copper" ? "Copper" : "Aluminum"} - ${temperatureRating}°C`}
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
            <strong>Chart Summary:</strong> {summaryStats.totalCables} cables |
            Average derating: {(summaryStats.avgDerating * 100).toFixed(0)}% |
            Capacity range: {summaryStats.minCapacity}A -{" "}
            {summaryStats.maxCapacity}A
          </Typography>
        </Alert>
      )}

      {/* Chart Display */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TrendingUp sx={{ mr: 1 }} />
            <Typography variant="h6">
              IEC Cable Ampacity -{" "}
              {material === "copper" ? "Copper" : "Aluminum"} Conductors
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current carrying capacity adjusted for installation method (
            {installationMethod}), grouping factor ({selectedGrouping} cables),
            and ambient temperature ({ambientTemperature}°C).
          </Typography>

          {selectedChartType === "bar" && renderBarChart()}
          {selectedChartType === "line" && renderLineChart()}
          {selectedChartType === "table" && renderTable()}
        </CardContent>
      </Card>

      {/* Derating Factors Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Info sx={{ mr: 1 }} />
            Applied Derating Factors
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary">
                  {(
                    (IEC_INSTALLATION_METHODS[
                      installationMethod as keyof typeof IEC_INSTALLATION_METHODS
                    ]?.factor || 1.0) * 100
                  ).toFixed(0)}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Installation Method
                </Typography>
                <Typography variant="caption" display="block">
                  {IEC_INSTALLATION_METHODS[
                    installationMethod as keyof typeof IEC_INSTALLATION_METHODS
                  ]?.name || "Unknown"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="secondary">
                  {(
                    (IEC_GROUPING_FACTORS[
                      selectedGrouping as keyof typeof IEC_GROUPING_FACTORS
                    ] || 1.0) * 100
                  ).toFixed(0)}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grouping Factor
                </Typography>
                <Typography variant="caption" display="block">
                  {selectedGrouping} cables grouped
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="warning.main">
                  {(
                    (IEC_TEMPERATURE_CORRECTION_FACTORS[temperatureRating]?.[
                      ambientTemperature as keyof (typeof IEC_TEMPERATURE_CORRECTION_FACTORS)[70]
                    ] || 1.0) * 100
                  ).toFixed(0)}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Temperature Factor
                </Typography>
                <Typography variant="caption" display="block">
                  {ambientTemperature}°C ambient
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IECCableAmpacityChart;
