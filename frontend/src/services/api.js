import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock users for demo purposes
const mockUsers = {
  'admin@buzzbright.com': {
    id: '1',
    email: 'admin@buzzbright.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    password: 'password123'
  },
  'manager@buzzbright.com': {
    id: '2',
    email: 'manager@buzzbright.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    password: 'password123'
  },
  'staff@buzzbright.com': {
    id: '3',
    email: 'staff@buzzbright.com',
    firstName: 'Staff',
    lastName: 'User',
    role: 'staff',
    password: 'password123'
  }
};

export const authService = {
  login: async (email, password) => {
    // Mock authentication for demo
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const user = mockUsers[email];
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return {
      message: 'Login successful',
      token: 'mock-jwt-token-' + Date.now(),
      user: userWithoutPassword
    };
  },

  register: async (userData) => {
    // For demo, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'User registered successfully' };
  },

  getCurrentUser: async () => {
    // Get user from localStorage token for demo
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    // For demo, extract user from token (in real app this would be a proper JWT)
    const userId = token.includes('mock-jwt-token') ? '1' : null;
    if (!userId) throw new Error('Invalid token');
    
    const user = Object.values(mockUsers).find(u => u.id === userId) || mockUsers['admin@buzzbright.com'];
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword
    };
  },

  changePassword: async (currentPassword, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password changed successfully' };
  }
};

// Mock data for demo
const mockJobs = [
  { id: '1', client: 'Smith Residence', type: 'Regular Cleaning', status: 'completed', scheduledDate: new Date() },
  { id: '2', client: 'Office Complex A', type: 'Deep Cleaning', status: 'in_progress', scheduledDate: new Date() },
  { id: '3', client: 'Johnson Home', type: 'Move-out Clean', status: 'scheduled', scheduledDate: new Date() }
];

const mockClients = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@smith.com', phone: '555-0101' },
  { id: '2', firstName: 'Jane', lastName: 'Johnson', email: 'jane@johnson.com', phone: '555-0102' }
];

export const jobService = {
  getJobs: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      jobs: mockJobs,
      totalPages: 1,
      currentPage: 1,
      totalJobs: mockJobs.length
    };
  },

  getJobById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockJobs.find(job => job.id === id) || mockJobs[0];
  },

  createJob: async (jobData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { message: 'Job created successfully', job: { id: Date.now().toString(), ...jobData } };
  },

  updateJob: async (id, jobData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Job updated successfully', job: { id, ...jobData } };
  },

  deleteJob: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: 'Job deleted successfully' };
  },

  updateJobStatus: async (id, statusData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { message: 'Job status updated successfully', job: { id, ...statusData } };
  }
};

export const clientService = {
  getClients: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      clients: mockClients,
      totalPages: 1,
      currentPage: 1,
      totalClients: mockClients.length
    };
  },

  getClientById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockClients.find(client => client.id === id) || mockClients[0];
  },

  createClient: async (clientData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Client created successfully', client: { id: Date.now().toString(), ...clientData } };
  },

  updateClient: async (id, clientData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Client updated successfully', client: { id, ...clientData } };
  },

  deleteClient: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: 'Client deleted successfully' };
  }
};

export const staffService = {
  getStaff: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      staff: [
        { id: '1', firstName: 'Sarah', lastName: 'Miller', email: 'sarah@buzzbright.com', position: 'Senior Cleaner' },
        { id: '2', firstName: 'Mike', lastName: 'Roberts', email: 'mike@buzzbright.com', position: 'Cleaner' }
      ]
    };
  },

  getStaffById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, firstName: 'Sarah', lastName: 'Miller', email: 'sarah@buzzbright.com', position: 'Senior Cleaner' };
  },

  createStaff: async (staffData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Staff member created successfully' };
  },

  updateStaff: async (id, staffData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Staff member updated successfully' };
  },

  getStaffAvailability: async (id, params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { availability: [] };
  },

  setStaffAvailability: async (id, availabilityData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Availability updated successfully' };
  }
};

export const timesheetService = {
  getTimesheets: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      timesheets: [
        { id: '1', staff: 'Sarah Miller', date: new Date(), status: 'approved', totalHours: 8 },
        { id: '2', staff: 'Mike Roberts', date: new Date(), status: 'pending', totalHours: 7.5 }
      ]
    };
  },

  getTimesheetById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, staff: 'Sarah Miller', date: new Date(), status: 'approved', totalHours: 8 };
  },

  createTimesheet: async (timesheetData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Timesheet created successfully' };
  },

  updateTimesheet: async (id, timesheetData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Timesheet updated successfully' };
  },

  clockIn: async (id, clockData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { message: 'Clocked in successfully' };
  },

  clockOut: async (id, clockData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { message: 'Clocked out successfully' };
  },

  approveTimesheet: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Timesheet approved successfully' };
  },

  rejectTimesheet: async (id, reason) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Timesheet rejected successfully' };
  }
};

export const quoteService = {
  getQuotes: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      quotes: [
        { id: '1', client: 'Wilson Apartment', status: 'sent', total: 150, validUntil: new Date() },
        { id: '2', client: 'Corporate Office', status: 'accepted', total: 500, validUntil: new Date() }
      ]
    };
  },

  getQuoteById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, client: 'Wilson Apartment', status: 'sent', total: 150, validUntil: new Date() };
  },

  createQuote: async (quoteData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Quote created successfully' };
  },

  updateQuote: async (id, quoteData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Quote updated successfully' };
  },

  sendQuote: async (id, sendData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return { message: 'Quote sent successfully' };
  },

  convertToJob: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Quote converted to job successfully' };
  }
};

export const inventoryService = {
  getItems: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      items: [
        { id: '1', name: 'All-Purpose Cleaner', category: 'cleaning_supplies', currentStock: 25, minStockLevel: 10 },
        { id: '2', name: 'Vacuum Cleaner', category: 'equipment', currentStock: 5, minStockLevel: 3 }
      ]
    };
  },

  getItemById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, name: 'All-Purpose Cleaner', category: 'cleaning_supplies', currentStock: 25, minStockLevel: 10 };
  },

  createItem: async (itemData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Inventory item created successfully' };
  },

  updateItem: async (id, itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Inventory item updated successfully' };
  },

  deleteItem: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: 'Inventory item deleted successfully' };
  },

  getAlerts: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      alerts: [
        { id: '1', item: 'Disinfectant', type: 'low_stock', currentStock: 3, threshold: 10 }
      ]
    };
  },

  recordTransaction: async (id, transactionData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Transaction recorded successfully' };
  }
};

export const notificationService = {
  getNotifications: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      notifications: [
        { id: '1', title: 'Job Assigned', message: 'You have been assigned to clean Smith Residence', status: 'unread', createdAt: new Date() },
        { id: '2', title: 'Low Stock Alert', message: 'All-Purpose Cleaner is running low', status: 'read', createdAt: new Date() }
      ]
    };
  },

  markAsRead: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: 'Notification marked as read' };
  },

  markAllAsRead: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'All notifications marked as read' };
  },

  deleteNotification: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: 'Notification deleted' };
  },

  getPreferences: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      preferences: {
        email: true,
        push: true,
        sms: false
      }
    };
  },

  updatePreferences: async (preferences) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Preferences updated successfully' };
  }
};

export default api;