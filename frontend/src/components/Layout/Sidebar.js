import React, { useContext } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard,
  Work,
  People,
  AccessTime,
  RequestQuote,
  Contacts,
  Inventory,
  Notifications,
  AccountCircle,
  CleaningServices,
  Analytics,
  Business
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'manager', 'staff'] },
    { text: 'Jobs', icon: <Work />, path: '/jobs', roles: ['admin', 'manager', 'staff'] },
    { text: 'Clients', icon: <Contacts />, path: '/clients', roles: ['admin', 'manager'] },
    { text: 'Quotes', icon: <RequestQuote />, path: '/quotes', roles: ['admin', 'manager'] },
    { text: 'Staff', icon: <People />, path: '/staff', roles: ['admin', 'manager'] },
    { text: 'Timesheets', icon: <AccessTime />, path: '/timesheets', roles: ['admin', 'manager', 'staff'] },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory', roles: ['admin', 'manager'] },
    { text: 'Reports', icon: <Analytics />, path: '/reports', roles: ['admin', 'manager'] },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications', roles: ['admin', 'manager', 'staff'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <CleaningServices 
          sx={{ 
            fontSize: 40, 
            color: 'primary.main', 
            mb: 1 
          }} 
        />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          BuzzBright
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Cleaning Management
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 40, 
              height: 40,
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 44,
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.04),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2.5,
                  justifyContent: 'center',
                  color: location.pathname.startsWith(item.path) 
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Profile Section */}
      <List sx={{ mt: 'auto' }}>
        <Divider sx={{ mx: 2, mb: 1 }} />
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={() => handleNavigation('/profile')}
            sx={{
              minHeight: 44,
              borderRadius: 2,
              mx: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2.5,
                justifyContent: 'center',
                color: theme.palette.text.secondary,
              }}
            >
              <AccountCircle />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{
                fontSize: '0.9rem'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;