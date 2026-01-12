import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import theme from './theme/theme';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Jobs from './pages/Jobs/Jobs';
import Staff from './pages/Staff/Staff';
import Timesheets from './pages/Timesheets/Timesheets';
import Quotes from './pages/Quotes/Quotes';
import Clients from './pages/Clients/Clients';
import Inventory from './pages/Inventory/Inventory';
import Notifications from './pages/Notifications/Notifications';
import Profile from './pages/Profile/Profile';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { user, loading } = useContext(AuthContext);

  console.log('App render - User:', user, 'Loading:', loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {user ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs/*" element={<Jobs />} />
              <Route path="/staff/*" element={<Staff />} />
              <Route path="/timesheets/*" element={<Timesheets />} />
              <Route path="/quotes/*" element={<Quotes />} />
              <Route path="/clients/*" element={<Clients />} />
              <Route path="/inventory/*" element={<Inventory />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;