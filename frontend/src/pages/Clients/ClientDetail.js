import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Person,
  Business,
  Phone,
  Email,
  LocationOn,
  CreditCard,
  Schedule,
  Notes,
  Star,
  History,
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { clientService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import dayjs from 'dayjs';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const clientData = await clientService.getClientById(id);
      setClient(clientData);
    } catch (error) {
      toast.error('Failed to load client data');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await clientService.deleteClient(id);
      toast.success('Client deleted successfully');
      navigate('/clients');
    } catch (error) {
      toast.error('Failed to delete client');
    }
    setDeleteDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'prospect':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle fontSize="small" />;
      case 'prospect':
        return <Warning fontSize="small" />;
      case 'inactive':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading client details..." />;
  }

  if (!client) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Client not found</Typography>
        <Button onClick={() => navigate('/clients')} sx={{ mt: 2 }}>
          Back to Clients
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/clients')}>
              <ArrowBack />
            </IconButton>
            <Avatar
              sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {client.firstName} {client.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  label={client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  color={getStatusColor(client.status)}
                  icon={getStatusIcon(client.status)}
                />
                <Chip
                  size="small"
                  label={client.type.charAt(0).toUpperCase() + client.type.slice(1)}
                  variant="outlined"
                />
                {client.company && (
                  <Typography variant="body2" color="text.secondary">
                    at {client.company}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/clients/${id}/edit`)}
            >
              Edit
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialog(true)}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${client.stats?.totalPaid?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {client.stats?.totalJobs || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Rating value={client.stats?.rating || 0} size="small" readOnly />
                <Typography variant="h6">
                  {client.stats?.rating || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Average Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {client.stats?.lastServiceDays || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Since Last Service
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Person />} label="Overview" />
          <Tab icon={<LocationOn />} label="Address & Contact" />
          <Tab icon={<Schedule />} label="Service Preferences" />
          <Tab icon={<CreditCard />} label="Payment Info" />
          <Tab icon={<History />} label="Service History" />
          <Tab icon={<Notes />} label="Notes" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={`${client.firstName} ${client.lastName}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={client.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={client.phone}
                  />
                </ListItem>
                {client.company && (
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company"
                      secondary={client.company}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {client.tags?.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                )) || <Typography variant="body2" color="text.secondary">No tags</Typography>}
              </Box>

              {client.emergencyContact?.name && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Emergency Contact
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary={client.emergencyContact.name}
                        secondary={`${client.emergencyContact.relationship} • ${client.emergencyContact.phone}`}
                      />
                    </ListItem>
                  </List>
                </>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Address & Contact Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Service Address
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1">
                    {client.address?.street}<br />
                    {client.address?.city}, {client.address?.state} {client.address?.zipCode}<br />
                    {client.address?.country || 'USA'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Billing Address
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  {client.billingAddress?.street ? (
                    <Typography variant="body1">
                      {client.billingAddress.street}<br />
                      {client.billingAddress.city}, {client.billingAddress.state} {client.billingAddress.zipCode}<br />
                      {client.billingAddress.country || 'USA'}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Same as service address
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Service Preferences Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Scheduling Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Preferred Days"
                    secondary={
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {client.servicePreferences?.preferredDays?.length > 0 ? (
                          client.servicePreferences.preferredDays.map((day) => (
                            <Chip key={day} label={day.charAt(0).toUpperCase() + day.slice(1)} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">Any day</Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Preferred Time"
                    secondary={client.servicePreferences?.preferredTime?.charAt(0).toUpperCase() + (client.servicePreferences?.preferredTime?.slice(1) || 'flexible')}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Special Instructions
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Access Instructions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {client.servicePreferences?.accessInstructions || 'None specified'}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Special Instructions
                  </Typography>
                  <Typography variant="body2">
                    {client.servicePreferences?.specialInstructions || 'None specified'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payment Info Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CreditCard />
                  </ListItemIcon>
                  <ListItemText
                    primary="Payment Method"
                    secondary={client.paymentInfo?.method?.replace('_', ' ').toUpperCase() || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Payment Terms"
                    secondary={client.paymentInfo?.terms?.replace('_', ' ').toUpperCase() || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Credit Limit"
                    secondary={`$${client.paymentInfo?.creditLimit?.toLocaleString() || 0}`}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Payment History Summary
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h4" color="success.main">
                        ${client.stats?.totalPaid?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Paid
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h4" color="warning.main">
                        ${client.stats?.outstandingBalance?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Outstanding
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Service History Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Recent Service History
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Service history integration will be implemented when job management is connected.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Notes Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Client Notes
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body1">
                {client.notes || 'No notes available for this client.'}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {client.firstName} {client.lastName}? 
            This action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientDetail;