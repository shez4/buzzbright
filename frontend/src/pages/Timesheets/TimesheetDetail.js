import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Edit,
  Delete,
  Check,
  Close,
  AccessTime,
  Person,
  Work,
  LocationOn,
  Receipt,
  DirectionsCar,
  Note,
  History,
  GPS,
  Photo,
  AttachMoney,
  LocalDining,
  Coffee
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { timesheetService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TimesheetDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isManager, isAdmin } = useContext(AuthContext);
  
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadTimesheet();
  }, [id]);

  const loadTimesheet = async () => {
    try {
      setLoading(true);
      const data = await timesheetService.getTimesheet(id);
      setTimesheet(data);
    } catch (error) {
      toast.error('Failed to load timesheet');
      console.error(error);
      navigate('/timesheets');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await timesheetService.approveTimesheet(id);
      toast.success('Timesheet approved successfully');
      loadTimesheet();
    } catch (error) {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      await timesheetService.rejectTimesheet(id, rejectReason);
      toast.success('Timesheet rejected');
      setRejectDialog(false);
      setRejectReason('');
      loadTimesheet();
    } catch (error) {
      toast.error('Failed to reject timesheet');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      try {
        await timesheetService.deleteTimesheet(id);
        toast.success('Timesheet deleted successfully');
        navigate('/timesheets');
      } catch (error) {
        toast.error('Failed to delete timesheet');
      }
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

  const formatTime = (time) => {
    return time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading timesheet details..." />;
  }

  if (!timesheet) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Timesheet not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/timesheets')} sx={{ mt: 2 }}>
          Back to Timesheets
        </Button>
      </Box>
    );
  }

  const canEdit = timesheet.staffId === user.id && timesheet.status !== 'approved';
  const canApprove = (isManager || isAdmin) && timesheet.status === 'pending';
  const canDelete = timesheet.staffId === user.id && timesheet.status !== 'approved';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Timesheet Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {formatDate(timesheet.date)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={timesheet.status?.replace('_', ' ')}
            color={getStatusColor(timesheet.status)}
            size="large"
          />
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/timesheets/${id}/edit`)}
            >
              Edit
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<Check />}
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Close />}
                onClick={() => setRejectDialog(true)}
              >
                Reject
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Alert */}
      {timesheet.status === 'rejected' && timesheet.rejectionReason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Timesheet Rejected
          </Typography>
          <Typography variant="body2">
            {timesheet.rejectionReason}
          </Typography>
        </Alert>
      )}

      {/* Staff and Job Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6">{timesheet.staffName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {timesheet.staffTitle}
                </Typography>
              </Box>
            </Box>
          </Grid>
          {timesheet.jobTitle && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Work color="primary" />
                <Box>
                  <Typography variant="subtitle1">{timesheet.jobTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {timesheet.clientName}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Time Details" />
          <Tab label="Expenses" />
          <Tab label="History" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Time Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Time Summary
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Hours"
                      secondary={formatDuration(timesheet.totalHours || 0)}
                    />
                  </ListItem>
                  {timesheet.overtimeHours > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <AccessTime color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Overtime Hours"
                        secondary={formatDuration(timesheet.overtimeHours)}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText
                      primary="Clock In"
                      secondary={formatTime(timesheet.clockIn)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Clock Out"
                      secondary={timesheet.clockOut ? formatTime(timesheet.clockOut) : 'Not clocked out'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <List dense>
                  {timesheet.mileage > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <DirectionsCar />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mileage"
                        secondary={`${timesheet.mileage} miles`}
                      />
                    </ListItem>
                  )}
                  {timesheet.clockInLocation && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText
                        primary="Clock In Location"
                        secondary={`${timesheet.clockInLocation.latitude}, ${timesheet.clockInLocation.longitude}`}
                      />
                    </ListItem>
                  )}
                  {timesheet.notes && (
                    <ListItem>
                      <ListItemIcon>
                        <Note />
                      </ListItemIcon>
                      <ListItemText
                        primary="Notes"
                        secondary={timesheet.notes}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Photos */}
          {timesheet.photos && timesheet.photos.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Photos
                  </Typography>
                  <Grid container spacing={2}>
                    {timesheet.photos.map((photo, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box
                          component="img"
                          src={photo.url}
                          alt={photo.description || `Photo ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        {photo.description && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {photo.description}
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Breaks */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Breaks
                </Typography>
                {timesheet.breaks && timesheet.breaks.length > 0 ? (
                  <List>
                    {timesheet.breaks.map((break_, index) => (
                      <ListItem key={index} divider={index < timesheet.breaks.length - 1}>
                        <ListItemIcon>
                          {break_.type === 'lunch' ? <LocalDining /> : <Coffee />}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${break_.type === 'lunch' ? 'Lunch' : 'Break'} ${index + 1}`}
                          secondary={`${formatTime(break_.startTime)} - ${formatTime(break_.endTime)} (${formatDuration(break_.duration / 60)})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No breaks recorded
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Time Tracking Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tracking Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Tracking Method"
                      secondary={timesheet.clockInMethod || 'Manual'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Modified"
                      secondary={new Date(timesheet.updatedAt || timesheet.createdAt).toLocaleString()}
                    />
                  </ListItem>
                  {timesheet.autoClockOut && (
                    <ListItem>
                      <ListItemText
                        primary="Auto Clock Out"
                        secondary="System automatically clocked out"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expenses
            </Typography>
            {timesheet.expenses && timesheet.expenses.length > 0 ? (
              <List>
                {timesheet.expenses.map((expense, index) => (
                  <ListItem key={index} divider={index < timesheet.expenses.length - 1}>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary={expense.description}
                      secondary={`${expense.type} - $${expense.amount}`}
                    />
                    {expense.receipt && <Receipt color="primary" />}
                  </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem>
                  <ListItemText
                    primary="Total Expenses"
                    secondary={`$${timesheet.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`}
                  />
                </ListItem>
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No expenses recorded
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Edit History
            </Typography>
            {timesheet.editHistory && timesheet.editHistory.length > 0 ? (
              <List>
                {timesheet.editHistory.map((edit, index) => (
                  <ListItem key={index} divider={index < timesheet.editHistory.length - 1}>
                    <ListItemIcon>
                      <History />
                    </ListItemIcon>
                    <ListItemText
                      primary={edit.action}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            By {edit.editedBy} on {new Date(edit.timestamp).toLocaleString()}
                          </Typography>
                          {edit.changes && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {edit.changes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No edit history available
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Timesheet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this timesheet:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject Timesheet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetDetail;