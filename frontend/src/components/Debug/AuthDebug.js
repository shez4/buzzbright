import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, loading, login } = useContext(AuthContext);
  const [tokenInfo, setTokenInfo] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setTokenInfo(token || 'No token found');
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const loginAsAdmin = async () => {
    try {
      await login('admin@buzzbright.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Auth Debug Information
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Auth Context State:</Typography>
          <Typography>Loading: {loading ? 'true' : 'false'}</Typography>
          <Typography>User: {user ? JSON.stringify(user, null, 2) : 'null'}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">LocalStorage Token:</Typography>
          <Typography sx={{ wordBreak: 'break-all' }}>{tokenInfo}</Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={clearStorage}>
          Clear Storage & Reload
        </Button>
        <Button variant="contained" onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </Box>
    </Box>
  );
};

export default AuthDebug;