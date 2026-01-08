import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { RequestQuote } from '@mui/icons-material';

const Quotes = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Quotes Management
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <RequestQuote sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Quote Creation & Tracking
        </Typography>
        <Typography color="text.secondary">
          Coming soon: Quote management system.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Quotes;