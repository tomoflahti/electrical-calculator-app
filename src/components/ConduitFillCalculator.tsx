import { useState, useEffect } from "react";
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  GridLegacy as Grid,
} from "@mui/material";
import {
  Calculate,
  CheckCircle,
  Error,
  Add,
  Delete,
} from "@mui/icons-material";
import { calculateConduitFill } from "../utils/calculations/conduitFillRouter";
import type {
  ConduitFillCalculationInput,
  ConduitFillCalculationResult,
  ElectricalStandardId,
  ConduitFillApplicationType,
  ConduitFillInstallationMethod,
} from "../types/standards";
import type { ConduitFillResult } from "../types"; // Keep legacy types for backward compatibility
import { WIRE_GAUGES } from "../utils/necTables";
import { IEC_CABLE_CROSS_SECTIONS } from "../standards/iec/cableTables";
import { awgToMm2, mm2ToAwg } from "../utils/conversions";

interface WireEntry {
  id: string;
  gauge: string;
  quantity: number;
  insulation: string;
}

interface ConduitFillCalculatorProps {
  selectedStandard?: ElectricalStandardId;
}

export default function ConduitFillCalculator({
  selectedStandard = "NEC",
}: ConduitFillCalculatorProps) {
  // Get appropriate defaults based on standard
  const getDefaultConduitType = (standard: ElectricalStandardId) => {
    return standard === "IEC" ? "PVC Heavy Duty" : "EMT";
  };

  const getDefaultWire = (standard: ElectricalStandardId): WireEntry => ({
    id: "1",
    gauge: standard === "IEC" ? "2.5" : "12",
    quantity: 3,
    insulation: standard === "IEC" ? "PVC" : "THWN",
  });

  const [conduitType, setConduitType] = useState<string>(
    getDefaultConduitType(selectedStandard),
  );
  const [wires, setWires] = useState<WireEntry[]>([
    getDefaultWire(selectedStandard),
  ]);
  const [result, setResult] = useState<ConduitFillResult | null>(null);
  const [enhancedResult, setEnhancedResult] =
    useState<ConduitFillCalculationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [prevStandard, setPrevStandard] =
    useState<ElectricalStandardId>(selectedStandard);

  // Enhanced functionality state
  const [applicationType, setApplicationType] =
    useState<ConduitFillApplicationType>("residential");
  const [installationMethod, setInstallationMethod] =
    useState<ConduitFillInstallationMethod>("indoor");
  const [ambientTemperature, setAmbientTemperature] = useState<number>(30);
  const [environment, setEnvironment] = useState<string>("dry");
  const [futureFillReserve, setFutureFillReserve] = useState<number>(25);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Handle standard switching and unit conversion
  useEffect(() => {
    if (selectedStandard !== prevStandard) {
      // Clear results when standard changes
      setResult(null);
      setEnhancedResult(null);
      setError("");

      // Update conduit type to match new standard
      setConduitType(getDefaultConduitType(selectedStandard));

      // Convert wire gauges and update all wires
      setWires((prevWires) => {
        if (prevWires.length === 0) {
          // If no wires, create default wire for new standard
          return [getDefaultWire(selectedStandard)];
        }

        return prevWires.map((wire) => {
          let newGauge = wire.gauge;
          let newInsulation = wire.insulation;

          if (prevStandard === "NEC" && selectedStandard === "IEC") {
            // Convert AWG to mm²
            const mm2 = awgToMm2(wire.gauge);
            newGauge = mm2 ? mm2.toString() : "2.5";
            newInsulation = "PVC";
          } else if (prevStandard === "IEC" && selectedStandard === "NEC") {
            // Convert mm² to AWG
            const awg = mm2ToAwg(parseFloat(wire.gauge));
            newGauge = awg || "12";
            newInsulation = "THWN";
          }

          return { ...wire, gauge: newGauge, insulation: newInsulation };
        });
      });

      setPrevStandard(selectedStandard);
    }
  }, [selectedStandard, prevStandard]);

  const handleCalculate = () => {
    try {
      setError("");

      // Use new enhanced router system
      const input: ConduitFillCalculationInput = {
        wires: wires.map((w) => ({
          gauge: w.gauge,
          quantity: w.quantity,
          insulation: w.insulation,
        })),
        conduitType,
        wireStandard: selectedStandard === "IEC" ? "IEC" : "NEC",
        applicationType,
        installationMethod,
        ambientTemperature,
        environment: environment as
          | "indoor"
          | "outdoor"
          | "wet"
          | "dry"
          | "corrosive",
        futureFillReserve,
      };

      const enhancedResult = calculateConduitFill(input);
      setEnhancedResult(enhancedResult);

      // Convert to legacy format for backward compatibility
      const legacyResult: ConduitFillResult = {
        recommendedConduitSize: enhancedResult.recommendedConduitSize,
        fillPercentage: enhancedResult.fillAnalysis.fillPercentage,
        compliance: enhancedResult.compliance.codeCompliant,
        totalWireArea: enhancedResult.fillAnalysis.totalWireArea,
      };

      setResult(legacyResult);
    } catch (err) {
      const errorMessage = (err as Error)?.message || "Calculation failed";
      setError(errorMessage);
      setResult(null);
      setEnhancedResult(null);
    }
  };

  const addWire = () => {
    const newWire: WireEntry = {
      ...getDefaultWire(selectedStandard),
      id: Date.now().toString(),
      quantity: 1,
    };
    setWires([...wires, newWire]);
  };

  const removeWire = (id: string) => {
    setWires(wires.filter((w) => w.id !== id));
  };

  const updateWire = (
    id: string,
    field: keyof Omit<WireEntry, "id">,
    value: string | number,
  ) => {
    setWires(wires.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
    // Clear results when input changes
    setResult(null);
    setError("");
  };

  // Get wire options based on standard
  const getWireOptions = () => {
    if (selectedStandard === "IEC") {
      return IEC_CABLE_CROSS_SECTIONS.map((cable) => ({
        value: cable.size,
        label: `${cable.size} mm²`,
      }));
    } else {
      return WIRE_GAUGES.map((wire) => ({
        value: wire.awg,
        label: `${wire.awg} AWG`,
      }));
    }
  };

  // Get conduit types based on standard
  const getConduitTypes = () => {
    if (selectedStandard === "IEC") {
      return [
        { value: "PVC Heavy Duty", label: "PVC Heavy Duty" },
        { value: "PVC Medium Duty", label: "PVC Medium Duty" },
        { value: "Steel Heavy Duty", label: "Steel Heavy Duty" },
      ];
    } else {
      return [
        { value: "EMT", label: "EMT (Electrical Metallic Tubing)" },
        { value: "Rigid Steel", label: "Rigid Steel" },
        { value: "PVC Schedule 40", label: "PVC Schedule 40" },
        { value: "PVC Schedule 80", label: "PVC Schedule 80" },
      ];
    }
  };

  // Get insulation types based on standard
  const getInsulationTypes = () => {
    if (selectedStandard === "IEC") {
      return [
        { value: "PVC", label: "PVC" },
        { value: "XLPE", label: "XLPE" },
      ];
    } else {
      return [
        { value: "THWN", label: "THWN" },
        { value: "THHN", label: "THHN" },
        { value: "XHHW", label: "XHHW" },
        { value: "USE", label: "USE" },
      ];
    }
  };

  // Get validated values to prevent Material-UI warnings
  const getValidatedConduitType = () => {
    const availableTypes = getConduitTypes().map((type) => type.value);
    return availableTypes.includes(conduitType) ? conduitType : "";
  };

  const getValidatedWireGauge = (gauge: string) => {
    const availableGauges = getWireOptions().map((option) => option.value);
    return availableGauges.includes(gauge) ? gauge : "";
  };

  const getValidatedInsulation = (insulation: string) => {
    const availableTypes = getInsulationTypes().map((type) => type.value);
    return availableTypes.includes(insulation) ? insulation : "";
  };

  const standardName = selectedStandard === "IEC" ? "IEC 60364" : "NEC";

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Conduit Fill Calculator
        </Typography>
        <Chip label={standardName} color="primary" variant="outlined" />
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate required conduit size based on wire fill requirements per{" "}
        {standardName} standards.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conduit Configuration
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="conduit-type-label">
                      Conduit Type
                    </InputLabel>
                    <Select
                      labelId="conduit-type-label"
                      value={getValidatedConduitType()}
                      label="Conduit Type"
                      onChange={(e) => setConduitType(e.target.value)}
                    >
                      {getConduitTypes().map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="application-type-label">
                      Application Type
                    </InputLabel>
                    <Select
                      labelId="application-type-label"
                      value={applicationType}
                      label="Application Type"
                      onChange={(e) =>
                        setApplicationType(
                          e.target.value as ConduitFillApplicationType,
                        )
                      }
                      data-testid="application-type-select"
                    >
                      <MenuItem value="residential">Residential</MenuItem>
                      <MenuItem value="commercial">Commercial</MenuItem>
                      <MenuItem value="industrial">Industrial</MenuItem>
                      <MenuItem value="data_center">Data Center</MenuItem>
                      <MenuItem value="healthcare">Healthcare</MenuItem>
                      <MenuItem value="marine">Marine</MenuItem>
                      <MenuItem value="hazardous">Hazardous Locations</MenuItem>
                      <MenuItem value="outdoor">Outdoor</MenuItem>
                      <MenuItem value="underground">Underground</MenuItem>
                      <MenuItem value="high_temperature">
                        High Temperature
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="installation-method-label">
                      Installation Method
                    </InputLabel>
                    <Select
                      labelId="installation-method-label"
                      value={installationMethod}
                      label="Installation Method"
                      onChange={(e) =>
                        setInstallationMethod(
                          e.target.value as ConduitFillInstallationMethod,
                        )
                      }
                      data-testid="installation-method-select"
                    >
                      <MenuItem value="indoor">Indoor</MenuItem>
                      <MenuItem value="outdoor">Outdoor</MenuItem>
                      <MenuItem value="underground">Underground</MenuItem>
                      <MenuItem value="wet_location">Wet Location</MenuItem>
                      <MenuItem value="hazardous">Hazardous Location</MenuItem>
                      <MenuItem value="corrosive">
                        Corrosive Environment
                      </MenuItem>
                      <MenuItem value="high_temperature">
                        High Temperature
                      </MenuItem>
                      <MenuItem value="vibration">Vibration Prone</MenuItem>
                      <MenuItem value="buried">Direct Burial</MenuItem>
                      <MenuItem value="concealed">Concealed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    size="small"
                    data-testid="advanced-options-toggle"
                  >
                    {showAdvanced ? "Hide" : "Show"} Advanced Options
                  </Button>
                </Grid>
              </Grid>

              {showAdvanced && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Ambient Temperature (°C)"
                      type="number"
                      value={ambientTemperature}
                      onChange={(e) =>
                        setAmbientTemperature(Number(e.target.value))
                      }
                      size="small"
                      data-testid="ambient-temperature-input"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="environment-label">
                        Environment
                      </InputLabel>
                      <Select
                        labelId="environment-label"
                        value={environment}
                        label="Environment"
                        onChange={(e) => setEnvironment(e.target.value)}
                        data-testid="environment-select"
                      >
                        <MenuItem value="dry">Dry</MenuItem>
                        <MenuItem value="damp">Damp</MenuItem>
                        <MenuItem value="wet">Wet</MenuItem>
                        <MenuItem value="corrosive">Corrosive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Future Fill Reserve (%)"
                      type="number"
                      value={futureFillReserve}
                      onChange={(e) =>
                        setFutureFillReserve(Number(e.target.value))
                      }
                      size="small"
                      inputProps={{ min: 0, max: 50 }}
                      data-testid="future-fill-reserve-input"
                    />
                  </Grid>
                </Grid>
              )}

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">Wire Configuration</Typography>
                <Button
                  variant="outlined"
                  onClick={addWire}
                  startIcon={<Add />}
                  size="small"
                  data-testid="add-wire-button"
                >
                  Add Wire
                </Button>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Wire Gauge</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Insulation</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wires.map((wire) => (
                    <TableRow key={wire.id}>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <Select
                            value={getValidatedWireGauge(wire.gauge)}
                            onChange={(e) =>
                              updateWire(wire.id, "gauge", e.target.value)
                            }
                            data-testid={`wire-gauge-select-${wire.id}`}
                          >
                            {getWireOptions().map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={wire.quantity}
                          onChange={(e) =>
                            updateWire(
                              wire.id,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                          sx={{ width: 80 }}
                          data-testid={`wire-quantity-input-${wire.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <Select
                            value={getValidatedInsulation(wire.insulation)}
                            onChange={(e) =>
                              updateWire(wire.id, "insulation", e.target.value)
                            }
                            data-testid={`wire-insulation-select-${wire.id}`}
                          >
                            {getInsulationTypes().map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeWire(wire.id)}
                          disabled={wires.length === 1}
                          data-testid={`remove-wire-button-${wire.id}`}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={handleCalculate}
                  startIcon={<Calculate />}
                  fullWidth
                  size="large"
                  data-testid="calculate-button"
                >
                  Calculate Conduit Fill
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
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
                          {result.recommendedConduitSize}
                          {selectedStandard === "IEC" ? "mm" : '"'}
                        </Typography>
                        <Chip
                          icon={result.compliance ? <CheckCircle /> : <Error />}
                          label={result.compliance ? "Compliant" : "Over Fill"}
                          color={result.compliance ? "success" : "error"}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Fill Percentage
                      </Typography>
                      <Typography variant="h6">
                        {result.fillPercentage.toFixed(1)}%
                        {enhancedResult && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {" "}
                            (max:{" "}
                            {
                              enhancedResult.fillAnalysis
                                .maxAllowedFillPercentage
                            }
                            % - {enhancedResult.fillAnalysis.fillRule})
                          </Typography>
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Total Wire Area
                      </Typography>
                      <Typography variant="h6">
                        {result.totalWireArea.toFixed(4)}{" "}
                        {selectedStandard === "IEC" ? "mm²" : "sq in"}
                      </Typography>
                    </Grid>
                  </Grid>

                  {enhancedResult && (
                    <Box mt={3}>
                      <Typography variant="h6" gutterBottom>
                        Comprehensive Compliance
                      </Typography>

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item>
                          <Chip
                            icon={
                              enhancedResult.compliance.codeCompliant ? (
                                <CheckCircle />
                              ) : (
                                <Error />
                              )
                            }
                            label={`Code: ${enhancedResult.compliance.codeCompliant ? "Pass" : "Fail"}`}
                            color={
                              enhancedResult.compliance.codeCompliant
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={
                              enhancedResult.compliance.temperatureCompliant ? (
                                <CheckCircle />
                              ) : (
                                <Error />
                              )
                            }
                            label={`Temperature: ${enhancedResult.compliance.temperatureCompliant ? "Pass" : "Fail"}`}
                            color={
                              enhancedResult.compliance.temperatureCompliant
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </Grid>
                        <Grid item>
                          <Chip
                            icon={
                              enhancedResult.compliance.applicationCompliant ? (
                                <CheckCircle />
                              ) : (
                                <Error />
                              )
                            }
                            label={`Application: ${enhancedResult.compliance.applicationCompliant ? "Pass" : "Fail"}`}
                            color={
                              enhancedResult.compliance.applicationCompliant
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        <strong>Application:</strong>{" "}
                        {enhancedResult.applicationData.applicationType} -{" "}
                        {enhancedResult.applicationData.installationMethod}
                      </Typography>

                      {enhancedResult.applicationData.specialRequirements &&
                        enhancedResult.applicationData.specialRequirements
                          .length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Special Requirements:</strong>
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {enhancedResult.applicationData.specialRequirements
                                ?.slice(0, 3)
                                .map((req, idx) => (
                                  <li key={idx}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {req}
                                    </Typography>
                                  </li>
                                ))}
                            </ul>
                          </Box>
                        )}
                    </Box>
                  )}

                  <Box mt={3}>
                    <Alert
                      severity={result.compliance ? "success" : "warning"}
                      sx={{ mb: 2 }}
                    >
                      {result.compliance
                        ? `Conduit fill is within ${standardName} limits`
                        : `Conduit fill exceeds ${standardName} limits`}
                    </Alert>

                    <Typography variant="body2" color="text.secondary">
                      {selectedStandard === "IEC" ? (
                        <>
                          <strong>IEC 60364 Guidelines:</strong>
                          <br />
                          • Maximum 40% fill for multiple conductors
                          <br />
                          • Reduced fill for high temperature applications
                          <br />• Consider cable grouping factors
                        </>
                      ) : (
                        <>
                          <strong>NEC Chapter 9 Guidelines:</strong>
                          <br />
                          • Maximum 40% fill for 3 or more conductors
                          <br />
                          • Maximum 31% fill for 2 conductors
                          <br />• Maximum 53% fill for 1 conductor
                        </>
                      )}
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
