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
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  GridLegacy as Grid,
} from "@mui/material";
// Removed unused import
import { generateConduitFillComparisonData } from "../../utils/calculations/iecConduitFill";

interface ConduitFillChartProps {
  wires: Array<{
    gauge: string;
    count: number;
    insulationType: "PVC" | "XLPE";
  }>;
  conduitType?: "PVC" | "Steel";
  selectedConduitSize?: string;
  showComparison?: boolean;
}

const ConduitFillChart: React.FC<ConduitFillChartProps> = ({
  wires,
  conduitType = "PVC",
  selectedConduitSize,
  showComparison = true,
}) => {
  const [chartType, setChartType] = React.useState<"bar" | "pie">("bar");

  // Generate comparison data for all conduit sizes
  const comparisonData = useMemo(() => {
    return generateConduitFillComparisonData(wires, conduitType);
  }, [wires, conduitType]);

  // Calculate wire breakdown for pie chart
  const wireBreakdownData = useMemo(() => {
    const totalArea = wires.reduce((sum, wire) => {
      // This is a simplified calculation - in real implementation,
      // you'd need to get actual wire specifications
      const baseArea = parseFloat(wire.gauge) || 1;
      return sum + baseArea * wire.count;
    }, 0);

    return wires.map((wire) => {
      const baseArea = parseFloat(wire.gauge) || 1;
      const wireArea = baseArea * wire.count;
      return {
        name: `${wire.gauge}mm² (${wire.count}x)`,
        value: wireArea,
        percentage: (wireArea / totalArea) * 100,
        count: wire.count,
        gauge: wire.gauge,
        insulationType: wire.insulationType,
      };
    });
  }, [wires]);

  // Colors for different elements
  const barColors = {
    compliant: "#2ca02c",
    nonCompliant: "#d62728",
    selected: "#1f77b4",
  };

  const pieColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
  ];

  const getBarColor = (data: {
    conduitSize: string;
    fillPercent: number;
    maxFillPercent: number;
    isCompliant: boolean;
    availableArea: number;
    usedArea: number;
  }) => {
    if (selectedConduitSize && data.conduitSize === selectedConduitSize) {
      return barColors.selected;
    }
    return data.isCompliant ? barColors.compliant : barColors.nonCompliant;
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
            Conduit Fill Analysis
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as "bar" | "pie")}
              label="Chart Type"
            >
              <MenuItem value="bar">Fill Comparison</MenuItem>
              <MenuItem value="pie">Wire Breakdown</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Main Chart */}
          <Grid item xs={12} md={8}>
            {chartType === "bar" && showComparison ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="conduitSize"
                    label={{
                      value: "Conduit Size (mm)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Fill Percentage (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}%`,
                      name,
                    ]}
                    labelFormatter={(value) => `Conduit: ${value}mm`}
                  />
                  <Legend />

                  {/* Reference line for maximum fill */}
                  <ReferenceLine
                    y={40}
                    stroke="#d62728"
                    strokeDasharray="5 5"
                    label="Max Fill (40%)"
                  />

                  <Bar
                    dataKey="fillPercent"
                    name="Fill Percentage"
                    fill="#2ca02c"
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wireBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) =>
                      `${name}: ${percentage.toFixed(1)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {wireBreakdownData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(2)} mm²`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Grid>

          {/* Summary Information */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Wire Summary
              </Typography>
              {wires.map((wire, index) => (
                <Box key={index} mb={1}>
                  <Chip
                    label={`${wire.gauge}mm² × ${wire.count} (${wire.insulationType})`}
                    variant="outlined"
                    size="small"
                    style={{
                      backgroundColor:
                        pieColors[index % pieColors.length] + "20",
                      borderColor: pieColors[index % pieColors.length],
                    }}
                  />
                </Box>
              ))}

              {selectedConduitSize && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Selected Conduit
                  </Typography>
                  <Typography variant="body2">
                    Size: {selectedConduitSize}mm ({conduitType})
                  </Typography>
                  {(() => {
                    const selected = comparisonData.find(
                      (d) => d.conduitSize === selectedConduitSize,
                    );
                    if (selected) {
                      return (
                        <>
                          <Typography variant="body2">
                            Fill: {selected.fillPercent.toFixed(1)}%
                          </Typography>
                          <Chip
                            label={
                              selected.isCompliant
                                ? "Compliant"
                                : "Non-Compliant"
                            }
                            color={selected.isCompliant ? "success" : "error"}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </>
                      );
                    }
                    return null;
                  })()}
                </Box>
              )}

              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Fill Standards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Single cable: 53% max
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Two cables: 31% max
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Three+ cables: 40% max
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Recommendations */}
        {showComparison && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Recommendations:
            </Typography>
            {(() => {
              const compliantSizes = comparisonData.filter(
                (d) => d.isCompliant,
              );
              if (compliantSizes.length > 0) {
                const smallest = compliantSizes[0];
                return (
                  <Typography variant="body2" color="text.secondary">
                    Minimum conduit size: {smallest.conduitSize}mm (
                    {conduitType}) with {smallest.fillPercent.toFixed(1)}% fill
                  </Typography>
                );
              } else {
                return (
                  <Typography variant="body2" color="error">
                    No compliant conduit sizes found for this wire
                    configuration. Consider reducing wire count or using larger
                    conduits.
                  </Typography>
                );
              }
            })()}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ConduitFillChart;
