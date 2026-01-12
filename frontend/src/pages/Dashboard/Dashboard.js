import React, { useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import {
  Work,
  People,
  AccessTime,
  RequestQuote,
  // TrendingUp,
  Schedule,
  CheckCircle,
  // Warning
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const theme = useTheme();
  const { user, isAdmin, isManager } = useContext(AuthContext);

  // Mock data - in real app, this would come from API
  const stats = {
    totalJobs: 156,
    activeJobs: 23,
    completedToday: 12,
    pendingQuotes: 8,
    totalStaff: 15,
    activeStaff: 12,
    totalClients: 89,
    revenueThisMonth: 15750
  };

  const recentJobs = [
    { id: 1, client: 'Smith Residence', type: 'Regular Cleaning', status: 'completed', time: '2 hours ago' },
    { id: 2, client: 'Office Complex A', type: 'Deep Cleaning', status: 'in_progress', time: '4 hours ago' },
    { id: 3, client: 'Johnson Home', type: 'Move-out Clean', status: 'scheduled', time: 'Tomorrow 9:00 AM' },
    { id: 4, client: 'Retail Store B', type: 'Regular Cleaning', status: 'completed', time: 'Yesterday' },
  ];

  const upcomingJobs = [
    { id: 1, client: 'Wilson Apartment', time: '9:00 AM', staff: 'Sarah M.' },
    { id: 2, client: 'Corporate Office', time: '11:30 AM', staff: 'Mike R.' },
    { id: 3, client: 'Davis House', time: '2:00 PM', staff: 'Lisa K.' },
  ];

  const monthlyData = [
    { name: 'Jan', jobs: 120, revenue: 12000 },
    { name: 'Feb', jobs: 135, revenue: 14200 },
    { name: 'Mar', jobs: 156, revenue: 15750 },
    { name: 'Apr', jobs: 142, revenue: 14800 },
    { name: 'May', jobs: 165, revenue: 16500 },
    { name: 'Jun', jobs: 178, revenue: 17200 },
  ];

  const jobTypeData = [
    { name: 'Regular Cleaning', value: 45, color: '#8884d8' },
    { name: 'Deep Cleaning', value: 25, color: '#82ca9d' },
    { name: 'Move-in/out', value: 15, color: '#ffc658' },
    { name: 'Other', value: 15, color: '#ff7c7c' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your cleaning business today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={<Work />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Quotes"
            value={stats.pendingQuotes}
            icon={<RequestQuote />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charts Section - Only for Admin/Manager */}
        {(isAdmin || isManager) && (
          <>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Performance
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="jobs" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Job Types Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {jobTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Recent Jobs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Jobs
              </Typography>
              <List>
                {recentJobs.map((job) => (
                  <ListItem key={job.id} divider>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.client}
                      secondary={`${job.type} • ${job.time}`}
                    />
                    <Chip
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Jobs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule
              </Typography>
              <List>
                {upcomingJobs.map((job) => (
                  <ListItem key={job.id} divider>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary={job.client}
                      secondary={`${job.time} • Assigned to ${job.staff}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Chip
                  icon={<Work />}
                  label="Create New Job"
                  onClick={() => {}}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<RequestQuote />}
                  label="New Quote"
                  onClick={() => {}}
                  color="secondary"
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<People />}
                  label="Add Client"
                  onClick={() => {}}
                  color="info"
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<AccessTime />}
                  label="View Timesheets"
                  onClick={() => {}}
                  color="success"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;