import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  // FilterList,
  CalendarToday,
  Person,
  LocationOn,
  Repeat
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs();
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(id);
        toast.success('Job deleted successfully');
        loadJobs();
      } catch (error) {
        toast.error('Failed to delete job');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesFrequency = frequencyFilter === 'all' || job.frequency === frequencyFilter;
    return matchesSearch && matchesStatus && matchesType && matchesFrequency;
  });

  if (loading) {
    return <LoadingSpinner message="Loading jobs..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Job Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and schedule cleaning jobs
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CalendarToday />}
            onClick={() => navigate('/jobs/calendar')}
          >
            Calendar View
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/jobs/new')}
          >
            Create Job
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
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
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Job Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Regular Cleaning">Regular Cleaning</MenuItem>
              <MenuItem value="Deep Cleaning">Deep Cleaning</MenuItem>
              <MenuItem value="Move-in">Move-in Clean</MenuItem>
              <MenuItem value="Move-out">Move-out Clean</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Frequency"
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
            >
              <MenuItem value="all">All Frequencies</MenuItem>
              <MenuItem value="one-time">One-time</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="bi-monthly">Bi-monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredJobs.length} job(s) found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || frequencyFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first job'}
          </Typography>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && frequencyFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/jobs/new')}
            >
              Create First Job
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {job.client}
                    </Typography>
                    <Chip
                      label={job.status?.replace('_', ' ')}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {job.type}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    {job.assignedStaff && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {job.assignedStaff}
                        </Typography>
                      </Box>
                    )}
                    {job.frequency && job.frequency !== 'one-time' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Repeat fontSize="small" color="action" />
                        <Typography variant="body2" color="primary">
                          {job.frequency.charAt(0).toUpperCase() + job.frequency.slice(1).replace('-', ' ')}
                        </Typography>
                      </Box>
                    )}
                    {job.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {typeof job.address === 'object' 
                            ? `${job.address.street}, ${job.address.city}, ${job.address.state} ${job.address.zipCode}`
                            : job.address
                          }
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Job">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Tooltip title="Delete Job">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default JobList;