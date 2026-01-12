import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
  InputAdornment,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { ArrowBack, Save } from '@mui/icons-material';
import { jobService, clientService, staffService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const validationSchema = Yup.object({
  client: Yup.string().required('Client is required'),
  title: Yup.string().required('Job title is required'),
  type: Yup.string().required('Job type is required'),
  scheduledDate: Yup.date().required('Date is required').min(new Date(), 'Date must be in the future'),
  startTime: Yup.string().required('Start time is required'),
  estimatedDuration: Yup.number().required('Duration is required').min(1, 'Must be at least 1 hour'),
  address: Yup.string().required('Address is required'),
  totalAmount: Yup.number().required('Amount is required').min(0, 'Amount must be positive'),
  frequency: Yup.string().required('Frequency is required'),
  recurringEndDate: Yup.date().when('frequency', {
    is: (frequency) => frequency && frequency !== 'one-time',
    then: (schema) => schema.required('End date is required for recurring jobs').min(Yup.ref('scheduledDate'), 'End date must be after start date'),
    otherwise: (schema) => schema.nullable()
  })
});

const JobForm = ({ job = null, isEdit = false }) => {
  const navigate = useNavigate();
  // const { user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    loadClients();
    loadStaff();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await staffService.getStaff();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      client: job?.client || '',
      title: job?.title || '',
      description: job?.description || '',
      type: job?.type || 'Regular Cleaning',
      scheduledDate: job?.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : '',
      startTime: job?.startTime || '09:00',
      estimatedDuration: job?.estimatedDuration || 2,
      address: (job?.address && typeof job.address === 'object') 
        ? job.address.street 
        : (job?.address || ''),
      city: (job?.address && typeof job.address === 'object') 
        ? job.address.city 
        : (job?.city || ''),
      zipCode: (job?.address && typeof job.address === 'object') 
        ? job.address.zipCode 
        : (job?.zipCode || ''),
      accessInstructions: job?.accessInstructions || '',
      assignedStaff: job?.assignedStaff || [],
      priority: job?.priority || 'medium',
      totalAmount: job?.totalAmount || 0,
      status: job?.status || 'scheduled',
      frequency: job?.frequency || 'one-time',
      recurringEndDate: job?.recurringEndDate ? new Date(job.recurringEndDate).toISOString().split('T')[0] : '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await jobService.updateJob(job.id, values);
          toast.success('Job updated successfully!');
        } else {
          await jobService.createJob(values);
          toast.success('Job created successfully!');
        }
        navigate('/jobs');
      } catch (error) {
        toast.error(isEdit ? 'Failed to update job' : 'Failed to create job');
        console.error(error);
      }
    },
  });

  const jobTypes = [
    'Regular Cleaning',
    'Deep Cleaning',
    'Move-in Clean',
    'Move-out Clean',
    'Post-Construction',
    'Carpet Cleaning',
    'Window Cleaning',
    'Other'
  ];

  const frequencyOptions = [
    { value: 'one-time', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly (Every 2 weeks)' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'bi-monthly', label: 'Bi-monthly (Every 2 months)' },
    { value: 'quarterly', label: 'Quarterly (Every 3 months)' },
    { value: 'semi-annually', label: 'Semi-annually (Every 6 months)' },
    { value: 'annually', label: 'Annually' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'default' },
    { value: 'medium', label: 'Medium', color: 'primary' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'urgent', label: 'Urgent', color: 'error' }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mb: 2 }}
        >
          Back to Jobs
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Job' : 'Create New Job'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit ? 'Update job details' : 'Schedule a new cleaning job'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Job Details */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Client"
                    name="client"
                    value={formik.values.client}
                    onChange={formik.handleChange}
                    error={formik.touched.client && Boolean(formik.errors.client)}
                    helperText={formik.touched.client && formik.errors.client}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={`${client.firstName} ${client.lastName}`}>
                        {client.firstName} {client.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                    placeholder="e.g., Weekly House Cleaning - Smith Residence"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Job Type"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    helperText={formik.touched.type && formik.errors.type}
                  >
                    {jobTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Priority"
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Chip label={priority.label} color={priority.color} size="small" />
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Additional details about the cleaning job..."
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Schedule Details */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Schedule
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    name="scheduledDate"
                    value={formik.values.scheduledDate}
                    onChange={formik.handleChange}
                    error={formik.touched.scheduledDate && Boolean(formik.errors.scheduledDate)}
                    helperText={formik.touched.scheduledDate && formik.errors.scheduledDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start Time"
                    name="startTime"
                    value={formik.values.startTime}
                    onChange={formik.handleChange}
                    error={formik.touched.startTime && Boolean(formik.errors.startTime)}
                    helperText={formik.touched.startTime && formik.errors.startTime}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Estimated Duration (hours)"
                    name="estimatedDuration"
                    value={formik.values.estimatedDuration}
                    onChange={formik.handleChange}
                    error={formik.touched.estimatedDuration && Boolean(formik.errors.estimatedDuration)}
                    helperText={formik.touched.estimatedDuration && formik.errors.estimatedDuration}
                    InputProps={{
                      inputProps: { min: 0.5, step: 0.5 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price"
                    name="totalAmount"
                    value={formik.values.totalAmount}
                    onChange={formik.handleChange}
                    error={formik.touched.totalAmount && Boolean(formik.errors.totalAmount)}
                    helperText={formik.touched.totalAmount && formik.errors.totalAmount}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0, step: 0.01 }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Frequency & Recurrence */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Frequency & Recurrence
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.frequency && Boolean(formik.errors.frequency)}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      name="frequency"
                      value={formik.values.frequency}
                      onChange={formik.handleChange}
                      label="Frequency"
                    >
                      {frequencyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.frequency && formik.errors.frequency && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                        {formik.errors.frequency}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {formik.values.frequency !== 'one-time' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Recurring End Date"
                      name="recurringEndDate"
                      value={formik.values.recurringEndDate}
                      onChange={formik.handleChange}
                      error={formik.touched.recurringEndDate && Boolean(formik.errors.recurringEndDate)}
                      helperText={formik.touched.recurringEndDate && formik.errors.recurringEndDate || 'Leave empty for ongoing recurring jobs'}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}

                {formik.values.frequency !== 'one-time' && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Recurring jobs will be automatically created based on the selected frequency. 
                        The next job will be scheduled {
                          formik.values.frequency === 'weekly' ? 'one week' :
                          formik.values.frequency === 'bi-weekly' ? 'two weeks' :
                          formik.values.frequency === 'monthly' ? 'one month' :
                          formik.values.frequency === 'bi-monthly' ? 'two months' :
                          formik.values.frequency === 'quarterly' ? 'three months' :
                          formik.values.frequency === 'semi-annually' ? 'six months' :
                          formik.values.frequency === 'annually' ? 'one year' : ''
                        } after the scheduled date.
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Location Details */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location & Access
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="zipCode"
                    value={formik.values.zipCode}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Access Instructions"
                    name="accessInstructions"
                    value={formik.values.accessInstructions}
                    onChange={formik.handleChange}
                    placeholder="Gate code, key location, parking instructions, etc."
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Staff Assignment */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Staff Assignment
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth>
                <InputLabel>Assign Staff</InputLabel>
                <Select
                  multiple
                  name="assignedStaff"
                  value={formik.values.assignedStaff}
                  onChange={formik.handleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {staff.map((member) => (
                    <MenuItem key={member.id} value={`${member.firstName} ${member.lastName}`}>
                      {member.firstName} {member.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mt: 2 }}>
                Staff will be notified once the job is created
              </Alert>
            </Paper>

            {/* Actions */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                startIcon={<Save />}
                disabled={formik.isSubmitting}
                sx={{ mb: 2 }}
              >
                {formik.isSubmitting ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/jobs')}
              >
                Cancel
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default JobForm;