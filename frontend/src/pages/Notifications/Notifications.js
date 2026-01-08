import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Notifications } from '@mui/icons-material';

const NotificationsPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Notification Center
        </Typography>
        <Typography color="text.secondary">
          Coming soon: Notification management system.
        </Typography>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;