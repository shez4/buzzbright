import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Send,
  ContentCopy,
  Delete,
  CheckCircle,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Schedule,
  AttachMoney,
  Build,
  Comment,
  Visibility,
  Timeline
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { quoteService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ p: 3 }}>
    {value === index && children}
  </Box>
);

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [sendDialog, setSendDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [sendData, setSendData] = useState({
    method: 'email',
    recipient: '',
    message: '',
    includeAttachments: true
  });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await quoteService.getQuote(id);
      setQuote(response);
    } catch (error) {
      toast.error('Failed to fetch quote details');
      navigate('/quotes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'info',
      viewed: 'warning',
      accepted: 'success',
      rejected: 'error',
      expired: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Edit sx={{ fontSize: 16 }} />,
      sent: <Send sx={{ fontSize: 16 }} />,
      viewed: <Visibility sx={{ fontSize: 16 }} />,
      accepted: <CheckCircle sx={{ fontSize: 16 }} />,
      rejected: <Cancel sx={{ fontSize: 16 }} />,
      expired: <Schedule sx={{ fontSize: 16 }} />
    };
    return icons[status] || null;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority] || 'default';
  };

  const handleSendQuote = async () => {
    try {
      setActionLoading(true);
      await quoteService.sendQuote(id, sendData);
      toast.success('Quote sent successfully');
      await fetchQuote();
      setSendDialog(false);
      setSendData({ method: 'email', recipient: '', message: '', includeAttachments: true });
    } catch (error) {
      toast.error('Failed to send quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    try {
      setActionLoading(true);
      await quoteService.acceptQuote(id);
      toast.success('Quote accepted successfully');
      await fetchQuote();
    } catch (error) {
      toast.error('Failed to accept quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    try {
      setActionLoading(true);
      await quoteService.rejectQuote(id, rejectReason);
      toast.success('Quote rejected');
      await fetchQuote();
      setRejectDialog(false);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to reject quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateQuote = async () => {
    try {
      setActionLoading(true);
      const response = await quoteService.duplicateQuote(id);
      toast.success('Quote duplicated successfully');
      navigate(`/quotes/${response.quote.id}/edit`);
    } catch (error) {
      toast.error('Failed to duplicate quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuote = async () => {
    try {
      setActionLoading(true);
      await quoteService.deleteQuote(id);
      toast.success('Quote deleted successfully');
      navigate('/quotes');
    } catch (error) {
      toast.error('Failed to delete quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToJob = async () => {
    try {
      setActionLoading(true);
      await quoteService.convertToJob(id);
      toast.success('Quote converted to job successfully');
      navigate('/jobs');
    } catch (error) {
      toast.error('Failed to convert quote to job');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!quote) {
    return (
      <Alert severity="error">
        Quote not found
      </Alert>
    );
  }

  const isExpired = quote.terms?.validUntil && dayjs(quote.terms.validUntil).isBefore(dayjs());

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/quotes')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {quote.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {quote.quoteNumber} • {quote.clientName}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Chip
            icon={getStatusIcon(quote.status)}
            label={quote.status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(quote.status)}
            variant={quote.status === 'draft' ? 'outlined' : 'filled'}
          />
          <Chip
            label={quote.priority.toUpperCase()}
            color={getPriorityColor(quote.priority)}
            size="small"
          />
        </Box>
      </Box>

      {/* Expired Warning */}
      {isExpired && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This quote expired on {dayjs(quote.terms.validUntil).format('DD/MM/YY')}
        </Alert>
      )}

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={1} flexWrap="wrap">
          {quote.status === 'draft' && (
            <>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={() => setSendDialog(true)}
                disabled={actionLoading}
              >
                Send Quote
              </Button>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => navigate(`/quotes/${id}/edit`)}
              >
                Edit
              </Button>
            </>
          )}
          
          {(quote.status === 'sent' || quote.status === 'viewed') && !isExpired && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleAcceptQuote}
                disabled={actionLoading}
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setRejectDialog(true)}
                disabled={actionLoading}
              >
                Reject
              </Button>
            </>
          )}
          
          {quote.status === 'accepted' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Build />}
              onClick={handleConvertToJob}
              disabled={actionLoading}
            >
              Convert to Job
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleDuplicateQuote}
            disabled={actionLoading}
          >
            Duplicate
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialog(true)}
            disabled={actionLoading}
          >
            Delete
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Services & Pricing" />
          <Tab label="Property Details" />
          <Tab label="Terms & Schedule" />
          <Tab label="Communication" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quote Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography>{quote.description}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography>{quote.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Created</Typography>
                      <Typography>{dayjs(quote.createdAt).format('DD/MM/YY')}</Typography>
                    </Box>
                    {quote.notes && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Notes</Typography>
                        <Typography>{quote.notes}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pricing Summary
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Subtotal</Typography>
                      <Typography>{formatCurrency(quote.pricing.subtotal)}</Typography>
                    </Box>
                    {quote.pricing.discount?.amount > 0 && (
                      <Box display="flex" justifyContent="space-between" color="success.main">
                        <Typography>
                          Discount {quote.pricing.discount.percentage > 0 && `(${quote.pricing.discount.percentage}%)`}
                        </Typography>
                        <Typography>-{formatCurrency(quote.pricing.discount.amount)}</Typography>
                      </Box>
                    )}
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(quote.pricing.total)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Services & Pricing Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quote.services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="subtitle2">{service.name}</Typography>
                      <Chip
                        label={service.category}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell align="center">{service.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(service.unitPrice)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {formatCurrency(service.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>{service.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pricing Breakdown
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Subtotal</Typography>
                        <Typography>{formatCurrency(quote.pricing.subtotal)}</Typography>
                      </Box>
                      {quote.pricing.discount?.amount > 0 && (
                        <>
                          <Box display="flex" justifyContent="space-between" color="success.main">
                            <Typography>Discount ({quote.pricing.discount.percentage}%)</Typography>
                            <Typography>-{formatCurrency(quote.pricing.discount.amount)}</Typography>
                          </Box>
                          {quote.pricing.discount.reason && (
                            <Typography variant="caption" color="text.secondary">
                              Reason: {quote.pricing.discount.reason}
                            </Typography>
                          )}
                        </>
                      )}
                      <Divider />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(quote.pricing.total)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Property Details Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Property Address
                  </Typography>
                  <Typography>
                    {quote.property.address.street}<br />
                    {quote.property.address.city}, {quote.property.address.state} {quote.property.address.zipCode}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Property Details
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Type</Typography>
                      <Typography>{quote.property.propertyType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Square Footage</Typography>
                      <Typography>{quote.property.squareFootage?.toLocaleString() || 'N/A'} sq ft</Typography>
                    </Box>
                    {quote.property.bedrooms && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Bedrooms</Typography>
                        <Typography>{quote.property.bedrooms}</Typography>
                      </Box>
                    )}
                    {quote.property.bathrooms && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Bathrooms</Typography>
                        <Typography>{quote.property.bathrooms}</Typography>
                      </Box>
                    )}
                    {quote.property.floors && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Floors</Typography>
                        <Typography>{quote.property.floors}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {quote.property.accessInstructions && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Access Instructions
                    </Typography>
                    <Typography>{quote.property.accessInstructions}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {quote.property.specialConditions && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Special Conditions
                    </Typography>
                    <Typography>{quote.property.specialConditions}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Terms & Schedule Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Schedule
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Preferred Start Date</Typography>
                      <Typography>
                        {quote.schedule.preferredStartDate 
                          ? dayjs(quote.schedule.preferredStartDate).format('DD/MM/YY')
                          : 'Not specified'
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Frequency</Typography>
                      <Typography>{quote.schedule.frequency.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                    </Box>
                    {quote.schedule.preferredDays && quote.schedule.preferredDays.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Preferred Days</Typography>
                        <Typography>
                          {quote.schedule.preferredDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">Preferred Time</Typography>
                      <Typography>{quote.schedule.preferredTime.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Estimated Duration</Typography>
                      <Typography>{quote.schedule.estimatedDuration} hours</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Terms & Conditions
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Valid Until</Typography>
                      <Typography color={isExpired ? 'error.main' : 'text.primary'}>
                        {quote.terms.validUntil 
                          ? dayjs(quote.terms.validUntil).format('DD/MM/YY')
                          : 'Not specified'
                        }
                        {isExpired && ' (EXPIRED)'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Payment Terms</Typography>
                      <Typography>{quote.terms.paymentTerms.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Cancellation Policy</Typography>
                      <Typography>{quote.terms.cancellationPolicy}</Typography>
                    </Box>
                    {quote.terms.specialTerms && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Special Terms</Typography>
                        <Typography>{quote.terms.specialTerms}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Communication Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Communication History
                  </Typography>
                  
                  {quote.communication?.sentDate && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="primary.main">
                        Quote Sent
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(quote.communication.sentDate).format('DD/MM/YY [at] h:mm A')}
                      </Typography>
                      <Typography variant="body2">
                        Method: {quote.communication.sentMethod}
                      </Typography>
                    </Box>
                  )}
                  
                  {quote.communication?.viewedDate && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="info.main">
                        Quote Viewed
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(quote.communication.viewedDate).format('DD/MM/YY [at] h:mm A')}
                      </Typography>
                    </Box>
                  )}
                  
                  {quote.communication?.responses && quote.communication.responses.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Client Responses
                      </Typography>
                      <List dense>
                        {quote.communication.responses.map((response, index) => (
                          <ListItem key={index} divider>
                            <ListItemIcon>
                              <Comment color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={response.message}
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    {response.respondedBy} • {dayjs(response.date).format('DD/MM/YY [at] h:mm A')}
                                  </Typography>
                                  <Chip
                                    label={response.type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {(!quote.communication?.sentDate && !quote.communication?.responses?.length) && (
                    <Typography color="text.secondary">
                      No communication history yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Send Quote Dialog */}
      <Dialog open={sendDialog} onClose={() => setSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Quote</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Recipient Email"
              value={sendData.recipient}
              onChange={(e) => setSendData(prev => ({ ...prev, recipient: e.target.value }))}
              fullWidth
              placeholder="client@example.com"
            />
            <TextField
              label="Personal Message (Optional)"
              value={sendData.message}
              onChange={(e) => setSendData(prev => ({ ...prev, message: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              placeholder="Add a personal message to accompany the quote..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendQuote}
            variant="contained"
            disabled={actionLoading || !sendData.recipient}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Send />}
          >
            Send Quote
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Quote Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Quote</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={3}
            fullWidth
            required
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRejectQuote}
            color="error"
            variant="contained"
            disabled={actionLoading || !rejectReason.trim()}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Cancel />}
          >
            Reject Quote
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Quote</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this quote? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteQuote}
            color="error"
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete Quote
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuoteDetail;