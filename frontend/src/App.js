import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
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
    </Box>
  );
}

export default App;