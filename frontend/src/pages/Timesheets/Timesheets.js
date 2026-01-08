import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

const Timesheets = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Timesheets
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AccessTime sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Timesheet Management
        </Typography>
        <Typography color="text.secondary">
          Coming soon: Time tracking and approval system.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Timesheets;