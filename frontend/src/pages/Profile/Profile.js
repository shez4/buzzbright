import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Settings
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AccountCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          User Profile Management
        </Typography>
        <Typography color="text.secondary">
          Coming soon: User profile and settings.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile;