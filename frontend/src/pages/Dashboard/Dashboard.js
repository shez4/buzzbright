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
  Button,
  IconButton,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Work,
  People,
  AccessTime,
  RequestQuote,
  TrendingUp,
  Schedule,
  CheckCircle,
  Warning,
  Add,
  PersonAdd,
  Assignment,
  AttachMoney,
  Business,
  Star,
  Notifications,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
    revenueThisMonth: 15750,
    revenueLastMonth: 13200,
    newClientsThisMonth: 12,
    customerSatisfaction: 4.8,
    jobCompletionRate: 96
  };

  const recentJobs = [
    { id: 1, client: 'Smith Residence', type: 'Regular Cleaning', status: 'completed', time: '2 hours ago', revenue: 150 },
    { id: 2, client: 'Office Complex A', type: 'Deep Cleaning', status: 'in_progress', time: '4 hours ago', revenue: 450 },
    { id: 3, client: 'Johnson Home', type: 'Move-out Clean', status: 'scheduled', time: 'Tomorrow 9:00 AM', revenue: 280 },
    { id: 4, client: 'Retail Store B', type: 'Regular Cleaning', status: 'completed', time: 'Yesterday', revenue: 200 },
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

  const MetricCard = ({ title, value, icon, color = 'primary', trend, subtitle, onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" component="div" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend > 0 ? <ArrowUpward fontSize="small" color="success" /> : <ArrowDownward fontSize="small" color="error" />}
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6]
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56, mx: 'auto', mb: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const revenueGrowth = ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth * 100).toFixed(1);

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your cleaning business today.
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            icon={<AttachMoney />}
            color="success"
            trend={parseFloat(revenueGrowth)}
            onClick={() => navigate('/reports')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={<Work />}
            color="primary"
            subtitle={`${stats.completedToday} completed today`}
            onClick={() => navigate('/jobs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<People />}
            color="info"
            subtitle={`+${stats.newClientsThisMonth} this month`}
            onClick={() => navigate('/clients')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Satisfaction"
            value={`${stats.customerSatisfaction}/5`}
            icon={<Star />}
            color="warning"
            subtitle={`${stats.jobCompletionRate}% completion rate`}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp /> Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="New Job"
              description="Schedule a cleaning job"
              icon={<Add />}
              color="primary"
              onClick={() => navigate('/jobs/new')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Add Client"
              description="Register new customer"
              icon={<PersonAdd />}
              color="success"
              onClick={() => navigate('/clients/new')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Create Quote"
              description="Generate service quote"
              icon={<RequestQuote />}
              color="info"
              onClick={() => navigate('/quotes/new')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Manage Staff"
              description="View team schedule"
              icon={<Schedule />}
              color="warning"
              onClick={() => navigate('/staff')}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Charts and Recent Activity */}
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