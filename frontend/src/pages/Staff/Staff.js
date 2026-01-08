import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { People } from '@mui/icons-material';

const Staff = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Staff Management
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Staff Management System
        </Typography>
        <Typography color="text.secondary">
          Coming soon: Staff management and availability tracking features.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Staff;