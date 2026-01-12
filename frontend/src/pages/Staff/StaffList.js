import React, { useState, useEffect } from 'react';
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
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Phone,
  Email,
  Work,
  Star,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { staffService } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const StaffList = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.getStaff();
      setStaff(data.staff || []);
    } catch (error) {
      toast.error('Failed to load staff');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await staffService.deleteStaff(id);
        toast.success('Staff member deleted successfully');
        loadStaff();
      } catch (error) {
        toast.error('Failed to delete staff member');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'on_leave':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'cleaning':
        return 'primary';
      case 'management':
        return 'secondary';
      case 'customer_service':
        return 'info';
      case 'maintenance':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return <LoadingSpinner message="Loading staff..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage team members, schedules, and availability
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/staff/new')}
        >
          Add Staff Member
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search staff..."
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="on_leave">On Leave</MenuItem>
              <MenuItem value="terminated">Terminated</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="cleaning">Cleaning</MenuItem>
              <MenuItem value="management">Management</MenuItem>
              <MenuItem value="customer_service">Customer Service</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredStaff.length} staff member(s)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Staff Cards */}
      {filteredStaff.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No staff members found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first staff member'}
          </Typography>
          {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/staff/new')}
            >
              Add Staff Member
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredStaff.map((member) => (
            <Grid item xs={12} md={6} lg={4} key={member.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {`${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {member.firstName} {member.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.position}
                      </Typography>
                    </Box>
                    <Chip
                      label={member.status?.replace('_', ' ')}
                      color={getStatusColor(member.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {member.department && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work fontSize="small" color="action" />
                        <Chip
                          label={member.department.replace('_', ' ')}
                          color={getDepartmentColor(member.department)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}
                    {member.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {member.email}
                        </Typography>
                      </Box>
                    )}
                    {member.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">
                          {member.phone}
                        </Typography>
                      </Box>
                    )}
                    {member.hourlyRate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="primary">
                          ${member.hourlyRate}/hr
                        </Typography>
                      </Box>
                    )}
                    {member.skills && member.skills.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {member.skills.length > 3 && (
                          <Chip
                            label={`+${member.skills.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Schedule />}
                    onClick={() => navigate(`/staff/${member.id}/schedule`)}
                  >
                    Schedule
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/staff/${member.id}`)}
                  >
                    View
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/staff/${member.id}/edit`)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StaffList;