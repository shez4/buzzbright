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
  MenuItem,
  InputAdornment,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save,
  Cancel,
  Add,
  Delete,
  ExpandMore,
  AttachMoney,
  Person,
  Home,
  Build,
  Description,
  Schedule
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { quoteService, clientService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const QuoteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Client & Property', 'Services & Pricing', 'Terms & Schedule'];

  const validationSchema = Yup.object({
    clientId: Yup.string().required('Client is required'),
    title: Yup.string().required('Quote title is required'),
    type: Yup.string().required('Quote type is required'),
    description: Yup.string(),
    priority: Yup.string(),
    // Property validation
    'property.address.street': Yup.string().required('Street address is required'),
    'property.address.city': Yup.string().required('City is required'),
    'property.address.state': Yup.string().required('State is required'),
    'property.address.zipCode': Yup.string().required('ZIP code is required'),
    'property.propertyType': Yup.string().required('Property type is required'),
    'property.squareFootage': Yup.number().min(1, 'Square footage must be positive'),
    // Terms validation
    'terms.validUntil': Yup.date().required('Valid until date is required').min(new Date(), 'Date must be in the future'),
    'terms.paymentTerms': Yup.string().required('Payment terms are required'),
    // Pricing validation
    'pricing.discount.percentage': Yup.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%')
  });

  const formik = useFormik({
    initialValues: {
      clientId: '',
      title: '',
      description: '',
      type: 'regular_cleaning',
      priority: 'medium',
      property: {
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        propertyType: 'residential',
        squareFootage: '',
        bedrooms: '',
        bathrooms: '',
        floors: 1,
        accessInstructions: '',
        specialConditions: ''
      },
      schedule: {
        preferredStartDate: dayjs().add(1, 'week'),
        estimatedDuration: '',
        frequency: 'one-time',
        preferredDays: [],
        preferredTime: 'flexible'
      },
      terms: {
        validUntil: dayjs().add(30, 'day'),
        paymentTerms: 'upon_completion',
        cancellationPolicy: '',
        specialTerms: ''
      },
      pricing: {
        discount: {
          percentage: 0,
          reason: ''
        }
      },
      notes: '',
      internalNotes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      if (services.length === 0) {
        toast.error('Please add at least one service');
        return;
      }

      try {
        const quoteData = {
          ...values,
          services: services,
          createdBy: user.id
        };

        if (isEdit) {
          await quoteService.updateQuote(id, quoteData);
          toast.success('Quote updated successfully');
        } else {
          await quoteService.createQuote(quoteData);
          toast.success('Quote created successfully');
        }
        
        navigate('/quotes');
      } catch (error) {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} quote`);
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
      
      const clientData = await clientService.getClients();
      setClients(clientData.clients || []);

      if (isEdit) {
        const quote = await quoteService.getQuote(id);
        formik.setValues({
          clientId: quote.clientId || '',
          title: quote.title || '',
          description: quote.description || '',
          type: quote.type || 'regular_cleaning',
          priority: quote.priority || 'medium',
          property: {
            address: {
              street: quote.property?.address?.street || '',
              city: quote.property?.address?.city || '',
              state: quote.property?.address?.state || '',
              zipCode: quote.property?.address?.zipCode || ''
            },
            propertyType: quote.property?.propertyType || 'residential',
            squareFootage: quote.property?.squareFootage || '',
            bedrooms: quote.property?.bedrooms || '',
            bathrooms: quote.property?.bathrooms || '',
            floors: quote.property?.floors || 1,
            accessInstructions: quote.property?.accessInstructions || '',
            specialConditions: quote.property?.specialConditions || ''
          },
          schedule: {
            preferredStartDate: quote.schedule?.preferredStartDate ? dayjs(quote.schedule.preferredStartDate) : dayjs().add(1, 'week'),
            estimatedDuration: quote.schedule?.estimatedDuration || '',
            frequency: quote.schedule?.frequency || 'one-time',
            preferredDays: quote.schedule?.preferredDays || [],
            preferredTime: quote.schedule?.preferredTime || 'flexible'
          },
          terms: {
            validUntil: quote.terms?.validUntil ? dayjs(quote.terms.validUntil) : dayjs().add(30, 'day'),
            paymentTerms: quote.terms?.paymentTerms || 'upon_completion',
            cancellationPolicy: quote.terms?.cancellationPolicy || '',
            specialTerms: quote.terms?.specialTerms || ''
          },
          pricing: {
            discount: {
              percentage: quote.pricing?.discount?.percentage || 0,
              reason: quote.pricing?.discount?.reason || ''
            }
          },
          notes: quote.notes || '',
          internalNotes: quote.internalNotes || ''
        });
        setServices(quote.services || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setCurrentService({
      name: '',
      description: '',
      category: 'cleaning',
      quantity: 1,
      unitPrice: 0,
      frequency: 'one-time',
      estimatedDuration: '',
      notes: ''
    });
    setServiceDialog(true);
  };

  const handleEditService = (index) => {
    setCurrentService({ ...services[index], index });
    setServiceDialog(true);
  };

  const handleSaveService = (serviceData) => {
    const service = {
      ...serviceData,
      totalPrice: serviceData.quantity * serviceData.unitPrice
    };

    if (currentService.index !== undefined) {
      const updatedServices = [...services];
      updatedServices[currentService.index] = service;
      setServices(updatedServices);
    } else {
      setServices([...services, service]);
    }
    
    setServiceDialog(false);
    setCurrentService(null);
  };

  const handleDeleteService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = services.reduce((sum, service) => sum + service.totalPrice, 0);
    const discountAmount = (subtotal * (formik.values.pricing.discount.percentage || 0)) / 100;
    const total = subtotal - discountAmount;

    return { subtotal, discountAmount, total };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (loading) {
    return <LoadingSpinner message="Loading quote..." />;
  }

  const { subtotal, discountAmount, total } = calculateTotals();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Edit Quote' : 'New Quote'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEdit ? 'Update quote details' : 'Create a new quote for potential clients'}
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <form onSubmit={formik.handleSubmit}>
        {/* Step 1: Client & Property */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Client Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Client"
                      name="clientId"
                      value={formik.values.clientId}
                      onChange={formik.handleChange}
                      error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                      helperText={formik.touched.clientId && formik.errors.clientId}
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Quote Title"
                      name="title"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                      placeholder="e.g., Weekly Office Cleaning"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Quote Type"
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={formik.touched.type && formik.errors.type}
                    >
                      <MenuItem value="regular_cleaning">Regular Cleaning</MenuItem>
                      <MenuItem value="deep_cleaning">Deep Cleaning</MenuItem>
                      <MenuItem value="move_in">Move In</MenuItem>
                      <MenuItem value="move_out">Move Out</MenuItem>
                      <MenuItem value="post_construction">Post Construction</MenuItem>
                      <MenuItem value="carpet_cleaning">Carpet Cleaning</MenuItem>
                      <MenuItem value="window_cleaning">Window Cleaning</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Priority"
                      name="priority"
                      value={formik.values.priority}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
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
                      placeholder="Brief description of the cleaning requirements..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Property Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Home /> Property Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="property.address.street"
                      value={formik.values.property.address.street}
                      onChange={formik.handleChange}
                      error={formik.touched.property?.address?.street && Boolean(formik.errors.property?.address?.street)}
                      helperText={formik.touched.property?.address?.street && formik.errors.property?.address?.street}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="property.address.city"
                      value={formik.values.property.address.city}
                      onChange={formik.handleChange}
                      error={formik.touched.property?.address?.city && Boolean(formik.errors.property?.address?.city)}
                      helperText={formik.touched.property?.address?.city && formik.errors.property?.address?.city}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="property.address.state"
                      value={formik.values.property.address.state}
                      onChange={formik.handleChange}
                      error={formik.touched.property?.address?.state && Boolean(formik.errors.property?.address?.state)}
                      helperText={formik.touched.property?.address?.state && formik.errors.property?.address?.state}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      name="property.address.zipCode"
                      value={formik.values.property.address.zipCode}
                      onChange={formik.handleChange}
                      error={formik.touched.property?.address?.zipCode && Boolean(formik.errors.property?.address?.zipCode)}
                      helperText={formik.touched.property?.address?.zipCode && formik.errors.property?.address?.zipCode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Property Type"
                      name="property.propertyType"
                      value={formik.values.property.propertyType}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="residential">Residential</MenuItem>
                      <MenuItem value="commercial">Commercial</MenuItem>
                      <MenuItem value="office">Office</MenuItem>
                      <MenuItem value="retail">Retail</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Square Footage"
                      name="property.squareFootage"
                      value={formik.values.property.squareFootage}
                      onChange={formik.handleChange}
                      error={formik.touched.property?.squareFootage && Boolean(formik.errors.property?.squareFootage)}
                      helperText={formik.touched.property?.squareFootage && formik.errors.property?.squareFootage}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
                      }}
                    />
                  </Grid>
                  {formik.values.property.propertyType === 'residential' && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Bedrooms"
                          name="property.bedrooms"
                          value={formik.values.property.bedrooms}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Bathrooms"
                          name="property.bathrooms"
                          value={formik.values.property.bathrooms}
                          onChange={formik.handleChange}
                          inputProps={{ step: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Floors"
                          name="property.floors"
                          value={formik.values.property.floors}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Access Instructions"
                      name="property.accessInstructions"
                      value={formik.values.property.accessInstructions}
                      onChange={formik.handleChange}
                      placeholder="Key location, gate codes, parking instructions, etc."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Special Conditions"
                      name="property.specialConditions"
                      value={formik.values.property.specialConditions}
                      onChange={formik.handleChange}
                      placeholder="Pets, allergies, fragile items, etc."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Step 2: Services & Pricing */}
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Build /> Services
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddService}
                  >
                    Add Service
                  </Button>
                </Box>

                {services.length === 0 ? (
                  <Alert severity="info">
                    No services added yet. Click "Add Service" to get started.
                  </Alert>
                ) : (
                  <List>
                    {services.map((service, index) => (
                      <ListItem key={index} divider sx={{ pr: 10 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                              {service.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {service.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  Qty: {service.quantity} × {formatCurrency(service.unitPrice)} = {formatCurrency(service.totalPrice)}
                                </Typography>
                                {service.frequency !== 'one-time' && (
                                  <Chip label={service.frequency} size="small" color="primary" variant="outlined" />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditService(index)}
                              title="Edit Service"
                            >
                              <Build />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteService(index)}
                              title="Delete Service"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* Pricing Summary */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney /> Pricing Summary
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Discount %"
                      name="pricing.discount.percentage"
                      value={formik.values.pricing.discount.percentage}
                      onChange={formik.handleChange}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(subtotal)}</Typography>
                  </Box>
                  {discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="success.main">Discount:</Typography>
                      <Typography color="success.main">-{formatCurrency(discountAmount)}</Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">{formatCurrency(total)}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Step 3: Terms & Schedule */}
        {activeStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule /> Schedule
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Preferred Start Date"
                      value={formik.values.schedule.preferredStartDate}
                      onChange={(newValue) => formik.setFieldValue('schedule.preferredStartDate', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Estimated Duration"
                      name="schedule.estimatedDuration"
                      value={formik.values.schedule.estimatedDuration}
                      onChange={formik.handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Frequency"
                      name="schedule.frequency"
                      value={formik.values.schedule.frequency}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="one-time">One Time</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="biweekly">Bi-weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Preferred Time"
                      name="schedule.preferredTime"
                      value={formik.values.schedule.preferredTime}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="morning">Morning (8AM - 12PM)</MenuItem>
                      <MenuItem value="afternoon">Afternoon (12PM - 5PM)</MenuItem>
                      <MenuItem value="evening">Evening (5PM - 8PM)</MenuItem>
                      <MenuItem value="flexible">Flexible</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description /> Terms & Conditions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Valid Until"
                      value={formik.values.terms.validUntil}
                      onChange={(newValue) => formik.setFieldValue('terms.validUntil', newValue)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          error={formik.touched.terms?.validUntil && Boolean(formik.errors.terms?.validUntil)}
                          helperText={formik.touched.terms?.validUntil && formik.errors.terms?.validUntil}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Payment Terms"
                      name="terms.paymentTerms"
                      value={formik.values.terms.paymentTerms}
                      onChange={formik.handleChange}
                      error={formik.touched.terms?.paymentTerms && Boolean(formik.errors.terms?.paymentTerms)}
                      helperText={formik.touched.terms?.paymentTerms && formik.errors.terms?.paymentTerms}
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="net_15">Net 15</MenuItem>
                      <MenuItem value="net_30">Net 30</MenuItem>
                      <MenuItem value="upon_completion">Upon Completion</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Cancellation Policy"
                      name="terms.cancellationPolicy"
                      value={formik.values.terms.cancellationPolicy}
                      onChange={formik.handleChange}
                      placeholder="24-hour notice required for cancellations..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Special Terms"
                      name="terms.specialTerms"
                      value={formik.values.terms.specialTerms}
                      onChange={formik.handleChange}
                      placeholder="Any additional terms or conditions..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Client Notes"
                      name="notes"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      placeholder="Notes visible to the client..."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Internal Notes"
                      name="internalNotes"
                      value={formik.values.internalNotes}
                      onChange={formik.handleChange}
                      placeholder="Internal notes (not visible to client)..."
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/quotes')}
          >
            Cancel
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={formik.isSubmitting}
              >
                {isEdit ? 'Update' : 'Create'} Quote
              </Button>
            )}
          </Box>
        </Box>
      </form>

      {/* Service Dialog */}
      <ServiceDialog
        open={serviceDialog}
        onClose={() => setServiceDialog(false)}
        onSave={handleSaveService}
        initialData={currentService}
      />
    </Box>
  );
};

// Service Dialog Component
const ServiceDialog = ({ open, onClose, onSave, initialData }) => {
  const [serviceData, setServiceData] = useState(
    initialData || {
      name: '',
      description: '',
      category: 'cleaning',
      quantity: 1,
      unitPrice: 0,
      frequency: 'one-time',
      estimatedDuration: '',
      notes: ''
    }
  );

  useEffect(() => {
    if (initialData) {
      setServiceData(initialData);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!serviceData.name || serviceData.unitPrice <= 0) {
      toast.error('Please fill in service name and price');
      return;
    }
    onSave(serviceData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData?.index !== undefined ? 'Edit Service' : 'Add Service'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Service Name"
              value={serviceData.name}
              onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
              placeholder="e.g., Kitchen Deep Clean"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={serviceData.category}
              onChange={(e) => setServiceData({ ...serviceData, category: e.target.value })}
            >
              <MenuItem value="cleaning">Cleaning</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="supplies">Supplies</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={serviceData.description}
              onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
              placeholder="Detailed description of the service..."
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={serviceData.quantity}
              onChange={(e) => setServiceData({ ...serviceData, quantity: parseInt(e.target.value) || 1 })}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Unit Price"
              value={serviceData.unitPrice}
              onChange={(e) => setServiceData({ ...serviceData, unitPrice: parseFloat(e.target.value) || 0 })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Total"
              value={`$${(serviceData.quantity * serviceData.unitPrice).toFixed(2)}`}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              label="Frequency"
              value={serviceData.frequency}
              onChange={(e) => setServiceData({ ...serviceData, frequency: e.target.value })}
            >
              <MenuItem value="one-time">One Time</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="biweekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Duration"
              value={serviceData.estimatedDuration}
              onChange={(e) => setServiceData({ ...serviceData, estimatedDuration: e.target.value })}
              InputProps={{
                endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={serviceData.notes}
              onChange={(e) => setServiceData({ ...serviceData, notes: e.target.value })}
              placeholder="Additional notes about this service..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {initialData?.index !== undefined ? 'Update' : 'Add'} Service
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteForm;