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
  GridLegacy as Grid,
} from "@mui/material";
import {
  Calculate,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { calculateWireSize } from "../utils/calculations/wireCalculatorRouter";
import type { VoltageDropInput, VoltageDropResult } from "../types";
import type {
  ElectricalStandardId,
  InstallationMethod,
} from "../types/standards";
import { WIRE_GAUGES } from "../utils/necTables";
import { IEC_CABLE_CROSS_SECTIONS } from "../standards/iec/cableTables";
import {
  getVoltageOptions,
  getInstallationMethods,
  feetToMeters,
  metersToFeet,
} from "../utils/conversions";

interface VoltageDropCalculatorProps {
  selectedStandard?: ElectricalStandardId;
}

// Helper function to check if standard uses metric system
const isMetricStandard = (standard: ElectricalStandardId): boolean => {
  return standard === "IEC" || standard === "BS7671";
};

// Get standard display name
const getStandardDisplayName = (standard: ElectricalStandardId): string => {
  switch (standard) {
    case "BS7671":
      return "BS 7671";
    case "IEC":
      return "IEC 60364";
    case "NEC":
      return "NEC";
    default:
      return standard;
  }
};

// Get initial voltage based on standard
const getInitialVoltage = (standard: ElectricalStandardId) => {
  const voltageOptions = getVoltageOptions(standard);
  return voltageOptions.single[0] || voltageOptions.threephase[0] || 120;
};

// Get initial installation method based on standard
const getInitialInstallationMethod = (
  standard: ElectricalStandardId,
): InstallationMethod => {
  const methods = getInstallationMethods(standard);
  return (methods[0]?.id as InstallationMethod) || "conduit";
};

// Get initial wire gauge based on standard
const getInitialWireGauge = (standard: ElectricalStandardId) => {
  if (isMetricStandard(standard)) {
    return "2.5"; // Default metric mm² size
  } else {
    return "12"; // Default NEC AWG size
  }
};

export default function VoltageDropCalculator({
  selectedStandard = "NEC",
}: VoltageDropCalculatorProps) {
  const [input, setInput] = useState<VoltageDropInput>({
    wireGauge: getInitialWireGauge(selectedStandard),
    current: 20,
    length: isMetricStandard(selectedStandard) ? 30.48 : 100,
    voltage: getInitialVoltage(selectedStandard),
    conductorMaterial: "copper",
    wireType: "single",
  });

  const [installationMethod, setInstallationMethod] =
    useState<InstallationMethod>(
      getInitialInstallationMethod(selectedStandard),
    );

  const [result, setResult] = useState<VoltageDropResult | null>(null);
  const [error, setError] = useState<string>("");
  const [prevStandard, setPrevStandard] =
    useState<ElectricalStandardId>(selectedStandard);

  // Handle standard switching and unit conversion
  useEffect(() => {
    if (selectedStandard !== prevStandard) {
      // Clear results when standard changes
      setResult(null);
      setError("");

      // Convert units when switching standards
      setInput((prev) => {
        const newInput = { ...prev };

        // Convert units and set valid default values for the new standard
        const prevIsMetric = isMetricStandard(prevStandard);
        const newIsMetric = isMetricStandard(selectedStandard);

        if (!prevIsMetric && newIsMetric) {
          // Converting from NEC to metric (IEC or BS7671)
          newInput.length = feetToMeters(prev.length);
          // Convert AWG to mm²
          if (prev.wireGauge === "14") newInput.wireGauge = "2.5";
          else if (prev.wireGauge === "12") newInput.wireGauge = "4";
          else if (prev.wireGauge === "10") newInput.wireGauge = "6";
          else if (prev.wireGauge === "8") newInput.wireGauge = "10";
          else newInput.wireGauge = "2.5";
          // Set valid voltage for the new metric standard
          newInput.voltage = getInitialVoltage(selectedStandard);
        } else if (prevIsMetric && !newIsMetric) {
          // Converting from metric (IEC or BS7671) to NEC
          newInput.length = metersToFeet(prev.length);
          // Convert mm² to AWG
          if (prev.wireGauge === "2.5") newInput.wireGauge = "14";
          else if (prev.wireGauge === "4") newInput.wireGauge = "12";
          else if (prev.wireGauge === "6") newInput.wireGauge = "10";
          else if (prev.wireGauge === "10") newInput.wireGauge = "8";
          else newInput.wireGauge = "12";
          // Set valid NEC voltage
          newInput.voltage = getInitialVoltage(selectedStandard);
        } else {
          // Same system (metric to metric, or within same standard)
          // Just ensure voltage and wire gauge are valid for the new standard
          const newVoltageOptions = getVoltageOptions(selectedStandard);
          const allNewVoltages = [
            ...newVoltageOptions.single,
            ...newVoltageOptions.threephase,
          ];
          if (!allNewVoltages.includes(prev.voltage)) {
            newInput.voltage = getInitialVoltage(selectedStandard);
          }
          // Ensure wire gauge is valid for the new standard
          if (prevIsMetric !== newIsMetric) {
            newInput.wireGauge = getInitialWireGauge(selectedStandard);
          }
        }

        return newInput;
      });

      // Update installation method for the new standard
      setInstallationMethod(getInitialInstallationMethod(selectedStandard));

      setPrevStandard(selectedStandard);
    }
  }, [selectedStandard, prevStandard]);

  const handleCalculate = () => {
    try {
      setError("");

      // Use the unified wire calculator router
      const routerResult = calculateWireSize({
        standard: selectedStandard || "NEC",
        loadCurrent: input.current,
        circuitLength: input.length,
        voltage: input.voltage,
        voltageSystem:
          input.wireType === "three-phase" ? "three-phase" : "single",
        conductorMaterial: input.conductorMaterial,
        powerFactor: 0.8,
        ambientTemperature: 30,
        installationMethod,
        temperatureRating: selectedStandard === "NEC" ? 75 : undefined,
        numberOfConductors: 3,
      });

      // Convert router result to VoltageDropResult format
      const calculationResult = {
        voltageDropPercent: routerResult.voltageDropPercent,
        voltageDropVolts: routerResult.voltageDropVolts,
        voltageAtLoad: input.voltage - routerResult.voltageDropVolts,
        compliance: routerResult.compliance.voltageDropCompliant,
      };

      setResult(calculationResult);
    } catch (err) {
      const errorMessage = (err as Error)?.message || "Calculation failed";
      setError(errorMessage);
      setResult(null);
    }
  };

  const handleInputChange = (
    field: keyof VoltageDropInput,
    value: string | number,
  ) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear results when input changes
    setResult(null);
    setError("");
  };

  // Get wire options based on standard
  const getWireOptions = () => {
    if (isMetricStandard(selectedStandard)) {
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

  // Get validated values to prevent Material-UI warnings
  const getValidatedWireGauge = () => {
    const availableOptions = getWireOptions().map((option) => option.value);
    return availableOptions.includes(input.wireGauge) ? input.wireGauge : "";
  };

  const getValidatedVoltage = () => {
    return allVoltageOptions.includes(input.voltage) ? input.voltage : "";
  };

  const getValidatedInstallationMethod = () => {
    const availableMethods = getInstallationMethods(selectedStandard).map(
      (method) => method.id,
    );
    return availableMethods.includes(installationMethod)
      ? installationMethod
      : "";
  };

  // Get voltage options based on standard
  const voltageOptions = getVoltageOptions(selectedStandard);
  const allVoltageOptions = [
    ...voltageOptions.single,
    ...voltageOptions.threephase,
  ];

  // Get unit labels based on standard
  const lengthUnit = isMetricStandard(selectedStandard) ? "m" : "ft";
  const wireLabel = isMetricStandard(selectedStandard)
    ? "Cable Size"
    : "Wire Gauge";
  const standardName = getStandardDisplayName(selectedStandard);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Voltage Drop Calculator
        </Typography>
        <Chip label={standardName} color="primary" variant="outlined" />
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate voltage drop for a specific wire gauge and circuit
        configuration using {standardName} standards.
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
                  <FormControl fullWidth>
                    <InputLabel id="wire-gauge-label">{wireLabel}</InputLabel>
                    <Select
                      labelId="wire-gauge-label"
                      data-testid="wire-gauge-selector"
                      value={getValidatedWireGauge()}
                      label={wireLabel}
                      onChange={(e) =>
                        handleInputChange("wireGauge", e.target.value)
                      }
                    >
                      {getWireOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current (A)"
                    type="number"
                    value={input.current}
                    onChange={(e) =>
                      handleInputChange("current", Number(e.target.value))
                    }
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label={`Length (${lengthUnit})`}
                    type="number"
                    value={input.length}
                    onChange={(e) =>
                      handleInputChange("length", Number(e.target.value))
                    }
                    fullWidth
                    required
                    inputProps={{ min: 0, step: lengthUnit === "m" ? 0.1 : 1 }}
                    data-testid="length-input"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="voltage-label">Voltage</InputLabel>
                    <Select
                      labelId="voltage-label"
                      data-testid="voltage-selector"
                      value={getValidatedVoltage()}
                      label="Voltage"
                      onChange={(e) =>
                        handleInputChange("voltage", Number(e.target.value))
                      }
                    >
                      {allVoltageOptions.map((voltage) => (
                        <MenuItem key={voltage} value={voltage}>
                          {voltage}V
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="conductor-material-label">
                      Conductor Material
                    </InputLabel>
                    <Select
                      labelId="conductor-material-label"
                      value={input.conductorMaterial}
                      label="Conductor Material"
                      onChange={(e) =>
                        handleInputChange("conductorMaterial", e.target.value)
                      }
                    >
                      <MenuItem value="copper">Copper</MenuItem>
                      <MenuItem value="aluminum">Aluminum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="wire-type-label">Wire Type</InputLabel>
                    <Select
                      labelId="wire-type-label"
                      value={input.wireType}
                      label="Wire Type"
                      onChange={(e) =>
                        handleInputChange("wireType", e.target.value)
                      }
                    >
                      <MenuItem value="single">Single Phase</MenuItem>
                      <MenuItem value="three-phase">Three Phase</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="installation-method-label">
                      Installation Method
                    </InputLabel>
                    <Select
                      labelId="installation-method-label"
                      value={getValidatedInstallationMethod()}
                      label="Installation Method"
                      onChange={(e) =>
                        setInstallationMethod(
                          e.target.value as InstallationMethod,
                        )
                      }
                    >
                      {getInstallationMethods(selectedStandard).map(
                        (method) => (
                          <MenuItem key={method.id} value={method.id}>
                            {method.name}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={handleCalculate}
                  startIcon={<Calculate />}
                  fullWidth
                  size="large"
                >
                  Calculate Voltage Drop
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
                          {result.voltageDropPercent.toFixed(2)}%
                        </Typography>
                        <Chip
                          icon={
                            result.compliance ? <CheckCircle /> : <ErrorIcon />
                          }
                          label={
                            result.compliance
                              ? "Within Limits"
                              : "Exceeds Limits"
                          }
                          color={result.compliance ? "success" : "error"}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Voltage Drop (Volts)
                      </Typography>
                      <Typography variant="h6">
                        {result.voltageDropVolts.toFixed(2)}V
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Voltage at Load
                      </Typography>
                      <Typography variant="h6">
                        {result.voltageAtLoad.toFixed(2)}V
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={3}>
                    <Alert
                      severity={result.compliance ? "success" : "warning"}
                      sx={{ mb: 2 }}
                    >
                      {result.compliance
                        ? `Voltage drop is within ${standardName} recommended limits`
                        : `Voltage drop exceeds ${standardName} recommended limits`}
                    </Alert>

                    <Typography variant="body2" color="text.secondary">
                      {selectedStandard === "BS7671" ? (
                        <>
                          <strong>BS 7671 limits:</strong>
                          <br />
                          • Lighting circuits: ≤3% voltage drop (6.9V max at
                          230V)
                          <br />
                          • Other circuits: ≤5% voltage drop (11.5V max at 230V)
                          <br />• Based on public distribution system supply
                        </>
                      ) : selectedStandard === "IEC" ? (
                        <>
                          <strong>IEC 60364 limits:</strong>
                          <br />
                          • Final circuits: ≤4% voltage drop
                          <br />
                          • Distribution circuits: ≤2% voltage drop
                          <br />• Total system: ≤6% voltage drop
                        </>
                      ) : (
                        <>
                          <strong>NEC recommended limits:</strong>
                          <br />
                          • Branch circuits: ≤3% voltage drop
                          <br />
                          • Feeders: ≤2.5% voltage drop
                          <br />• Total system: ≤5% voltage drop
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
