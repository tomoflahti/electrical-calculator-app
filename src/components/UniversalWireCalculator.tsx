import { useState, useEffect } from "react";
import { handleNumberInput, getNumericValue } from "../utils/inputHelpers";
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
  GridLegacy as Grid,
} from "@mui/material";
import { Calculate, CheckCircle, Error } from "@mui/icons-material";
import {
  calculateWireSize,
  type WireCalculationInput as RouterWireInput,
  type WireCalculationResult as RouterWireResult,
} from "../utils/calculations/wireCalculatorRouter";
import {
  getVoltageOptions,
  getInstallationMethods,
  formatWireSize,
} from "../utils/conversions";
import type {
  ElectricalStandardId,
  CableCalculationInput,
  CableCalculationResult,
  InstallationMethod,
} from "../types/standards";
import type { WireCalculationResult } from "../types";

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

export default function UniversalWireCalculator({
  selectedStandard,
}: UniversalWireCalculatorProps) {
  const [input, setInput] = useState<CableCalculationInput>(() => {
    let initialVoltage: number;
    if (selectedStandard === "NEC") {
      initialVoltage = 120;
    } else {
      initialVoltage = 230;
    }

    let initialInstallationMethod: string;
    if (selectedStandard === "NEC") {
      initialInstallationMethod = "conduit";
    } else {
      initialInstallationMethod = "A1";
    }

    return {
      standard: selectedStandard,
      loadCurrent: 20,
      circuitLength: 100,
      voltage: initialVoltage,
      voltageSystem: "single",
      installationMethod: initialInstallationMethod as InstallationMethod,
      conductorMaterial: "copper",
      ambientTemperature: 30,
      numberOfConductors: 3,
      powerFactor: 0.8,
    };
  });

  // Form input state for better UX (prevents leading zeros and empty->0 conversion)
  const [formInputs, setFormInputs] = useState<FormInputState>({
    loadCurrent: "20",
    circuitLength: "100",
    ambientTemperature: "30",
    numberOfConductors: "3",
    powerFactor: "0.8",
  });

  const [result, setResult] = useState<
    CableCalculationResult | WireCalculationResult | RouterWireResult | null
  >(null);
  const [error, setError] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const voltageOptions = getVoltageOptions(selectedStandard);
  const installationMethods = getInstallationMethods(selectedStandard);

  // Get validated values to prevent Material-UI warnings
  const getValidatedVoltage = () => {
    const availableVoltages =
      input.voltageSystem === "single"
        ? voltageOptions.single
        : voltageOptions.threephase;
    return availableVoltages.includes(input.voltage) ? input.voltage : "";
  };

  const getValidatedInstallationMethod = () => {
    const availableMethods = installationMethods.map((method) => method.id);
    return availableMethods.includes(input.installationMethod)
      ? input.installationMethod
      : "";
  };

  const getValidatedVoltageSystem = () => {
    const availableOptions = ["single", "three-phase"];
    return availableOptions.includes(input.voltageSystem)
      ? input.voltageSystem
      : "";
  };

  // Update input when standard changes
  useEffect(() => {
    const voltageOpts = getVoltageOptions(selectedStandard);

    // Use AC-only logic
    const defaultVoltage =
      input.voltageSystem === "single"
        ? voltageOpts.single[0]
        : voltageOpts.threephase[0];

    let defaultInstallationMethod: string;
    if (selectedStandard === "NEC") {
      defaultInstallationMethod = "conduit";
    } else {
      defaultInstallationMethod = "A1";
    }

    setInput((prev) => ({
      ...prev,
      standard: selectedStandard,
      voltage: defaultVoltage,
      installationMethod: defaultInstallationMethod as InstallationMethod,
    }));
  }, [selectedStandard, input.voltageSystem]);

  const handleCalculate = () => {
    try {
      setError("");

      // Create router input for AC calculations only
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

        // AC-specific fields
        temperatureRating: 75 as 60 | 75 | 90,
        includeNECMultiplier: selectedStandard === "NEC",
        calculateDerating: true,
        strictCompliance: true,
      };

      // Use unified router for AC calculations
      const calculationResult = calculateWireSize(routerInput);
      setResult(calculationResult);
    } catch (err) {
      const errorMessage = (err as Error)?.message || "Calculation failed";
      setError(errorMessage);
      setResult(null);
    }
  };

  const handleInputChange = (
    field: keyof CableCalculationInput,
    value: string | number,
  ) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for form inputs (prevents leading zeros and handles empty values)
  const handleFormInputChange = (
    field: keyof FormInputState,
    value: string,
  ) => {
    const processedValue = handleNumberInput(value, {
      min: field === "loadCurrent" ? 0.1 : field === "circuitLength" ? 1 : 0,
      allowDecimals: field !== "numberOfConductors",
      allowEmpty: true,
      emptyValue: "",
    });

    if (processedValue !== null) {
      setFormInputs((prev) => ({
        ...prev,
        [field]: String(processedValue),
      }));
    }
  };

  const isEuropeanStandard =
    selectedStandard === "IEC" || selectedStandard === "BS7671";

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AC Wire Size Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate required cable size for AC electrical systems based on{" "}
        {selectedStandard} standards with proper current capacity and voltage
        drop considerations.
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
                    onChange={(e) =>
                      handleFormInputChange("loadCurrent", e.target.value)
                    }
                    fullWidth
                    required
                    data-testid="load-current-input"
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "[0-9]*\\.?[0-9]*",
                    }}
                    helperText="Continuous operating current"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label={`Circuit Length (${selectedStandard === "NEC" ? "ft" : "m"})`}
                    type="text"
                    value={formInputs.circuitLength}
                    onChange={(e) =>
                      handleFormInputChange("circuitLength", e.target.value)
                    }
                    fullWidth
                    required
                    data-testid="circuit-length-input"
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "[0-9]*\\.?[0-9]*",
                    }}
                    helperText="One-way distance to load"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="voltage-system-label">
                      Voltage System
                    </InputLabel>
                    <Select
                      labelId="voltage-system-label"
                      value={getValidatedVoltageSystem()}
                      label="Voltage System"
                      onChange={(e) => {
                        const newVoltageSystem = e.target.value as
                          | "single"
                          | "three-phase";
                        const voltageOpts = getVoltageOptions(selectedStandard);
                        handleInputChange("voltageSystem", newVoltageSystem);
                        handleInputChange(
                          "voltage",
                          newVoltageSystem === "single"
                            ? voltageOpts.single[0]
                            : voltageOpts.threephase[0],
                        );
                      }}
                    >
                      <MenuItem value="single">Single Phase</MenuItem>
                      <MenuItem value="three-phase">Three Phase</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="voltage-label">Voltage</InputLabel>
                    <Select
                      labelId="voltage-label"
                      value={getValidatedVoltage()}
                      label="Voltage"
                      data-testid="voltage-selector"
                      onChange={(e) =>
                        handleInputChange("voltage", Number(e.target.value))
                      }
                    >
                      {(input.voltageSystem === "single"
                        ? voltageOptions.single
                        : voltageOptions.threephase
                      ).map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}V
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
                    <InputLabel id="installation-method-label">
                      Installation Method
                    </InputLabel>
                    <Select
                      labelId="installation-method-label"
                      value={getValidatedInstallationMethod()}
                      label="Installation Method"
                      onChange={(e) =>
                        handleInputChange("installationMethod", e.target.value)
                      }
                    >
                      {installationMethods.map((method) => (
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
                        onChange={(e) =>
                          handleFormInputChange(
                            "ambientTemperature",
                            e.target.value,
                          )
                        }
                        fullWidth
                        inputProps={{
                          inputMode: "decimal",
                          pattern: "[0-9]*\\.?[0-9]*",
                        }}
                        helperText="Operating environment temperature"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Number of Conductors"
                        type="text"
                        value={formInputs.numberOfConductors}
                        onChange={(e) =>
                          handleFormInputChange(
                            "numberOfConductors",
                            e.target.value,
                          )
                        }
                        fullWidth
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*",
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
                          onChange={(e) =>
                            handleFormInputChange("powerFactor", e.target.value)
                          }
                          fullWidth
                          inputProps={{
                            inputMode: "decimal",
                            pattern: "[0-9]*\\.?[0-9]*",
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
                  Calculate Wire Size
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
                            "recommendedWireSize" in result
                              ? result.recommendedWireSize // Router result format
                              : (result as any).recommendedCableSize ||
                                  (result as any).recommendedWireGauge, // Legacy formats
                            selectedStandard,
                          )}
                        </Typography>
                        <Chip
                          icon={(() => {
                            if (!result.compliance) return <Error />;

                            // Check if this is a router result with standardized compliance
                            if ("standardCompliant" in result.compliance) {
                              return result.compliance.standardCompliant ? (
                                <CheckCircle />
                              ) : (
                                <Error />
                              );
                            }

                            // Legacy result formats (AC only)
                            if ("necCompliant" in result.compliance)
                              return result.compliance.necCompliant ? (
                                <CheckCircle />
                              ) : (
                                <Error />
                              );

                            return <Error />;
                          })()}
                          label={(() => {
                            if (!result.compliance) return "Non-Compliant";

                            // Check if this is a router result with standardized compliance
                            if ("standardCompliant" in result.compliance) {
                              return result.compliance.standardCompliant
                                ? "Standard Compliant"
                                : "Non-Compliant";
                            }

                            // Legacy result formats (AC only)
                            if ("necCompliant" in result.compliance)
                              return result.compliance.necCompliant
                                ? "Standard Compliant"
                                : "Non-Compliant";

                            return "Non-Compliant";
                          })()}
                          color={(() => {
                            if (!result.compliance) return "error";

                            // Check if this is a router result with standardized compliance
                            if ("standardCompliant" in result.compliance) {
                              return result.compliance.standardCompliant
                                ? "success"
                                : "error";
                            }

                            // Legacy result formats (AC only)
                            if ("necCompliant" in result.compliance)
                              return result.compliance.necCompliant
                                ? "success"
                                : "error";

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
                          "currentCapacity" in result
                            ? result.currentCapacity // Router result format
                            : (
                                result as WireCalculationResult & {
                                  currentCapacity?: number;
                                }
                              ).currentCapacity || 0 // IEC result format or fallback
                        }
                        A
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

                    {"correctionFactors" in result &&
                      result.correctionFactors && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Derating
                          </Typography>
                          <Typography variant="h6">
                            {(
                              Object.values(result.correctionFactors).reduce(
                                (a, b) => (a || 1) * (b || 1),
                                1,
                              ) * 100
                            ).toFixed(1)}
                            %
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
                        icon={
                          result.compliance &&
                          ((result.compliance as any).currentCompliant !==
                          undefined
                            ? (result.compliance as any).currentCompliant
                            : (result.compliance as any).ampacityCompliant) ? (
                            <CheckCircle />
                          ) : (
                            <Error />
                          )
                        }
                        label="Current Capacity"
                        color={
                          result.compliance &&
                          ((result.compliance as any).currentCompliant !==
                          undefined
                            ? (result.compliance as any).currentCompliant
                            : (result.compliance as any).ampacityCompliant)
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                      <Chip
                        icon={
                          result.compliance &&
                          result.compliance.voltageDropCompliant ? (
                            <CheckCircle />
                          ) : (
                            <Error />
                          )
                        }
                        label="Voltage Drop"
                        color={
                          result.compliance &&
                          result.compliance.voltageDropCompliant
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </Box>
                  </Box>

                  {isEuropeanStandard &&
                    "correctionFactors" in result &&
                    result.correctionFactors && (
                      <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom>
                          Correction Factors
                        </Typography>
                        <Grid container spacing={1}>
                          {Object.entries(result.correctionFactors).map(
                            ([key, value]) =>
                              value && (
                                <Grid item xs={6} key={key}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </Typography>
                                  <Typography variant="body2">
                                    {(value * 100).toFixed(1)}%
                                  </Typography>
                                </Grid>
                              ),
                          )}
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
