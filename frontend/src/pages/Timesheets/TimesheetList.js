import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Avatar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Check,
  Close,
  AccessTime,
  Person,
  Work,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { timesheetService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TimesheetList = () => {
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useContext(AuthContext);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('this_week');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadTimesheets();
  }, [statusFilter, dateFilter]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      const data = await timesheetService.getTimesheets({
        status: statusFilter,
        dateRange: dateFilter
      });
      setTimesheets(data.timesheets || []);
    } catch (error) {
      toast.error('Failed to load timesheets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await timesheetService.approveTimesheet(id);
      toast.success('Timesheet approved successfully');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await timesheetService.rejectTimesheet(id, reason);
        toast.success('Timesheet rejected');
        loadTimesheets();
      } catch (error) {
        toast.error('Failed to reject timesheet');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      try {
        await timesheetService.deleteTimesheet(id);
        toast.success('Timesheet deleted successfully');
        loadTimesheets();
      } catch (error) {
        toast.error('Failed to delete timesheet');
      }
    }
  };

  const handleClockIn = async () => {
    try {
      await timesheetService.clockIn(user.id, {
        time: new Date(),
        method: 'web'
      });
      toast.success('Clocked in successfully');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await timesheetService.clockOut(user.id, {
        time: new Date(),
        method: 'web'
      });
      toast.success('Clocked out successfully');
      loadTimesheets();
    } catch (error) {
      toast.error('Failed to clock out');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'needs_review':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getMyTimesheets = () => timesheets.filter(t => t.staffId === user.id);
  const getPendingTimesheets = () => timesheets.filter(t => t.status === 'pending' || t.status === 'needs_review');

  const currentTimesheets = activeTab === 0 ? getMyTimesheets() : timesheets;

  const filteredTimesheets = currentTimesheets.filter(timesheet => {
    const matchesSearch = 
      timesheet.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || timesheet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner message="Loading timesheets..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Timesheets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track time, manage schedules, and approve hours
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isManager && !isAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={handleClockIn}
                color="success"
              >
                Clock In
              </Button>
              <Button
                variant="outlined"
                startIcon={<Stop />}
                onClick={handleClockOut}
                color="error"
              >
                Clock Out
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/timesheets/new')}
          >
            New Timesheet
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`My Timesheets (${getMyTimesheets().length})`} />
          {(isManager || isAdmin) && (
            <>
              <Tab label={`All Timesheets (${timesheets.length})`} />
              <Tab label={`Pending Approval (${getPendingTimesheets().length})`} />
            </>
          )}
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search timesheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="needs_review">Needs Review</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Date Range"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="this_week">This Week</MenuItem>
              <MenuItem value="last_week">Last Week</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="last_month">Last Month</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredTimesheets.length} timesheet(s)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Pending Approval Alert */}
      {(isManager || isAdmin) && getPendingTimesheets().length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {getPendingTimesheets().length} timesheet(s) pending your approval.
        </Alert>
      )}

      {/* Timesheet Cards */}
      {filteredTimesheets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No timesheets found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first timesheet'}
          </Typography>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/timesheets/new')}
            >
              Create Timesheet
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTimesheets.map((timesheet) => (
            <Grid item xs={12} md={6} lg={4} key={timesheet.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {timesheet.staffName?.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {timesheet.staffName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(timesheet.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={timesheet.status?.replace('_', ' ')}
                      color={getStatusColor(timesheet.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {timesheet.jobTitle && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work fontSize="small" color="action" />
                        <Typography variant="body2">
                          {timesheet.jobTitle}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatHours(timesheet.totalHours || 0)}
                      </Typography>
                      {timesheet.overtimeHours > 0 && (
                        <Chip
                          label={`+${formatHours(timesheet.overtimeHours)} OT`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    {timesheet.clockIn && (
                      <Typography variant="body2" color="text.secondary">
                        {new Date(timesheet.clockIn).toLocaleTimeString()} - 
                        {timesheet.clockOut ? new Date(timesheet.clockOut).toLocaleTimeString() : 'In Progress'}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/timesheets/${timesheet.id}`)}
                  >
                    View
                  </Button>
                  {(timesheet.status === 'pending' || timesheet.staffId === user.id) && (
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/timesheets/${timesheet.id}/edit`)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                  {(isManager || isAdmin) && timesheet.status === 'pending' && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(timesheet.id)}
                      >
                        <Check fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(timesheet.id)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </>
                  )}
                  {timesheet.staffId === user.id && timesheet.status !== 'approved' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(timesheet.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TimesheetList;