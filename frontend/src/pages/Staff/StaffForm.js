import React, { useState, useEffect } from 'react';
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
  Alert,
  FormControlLabel,
  Switch,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { ArrowBack, Save, Person, Work, AttachMoney } from '@mui/icons-material';
import { staffService } from '../../services/api';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  position: Yup.string().required('Position is required'),
  department: Yup.string().required('Department is required'),
  employmentType: Yup.string().required('Employment type is required'),
  hourlyRate: Yup.number().required('Hourly rate is required').min(0, 'Rate must be positive'),
  hireDate: Yup.date().required('Hire date is required'),
});

const StaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      loadStaff();
    }
  }, [id, isEdit]);

  const loadStaff = async () => {
    try {
      const data = await staffService.getStaffById(id);
      setStaff(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load staff member');
      console.error(error);
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      email: staff?.email || '',
      phone: staff?.phone || '',
      position: staff?.position || '',
      department: staff?.department || 'cleaning',
      employmentType: staff?.employmentType || 'full_time',
      hourlyRate: staff?.hourlyRate || '',
      hireDate: staff?.hireDate ? new Date(staff.hireDate).toISOString().split('T')[0] : '',
      skills: staff?.skills || [],
      status: staff?.status || 'active',
      emergencyContactName: staff?.emergencyContact?.name || '',
      emergencyContactPhone: staff?.emergencyContact?.phone || '',
      emergencyContactRelationship: staff?.emergencyContact?.relationship || '',
      // Work schedule
      mondayWork: staff?.workSchedule?.monday?.isWorkingDay || false,
      mondayStart: staff?.workSchedule?.monday?.start || '09:00',
      mondayEnd: staff?.workSchedule?.monday?.end || '17:00',
      tuesdayWork: staff?.workSchedule?.tuesday?.isWorkingDay || false,
      tuesdayStart: staff?.workSchedule?.tuesday?.start || '09:00',
      tuesdayEnd: staff?.workSchedule?.tuesday?.end || '17:00',
      wednesdayWork: staff?.workSchedule?.wednesday?.isWorkingDay || false,
      wednesdayStart: staff?.workSchedule?.wednesday?.start || '09:00',
      wednesdayEnd: staff?.workSchedule?.wednesday?.end || '17:00',
      thursdayWork: staff?.workSchedule?.thursday?.isWorkingDay || false,
      thursdayStart: staff?.workSchedule?.thursday?.start || '09:00',
      thursdayEnd: staff?.workSchedule?.thursday?.end || '17:00',
      fridayWork: staff?.workSchedule?.friday?.isWorkingDay || false,
      fridayStart: staff?.workSchedule?.friday?.start || '09:00',
      fridayEnd: staff?.workSchedule?.friday?.end || '17:00',
      saturdayWork: staff?.workSchedule?.saturday?.isWorkingDay || false,
      saturdayStart: staff?.workSchedule?.saturday?.start || '09:00',
      saturdayEnd: staff?.workSchedule?.saturday?.end || '17:00',
      sundayWork: staff?.workSchedule?.sunday?.isWorkingDay || false,
      sundayStart: staff?.workSchedule?.sunday?.start || '09:00',
      sundayEnd: staff?.workSchedule?.sunday?.end || '17:00',
      maxHoursPerWeek: staff?.workSchedule?.maxHoursPerWeek || 40,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const staffData = {
          ...values,
          emergencyContact: {
            name: values.emergencyContactName,
            phone: values.emergencyContactPhone,
            relationship: values.emergencyContactRelationship
          },
          workSchedule: {
            monday: { start: values.mondayStart, end: values.mondayEnd, isWorkingDay: values.mondayWork },
            tuesday: { start: values.tuesdayStart, end: values.tuesdayEnd, isWorkingDay: values.tuesdayWork },
            wednesday: { start: values.wednesdayStart, end: values.wednesdayEnd, isWorkingDay: values.wednesdayWork },
            thursday: { start: values.thursdayStart, end: values.thursdayEnd, isWorkingDay: values.thursdayWork },
            friday: { start: values.fridayStart, end: values.fridayEnd, isWorkingDay: values.fridayWork },
            saturday: { start: values.saturdayStart, end: values.saturdayEnd, isWorkingDay: values.saturdayWork },
            sunday: { start: values.sundayStart, end: values.sundayEnd, isWorkingDay: values.sundayWork },
            maxHoursPerWeek: values.maxHoursPerWeek
          }
        };

        if (isEdit) {
          await staffService.updateStaff(id, staffData);
          toast.success('Staff member updated successfully!');
        } else {
          await staffService.createStaff(staffData);
          toast.success('Staff member created successfully!');
        }
        navigate('/staff');
      } catch (error) {
        toast.error(isEdit ? 'Failed to update staff member' : 'Failed to create staff member');
        console.error(error);
      }
    },
  });

  const departments = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'management', label: 'Management' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' }
  ];

  const skillOptions = [
    'regular_cleaning',
    'deep_cleaning',
    'carpet_cleaning',
    'window_cleaning',
    'floor_maintenance',
    'upholstery_cleaning',
    'pressure_washing',
    'team_leadership'
  ];

  const handleSkillChange = (skill) => {
    const currentSkills = formik.values.skills || [];
    if (currentSkills.includes(skill)) {
      formik.setFieldValue('skills', currentSkills.filter(s => s !== skill));
    } else {
      formik.setFieldValue('skills', [...currentSkills, skill]);
    }
  };

  const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/staff')}
          sx={{ mb: 2 }}
        >
          Back to Staff List
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Staff Member' : 'Add New Staff Member'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit ? 'Update staff member information' : 'Add a new team member to your staff'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        {/* Personal Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 1 }} />
            <Typography variant="h6">Personal Information</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Employment Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Work sx={{ mr: 1 }} />
            <Typography variant="h6">Employment Information</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position/Job Title"
                name="position"
                value={formik.values.position}
                onChange={formik.handleChange}
                error={formik.touched.position && Boolean(formik.errors.position)}
                helperText={formik.touched.position && formik.errors.position}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.department && Boolean(formik.errors.department)}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  name="employmentType"
                  value={formik.values.employmentType}
                  onChange={formik.handleChange}
                  label="Employment Type"
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Hourly Rate"
                name="hourlyRate"
                value={formik.values.hourlyRate}
                onChange={formik.handleChange}
                error={formik.touched.hourlyRate && Boolean(formik.errors.hourlyRate)}
                helperText={formik.touched.hourlyRate && formik.errors.hourlyRate}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Hire Date"
                name="hireDate"
                value={formik.values.hireDate}
                onChange={formik.handleChange}
                error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                helperText={formik.touched.hireDate && formik.errors.hireDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
                    <MenuItem value="terminated">Terminated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Skills */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Skills & Certifications</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select relevant skills for this staff member:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skillOptions.map((skill) => (
              <Chip
                key={skill}
                label={skill.replace('_', ' ')}
                clickable
                color={formik.values.skills?.includes(skill) ? 'primary' : 'default'}
                variant={formik.values.skills?.includes(skill) ? 'filled' : 'outlined'}
                onClick={() => handleSkillChange(skill)}
              />
            ))}
          </Box>
        </Paper>

        {/* Emergency Contact */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Contact Name"
                name="emergencyContactName"
                value={formik.values.emergencyContactName}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                name="emergencyContactPhone"
                value={formik.values.emergencyContactPhone}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Relationship"
                name="emergencyContactRelationship"
                value={formik.values.emergencyContactRelationship}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Work Schedule */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Work Schedule</Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {weekDays.map((day) => (
              <Grid item xs={12} key={day}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values[`${day}Work`]}
                              onChange={(e) => formik.setFieldValue(`${day}Work`, e.target.checked)}
                            />
                          }
                          label={day.charAt(0).toUpperCase() + day.slice(1)}
                        />
                      </Grid>
                      {formik.values[`${day}Work`] && (
                        <>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Start Time"
                              name={`${day}Start`}
                              value={formik.values[`${day}Start`]}
                              onChange={formik.handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              type="time"
                              label="End Time"
                              name={`${day}End`}
                              value={formik.values[`${day}End`]}
                              onChange={formik.handleChange}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Hours Per Week"
                name="maxHoursPerWeek"
                value={formik.values.maxHoursPerWeek}
                onChange={formik.handleChange}
                InputProps={{
                  inputProps: { min: 1, max: 60 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/staff')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
          >
            {isEdit ? 'Update Staff Member' : 'Add Staff Member'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default StaffForm;