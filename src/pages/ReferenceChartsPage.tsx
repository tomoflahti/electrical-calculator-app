/**
 * Unified Reference Charts Page
 * Consolidates IEC, NEC, and BS7671 electrical reference charts in one interface
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
import { 
  Info, 
  Cable, 
  Bolt, 
  Settings, 
  TrendingUp, 
  Flag,
  Public,
  LocationOn
} from '@mui/icons-material';
import IECCableAmpacityChart from '../components/charts/IECCableAmpacityChart';
import NECWireAmpacityChart from '../components/charts/NECWireAmpacityChart';

type ElectricalStandard = 'IEC' | 'NEC' | 'BS7671';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  standardId: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, standardId }) => (
  <div role="tabpanel" hidden={value !== index} id={`${standardId}-tabpanel-${index}`}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ReferenceChartsPage: React.FC = () => {
  const [activeStandard, setActiveStandard] = useState<ElectricalStandard>('IEC');
  
  // IEC State
  const [iecTabValue, setIecTabValue] = useState(0);
  const [iecMaterial, setIecMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [iecTemperature, setIecTemperature] = useState<70 | 90>(70);
  const [iecInstallationMethod, setIecInstallationMethod] = useState('A1');

  // NEC State
  const [necTabValue, setNecTabValue] = useState(0);
  const [necMaterial, setNecMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [necTemperature, setNecTemperature] = useState<60 | 75 | 90>(75);
  const [necInsulationType, setNecInsulationType] = useState('THHN');

  // BS7671 State
  const [bs7671TabValue, setBs7671TabValue] = useState(0);

  const handleStandardChange = (_: React.SyntheticEvent, newValue: number) => {
    const standards: ElectricalStandard[] = ['IEC', 'NEC', 'BS7671'];
    setActiveStandard(standards[newValue]);
  };

  const getStandardIndex = (standard: ElectricalStandard): number => {
    return ['IEC', 'NEC', 'BS7671'].indexOf(standard);
  };

  const iecInstallationMethods = [
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

  const necInsulationTypes = [
    { value: 'THHN', label: 'THHN - High Heat Nylon' },
    { value: 'THWN', label: 'THWN - Heat/Water Resistant' },
    { value: 'XHHW', label: 'XHHW - Cross-linked Polyethylene' },
    { value: 'USE', label: 'USE - Underground Service' },
    { value: 'RHW', label: 'RHW - Rubber Heat/Water Resistant' }
  ];

  const renderStandardHeader = () => {
    const standardConfigs = {
      IEC: {
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        icon: <Public sx={{ fontSize: 40 }} />,
        title: 'IEC Reference Charts',
        subtitle: 'International Electrical Standards (IEC 60364) - Pure Metric Implementation'
      },
      NEC: {
        gradient: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
        icon: <LocationOn sx={{ fontSize: 40 }} />,
        title: 'NEC Reference Charts', 
        subtitle: 'National Electrical Code (NFPA 70) - Pure Imperial Implementation'
      },
      BS7671: {
        gradient: 'linear-gradient(135deg, #006400 0%, #228B22 100%)',
        icon: <Flag sx={{ fontSize: 40 }} />,
        title: 'BS7671 Reference Charts',
        subtitle: 'UK Wiring Regulations (BS7671:2018+A2:2022) - British Standards'
      }
    };

    const config = standardConfigs[activeStandard];

    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: config.gradient,
          color: 'white' 
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          {config.icon}
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {config.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {config.subtitle}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  const renderStandardsInfo = () => {
    const standardsInfo = {
      IEC: {
        title: 'IEC International Standards',
        description: 'These charts follow IEC 60364 electrical installation standards. All measurements are in metric units (mm², A, °C). Cable sizes are based on European copper conductor specifications.'
      },
      NEC: {
        title: 'NEC National Standards',
        description: 'These charts follow NFPA 70 National Electrical Code standards. All measurements are in imperial units (AWG, A, °F). Wire gauges are based on American Wire Gauge specifications.'
      },
      BS7671: {
        title: 'BS7671 UK Standards',
        description: 'These charts follow BS7671:2018+A2:2022 (IET Wiring Regulations) standards. All measurements comply with British standards including diversity factors and UK voltage requirements (230V single-phase, 400V three-phase).'
      }
    };

    const info = standardsInfo[activeStandard];

    return (
      <Alert 
        severity="info" 
        icon={<Info />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          <strong>{info.title}:</strong> {info.description}
        </Typography>
      </Alert>
    );
  };

  const renderIECContent = () => (
    <>
      {/* IEC Chart Controls */}
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
                  value={iecMaterial}
                  label="Conductor Material"
                  onChange={(e) => setIecMaterial(e.target.value as 'copper' | 'aluminum')}
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
                  value={iecTemperature}
                  label="Temperature Rating"
                  onChange={(e) => setIecTemperature(e.target.value as 70 | 90)}
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
                  value={iecInstallationMethod}
                  label="Installation Method"
                  onChange={(e) => setIecInstallationMethod(e.target.value)}
                >
                  {iecInstallationMethods.map((method) => (
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
              label={`${iecMaterial === 'copper' ? 'Copper' : 'Aluminum'} Conductors`}
              color="primary"
              size="small"
            />
            <Chip 
              icon={<Bolt />} 
              label={`${iecTemperature}°C Rating`}
              color="secondary"
              size="small"
            />
            <Chip 
              icon={<Settings />} 
              label={`Method ${iecInstallationMethod}`}
              color="info"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* IEC Chart Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={iecTabValue} 
            onChange={(_, newValue) => setIecTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Cable Ampacity" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Temperature Derating" icon={<Bolt />} iconPosition="start" />
            <Tab label="Grouping Factors" icon={<Cable />} iconPosition="start" />
            <Tab label="Installation Methods" icon={<Settings />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={iecTabValue} index={0} standardId="iec">
          <Typography variant="h6" gutterBottom>
            IEC Cable Current Carrying Capacity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current carrying capacity (ampacity) for IEC standard cables based on conductor material, 
            temperature rating, and installation method. All values comply with IEC 60364 standards.
          </Typography>
          
          <IECCableAmpacityChart 
            material={iecMaterial}
            temperatureRating={iecTemperature}
            installationMethod={iecInstallationMethod}
          />
        </TabPanel>

        <TabPanel value={iecTabValue} index={1} standardId="iec">
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

        <TabPanel value={iecTabValue} index={2} standardId="iec">
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

        <TabPanel value={iecTabValue} index={3} standardId="iec">
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

      {/* IEC Footer Information */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Standards Compliance:</strong> All charts comply with IEC 60364 electrical installation standards. 
          Values are based on European conductor specifications and installation practices.
          <br />
          <strong>Temperature Base:</strong> 30°C ambient temperature | <strong>Soil Temperature:</strong> 20°C | <strong>Conductor Temperature:</strong> {iecTemperature}°C
        </Typography>
      </Box>
    </>
  );

  const renderNECContent = () => (
    <>
      {/* NEC Chart Controls */}
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
                  value={necMaterial}
                  label="Conductor Material"
                  onChange={(e) => setNecMaterial(e.target.value as 'copper' | 'aluminum')}
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
                  value={necTemperature}
                  label="Temperature Rating"
                  onChange={(e) => setNecTemperature(e.target.value as 60 | 75 | 90)}
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
                  value={necInsulationType}
                  label="Insulation Type"
                  onChange={(e) => setNecInsulationType(e.target.value)}
                >
                  {necInsulationTypes.map((insulation) => (
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
              label={`${necMaterial === 'copper' ? 'Copper' : 'Aluminum'} Conductors`}
              color="primary"
              size="small"
            />
            <Chip 
              icon={<Bolt />} 
              label={`${necTemperature}°C Rating`}
              color="secondary"
              size="small"
            />
            <Chip 
              icon={<Settings />} 
              label={`${necInsulationType} Insulation`}
              color="info"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* NEC Chart Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={necTabValue} 
            onChange={(_, newValue) => setNecTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Wire Ampacity" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Temperature Derating" icon={<Bolt />} iconPosition="start" />
            <Tab label="Conductor Bundling" icon={<Cable />} iconPosition="start" />
            <Tab label="Insulation Types" icon={<Settings />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={necTabValue} index={0} standardId="nec">
          <Typography variant="h6" gutterBottom>
            NEC Wire Current Carrying Capacity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current carrying capacity (ampacity) for NEC standard wire gauges based on conductor material, 
            temperature rating, and insulation type. All values comply with NFPA 70 standards.
          </Typography>
          
          <NECWireAmpacityChart 
            material={necMaterial}
            temperatureRating={necTemperature}
            insulationType={necInsulationType}
          />
        </TabPanel>

        <TabPanel value={necTabValue} index={1} standardId="nec">
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

        <TabPanel value={necTabValue} index={2} standardId="nec">
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

        <TabPanel value={necTabValue} index={3} standardId="nec">
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

      {/* NEC Footer Information */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Standards Compliance:</strong> All charts comply with NFPA 70 National Electrical Code standards. 
          Values are based on American Wire Gauge specifications and North American installation practices.
          <br />
          <strong>Temperature Base:</strong> 30°C (86°F) ambient temperature | <strong>Conductor Temperature:</strong> {necTemperature}°C ({Math.round(necTemperature * 9/5 + 32)}°F)
        </Typography>
      </Box>
    </>
  );

  const renderBS7671Content = () => (
    <>
      {/* BS7671 Chart Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={bs7671TabValue} 
            onChange={(_, newValue) => setBs7671TabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Cable Ampacity" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Diversity Factors" icon={<Bolt />} iconPosition="start" />
            <Tab label="Installation Methods" icon={<Cable />} iconPosition="start" />
            <Tab label="Voltage Drop Limits" icon={<Settings />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={bs7671TabValue} index={0} standardId="bs7671">
          <Typography variant="h6" gutterBottom>
            BS7671 Cable Current Carrying Capacity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Interactive charts and reference data for UK electrical installations following BS7671:2018+A2:2022 standards.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              BS7671 Cable Ampacity Chart - Implementation in Progress
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={bs7671TabValue} index={1} standardId="bs7671">
          <Typography variant="h6" gutterBottom>
            UK Diversity Factors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Diversity factors for domestic and commercial installations according to BS7671:2018+A2:2022.
            These factors account for the fact that not all electrical loads operate simultaneously.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Diversity Factors Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={bs7671TabValue} index={2} standardId="bs7671">
          <Typography variant="h6" gutterBottom>
            BS7671 Installation Methods
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Installation method factors according to BS7671. UK-specific methods including 
            Method A (conduit), B (wall), C (tray), E (free air), and F (cable tray).
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Installation Methods Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={bs7671TabValue} index={3} standardId="bs7671">
          <Typography variant="h6" gutterBottom>
            UK Voltage Drop Limits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            BS7671 voltage drop requirements: 3% for lighting circuits, 5% for power circuits. 
            Based on UK voltage standards (230V single-phase, 400V three-phase).
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Voltage Drop Chart - Coming Soon
            </Typography>
          </Box>
        </TabPanel>
      </Card>

      {/* BS7671 Footer Information */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Standards Compliance:</strong> All charts comply with BS7671:2018+A2:2022 (IET Wiring Regulations). 
          Values are based on British cable specifications and UK installation practices.
          <br />
          <strong>UK Voltages:</strong> 230V single-phase, 400V three-phase | <strong>Authority:</strong> Institution of Engineering and Technology (IET)
        </Typography>
      </Box>
    </>
  );

  const renderContent = () => {
    switch (activeStandard) {
      case 'IEC':
        return renderIECContent();
      case 'NEC':
        return renderNECContent();
      case 'BS7671':
        return renderBS7671Content();
      default:
        return renderIECContent();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Standards Selector */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={getStandardIndex(activeStandard)} 
            onChange={handleStandardChange}
            variant="fullWidth"
            sx={{ '& .MuiTab-root': { minHeight: 64 } }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Public />
                  <Box>
                    <Typography variant="subtitle2">IEC 60364</Typography>
                    <Typography variant="caption" color="text.secondary">International</Typography>
                  </Box>
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn />
                  <Box>
                    <Typography variant="subtitle2">NEC (NFPA 70)</Typography>
                    <Typography variant="caption" color="text.secondary">North America</Typography>
                  </Box>
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flag />
                  <Box>
                    <Typography variant="subtitle2">BS7671</Typography>
                    <Typography variant="caption" color="text.secondary">United Kingdom</Typography>
                  </Box>
                </Box>
              }
            />
          </Tabs>
        </Box>
      </Card>

      {/* Dynamic Header */}
      {renderStandardHeader()}

      {/* Standards Information */}
      {renderStandardsInfo()}

      {/* Dynamic Content */}
      {renderContent()}
    </Container>
  );
};

export default ReferenceChartsPage;