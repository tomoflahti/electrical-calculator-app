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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  GridLegacy as Grid,
} from "@mui/material";
import { getIECWireSpecifications } from "../../utils/calculations/iecConduitFill";

interface WireAreaChartProps {
  wires: Array<{
    gauge: string;
    count: number;
    insulationType: "PVC" | "XLPE";
  }>;
  chartType?: "bar" | "pie" | "scatter" | "table";
  showInsulationBreakdown?: boolean;
}

const WireAreaChart: React.FC<WireAreaChartProps> = ({
  wires,
  chartType = "bar",
  showInsulationBreakdown = true,
}) => {
  const [selectedChartType, setSelectedChartType] = React.useState(chartType);

  // Colors for visualization (memoized to prevent dependency issues)
  const colors = useMemo(
    () => [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
    ],
    [],
  );

  // Calculate wire area data with specifications
  const wireAreaData = useMemo(() => {
    const data = wires.map((wire, index) => {
      const pvcSpecs = getIECWireSpecifications("PVC");
      const xlpeSpecs = getIECWireSpecifications("XLPE");

      const specs =
        wire.insulationType === "XLPE"
          ? xlpeSpecs.find((s) => s.gauge === wire.gauge)
          : pvcSpecs.find((s) => s.gauge === wire.gauge);

      if (!specs) {
        // Fallback calculation if specs not found
        const conductorArea = parseFloat(wire.gauge) || 1;
        const estimatedTotalArea = conductorArea * 2; // Rough estimation
        return {
          gauge: wire.gauge,
          count: wire.count,
          insulationType: wire.insulationType,
          conductorArea: conductorArea,
          insulationArea: estimatedTotalArea - conductorArea,
          totalAreaPerWire: estimatedTotalArea,
          totalArea: estimatedTotalArea * wire.count,
          color: index < 10 ? colors[index] : colors[index % 10],
        };
      }

      const insulationArea = specs.totalArea - specs.area;

      return {
        gauge: wire.gauge,
        count: wire.count,
        insulationType: wire.insulationType,
        conductorArea: specs.area,
        insulationArea: insulationArea,
        totalAreaPerWire: specs.totalArea,
        totalArea: specs.totalArea * wire.count,
        totalDiameter: specs.totalDiameter,
        color: index < 10 ? colors[index] : colors[index % 10],
      };
    });

    return data.sort((a, b) => parseFloat(a.gauge) - parseFloat(b.gauge));
  }, [wires, colors]);

  // Calculate totals for summary
  const totals = useMemo(() => {
    return wireAreaData.reduce(
      (acc, wire) => ({
        conductorArea: acc.conductorArea + wire.conductorArea * wire.count,
        insulationArea: acc.insulationArea + wire.insulationArea * wire.count,
        totalArea: acc.totalArea + wire.totalArea,
        totalWires: acc.totalWires + wire.count,
      }),
      { conductorArea: 0, insulationArea: 0, totalArea: 0, totalWires: 0 },
    );
  }, [wireAreaData]);

  // Prepare data for different chart types
  const getChartData = () => {
    switch (selectedChartType) {
      case "pie":
        return wireAreaData.map((wire) => ({
          name: `${wire.gauge}mm² (${wire.count}x)`,
          value: wire.totalArea,
          percentage: (wire.totalArea / totals.totalArea) * 100,
        }));

      case "scatter":
        return wireAreaData.map((wire) => ({
          gauge: parseFloat(wire.gauge),
          totalArea: wire.totalAreaPerWire,
          count: wire.count,
          insulationType: wire.insulationType,
          name: `${wire.gauge}mm² (${wire.insulationType})`,
        }));

      default: // bar
        return wireAreaData.map((wire) => ({
          gauge: `${wire.gauge}mm²`,
          conductorArea: wire.conductorArea * wire.count,
          insulationArea: wire.insulationArea * wire.count,
          totalArea: wire.totalArea,
          count: wire.count,
          insulationType: wire.insulationType,
        }));
    }
  };

  const renderChart = () => {
    const data = getChartData();

    switch (selectedChartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) =>
                  `${name}: ${percentage.toFixed(1)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(2)} mm²`,
                  "Area",
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="gauge"
                name="Wire Gauge"
                label={{
                  value: "Wire Gauge (mm²)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                type="number"
                dataKey="totalArea"
                name="Total Area"
                label={{
                  value: "Total Area (mm²)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value: number, name: string) => [
                  name === "totalArea" ? `${value.toFixed(2)} mm²` : value,
                  name === "totalArea" ? "Total Area" : name,
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.name} (${data.count}x wires)`;
                  }
                  return label;
                }}
              />
              <Scatter
                data={data}
                fill="#1f77b4"
                shape={(props: { cx?: number; cy?: number; payload?: any }) => {
                  const { cx, cy, payload } = props;
                  const color =
                    payload.insulationType === "XLPE" ? "#ff7f0e" : "#1f77b4";
                  return <circle cx={cx} cy={cy} r={6} fill={color} />;
                }}
              />
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "table":
        return (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Gauge</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell>Insulation</TableCell>
                  <TableCell align="right">Conductor Area</TableCell>
                  <TableCell align="right">Insulation Area</TableCell>
                  <TableCell align="right">Total Area/Wire</TableCell>
                  <TableCell align="right">Total Area</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wireAreaData.map((wire, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {wire.gauge}mm²
                    </TableCell>
                    <TableCell align="right">{wire.count}</TableCell>
                    <TableCell>
                      <Chip
                        label={wire.insulationType}
                        size="small"
                        color={
                          wire.insulationType === "XLPE"
                            ? "secondary"
                            : "primary"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      {(wire.conductorArea * wire.count).toFixed(2)} mm²
                    </TableCell>
                    <TableCell align="right">
                      {(wire.insulationArea * wire.count).toFixed(2)} mm²
                    </TableCell>
                    <TableCell align="right">
                      {wire.totalAreaPerWire.toFixed(2)} mm²
                    </TableCell>
                    <TableCell align="right">
                      {wire.totalArea.toFixed(2)} mm²
                    </TableCell>
                    <TableCell align="right">
                      {((wire.totalArea / totals.totalArea) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3}>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{totals.conductorArea.toFixed(2)} mm²</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>{totals.insulationArea.toFixed(2)} mm²</strong>
                  </TableCell>
                  <TableCell align="right">-</TableCell>
                  <TableCell align="right">
                    <strong>{totals.totalArea.toFixed(2)} mm²</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>100%</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        );

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gauge" />
              <YAxis
                label={{
                  value: "Area (mm²)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} mm²`,
                  name,
                ]}
                labelFormatter={(label) => `Wire: ${label}`}
              />
              <Legend />

              {showInsulationBreakdown && (
                <>
                  <Bar
                    dataKey="conductorArea"
                    stackId="a"
                    fill="#1f77b4"
                    name="Conductor Area"
                  />
                  <Bar
                    dataKey="insulationArea"
                    stackId="a"
                    fill="#ff7f0e"
                    name="Insulation Area"
                  />
                </>
              )}

              {!showInsulationBreakdown && (
                <Bar dataKey="totalArea" fill="#1f77b4" name="Total Area" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h3">
            Wire Area Analysis
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={selectedChartType}
              onChange={(e) =>
                setSelectedChartType(
                  e.target.value as "bar" | "pie" | "scatter" | "table",
                )
              }
              label="View"
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="scatter">Scatter Plot</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {renderChart()}

        {/* Summary Section */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body2">
              Total Wires: {totals.totalWires}
            </Typography>
            <Typography variant="body2">
              Total Conductor Area: {totals.conductorArea.toFixed(2)} mm²
            </Typography>
            <Typography variant="body2">
              Total Insulation Area: {totals.insulationArea.toFixed(2)} mm²
            </Typography>
            <Typography variant="body2">
              Total Combined Area: {totals.totalArea.toFixed(2)} mm²
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Wire Types
            </Typography>
            {wireAreaData.map((wire, index) => (
              <Box key={index} mb={0.5}>
                <Chip
                  label={`${wire.gauge}mm² × ${wire.count} (${wire.insulationType})`}
                  variant="outlined"
                  size="small"
                  style={{
                    backgroundColor: wire.color + "20",
                    borderColor: wire.color,
                    marginRight: 4,
                    marginBottom: 4,
                  }}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WireAreaChart;
