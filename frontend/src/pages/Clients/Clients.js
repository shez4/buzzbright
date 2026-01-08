import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Contacts } from '@mui/icons-material';

const Clients = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Client Management
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Contacts sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Client & Contact Management
        </Typography>
        <Typography color="text.secondary">
          Coming soon: Complete client management system.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Clients;