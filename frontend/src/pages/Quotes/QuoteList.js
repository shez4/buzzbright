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
  Send,
  Check,
  Close,
  RequestQuote,
  Person,
  AttachMoney,
  CalendarToday,
  LocationOn,
  ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const QuoteList = () => {
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useContext(AuthContext);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadQuotes();
  }, [statusFilter, typeFilter]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await quoteService.getQuotes({
        status: statusFilter,
        type: typeFilter
      });
      setQuotes(data.quotes || []);
    } catch (error) {
      toast.error('Failed to load quotes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async (id) => {
    try {
      await quoteService.sendQuote(id);
      toast.success('Quote sent successfully');
      loadQuotes();
    } catch (error) {
      toast.error('Failed to send quote');
    }
  };

  const handleAcceptQuote = async (id) => {
    try {
      await quoteService.acceptQuote(id);
      toast.success('Quote accepted');
      loadQuotes();
    } catch (error) {
      toast.error('Failed to accept quote');
    }
  };

  const handleRejectQuote = async (id) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await quoteService.rejectQuote(id, reason);
        toast.success('Quote rejected');
        loadQuotes();
      } catch (error) {
        toast.error('Failed to reject quote');
      }
    }
  };

  const handleDuplicateQuote = async (id) => {
    try {
      await quoteService.duplicateQuote(id);
      toast.success('Quote duplicated successfully');
      loadQuotes();
    } catch (error) {
      toast.error('Failed to duplicate quote');
    }
  };

  const handleDeleteQuote = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await quoteService.deleteQuote(id);
        toast.success('Quote deleted successfully');
        loadQuotes();
      } catch (error) {
        toast.error('Failed to delete quote');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'sent':
        return 'info';
      case 'viewed':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'default';
      case 'converted':
        return 'success';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isExpiringSoon = (validUntil) => {
    const today = new Date();
    const expiry = new Date(validUntil);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const getDraftQuotes = () => quotes.filter(q => q.status === 'draft');
  const getActiveQuotes = () => quotes.filter(q => ['sent', 'viewed'].includes(q.status));
  const getClosedQuotes = () => quotes.filter(q => ['accepted', 'rejected', 'expired', 'converted'].includes(q.status));

  const getCurrentQuotes = () => {
    switch (activeTab) {
      case 0: return getDraftQuotes();
      case 1: return getActiveQuotes();
      case 2: return getClosedQuotes();
      default: return quotes;
    }
  };

  const filteredQuotes = getCurrentQuotes().filter(quote => {
    const matchesSearch = 
      quote.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || quote.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <LoadingSpinner message="Loading quotes..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Quotes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, track, and manage quotes for potential clients
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/quotes/new')}
        >
          New Quote
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Draft (${getDraftQuotes().length})`} />
          <Tab label={`Active (${getActiveQuotes().length})`} />
          <Tab label={`Closed (${getClosedQuotes().length})`} />
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search quotes..."
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
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
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              {filteredQuotes.length} quote(s)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Expiring Soon Alert */}
      {quotes.some(q => isExpiringSoon(q.validUntil)) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {quotes.filter(q => isExpiringSoon(q.validUntil)).length} quote(s) expiring soon.
        </Alert>
      )}

      {/* Quote Cards */}
      {filteredQuotes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No quotes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first quote'}
          </Typography>
          {!searchTerm && typeFilter === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/quotes/new')}
            >
              Create Quote
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredQuotes.map((quote) => (
            <Grid item xs={12} md={6} lg={4} key={quote.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.5em'
                  }}>
                    {quote.description || quote.title}
                  </Typography>

                  {/* Client with Phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Person fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {quote.clientName}
                      </Typography>
                      {quote.clientPhone && (
                        <Typography variant="caption" color="text.secondary">
                          📞 {quote.clientPhone}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Job Site Address */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mt: 0.1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                      {quote.property?.address?.street}<br />
                      {quote.property?.address?.city}, {quote.property?.address?.state} {quote.property?.address?.zipCode}
                    </Typography>
                  </Box>

                  {/* Valid Until */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography 
                      variant="body2" 
                      color={isExpired(quote.terms?.validUntil) ? 'error' : isExpiringSoon(quote.terms?.validUntil) ? 'warning.main' : 'text.secondary'}
                    >
                      Valid until {new Date(quote.terms?.validUntil).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </Typography>
                  </Box>

                  {/* Amount */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {formatCurrency(quote.pricing?.total)}
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/quotes/${quote.id}`)}
                      title="View Details"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/quotes/${quote.id}/edit`)}
                      title="Edit Quote"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicateQuote(quote.id)}
                      title="Duplicate Quote"
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box>
                    {quote.status === 'draft' && (
                      <Button
                        size="small"
                        startIcon={<Send />}
                        onClick={() => handleSendQuote(quote.id)}
                      >
                        Send
                      </Button>
                    )}
                    {quote.status === 'sent' && (isManager || isAdmin) && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAcceptQuote(quote.id)}
                          title="Accept Quote"
                        >
                          <Check fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRejectQuote(quote.id)}
                          title="Reject Quote"
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    {quote.status === 'draft' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteQuote(quote.id)}
                        title="Delete Quote"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
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

export default QuoteList;