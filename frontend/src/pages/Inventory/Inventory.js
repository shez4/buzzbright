import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Inventory } from '@mui/icons-material';

const InventoryPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory Management
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Inventory sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Inventory Tracking System
        </Typography>
        <Typography color="text.secondary">
          Coming soon: Supplies and equipment tracking.
        </Typography>
      </Paper>
    </Box>
  );
};

export default InventoryPage;