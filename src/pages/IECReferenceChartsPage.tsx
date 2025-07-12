/**
 * IEC Reference Charts Page
 * International standard electrical reference charts for professionals
 * Pure IEC/Metric implementation - no imperial units
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { Info, Cable, Bolt, Settings, TrendingUp } from '@mui/icons-material';
import IECCableAmpacityChart from '../components/charts/IECCableAmpacityChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`iec-tabpanel-${index}`}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const IECReferenceChartsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [selectedTemperature, setSelectedTemperature] = useState<70 | 90>(70);
  const [selectedInstallationMethod, setSelectedInstallationMethod] = useState('A1');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const installationMethods = [
    { value: 'A1', label: 'Single cable clipped direct' },
    { value: 'A2', label: 'Multi-core cable clipped direct' },
    { value: 'B1', label: 'Single cable in conduit on wall' },
    { value: 'B2', label: 'Multi-core cable in conduit on wall' },
    { value: 'C', label: 'Cables in conduit buried in ground' },
    { value: 'D1', label: 'Single cable direct buried' },
    { value: 'D2', label: 'Multi-core cable direct buried' },
    { value: 'E', label: 'Cables in free air' },
    { value: 'F', label: 'Single cable on perforated tray' },
    { value: 'G', label: 'Multi-core cable on tray' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Cable sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              IEC Reference Charts
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              International Electrical Standards (IEC 60364) - Pure Metric Implementation
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Standards Information */}
      <Alert 
        severity="info" 
        icon={<Info />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          <strong>IEC International Standards:</strong> These charts follow IEC 60364 electrical installation standards. 
          All measurements are in metric units (mm², A, °C). Cable sizes are based on European copper conductor specifications.
        </Typography>
      </Alert>

      {/* Chart Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings /> Chart Configuration
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Conductor Material</InputLabel>
                <Select
                  value={selectedMaterial}
                  label="Conductor Material"
                  onChange={(e) => setSelectedMaterial(e.target.value as 'copper' | 'aluminum')}
                >
                  <MenuItem value="copper">Copper</MenuItem>
                  <MenuItem value="aluminum">Aluminum</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Temperature Rating</InputLabel>
                <Select
                  value={selectedTemperature}
                  label="Temperature Rating"
                  onChange={(e) => setSelectedTemperature(e.target.value as 70 | 90)}
                >
                  <MenuItem value={70}>70°C</MenuItem>
                  <MenuItem value={90}>90°C</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Installation Method</InputLabel>
                <Select
                  value={selectedInstallationMethod}
                  label="Installation Method"
                  onChange={(e) => setSelectedInstallationMethod(e.target.value)}
                >
                  {installationMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.value} - {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<Cable />} 
              label={`${selectedMaterial === 'copper' ? 'Copper' : 'Aluminum'} Conductors`}
              color="primary"
              size="small"
            />
            <Chip 
              icon={<Bolt />} 
              label={`${selectedTemperature}°C Rating`}
              color="secondary"
              size="small"
            />
            <Chip 
              icon={<Settings />} 
              label={`Method ${selectedInstallationMethod}`}
              color="info"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Chart Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label="Cable Ampacity" 
              icon={<TrendingUp />}
              iconPosition="start"
            />
            <Tab 
              label="Temperature Derating" 
              icon={<Bolt />}
              iconPosition="start"
            />
            <Tab 
              label="Grouping Factors" 
              icon={<Cable />}
              iconPosition="start"
            />
            <Tab 
              label="Installation Methods" 
              icon={<Settings />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            IEC Cable Current Carrying Capacity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current carrying capacity (ampacity) for IEC standard cables based on conductor material, 
            temperature rating, and installation method. All values comply with IEC 60364 standards.
          </Typography>
          
          <IECCableAmpacityChart 
            material={selectedMaterial}
            temperatureRating={selectedTemperature}
            installationMethod={selectedInstallationMethod}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Temperature Derating Factors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Temperature correction factors for ambient temperatures different from 30°C. 
            These factors are applied to the base current carrying capacity.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Temperature derating factors are critical for safety. 
              Always apply appropriate derating when ambient temperatures exceed 30°C.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Temperature Derating Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Cable Grouping Factors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Grouping factors for cables installed in groups. These factors account for 
            mutual heating effects when multiple cables are installed together.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Grouping Factors Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Installation Method Factors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Installation method factors according to IEC 60364. Different installation 
            methods have different heat dissipation characteristics.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Installation Method Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Footer Information */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Standards Compliance:</strong> All charts comply with IEC 60364 electrical installation standards. 
          Values are based on European conductor specifications and installation practices.
          <br />
          <strong>Temperature Base:</strong> 30°C ambient temperature | <strong>Soil Temperature:</strong> 20°C | <strong>Conductor Temperature:</strong> {selectedTemperature}°C
        </Typography>
      </Box>
    </Container>
  );
};

export default IECReferenceChartsPage;