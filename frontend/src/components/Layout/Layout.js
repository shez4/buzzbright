import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', // Full viewport height
      overflow: 'hidden' // Prevent body from scrolling
    }}>
      <Header onMenuClick={handleDrawerToggle} drawerOpen={drawerOpen} />
      
      <Sidebar 
        open={drawerOpen} 
        onClose={handleDrawerClose}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for AppBar height
          height: 'calc(100vh - 64px)', // Full viewport height minus AppBar
          overflowY: 'auto', // Enable vertical scrolling
          width: { sm: drawerOpen ? `calc(100% - 240px)` : '100%' },
          ml: { sm: drawerOpen ? '240px' : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;