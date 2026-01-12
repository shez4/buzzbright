import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  IconButton,
  Alert,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  Person,
  Business,
  Phone,
  Email,
  LocationOn,
  CreditCard,
  Add,
  Delete
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { clientService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'), 
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  type: Yup.string().required('Client type is required'),
  status: Yup.string().required('Status is required'),
  'address.street': Yup.string().required('Street address is required'),
  'address.city': Yup.string().required('City is required'),
  'address.state': Yup.string().required('State is required'),
  'address.zipCode': Yup.string().required('ZIP code is required'),
  'paymentInfo.method': Yup.string().required('Payment method is required'),
  'paymentInfo.terms': Yup.string().required('Payment terms are required')
});

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [newTag, setNewTag] = useState('');
  
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const clientData = await clientService.getClientById(id);
      setClient(clientData);
      
      formik.setValues({
        firstName: clientData.firstName || '',
        lastName: clientData.lastName || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        company: clientData.company || '',
        type: clientData.type || 'residential',
        status: clientData.status || 'prospect',
        address: {
          street: clientData.address?.street || '',
          city: clientData.address?.city || '',
          state: clientData.address?.state || '',
          zipCode: clientData.address?.zipCode || '',
          country: clientData.address?.country || 'USA'
        },
        billingAddress: {
          street: clientData.billingAddress?.street || '',
          city: clientData.billingAddress?.city || '',
          state: clientData.billingAddress?.state || '',
          zipCode: clientData.billingAddress?.zipCode || '',
          country: clientData.billingAddress?.country || 'USA'
        },
        emergencyContact: {
          name: clientData.emergencyContact?.name || '',
          phone: clientData.emergencyContact?.phone || '',
          relationship: clientData.emergencyContact?.relationship || ''
        },
        servicePreferences: {
          preferredDays: clientData.servicePreferences?.preferredDays || [],
          preferredTime: clientData.servicePreferences?.preferredTime || 'flexible',
          accessInstructions: clientData.servicePreferences?.accessInstructions || '',
          specialInstructions: clientData.servicePreferences?.specialInstructions || ''
        },
        paymentInfo: {
          method: clientData.paymentInfo?.method || 'credit_card',
          terms: clientData.paymentInfo?.terms || 'immediate',
          creditLimit: clientData.paymentInfo?.creditLimit || 500
        },
        notes: clientData.notes || '',
        tags: clientData.tags || []
      });
    } catch (error) {
      toast.error('Failed to load client data');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      type: 'residential',
      status: 'prospect',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      servicePreferences: {
        preferredDays: [],
        preferredTime: 'flexible',
        accessInstructions: '',
        specialInstructions: ''
      },
      paymentInfo: {
        method: 'credit_card',
        terms: 'immediate',
        creditLimit: 500
      },
      notes: '',
      tags: []
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (isEdit) {
          await clientService.updateClient(id, values);
          toast.success('Client updated successfully');
        } else {
          await clientService.createClient(values);
          toast.success('Client created successfully');
        }
        navigate('/clients');
      } catch (error) {
        toast.error(isEdit ? 'Failed to update client' : 'Failed to create client');
      } finally {
        setLoading(false);
      }
    }
  });

  const copyBillingAddress = () => {
    formik.setFieldValue('billingAddress', formik.values.address);
  };

  const addTag = () => {
    if (newTag.trim() && !formik.values.tags.includes(newTag.trim())) {
      formik.setFieldValue('tags', [...formik.values.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    formik.setFieldValue('tags', formik.values.tags.filter(tag => tag !== tagToRemove));
  };

  const handlePreferredDayChange = (day) => {
    const currentDays = formik.values.servicePreferences.preferredDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    formik.setFieldValue('servicePreferences.preferredDays', newDays);
  };

  if (loading && isEdit && !client) {
    return <LoadingSpinner message="Loading client data..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/clients')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            {isEdit ? 'Edit Client' : 'New Client'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Update client information' : 'Add a new client to your system'}
          </Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        {/* Basic Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company (Optional)"
                name="company"
                value={formik.values.company}
                onChange={formik.handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                required
              >
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                required
              >
                <MenuItem value="prospect">Prospect</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Address Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn /> Address Information
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Service Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address.street"
                value={formik.values.address.street}
                onChange={formik.handleChange}
                error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                helperText={formik.touched.address?.street && formik.errors.address?.street}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                helperText={formik.touched.address?.city && formik.errors.address?.city}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="address.state"
                value={formik.values.address.state}
                onChange={formik.handleChange}
                error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                helperText={formik.touched.address?.state && formik.errors.address?.state}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="address.zipCode"
                value={formik.values.address.zipCode}
                onChange={formik.handleChange}
                error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2">
              Billing Address
            </Typography>
            <Button
              size="small"
              onClick={copyBillingAddress}
              startIcon={<LocationOn />}
            >
              Copy from Service Address
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="billingAddress.street"
                value={formik.values.billingAddress.street}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="billingAddress.city"
                value={formik.values.billingAddress.city}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="billingAddress.state"
                value={formik.values.billingAddress.state}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="billingAddress.zipCode"
                value={formik.values.billingAddress.zipCode}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Emergency Contact */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Emergency Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="emergencyContact.name"
                value={formik.values.emergencyContact.name}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Phone"
                name="emergencyContact.phone"
                value={formik.values.emergencyContact.phone}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Relationship"
                name="emergencyContact.relationship"
                value={formik.values.emergencyContact.relationship}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Service Preferences */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Service Preferences
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Preferred Days
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <Chip
                    key={day}
                    label={day.charAt(0).toUpperCase() + day.slice(1)}
                    clickable
                    color={formik.values.servicePreferences.preferredDays.includes(day) ? 'primary' : 'default'}
                    onClick={() => handlePreferredDayChange(day)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Preferred Time"
                name="servicePreferences.preferredTime"
                value={formik.values.servicePreferences.preferredTime}
                onChange={formik.handleChange}
              >
                <MenuItem value="flexible">Flexible</MenuItem>
                <MenuItem value="morning">Morning</MenuItem>
                <MenuItem value="afternoon">Afternoon</MenuItem>
                <MenuItem value="evening">Evening</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Access Instructions"
                name="servicePreferences.accessInstructions"
                value={formik.values.servicePreferences.accessInstructions}
                onChange={formik.handleChange}
                placeholder="e.g., Key under mat, Gate code 1234..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Special Instructions"
                name="servicePreferences.specialInstructions"
                value={formik.values.servicePreferences.specialInstructions}
                onChange={formik.handleChange}
                placeholder="e.g., Pet allergies, fragile items, security system..."
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Payment Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard /> Payment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                name="paymentInfo.method"
                value={formik.values.paymentInfo.method}
                onChange={formik.handleChange}
                required
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="invoice">Invoice</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Payment Terms"
                name="paymentInfo.terms"
                value={formik.values.paymentInfo.terms}
                onChange={formik.handleChange}
                required
              >
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="net_15">Net 15</MenuItem>
                <MenuItem value="net_30">Net 30</MenuItem>
                <MenuItem value="upon_completion">Upon Completion</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Credit Limit"
                name="paymentInfo.creditLimit"
                value={formik.values.paymentInfo.creditLimit}
                onChange={formik.handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Notes and Tags */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notes & Tags
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                placeholder="Additional information about the client..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField
                  size="small"
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <IconButton onClick={addTag} disabled={!newTag.trim()}>
                  <Add />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formik.values.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    deleteIcon={<Delete />}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Actions */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/clients')}
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<Save />}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Client' : 'Create Client')}
            </Button>
          </Box>
        </Paper>
      </form>
    </Box>
  );
};

export default ClientForm;