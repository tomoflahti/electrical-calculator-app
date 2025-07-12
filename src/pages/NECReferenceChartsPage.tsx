/**
 * NEC Reference Charts Page
 * National Electrical Code reference charts for North American professionals
 * Pure NEC/Imperial implementation - no metric units
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
import NECWireAmpacityChart from '../components/charts/NECWireAmpacityChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`nec-tabpanel-${index}`}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const NECReferenceChartsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [selectedTemperature, setSelectedTemperature] = useState<60 | 75 | 90>(75);
  const [selectedInsulationType, setSelectedInsulationType] = useState('THHN');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const insulationTypes = [
    { value: 'THHN', label: 'THHN - High Heat Nylon' },
    { value: 'THWN', label: 'THWN - Heat/Water Resistant' },
    { value: 'XHHW', label: 'XHHW - Cross-linked Polyethylene' },
    { value: 'USE', label: 'USE - Underground Service' },
    { value: 'RHW', label: 'RHW - Rubber Heat/Water Resistant' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Cable sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              NEC Reference Charts
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              National Electrical Code (NFPA 70) - Pure Imperial Implementation
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
          <strong>NEC National Standards:</strong> These charts follow NFPA 70 National Electrical Code standards. 
          All measurements are in imperial units (AWG, A, °F). Wire gauges are based on American Wire Gauge specifications.
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
                  onChange={(e) => setSelectedTemperature(e.target.value as 60 | 75 | 90)}
                >
                  <MenuItem value={60}>60°C (140°F)</MenuItem>
                  <MenuItem value={75}>75°C (167°F)</MenuItem>
                  <MenuItem value={90}>90°C (194°F)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Insulation Type</InputLabel>
                <Select
                  value={selectedInsulationType}
                  label="Insulation Type"
                  onChange={(e) => setSelectedInsulationType(e.target.value)}
                >
                  {insulationTypes.map((insulation) => (
                    <MenuItem key={insulation.value} value={insulation.value}>
                      {insulation.label}
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
              label={`${selectedInsulationType} Insulation`}
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
              label="Wire Ampacity" 
              icon={<TrendingUp />}
              iconPosition="start"
            />
            <Tab 
              label="Temperature Derating" 
              icon={<Bolt />}
              iconPosition="start"
            />
            <Tab 
              label="Conductor Bundling" 
              icon={<Cable />}
              iconPosition="start"
            />
            <Tab 
              label="Insulation Types" 
              icon={<Settings />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            NEC Wire Current Carrying Capacity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current carrying capacity (ampacity) for NEC standard wire gauges based on conductor material, 
            temperature rating, and insulation type. All values comply with NFPA 70 standards.
          </Typography>
          
          <NECWireAmpacityChart 
            material={selectedMaterial}
            temperatureRating={selectedTemperature}
            insulationType={selectedInsulationType}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Temperature Derating Factors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Temperature correction factors for ambient temperatures different from 30°C (86°F). 
            These factors are applied to the base current carrying capacity per NEC Table 310.15(B)(2)(a).
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Temperature derating factors are critical for safety. 
              Always apply appropriate derating when ambient temperatures exceed 30°C (86°F).
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
            Conductor Bundling Factors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Adjustment factors for conductors in groups per NEC Table 310.15(B)(3)(a). 
            These factors account for mutual heating effects when multiple conductors are bundled together.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Conductor Bundling Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            NEC Insulation Types
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Standard insulation types according to NEC Article 310 with their temperature ratings 
            and approved applications. Each type has specific UL standards and installation requirements.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Insulation Types Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* Footer Information */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Standards Compliance:</strong> All charts comply with NFPA 70 National Electrical Code standards. 
          Values are based on American Wire Gauge specifications and North American installation practices.
          <br />
          <strong>Temperature Base:</strong> 30°C (86°F) ambient temperature | <strong>Conductor Temperature:</strong> {selectedTemperature}°C ({Math.round(selectedTemperature * 9/5 + 32)}°F)
        </Typography>
      </Box>
    </Container>
  );
};

export default NECReferenceChartsPage;