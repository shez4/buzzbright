import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Save,
  Cancel,
  Add,
  Delete,
  PlayArrow,
  Stop,
  AccessTime,
  Work,
  LocationOn,
  Receipt,
  DirectionsCar,
  Note
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { timesheetService, staffService, jobService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const TimesheetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isManager, isAdmin } = useContext(AuthContext);
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [breakDialog, setBreakDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [currentBreak, setCurrentBreak] = useState(null);
  const [currentExpense, setCurrentExpense] = useState(null);

  const validationSchema = Yup.object({
    staffId: Yup.string().required('Staff member is required'),
    date: Yup.date().required('Date is required'),
    jobId: Yup.string(),
    clockIn: Yup.date().required('Clock in time is required'),
    clockOut: Yup.date().when('clockIn', (clockIn, schema) => {
      return clockIn ? schema.min(clockIn, 'Clock out must be after clock in') : schema;
    }),
    mileage: Yup.number().min(0, 'Mileage must be positive').nullable(),
    notes: Yup.string().max(500, 'Notes must be less than 500 characters')
  });

  const formik = useFormik({
    initialValues: {
      staffId: user?.id || '',
      date: dayjs(),
      jobId: '',
      clockIn: null,
      clockOut: null,
      mileage: 0,
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const timesheetData = {
          ...values,
          breaks: breaks,
          expenses: expenses,
          totalHours: calculateTotalHours(values.clockIn, values.clockOut, breaks),
          overtimeHours: calculateOvertimeHours(values.clockIn, values.clockOut, breaks)
        };

        if (isEdit) {
          await timesheetService.updateTimesheet(id, timesheetData);
          toast.success('Timesheet updated successfully');
        } else {
          await timesheetService.createTimesheet(timesheetData);
          toast.success('Timesheet created successfully');
        }
        
        navigate('/timesheets');
      } catch (error) {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} timesheet`);
        console.error(error);
      }
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [staffData, jobData] = await Promise.all([
        staffService.getStaff(),
        jobService.getJobs()
      ]);

      setStaff(staffData.staff || []);
      setJobs(jobData.jobs || []);

      if (isEdit) {
        const timesheet = await timesheetService.getTimesheet(id);
        formik.setValues({
          staffId: timesheet.staffId,
          date: dayjs(timesheet.date),
          jobId: timesheet.jobId || '',
          clockIn: timesheet.clockIn ? dayjs(timesheet.clockIn) : null,
          clockOut: timesheet.clockOut ? dayjs(timesheet.clockOut) : null,
          mileage: timesheet.mileage || 0,
          notes: timesheet.notes || ''
        });
        setBreaks(timesheet.breaks || []);
        setExpenses(timesheet.expenses || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = (clockIn, clockOut, breaks) => {
    if (!clockIn || !clockOut) return 0;
    
    const start = dayjs(clockIn);
    const end = dayjs(clockOut);
    const totalMinutes = end.diff(start, 'minute');
    const breakMinutes = breaks.reduce((total, break_) => {
      if (break_.startTime && break_.endTime) {
        const breakStart = dayjs(break_.startTime);
        const breakEnd = dayjs(break_.endTime);
        return total + breakEnd.diff(breakStart, 'minute');
      }
      return total;
    }, 0);
    
    return Math.max(0, (totalMinutes - breakMinutes) / 60);
  };

  const calculateOvertimeHours = (clockIn, clockOut, breaks) => {
    const totalHours = calculateTotalHours(clockIn, clockOut, breaks);
    return Math.max(0, totalHours - 8);
  };

  const handleAddBreak = () => {
    setCurrentBreak({
      id: Date.now(),
      type: 'break',
      startTime: dayjs(),
      endTime: null,
      duration: 0
    });
    setBreakDialog(true);
  };

  const handleSaveBreak = (breakData) => {
    if (currentBreak.id && breaks.find(b => b.id === currentBreak.id)) {
      setBreaks(breaks.map(b => b.id === currentBreak.id ? breakData : b));
    } else {
      setBreaks([...breaks, { ...breakData, id: Date.now() }]);
    }
    setBreakDialog(false);
    setCurrentBreak(null);
  };

  const handleDeleteBreak = (breakId) => {
    setBreaks(breaks.filter(b => b.id !== breakId));
  };

  const handleAddExpense = () => {
    setCurrentExpense({
      id: Date.now(),
      type: 'materials',
      amount: 0,
      description: '',
      receipt: false
    });
    setExpenseDialog(true);
  };

  const handleSaveExpense = (expenseData) => {
    if (currentExpense.id && expenses.find(e => e.id === currentExpense.id)) {
      setExpenses(expenses.map(e => e.id === currentExpense.id ? expenseData : e));
    } else {
      setExpenses([...expenses, { ...expenseData, id: Date.now() }]);
    }
    setExpenseDialog(false);
    setCurrentExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };

  const formatTime = (time) => {
    return time ? dayjs(time).format('HH:mm') : '';
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '0h 0m';
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const minutes = end.diff(start, 'minute');
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading timesheet..." />;
  }

  const totalHours = calculateTotalHours(formik.values.clockIn, formik.values.clockOut, breaks);
  const overtimeHours = calculateOvertimeHours(formik.values.clockIn, formik.values.clockOut, breaks);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Edit Timesheet' : 'New Timesheet'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit ? 'Update timesheet details' : 'Create a new timesheet entry'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Staff Member"
                    name="staffId"
                    value={formik.values.staffId}
                    onChange={formik.handleChange}
                    error={formik.touched.staffId && Boolean(formik.errors.staffId)}
                    helperText={formik.touched.staffId && formik.errors.staffId}
                    disabled={!isManager && !isAdmin}
                  >
                    {staff.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date"
                    value={formik.values.date}
                    onChange={(newValue) => formik.setFieldValue('date', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.date && Boolean(formik.errors.date)}
                        helperText={formik.touched.date && formik.errors.date}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Job (Optional)"
                    name="jobId"
                    value={formik.values.jobId}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="">No specific job</MenuItem>
                    {jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.title} - {job.clientName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Time Tracking */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Time Tracking
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Clock In"
                    value={formik.values.clockIn}
                    onChange={(newValue) => formik.setFieldValue('clockIn', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.clockIn && Boolean(formik.errors.clockIn)}
                        helperText={formik.touched.clockIn && formik.errors.clockIn}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="Clock Out"
                    value={formik.values.clockOut}
                    onChange={(newValue) => formik.setFieldValue('clockOut', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.clockOut && Boolean(formik.errors.clockOut)}
                        helperText={formik.touched.clockOut && formik.errors.clockOut}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Breaks Section */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Breaks</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddBreak}
                  >
                    Add Break
                  </Button>
                </Box>
                {breaks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No breaks recorded
                  </Typography>
                ) : (
                  <List dense>
                    {breaks.map((break_, index) => (
                      <ListItem key={break_.id} divider>
                        <ListItemText
                          primary={`${break_.type === 'break' ? 'Break' : 'Lunch'} ${index + 1}`}
                          secondary={`${formatTime(break_.startTime)} - ${formatTime(break_.endTime)} (${formatDuration(break_.startTime, break_.endTime)})`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteBreak(break_.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Time Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Hours:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {totalHours.toFixed(2)}h
                  </Typography>
                </Box>
                {overtimeHours > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Overtime Hours:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {overtimeHours.toFixed(2)}h
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Break Time:</Typography>
                  <Typography variant="body2">
                    {(breaks.reduce((total, break_) => {
                      if (break_.startTime && break_.endTime) {
                        const breakStart = dayjs(break_.startTime);
                        const breakEnd = dayjs(break_.endTime);
                        return total + breakEnd.diff(breakStart, 'minute');
                      }
                      return total;
                    }, 0) / 60).toFixed(2)}h
                  </Typography>
                </Box>
              </Box>

              {totalHours > 8 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This timesheet includes overtime hours.
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Mileage"
                    name="mileage"
                    value={formik.values.mileage}
                    onChange={formik.handleChange}
                    error={formik.touched.mileage && Boolean(formik.errors.mileage)}
                    helperText={formik.touched.mileage && formik.errors.mileage}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={handleAddExpense}
                    sx={{ height: '56px' }}
                  >
                    Add Expense
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                    placeholder="Add any additional notes about this timesheet..."
                  />
                </Grid>
              </Grid>

              {/* Expenses */}
              {expenses.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Expenses
                  </Typography>
                  <List dense>
                    {expenses.map((expense) => (
                      <ListItem key={expense.id} divider>
                        <ListItemText
                          primary={expense.description}
                          secondary={`${expense.type} - $${expense.amount}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/timesheets')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={formik.isSubmitting}
              >
                {isEdit ? 'Update' : 'Save'} Timesheet
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Break Dialog */}
      <BreakDialog
        open={breakDialog}
        onClose={() => setBreakDialog(false)}
        onSave={handleSaveBreak}
        initialData={currentBreak}
      />

      {/* Expense Dialog */}
      <ExpenseDialog
        open={expenseDialog}
        onClose={() => setExpenseDialog(false)}
        onSave={handleSaveExpense}
        initialData={currentExpense}
      />
    </Box>
  );
};

// Break Dialog Component
const BreakDialog = ({ open, onClose, onSave, initialData }) => {
  const [breakData, setBreakData] = useState(
    initialData || {
      type: 'break',
      startTime: dayjs(),
      endTime: dayjs(),
      duration: 0
    }
  );

  useEffect(() => {
    if (initialData) {
      setBreakData(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    if (breakData.startTime && breakData.endTime) {
      const start = dayjs(breakData.startTime);
      const end = dayjs(breakData.endTime);
      const duration = end.diff(start, 'minute');
      onSave({ ...breakData, duration });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Break</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Break Type"
              value={breakData.type}
              onChange={(e) => setBreakData({ ...breakData, type: e.target.value })}
            >
              <MenuItem value="break">Break</MenuItem>
              <MenuItem value="lunch">Lunch</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="Start Time"
              value={breakData.startTime}
              onChange={(newValue) => setBreakData({ ...breakData, startTime: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <TimePicker
              label="End Time"
              value={breakData.endTime}
              onChange={(newValue) => setBreakData({ ...breakData, endTime: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

// Expense Dialog Component
const ExpenseDialog = ({ open, onClose, onSave, initialData }) => {
  const [expenseData, setExpenseData] = useState(
    initialData || {
      type: 'materials',
      amount: 0,
      description: '',
      receipt: false
    }
  );

  useEffect(() => {
    if (initialData) {
      setExpenseData(initialData);
    }
  }, [initialData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Expense Type"
              value={expenseData.type}
              onChange={(e) => setExpenseData({ ...expenseData, type: e.target.value })}
            >
              <MenuItem value="materials">Materials</MenuItem>
              <MenuItem value="fuel">Fuel</MenuItem>
              <MenuItem value="parking">Parking</MenuItem>
              <MenuItem value="tools">Tools</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={expenseData.amount}
              onChange={(e) => setExpenseData({ ...expenseData, amount: parseFloat(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={expenseData.receipt}
                  onChange={(e) => setExpenseData({ ...expenseData, receipt: e.target.checked })}
                />
              }
              label="Has Receipt"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              placeholder="Describe the expense..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(expenseData)} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimesheetForm;