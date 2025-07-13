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
  Alert,
  Divider,
} from "@mui/material";
import {
  DirectionsCar,
  Sailing,
  WbSunny,
  Router,
  Battery4Bar,
  Lightbulb,
  Factory,
} from "@mui/icons-material";
import type {
  DCApplicationType,
  ElectricalStandardId,
} from "../types/standards";
import { getApplicationStandard } from "../standards/dc/applications";
import { getDCVoltages } from "../standards";

interface DCApplicationSelectorProps {
  selectedApplication: DCApplicationType;
  onApplicationChange: (application: DCApplicationType) => void;
  selectedStandard: ElectricalStandardId;
  onStandardChange: (standard: ElectricalStandardId) => void;
}

const APPLICATION_ICONS: Record<DCApplicationType, typeof DirectionsCar> = {
  automotive: DirectionsCar,
  marine: Sailing,
  solar: WbSunny,
  telecom: Router,
  battery: Battery4Bar,
  led: Lightbulb,
  industrial: Factory,
};

const APPLICATION_STANDARDS: Record<DCApplicationType, ElectricalStandardId> = {
  automotive: "DC_AUTOMOTIVE",
  marine: "DC_MARINE",
  solar: "DC_SOLAR",
  telecom: "DC_TELECOM",
  battery: "DC_SOLAR", // Use solar standard for battery systems
  led: "DC_AUTOMOTIVE", // Use automotive standard for LED systems
  industrial: "DC_SOLAR", // Use solar standard for industrial systems
};

export default function DCApplicationSelector({
  selectedApplication,
  onApplicationChange,
  selectedStandard,
  onStandardChange,
}: DCApplicationSelectorProps) {
  const handleApplicationChange = (application: DCApplicationType) => {
    onApplicationChange(application);
    // Automatically update standard based on application
    const recommendedStandard = APPLICATION_STANDARDS[application];
    if (recommendedStandard !== selectedStandard) {
      onStandardChange(recommendedStandard);
    }
  };

  const currentApplication = getApplicationStandard(selectedApplication);
  const availableVoltages = getDCVoltages(selectedStandard);
  const Icon = APPLICATION_ICONS[selectedApplication];

  const getApplicationDescription = (app: DCApplicationType): string => {
    switch (app) {
      case "automotive":
        return "12V/24V automotive electrical systems with ISO 6722 compliance";
      case "marine":
        return "12V/24V/48V marine electrical systems following ABYC standards";
      case "solar":
        return "Solar panel and renewable energy systems with efficiency optimization";
      case "telecom":
        return "24V/48V telecommunications and data center power systems";
      case "battery":
        return "Battery charging and energy storage systems";
      case "led":
        return "Low voltage LED lighting and control systems";
      case "industrial":
        return "Industrial DC power systems and motor drives";
      default:
        return "DC electrical system";
    }
  };

  const getVoltageDropGuidance = (app: DCApplicationType): string => {
    switch (app) {
      case "automotive":
        return "Automotive systems require strict voltage drop limits (≤2%) for reliable operation of ECUs and safety systems.";
      case "marine":
        return "Marine environments require corrosion-resistant materials and ABYC-compliant voltage drop limits (≤3%).";
      case "solar":
        return "Solar systems prioritize efficiency - minimize voltage drop (≤2%) to maximize energy harvest.";
      case "telecom":
        return "Telecommunications require extremely tight voltage regulation (≤1%) for system reliability.";
      case "battery":
        return "Battery charging systems need low voltage drop (≤1.5%) for optimal charging efficiency.";
      case "led":
        return "LED systems can tolerate higher voltage drop (≤3%) but color consistency may be affected.";
      case "industrial":
        return "Industrial systems require reliable voltage regulation (≤2%) for consistent motor and control operation.";
      default:
        return "Follow application-specific voltage drop guidelines.";
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Icon color="primary" />
          <Typography variant="h6">DC Application Selection</Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="dc-application-type-label">
            DC Application Type
          </InputLabel>
          <Select
            labelId="dc-application-type-label"
            value={selectedApplication}
            label="DC Application Type"
            onChange={(e) =>
              handleApplicationChange(e.target.value as DCApplicationType)
            }
            data-testid="application-selector"
          >
            <MenuItem value="automotive">
              <Box display="flex" alignItems="center" gap={1}>
                <DirectionsCar fontSize="small" />
                <Box>
                  <Typography variant="body1">Automotive</Typography>
                  <Typography variant="caption" color="text.secondary">
                    12V/24V vehicle electrical systems
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <MenuItem value="marine">
              <Box display="flex" alignItems="center" gap={1}>
                <Sailing fontSize="small" />
                <Box>
                  <Typography variant="body1">Marine</Typography>
                  <Typography variant="caption" color="text.secondary">
                    12V/24V/48V boat electrical systems
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <MenuItem value="solar">
              <Box display="flex" alignItems="center" gap={1}>
                <WbSunny fontSize="small" />
                <Box>
                  <Typography variant="body1">Solar/Renewable</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Solar panels and energy storage
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <MenuItem value="telecom">
              <Box display="flex" alignItems="center" gap={1}>
                <Router fontSize="small" />
                <Box>
                  <Typography variant="body1">Telecommunications</Typography>
                  <Typography variant="caption" color="text.secondary">
                    24V/48V telecom and data center power
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <MenuItem value="battery">
              <Box display="flex" alignItems="center" gap={1}>
                <Battery4Bar fontSize="small" />
                <Box>
                  <Typography variant="body1">Battery Systems</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Battery charging and energy storage
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <MenuItem value="led">
              <Box display="flex" alignItems="center" gap={1}>
                <Lightbulb fontSize="small" />
                <Box>
                  <Typography variant="body1">LED Lighting</Typography>
                  <Typography variant="caption" color="text.secondary">
                    12V/24V LED lighting systems
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <MenuItem value="industrial">
              <Box display="flex" alignItems="center" gap={1}>
                <Factory fontSize="small" />
                <Box>
                  <Typography variant="body1">Industrial</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Industrial DC power and motor systems
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Application Details */}
        <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              {currentApplication.name}
            </Typography>
            <Chip
              label={selectedStandard}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            {getApplicationDescription(selectedApplication)}
          </Typography>

          <Box display="flex" gap={1} mb={2}>
            <Chip
              label={`Voltages: ${availableVoltages.join("V, ")}V`}
              size="small"
              color="info"
              variant="outlined"
            />
            <Chip
              label={`Voltage Drop: ≤${currentApplication.voltageDropLimits.normal}%`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Temp: ${currentApplication.temperatureRange.min}°C to ${currentApplication.temperatureRange.max}°C`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Application-Specific Guidance */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {selectedApplication.charAt(0).toUpperCase() +
              selectedApplication.slice(1)}{" "}
            System Guidelines
          </Typography>
          <Typography variant="body2">
            {getVoltageDropGuidance(selectedApplication)}
          </Typography>
        </Alert>

        {/* Standards Information */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Applicable Standards
          </Typography>
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {currentApplication.wireStandards.map((standard) => (
              <Chip
                key={standard}
                label={standard}
                size="small"
                variant="outlined"
                color="secondary"
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
