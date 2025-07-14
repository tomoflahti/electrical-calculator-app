import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  ListSubheader,
} from "@mui/material";
import { Public, Engineering } from "@mui/icons-material";
import {
  getAllStandards,
  getACStandards,
  getDCStandards,
  isDCStandard,
} from "../standards";
import type { ElectricalStandardId } from "../types/standards";

interface StandardSelectorProps {
  selectedStandard: ElectricalStandardId;
  onStandardChange: (standard: ElectricalStandardId) => void;
  calculatorType?: "ac" | "dc" | "all";
}

export default function StandardSelector({
  selectedStandard,
  onStandardChange,
  calculatorType = "all",
}: StandardSelectorProps) {
  const acStandards = getACStandards();
  const dcStandards = getDCStandards();
  const currentStandard = getAllStandards().find(
    (s) => s.id === selectedStandard,
  );
  const isCurrentDC = isDCStandard(selectedStandard);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Engineering color="primary" />
          <Typography variant="h6">Electrical Standard Selection</Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="electrical-standard-label">
            Electrical Standard
          </InputLabel>
          <Select
            labelId="electrical-standard-label"
            value={selectedStandard}
            label="Electrical Standard"
            onChange={(e) =>
              onStandardChange(e.target.value as ElectricalStandardId)
            }
          >
            {/* AC Standards Group - only show if calculatorType allows */}
            {(calculatorType === "all" || calculatorType === "ac") && (
              <>
                <ListSubheader>AC Standards (Mains Power)</ListSubheader>
                {acStandards.map((standard) => {
                  return (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.name} - {standard.fullName}
                    </MenuItem>
                  );
                })}
              </>
            )}

            {/* DC Standards Group - only show if calculatorType allows */}
            {(calculatorType === "all" || calculatorType === "dc") && (
              <>
                <ListSubheader>DC Standards (Low Voltage)</ListSubheader>
                {dcStandards.map((standard) => {
                  return (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.name} - {standard.fullName}
                    </MenuItem>
                  );
                })}
              </>
            )}
          </Select>
        </FormControl>

        {currentStandard && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Standard Information
            </Typography>

            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip
                icon={<Engineering />}
                label={`Wire System: ${currentStandard.wireSystem === "AWG" ? "AWG Gauge" : "mm² Cross-Section"}`}
                size="small"
                variant="outlined"
                color={isCurrentDC ? "secondary" : "primary"}
              />
              <Chip
                icon={<Public />}
                label={`Voltage Drop: ${currentStandard.voltageDropLimits.branch}%`}
                size="small"
                variant="outlined"
                color={isCurrentDC ? "secondary" : "primary"}
              />
              {isCurrentDC && (
                <Chip
                  label={`Application: ${currentStandard.applicationType || "General"}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {isCurrentDC ? (
              /* DC Standard Information */
              <Box>
                <Box display="flex" gap={3} mb={2}>
                  <Box flex={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      DC Voltages
                    </Typography>
                    <Typography variant="body2">
                      {currentStandard.voltages.dc?.join("V, ")}V
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Application Type
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {currentStandard.applicationType || "General DC"}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {currentStandard.applicationType === "automotive" &&
                    "Designed for 12V/24V automotive electrical systems with strict voltage drop requirements for reliable ECU and safety system operation."}
                  {currentStandard.applicationType === "marine" &&
                    "Marine-grade electrical systems following ABYC standards for corrosion resistance and safety in marine environments."}
                  {currentStandard.applicationType === "solar" &&
                    "Solar and renewable energy systems optimized for efficiency and minimal power loss in DC power generation."}
                  {currentStandard.applicationType === "telecom" &&
                    "Telecommunications and data center power systems requiring extremely tight voltage regulation for system reliability."}
                </Typography>
              </Box>
            ) : (
              /* AC Standard Information */
              <Box display="flex" gap={3}>
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Single Phase Voltages
                  </Typography>
                  <Typography variant="body2">
                    {currentStandard.voltages.singlePhase.join("V, ")}V
                  </Typography>
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Three Phase Voltages
                  </Typography>
                  <Typography variant="body2">
                    {currentStandard.voltages.threePhase.join("V, ")}V
                  </Typography>
                </Box>
              </Box>
            )}

            <Box mt={2}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Applicable Regions
              </Typography>
              <Typography variant="body2">
                {currentStandard.regions.join(", ")}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
