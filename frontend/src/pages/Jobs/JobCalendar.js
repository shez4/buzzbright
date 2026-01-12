import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Paper,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/api';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

const JobCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await jobService.getJobs();
      const calendarEvents = (data.jobs || []).map(job => ({
        id: job.id,
        title: `${job.client} - ${job.type}`,
        start: new Date(job.scheduledDate),
        end: new Date(new Date(job.scheduledDate).getTime() + 2 * 60 * 60 * 1000), // Add 2 hours
        resource: job,
        status: job.status
      }));
      setEvents(calendarEvents);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error(error);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const getEventStyle = (event) => {
    let backgroundColor = '#3174ad';
    switch (event.status) {
      case 'completed':
        backgroundColor = '#4caf50';
        break;
      case 'in_progress':
        backgroundColor = '#ff9800';
        break;
      case 'scheduled':
        backgroundColor = '#2196f3';
        break;
      case 'cancelled':
        backgroundColor = '#f44336';
        break;
      default:
        backgroundColor = '#9e9e9e';
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/jobs')}
            sx={{ mb: 2 }}
          >
            Back to List View
          </Button>
          <Typography variant="h4" component="h1">
            Job Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visual schedule of all jobs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/jobs/new')}
        >
          Create Job
        </Button>
      </Box>

      {/* Legend */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label="Scheduled" sx={{ bgcolor: '#2196f3', color: 'white' }} size="small" />
          <Chip label="In Progress" sx={{ bgcolor: '#ff9800', color: 'white' }} size="small" />
          <Chip label="Completed" sx={{ bgcolor: '#4caf50', color: 'white' }} size="small" />
          <Chip label="Cancelled" sx={{ bgcolor: '#f44336', color: 'white' }} size="small" />
        </Box>
      </Paper>

      {/* Calendar */}
      <Paper sx={{ p: 2, height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          eventPropGetter={getEventStyle}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          step={30}
          showMultiDayTimes
          style={{ height: '100%' }}
        />
      </Paper>

      {/* Event Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Job Details
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.resource.client}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedEvent.resource.type}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {moment(selectedEvent.start).format('MMMM D, YYYY')}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {moment(selectedEvent.start).format('h:mm A')}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={selectedEvent.status?.replace('_', ' ')}
                    size="small"
                    color={
                      selectedEvent.status === 'completed' ? 'success' :
                      selectedEvent.status === 'in_progress' ? 'warning' :
                      selectedEvent.status === 'scheduled' ? 'info' : 'error'
                    }
                  />
                </Typography>
                {selectedEvent.resource.assignedStaff && (
                  <Typography variant="body2">
                    <strong>Assigned To:</strong> {selectedEvent.resource.assignedStaff}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            onClick={() => {
              navigate(`/jobs/${selectedEvent.id}`);
              handleCloseDialog();
            }}
            variant="outlined"
          >
            View Details
          </Button>
          <Button
            onClick={() => {
              navigate(`/jobs/${selectedEvent.id}/edit`);
              handleCloseDialog();
            }}
            variant="contained"
          >
            Edit Job
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobCalendar;