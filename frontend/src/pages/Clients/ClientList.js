import React, { useState, useEffect, useContext } from 'react';
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
  Chip,
  IconButton,
  InputAdornment,
  Avatar,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Phone,
  Email,
  Business,
  Home,
  LocationOn,
  Person,
  Star,
  AttachMoney
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import dayjs from 'dayjs';

const ClientList = () => {
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      setClients(response.clients);
    } catch (error) {
      toast.error('Failed to fetch clients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await clientService.deleteClient(id);
      toast.success('Client deleted successfully');
      await fetchClients();
    } catch (error) {
      toast.error('Failed to delete client');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      prospect: 'info'
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type) => {
    return type === 'commercial' ? <Business fontSize="small" /> : <Home fontSize="small" />;
  };

  const getActiveClients = () => clients.filter(c => c.status === 'active');
  const getInactiveClients = () => clients.filter(c => c.status === 'inactive');
  const getProspectClients = () => clients.filter(c => c.status === 'prospect');

  const getCurrentClients = () => {
    switch (activeTab) {
      case 0: return getActiveClients();
      case 1: return getInactiveClients();
      case 2: return getProspectClients();
      default: return clients;
    }
  };

  const filteredClients = getCurrentClients().filter(client => {
    const matchesSearch = 
      client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner message="Loading clients..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Client Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your clients and contact information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/clients/new')}
        >
          Add New Client
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Active (${getActiveClients().length})`} />
          <Tab label={`Inactive (${getInactiveClients().length})`} />
          <Tab label={`Prospects (${getProspectClients().length})`} />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search clients..."
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
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              select
              fullWidth
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="residential">Residential</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="prospect">Prospect</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredClients.length} of {getCurrentClients().length} clients
        </Typography>
      </Box>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No clients found. {searchTerm && 'Try adjusting your search terms.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredClients.map((client) => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={client.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                  {/* Header with Avatar and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2, minHeight: 48 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, overflow: 'hidden' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, flexShrink: 0 }}>
                        {client.company ? getTypeIcon(client.type) : <Person />}
                      </Avatar>
                      <Box sx={{ overflow: 'hidden', flex: 1 }}>
                        <Typography variant="h6" component="div" noWrap sx={{ fontSize: '1rem', fontWeight: 600 }}>
                          {client.company || `${client.firstName} ${client.lastName}`}
                        </Typography>
                        {client.company && (
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.85rem' }}>
                            {client.firstName} {client.lastName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 0.5, flexShrink: 0, ml: 1 }}>
                      <Chip
                        label={client.status}
                        color={getStatusColor(client.status)}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip
                        label={client.type}
                        variant="outlined"
                        size="small"
                        icon={getTypeIcon(client.type)}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </Box>

                  {/* Contact Information */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                      <Phone fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }} noWrap>{client.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                      <Email fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }} noWrap title={client.email}>
                        {client.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, overflow: 'hidden' }}>
                      <LocationOn fontSize="small" color="action" sx={{ mt: 0.1, flexShrink: 0 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.3, 
                          fontSize: '0.85rem',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                        title={`${client.address?.street}, ${client.address?.city}, ${client.address?.state} ${client.address?.zipCode}`}
                      >
                        {client.address?.street}<br />
                        {client.address?.city}, {client.address?.state} {client.address?.zipCode}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }} noWrap>
                        {formatCurrency(client.stats?.totalPaid || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {client.stats?.totalJobs || 0} jobs
                      </Typography>
                      {client.stats?.averageRating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <Star fontSize="small" color="warning" sx={{ fontSize: '1rem' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {client.stats.averageRating.toFixed(1)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Last Service */}
                  {client.stats?.lastService && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1, display: 'block' }}>
                      Last service: {dayjs(client.stats.lastService).format('DD/MM/YY')}
                    </Typography>
                  )}

                  {/* Tags */}
                  {client.tags && client.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', mt: 1, overflow: 'hidden' }}>
                      {client.tags.slice(0, 2).map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.65rem', height: '18px', maxWidth: '80px' }}
                        />
                      ))}
                      {client.tags.length > 2 && (
                        <Chip 
                          label={`+${client.tags.length - 2}`} 
                          size="small" 
                          variant="outlined" 
                          sx={{ fontSize: '0.65rem', height: '18px', minWidth: '28px' }}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1, minHeight: 48 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    View
                  </Button>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                      title="Edit Client"
                      sx={{ p: 0.5 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClient(client.id)}
                      title="Delete Client"
                      sx={{ p: 0.5 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ClientList;