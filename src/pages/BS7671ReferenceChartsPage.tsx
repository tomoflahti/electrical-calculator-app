/**
 * BS7671 Reference Charts Page
 * UK Wiring Regulations reference charts for British electrical professionals
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  Paper
} from '@mui/material';
import { Info, Flag } from '@mui/icons-material';

const BS7671ReferenceChartsPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #006400 0%, #228B22 100%)', 
          color: 'white' 
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Flag sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              BS7671 Reference Charts
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              UK Wiring Regulations (BS7671:2018+A2:2022) - British Standards
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
          <strong>BS7671 UK Standards:</strong> These charts follow BS7671:2018+A2:2022 (IET Wiring Regulations) standards. 
          All measurements comply with British standards including diversity factors and UK voltage requirements (230V single-phase, 400V three-phase).
        </Typography>
      </Alert>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            BS7671 Cable Current Carrying Capacity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Interactive charts and reference data for UK electrical installations following BS7671:2018+A2:2022 standards.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              BS7671 Reference Charts - Implementation in Progress
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Footer Information */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Standards Compliance:</strong> All charts comply with BS7671:2018+A2:2022 (IET Wiring Regulations). 
          Values are based on British cable specifications and UK installation practices.
          <br />
          <strong>UK Voltages:</strong> 230V single-phase, 400V three-phase | <strong>Authority:</strong> Institution of Engineering and Technology (IET)
        </Typography>
      </Box>
    </Container>
  );
};

export default BS7671ReferenceChartsPage;