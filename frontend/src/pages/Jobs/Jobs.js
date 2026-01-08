import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Add, Work } from '@mui/icons-material';

const Jobs = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Jobs Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {}}
        >
          Create New Job
        </Button>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Work sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Job Management System
        </Typography>
        <Typography color="text.secondary">
          This page will contain job scheduling, management, and tracking features.
          Features will include:
        </Typography>
        <Box sx={{ mt: 2, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
          <ul>
            <li>Create and schedule cleaning jobs</li>
            <li>Assign staff to jobs</li>
            <li>Track job progress and status</li>
            <li>Manage recurring appointments</li>
            <li>View job calendar and timeline</li>
            <li>Job completion tracking with photos</li>
            <li>Client feedback and ratings</li>
          </ul>
        </Box>
      </Paper>
    </Box>
  );
};

export default Jobs;