import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Email,
  Phone,
  Work,
  Schedule,
  Star,
  Person,
  ContactEmergency,
  Assessment,
  CalendarMonth
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { staffService } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const StaffDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadStaff();
  }, [id]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.getStaffById(id);
      setStaff(data);
    } catch (error) {
      toast.error('Failed to load staff member');
      console.error(error);
    } finally {
      setLoading(false);
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

  const formatWorkSchedule = (schedule) => {
    if (!schedule) return [];
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      ...schedule[day],
      isWorkingDay: schedule[day]?.isWorkingDay || false
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading staff details..." />;
  }

  if (!staff) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/staff')} sx={{ mb: 2 }}>
          Back to Staff List
        </Button>
        <Alert severity="error">Staff member not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/staff')} sx={{ mb: 2 }}>
          Back to Staff List
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
              {`${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}`}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {staff.firstName} {staff.lastName}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {staff.position}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip
                  label={staff.status?.replace('_', ' ')}
                  color={getStatusColor(staff.status)}
                  size="small"
                />
                <Chip
                  label={staff.department?.replace('_', ' ')}
                  color={getDepartmentColor(staff.department)}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={staff.employmentType?.replace('_', ' ')}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => navigate(`/staff/${id}/schedule`)}
            >
              Schedule
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/staff/${id}/edit`)}
            >
              Edit
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<Person />} />
          <Tab label="Schedule" icon={<CalendarMonth />} />
          <Tab label="Performance" icon={<Assessment />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={staff.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText primary="Phone" secondary={staff.phone} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Employee ID" 
                      secondary={staff.employeeId} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarMonth />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hire Date" 
                      secondary={staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : 'N/A'} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Employment Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Department" 
                      secondary={staff.department?.replace('_', ' ')} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Employment Type" 
                      secondary={staff.employmentType?.replace('_', ' ')} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Hourly Rate" 
                      secondary={`$${staff.hourlyRate}/hour`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Max Hours/Week" 
                      secondary={`${staff.workSchedule?.maxHoursPerWeek || 40} hours`} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Skills */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills & Competencies
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {staff.skills && staff.skills.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {staff.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill.replace('_', ' ')}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">No skills recorded</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Emergency Contact */}
          {staff.emergencyContact && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Emergency Contact
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ContactEmergency />
                      </ListItemIcon>
                      <ListItemText 
                        primary={staff.emergencyContact.name}
                        secondary={staff.emergencyContact.relationship}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone"
                        secondary={staff.emergencyContact.phone}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Work Schedule
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {formatWorkSchedule(staff.workSchedule).map((daySchedule) => (
                <Grid item xs={12} sm={6} md={4} key={daySchedule.day}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {daySchedule.day}
                      </Typography>
                      {daySchedule.isWorkingDay ? (
                        <Typography variant="body2" color="primary">
                          {daySchedule.start} - {daySchedule.end}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not working
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Maximum hours per week: {staff.workSchedule?.maxHoursPerWeek || 40} hours
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {staff.performance?.totalJobsCompleted || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jobs Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {staff.performance?.totalHoursWorked || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours Worked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Typography variant="h3" color="primary">
                    {staff.performance?.averageRating?.toFixed(1) || '0.0'}
                  </Typography>
                  <Star color="primary" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StaffDetail;