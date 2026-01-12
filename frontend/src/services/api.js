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
    // Only redirect to login for auth-related endpoints or when using real backend
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const token = localStorage.getItem('token');
      
      // If it's an auth endpoint or we have a real JWT token (not mock), handle the redirect
      if (isAuthEndpoint || (token && !token.includes('mock-jwt-token'))) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // For mock development, just log the error but don't redirect
      else {
        console.warn('API call failed (using mock data):', error.message);
      }
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
    try {
      // Try real API first
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Fallback to mock authentication for demo
      console.warn('API not available, using mock auth:', error.message);
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
    }
  },

  register: async (userData) => {
    // For demo, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'User registered successfully' };
  },

  getCurrentUser: async () => {
    try {
      // Try real API first
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // Fallback to mock auth for development
      console.warn('API not available, using mock auth:', error.message);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      // For demo, extract user from token
      if (token.includes('mock-jwt-token')) {
        // Extract user ID from mock token or default to admin
        const user = mockUsers['admin@buzzbright.com']; // Default to admin for demo
        const { password: _, ...userWithoutPassword } = user;
        
        return {
          user: userWithoutPassword
        };
      }
      
      throw new Error('Invalid token');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password changed successfully' };
  }
};

// Mock data for demo
const mockJobs = [
  {
    id: '1',
    jobNumber: 'JOB-2024-001',
    client: 'Smith Residence',
    clientId: '1',
    type: 'Regular Cleaning',
    title: 'Weekly Cleaning Service',
    status: 'completed',
    priority: 'normal',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    scheduledTime: '09:00',
    duration: 2,
    estimatedPrice: 120,
    assignedStaff: 'Sarah Johnson',
    assignedStaffIds: ['1'],
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    },
    description: 'Regular weekly cleaning including all rooms',
    frequency: 'weekly',
    recurringEndDate: null,
    completedAt: new Date(new Date().setDate(new Date().getDate() - 2))
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-002',
    client: 'Office Complex A',
    clientId: '2',
    type: 'Deep Cleaning',
    title: 'Office Deep Clean',
    status: 'in_progress',
    priority: 'high',
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    duration: 4,
    estimatedPrice: 450,
    assignedStaff: 'Mike Davis, Sarah Johnson',
    assignedStaffIds: ['2', '1'],
    address: {
      street: '456 Business Blvd',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702'
    },
    description: 'Deep cleaning of all office spaces, conference rooms, and restrooms',
    frequency: 'one-time',
    recurringEndDate: null
  },
  {
    id: '3',
    jobNumber: 'JOB-2024-003',
    client: 'Johnson Home',
    clientId: '3',
    type: 'Move-out Clean',
    title: 'End of Lease Cleaning',
    status: 'scheduled',
    priority: 'high',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    scheduledTime: '10:00',
    duration: 6,
    estimatedPrice: 650,
    assignedStaff: 'Emily Wilson, Sarah Johnson',
    assignedStaffIds: ['3', '1'],
    address: {
      street: '789 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703'
    },
    description: 'Complete move-out cleaning including carpet cleaning and windows',
    frequency: 'one-time',
    recurringEndDate: null
  },
  {
    id: '4',
    jobNumber: 'JOB-2024-004',
    client: 'Tech Startup Inc',
    clientId: '4',
    type: 'Regular Cleaning',
    title: 'Bi-weekly Office Maintenance',
    status: 'scheduled',
    priority: 'normal',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    scheduledTime: '18:00',
    duration: 3,
    estimatedPrice: 300,
    assignedStaff: 'Mike Davis',
    assignedStaffIds: ['2'],
    address: {
      street: '321 Tech Park Dr',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704'
    },
    description: 'Bi-weekly cleaning of office space and kitchen areas',
    frequency: 'bi-weekly',
    recurringEndDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
  },
  {
    id: '5',
    jobNumber: 'JOB-2024-005',
    client: 'Green Valley Restaurant',
    clientId: '5',
    type: 'Specialized Cleaning',
    title: 'Restaurant Kitchen Deep Clean',
    status: 'scheduled',
    priority: 'high',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    scheduledTime: '22:00',
    duration: 5,
    estimatedPrice: 800,
    assignedStaff: 'Mike Davis, Emily Wilson',
    assignedStaffIds: ['2', '3'],
    address: {
      street: '555 Food Court Plaza',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62705'
    },
    description: 'Deep cleaning of commercial kitchen including hoods, floors, and equipment',
    frequency: 'monthly',
    recurringEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  },
  {
    id: '6',
    jobNumber: 'JOB-2024-006',
    client: 'Smith Residence',
    clientId: '1',
    type: 'Window Cleaning',
    title: 'Window Cleaning Service',
    status: 'completed',
    priority: 'low',
    scheduledDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    scheduledTime: '11:00',
    duration: 2,
    estimatedPrice: 150,
    assignedStaff: 'Emily Wilson',
    assignedStaffIds: ['3'],
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    },
    description: 'Clean all interior and exterior windows',
    frequency: 'one-time',
    recurringEndDate: null,
    completedAt: new Date(new Date().setDate(new Date().getDate() - 7))
  }
];

const mockClients = [
  { 
    id: '1', 
    firstName: 'John', 
    lastName: 'Smith', 
    email: 'john@smith.com', 
    phone: '(555) 123-4567',
    company: '',
    type: 'residential',
    status: 'active',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    billingAddress: {
      street: '123 Main Street',
      city: 'San Francisco', 
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Smith',
      phone: '(555) 123-4568',
      relationship: 'Spouse'
    },
    servicePreferences: {
      preferredDays: ['tuesday', 'thursday'],
      preferredTime: 'morning',
      accessInstructions: 'Key under front door mat',
      specialInstructions: 'Two cats - please be careful with breakable items'
    },
    paymentInfo: {
      method: 'credit_card',
      terms: 'immediate',
      creditLimit: 500
    },
    stats: {
      totalJobs: 24,
      totalPaid: 2400,
      lastService: new Date(2026, 0, 8),
      joinDate: new Date(2025, 5, 15),
      averageRating: 4.8
    },
    notes: 'Excellent client, always pays on time. Prefers eco-friendly products.',
    tags: ['regular', 'eco-friendly', 'reliable']
  },
  { 
    id: '2', 
    firstName: 'Metro Business', 
    lastName: 'Center', 
    email: 'facilities@metrobusiness.com', 
    phone: '(555) 234-5678',
    company: 'Metro Business Center',
    type: 'commercial',
    status: 'active',
    address: {
      street: '456 Business Avenue, Suite 200',
      city: 'San Francisco',
      state: 'CA', 
      zipCode: '94105',
      country: 'USA'
    },
    billingAddress: {
      street: '456 Business Avenue, Suite 200',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105', 
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Smith - Facilities Manager',
      phone: '(555) 234-5679',
      relationship: 'Facilities Manager'
    },
    servicePreferences: {
      preferredDays: ['monday', 'wednesday', 'friday'],
      preferredTime: 'evening', 
      accessInstructions: 'Check in with building security',
      specialInstructions: 'Must work after 6 PM, building closes at 8 PM'
    },
    paymentInfo: {
      method: 'invoice',
      terms: 'net_30',
      creditLimit: 5000
    },
    stats: {
      totalJobs: 52,
      totalPaid: 15600,
      lastService: new Date(2026, 0, 10),
      joinDate: new Date(2025, 2, 1),
      averageRating: 4.9
    },
    notes: 'Large commercial client. Net 30 payment terms. Always requires certificate of insurance.',
    tags: ['commercial', 'high-value', 'recurring']
  },
  { 
    id: '3', 
    firstName: 'Bob', 
    lastName: 'Johnson', 
    email: 'bob@johnson.com', 
    phone: '(555) 345-6789',
    company: '',
    type: 'residential', 
    status: 'active',
    address: {
      street: '789 Pine Street, Apt 4B',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94607',
      country: 'USA'
    },
    billingAddress: {
      street: '789 Pine Street, Apt 4B', 
      city: 'Oakland',
      state: 'CA',
      zipCode: '94607',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mary Johnson',
      phone: '(555) 345-6790',
      relationship: 'Wife'
    },
    servicePreferences: {
      preferredDays: ['saturday'],
      preferredTime: 'morning',
      accessInstructions: 'Property manager has keys - call 30 min before',
      specialInstructions: 'Pet odors need special attention'
    },
    paymentInfo: {
      method: 'cash',
      terms: 'immediate', 
      creditLimit: 300
    },
    stats: {
      totalJobs: 8,
      totalPaid: 800,
      lastService: new Date(2025, 11, 22),
      joinDate: new Date(2025, 8, 10),
      averageRating: 4.5
    },
    notes: 'Moving out client. Needs deposit cleaning to get security deposit back.',
    tags: ['move-out', 'apartment']
  },
  { 
    id: '4', 
    firstName: 'Tech Startup', 
    lastName: 'Inc', 
    email: 'admin@techstartup.com', 
    phone: '(555) 456-7890',
    company: 'Tech Startup Inc',
    type: 'commercial',
    status: 'inactive',
    address: {
      street: '555 Innovation Drive',
      city: 'Palo Alto',
      state: 'CA',
      zipCode: '94301',
      country: 'USA'
    },
    billingAddress: {
      street: '555 Innovation Drive',
      city: 'Palo Alto',
      state: 'CA', 
      zipCode: '94301',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Sarah Chen - Office Manager',
      phone: '(555) 456-7891',
      relationship: 'Office Manager'
    },
    servicePreferences: {
      preferredDays: ['sunday'],
      preferredTime: 'morning',
      accessInstructions: 'Construction site - hard hats required',
      specialInstructions: 'Heavy dust and debris cleanup needed'
    },
    paymentInfo: {
      method: 'check',
      terms: 'net_15',
      creditLimit: 2000
    },
    stats: {
      totalJobs: 3,
      totalPaid: 1200,
      lastService: new Date(2025, 10, 15),
      joinDate: new Date(2025, 9, 1),
      averageRating: 3.8
    },
    notes: 'Lost to competitor on post-construction quote. Price sensitive.',
    tags: ['commercial', 'post-construction', 'price-sensitive']
  },
  { 
    id: '5', 
    firstName: 'Green Valley', 
    lastName: 'Hotel', 
    email: 'housekeeping@greenvalley.com', 
    phone: '(555) 567-8901',
    company: 'Green Valley Hotel',
    type: 'commercial',
    status: 'prospect',
    address: {
      street: '321 Hotel Boulevard', 
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94108',
      country: 'USA'
    },
    billingAddress: {
      street: '321 Hotel Boulevard',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94108',
      country: 'USA'
    },
    emergencyContact: {
      name: 'David Park - Housekeeping Manager', 
      phone: '(555) 567-8902',
      relationship: 'Housekeeping Manager'
    },
    servicePreferences: {
      preferredDays: ['monday', 'tuesday'],
      preferredTime: 'morning',
      accessInstructions: 'Report to front desk, ask for housekeeping manager',
      specialInstructions: 'Coordinate with hotel occupancy schedule'
    },
    paymentInfo: {
      method: 'invoice',
      terms: 'net_30',
      creditLimit: 10000
    },
    stats: {
      totalJobs: 0,
      totalPaid: 0,
      lastService: null,
      joinDate: new Date(2026, 0, 5),
      averageRating: null
    },
    notes: 'Potential high-value contract for monthly deep cleaning of 20 rooms.',
    tags: ['prospect', 'hospitality', 'high-potential']
  }
];

const mockStaff = [
  {
    id: '1',
    employeeId: 'EMP20240001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@buzzbright.com',
    phone: '555-0201',
    position: 'Senior Cleaner',
    department: 'cleaning',
    skills: ['regular_cleaning', 'deep_cleaning', 'window_cleaning', 'team_leadership'],
    status: 'active',
    employmentType: 'full_time',
    hourlyRate: 25,
    hireDate: new Date('2023-01-15'),
    workSchedule: {
      monday: { start: '08:00', end: '16:00', isWorkingDay: true },
      tuesday: { start: '08:00', end: '16:00', isWorkingDay: true },
      wednesday: { start: '08:00', end: '16:00', isWorkingDay: true },
      thursday: { start: '08:00', end: '16:00', isWorkingDay: true },
      friday: { start: '08:00', end: '16:00', isWorkingDay: true },
      saturday: { start: '09:00', end: '13:00', isWorkingDay: false },
      sunday: { start: '09:00', end: '13:00', isWorkingDay: false },
      maxHoursPerWeek: 40
    },
    performance: {
      totalJobsCompleted: 245,
      totalHoursWorked: 1890,
      averageRating: 4.8
    },
    emergencyContact: {
      name: 'Mike Johnson',
      relationship: 'Spouse',
      phone: '555-0301'
    }
  },
  {
    id: '2',
    employeeId: 'EMP20240002',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike@buzzbright.com',
    phone: '555-0202',
    position: 'Cleaner',
    department: 'cleaning',
    skills: ['regular_cleaning', 'carpet_cleaning', 'pressure_washing'],
    status: 'active',
    employmentType: 'full_time',
    hourlyRate: 22,
    hireDate: new Date('2023-03-20'),
    workSchedule: {
      monday: { start: '09:00', end: '17:00', isWorkingDay: true },
      tuesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      wednesday: { start: '09:00', end: '17:00', isWorkingDay: false },
      thursday: { start: '09:00', end: '17:00', isWorkingDay: true },
      friday: { start: '09:00', end: '17:00', isWorkingDay: true },
      saturday: { start: '08:00', end: '14:00', isWorkingDay: true },
      sunday: { start: '08:00', end: '14:00', isWorkingDay: false },
      maxHoursPerWeek: 40
    },
    performance: {
      totalJobsCompleted: 198,
      totalHoursWorked: 1456,
      averageRating: 4.6
    },
    emergencyContact: {
      name: 'Lisa Davis',
      relationship: 'Sister',
      phone: '555-0302'
    }
  },
  {
    id: '3',
    employeeId: 'EMP20240003',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'emily@buzzbright.com',
    phone: '555-0203',
    position: 'Cleaning Specialist',
    department: 'cleaning',
    skills: ['deep_cleaning', 'upholstery_cleaning', 'floor_maintenance'],
    status: 'active',
    employmentType: 'part_time',
    hourlyRate: 24,
    hireDate: new Date('2023-07-10'),
    workSchedule: {
      monday: { start: '10:00', end: '16:00', isWorkingDay: true },
      tuesday: { start: '10:00', end: '16:00', isWorkingDay: false },
      wednesday: { start: '10:00', end: '16:00', isWorkingDay: true },
      thursday: { start: '10:00', end: '16:00', isWorkingDay: false },
      friday: { start: '10:00', end: '16:00', isWorkingDay: true },
      saturday: { start: '09:00', end: '15:00', isWorkingDay: true },
      sunday: { start: '09:00', end: '15:00', isWorkingDay: false },
      maxHoursPerWeek: 24
    },
    performance: {
      totalJobsCompleted: 134,
      totalHoursWorked: 892,
      averageRating: 4.9
    },
    emergencyContact: {
      name: 'Robert Wilson',
      relationship: 'Father',
      phone: '555-0303'
    }
  },
  {
    id: '4',
    employeeId: 'EMP20240004',
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex@buzzbright.com',
    phone: '555-0204',
    position: 'Operations Manager',
    department: 'management',
    skills: ['team_leadership', 'regular_cleaning', 'deep_cleaning'],
    status: 'active',
    employmentType: 'full_time',
    hourlyRate: 35,
    hireDate: new Date('2022-11-01'),
    workSchedule: {
      monday: { start: '08:00', end: '17:00', isWorkingDay: true },
      tuesday: { start: '08:00', end: '17:00', isWorkingDay: true },
      wednesday: { start: '08:00', end: '17:00', isWorkingDay: true },
      thursday: { start: '08:00', end: '17:00', isWorkingDay: true },
      friday: { start: '08:00', end: '17:00', isWorkingDay: true },
      saturday: { start: '09:00', end: '13:00', isWorkingDay: false },
      sunday: { start: '09:00', end: '13:00', isWorkingDay: false },
      maxHoursPerWeek: 45
    },
    performance: {
      totalJobsCompleted: 89,
      totalHoursWorked: 2156,
      averageRating: 4.7
    },
    emergencyContact: {
      name: 'Maria Thompson',
      relationship: 'Spouse',
      phone: '555-0304'
    }
  },
  {
    id: '5',
    employeeId: 'EMP20240005',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica@buzzbright.com',
    phone: '555-0205',
    position: 'Customer Service Rep',
    department: 'customer_service',
    skills: ['team_leadership'],
    status: 'on_leave',
    employmentType: 'full_time',
    hourlyRate: 20,
    hireDate: new Date('2023-05-15'),
    workSchedule: {
      monday: { start: '09:00', end: '17:00', isWorkingDay: true },
      tuesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      wednesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      thursday: { start: '09:00', end: '17:00', isWorkingDay: true },
      friday: { start: '09:00', end: '17:00', isWorkingDay: true },
      saturday: { start: '09:00', end: '13:00', isWorkingDay: false },
      sunday: { start: '09:00', end: '13:00', isWorkingDay: false },
      maxHoursPerWeek: 40
    },
    performance: {
      totalJobsCompleted: 0,
      totalHoursWorked: 567,
      averageRating: 4.5
    },
    emergencyContact: {
      name: 'Carlos Martinez',
      relationship: 'Brother',
      phone: '555-0305'
    }
  }
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
    try {
      const response = await api.get('/clients', { params });
      return response.data;
    } catch (error) {
      // Fallback to mock data if API is not available
      console.warn('API not available, using mock data:', error.message);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let filteredClients = [...mockClients];
      
      // Apply filters
      if (params.status) {
        filteredClients = filteredClients.filter(client => client.status === params.status);
      }
      if (params.type) {
        filteredClients = filteredClients.filter(client => client.type === params.type);
      }
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredClients = filteredClients.filter(client => 
          client.firstName.toLowerCase().includes(searchTerm) ||
          client.lastName.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.phone.includes(searchTerm) ||
          (client.company && client.company.toLowerCase().includes(searchTerm))
        );
      }
      
      return {
        clients: filteredClients,
        pagination: {
          page: 1,
          limit: filteredClients.length,
          total: filteredClients.length,
          pages: 1
        }
      };
    }
  },

  getClientById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error.message);
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockClients.find(client => client.id === id) || mockClients[0];
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock response:', error.message);
      await new Promise(resolve => setTimeout(resolve, 600));
      return { 
        message: 'Client created successfully', 
        client: { id: Date.now().toString(), ...clientData } 
      };
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock response:', error.message);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { 
        message: 'Client updated successfully', 
        client: { id, ...clientData } 
      };
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock response:', error.message);
      await new Promise(resolve => setTimeout(resolve, 300));
      return { message: 'Client deleted successfully' };
    }
  },

  getClientStats: async () => {
    try {
      const response = await api.get('/clients/stats');
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data:', error.message);
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        totalClients: mockClients.length,
        activeClients: mockClients.filter(c => c.status === 'active').length,
        prospectClients: mockClients.filter(c => c.status === 'prospect').length,
        inactiveClients: mockClients.filter(c => c.status === 'inactive').length,
        residentialClients: mockClients.filter(c => c.type === 'residential').length,
        commercialClients: mockClients.filter(c => c.type === 'commercial').length,
        totalRevenue: mockClients.reduce((sum, c) => sum + (c.stats?.totalPaid || 0), 0),
        averageRating: mockClients.reduce((sum, c) => sum + (c.stats?.rating || 0), 0) / mockClients.length
      };
    }
  },

  updateClientStatus: async (id, status) => {
    try {
      const response = await api.patch(`/clients/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock response:', error.message);
      await new Promise(resolve => setTimeout(resolve, 300));
      return { message: 'Client status updated successfully' };
    }
  }
};

export const staffService = {
  getStaff: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      staff: mockStaff,
      totalPages: 1,
      currentPage: 1,
      totalStaff: mockStaff.length
    };
  },

  getStaffById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStaff.find(staff => staff.id === id) || mockStaff[0];
  },

  createStaff: async (staffData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { message: 'Staff member created successfully' };
  },

  updateStaff: async (id, staffData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Staff member updated successfully' };
  },

  deleteStaff: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { message: 'Staff member deleted successfully' };
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
  // Mock timesheet data
  mockTimesheets: [
    {
      id: '1',
      staffId: '1',
      staffName: 'Sarah Miller',
      staffTitle: 'Lead Cleaner',
      date: new Date().toISOString().split('T')[0],
      jobId: '1',
      jobTitle: 'Downtown Office Complex - Weekly Clean',
      clientName: 'Corporate Solutions LLC',
      clockIn: new Date(new Date().setHours(8, 0, 0, 0)),
      clockOut: new Date(new Date().setHours(16, 30, 0, 0)),
      clockInMethod: 'mobile',
      clockInLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      },
      breaks: [
        {
          id: 1,
          type: 'break',
          startTime: new Date(new Date().setHours(10, 0, 0, 0)),
          endTime: new Date(new Date().setHours(10, 15, 0, 0)),
          duration: 15
        },
        {
          id: 2,
          type: 'lunch',
          startTime: new Date(new Date().setHours(12, 0, 0, 0)),
          endTime: new Date(new Date().setHours(13, 0, 0, 0)),
          duration: 60
        }
      ],
      totalHours: 7.25,
      overtimeHours: 0,
      status: 'approved',
      mileage: 12.5,
      expenses: [
        {
          id: 1,
          type: 'materials',
          amount: 25.99,
          description: 'Cleaning supplies for restrooms',
          receipt: true
        }
      ],
      notes: 'Completed thorough cleaning of all floors. Restocked supplies in break rooms.',
      photos: [
        {
          url: 'https://via.placeholder.com/300x200?text=Before+Photo',
          description: 'Office before cleaning',
          timestamp: new Date()
        },
        {
          url: 'https://via.placeholder.com/300x200?text=After+Photo',
          description: 'Office after cleaning',
          timestamp: new Date()
        }
      ],
      approvedBy: 'John Smith',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      editHistory: [
        {
          timestamp: new Date(),
          editedBy: 'Sarah Miller',
          action: 'Timesheet created',
          changes: 'Initial timesheet entry'
        },
        {
          timestamp: new Date(new Date().getTime() + 3600000),
          editedBy: 'John Smith',
          action: 'Timesheet approved',
          changes: 'Approved after review'
        }
      ]
    },
    {
      id: '2',
      staffId: '2',
      staffName: 'Mike Roberts',
      staffTitle: 'Cleaner',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      jobId: '3',
      jobTitle: 'Residential Deep Clean',
      clientName: 'Johnson Family',
      clockIn: new Date(new Date(Date.now() - 86400000).setHours(9, 0, 0, 0)),
      clockOut: new Date(new Date(Date.now() - 86400000).setHours(17, 0, 0, 0)),
      clockInMethod: 'web',
      breaks: [
        {
          id: 1,
          type: 'lunch',
          startTime: new Date(new Date(Date.now() - 86400000).setHours(12, 30, 0, 0)),
          endTime: new Date(new Date(Date.now() - 86400000).setHours(13, 30, 0, 0)),
          duration: 60
        }
      ],
      totalHours: 7,
      overtimeHours: 0,
      status: 'pending',
      mileage: 8.2,
      expenses: [],
      notes: 'Deep cleaned all rooms, special attention to bathrooms and kitchen.',
      photos: [],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      editHistory: [
        {
          timestamp: new Date(Date.now() - 86400000),
          editedBy: 'Mike Roberts',
          action: 'Timesheet created',
          changes: 'Initial timesheet entry'
        }
      ]
    },
    {
      id: '3',
      staffId: '3',
      staffName: 'Emily Chen',
      staffTitle: 'Window Specialist',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      jobId: '2',
      jobTitle: 'High-rise Window Cleaning',
      clientName: 'Metro Bank',
      clockIn: new Date(new Date(Date.now() - 172800000).setHours(7, 0, 0, 0)),
      clockOut: new Date(new Date(Date.now() - 172800000).setHours(18, 0, 0, 0)),
      clockInMethod: 'mobile',
      clockInLocation: {
        latitude: 40.7589,
        longitude: -73.9851,
        accuracy: 5
      },
      breaks: [
        {
          id: 1,
          type: 'break',
          startTime: new Date(new Date(Date.now() - 172800000).setHours(10, 0, 0, 0)),
          endTime: new Date(new Date(Date.now() - 172800000).setHours(10, 15, 0, 0)),
          duration: 15
        },
        {
          id: 2,
          type: 'lunch',
          startTime: new Date(new Date(Date.now() - 172800000).setHours(12, 0, 0, 0)),
          endTime: new Date(new Date(Date.now() - 172800000).setHours(13, 0, 0, 0)),
          duration: 60
        },
        {
          id: 3,
          type: 'break',
          startTime: new Date(new Date(Date.now() - 172800000).setHours(15, 0, 0, 0)),
          endTime: new Date(new Date(Date.now() - 172800000).setHours(15, 15, 0, 0)),
          duration: 15
        }
      ],
      totalHours: 9.5,
      overtimeHours: 1.5,
      status: 'needs_review',
      mileage: 15.7,
      expenses: [
        {
          id: 1,
          type: 'tools',
          amount: 89.99,
          description: 'Replacement squeegee blades',
          receipt: true
        },
        {
          id: 2,
          type: 'parking',
          amount: 15.00,
          description: 'Downtown parking',
          receipt: false
        }
      ],
      notes: 'Completed exterior window cleaning on all 20 floors. Weather conditions were challenging due to wind.',
      photos: [
        {
          url: 'https://via.placeholder.com/300x200?text=Equipment+Setup',
          description: 'Safety equipment setup',
          timestamp: new Date(Date.now() - 172800000)
        }
      ],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 86400000),
      editHistory: [
        {
          timestamp: new Date(Date.now() - 172800000),
          editedBy: 'Emily Chen',
          action: 'Timesheet created',
          changes: 'Initial timesheet entry'
        },
        {
          timestamp: new Date(Date.now() - 86400000),
          editedBy: 'Emily Chen',
          action: 'Added expenses',
          changes: 'Added tool replacement and parking costs'
        }
      ]
    },
    {
      id: '4',
      staffId: '4',
      staffName: 'David Kumar',
      staffTitle: 'Carpet Specialist',
      date: new Date().toISOString().split('T')[0],
      jobId: '4',
      jobTitle: 'Carpet Steam Cleaning',
      clientName: 'Green Valley Hotel',
      clockIn: new Date(new Date().setHours(8, 30, 0, 0)),
      clockOut: null, // Still working
      clockInMethod: 'mobile',
      clockInLocation: {
        latitude: 40.7505,
        longitude: -73.9934,
        accuracy: 8
      },
      breaks: [],
      totalHours: 0, // Will be calculated when clocked out
      overtimeHours: 0,
      status: 'pending',
      mileage: 0,
      expenses: [],
      notes: 'Starting carpet steam cleaning in hotel lobby and conference rooms.',
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      editHistory: [
        {
          timestamp: new Date(),
          editedBy: 'David Kumar',
          action: 'Timesheet created',
          changes: 'Clocked in for carpet cleaning job'
        }
      ]
    },
    {
      id: '5',
      staffId: '1',
      staffName: 'Sarah Miller',
      staffTitle: 'Lead Cleaner',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
      jobId: '5',
      jobTitle: 'Medical Office Sanitization',
      clientName: 'Downtown Medical Center',
      clockIn: new Date(new Date(Date.now() - 259200000).setHours(6, 0, 0, 0)),
      clockOut: new Date(new Date(Date.now() - 259200000).setHours(14, 30, 0, 0)),
      clockInMethod: 'mobile',
      breaks: [
        {
          id: 1,
          type: 'break',
          startTime: new Date(new Date(Date.now() - 259200000).setHours(9, 0, 0, 0)),
          endTime: new Date(new Date(Date.now() - 259200000).setHours(9, 15, 0, 0)),
          duration: 15
        }
      ],
      totalHours: 8.25,
      overtimeHours: 0.25,
      status: 'rejected',
      rejectionReason: 'Please verify overtime hours and provide manager approval for medical facility overtime.',
      mileage: 22.1,
      expenses: [
        {
          id: 1,
          type: 'materials',
          amount: 45.99,
          description: 'Medical-grade disinfectant',
          receipt: true
        }
      ],
      notes: 'Completed full sanitization protocol for medical facility. Used approved disinfectants.',
      photos: [],
      rejectedBy: 'John Smith',
      rejectedAt: new Date(Date.now() - 172800000),
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 172800000),
      editHistory: [
        {
          timestamp: new Date(Date.now() - 259200000),
          editedBy: 'Sarah Miller',
          action: 'Timesheet created',
          changes: 'Initial timesheet entry'
        },
        {
          timestamp: new Date(Date.now() - 172800000),
          editedBy: 'John Smith',
          action: 'Timesheet rejected',
          changes: 'Rejected due to overtime verification required'
        }
      ]
    }
  ],

  getTimesheets: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filteredTimesheets = [...timesheetService.mockTimesheets];
    
    // Filter by status
    if (params.status && params.status !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(t => t.status === params.status);
    }
    
    // Filter by date range
    if (params.dateRange) {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      
      switch (params.dateRange) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          filteredTimesheets = filteredTimesheets.filter(t => t.date === today);
          break;
        case 'this_week':
          filteredTimesheets = filteredTimesheets.filter(t => {
            const timesheetDate = new Date(t.date);
            return timesheetDate >= startOfWeek && timesheetDate <= endOfWeek;
          });
          break;
        // Add other date ranges as needed
      }
    }
    
    return {
      timesheets: filteredTimesheets,
      total: filteredTimesheets.length
    };
  },

  getTimesheet: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const timesheet = timesheetService.mockTimesheets.find(t => t.id === id);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }
    return timesheet;
  },

  createTimesheet: async (timesheetData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTimesheet = {
      id: Date.now().toString(),
      ...timesheetData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
      editHistory: [{
        timestamp: new Date(),
        editedBy: timesheetData.staffName || 'Current User',
        action: 'Timesheet created',
        changes: 'Initial timesheet entry'
      }]
    };
    
    timesheetService.mockTimesheets.unshift(newTimesheet);
    return { message: 'Timesheet created successfully', timesheet: newTimesheet };
  },

  updateTimesheet: async (id, timesheetData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const index = timesheetService.mockTimesheets.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Timesheet not found');
    }
    
    const updatedTimesheet = {
      ...timesheetService.mockTimesheets[index],
      ...timesheetData,
      updatedAt: new Date(),
      editHistory: [
        ...timesheetService.mockTimesheets[index].editHistory,
        {
          timestamp: new Date(),
          editedBy: timesheetData.staffName || 'Current User',
          action: 'Timesheet updated',
          changes: 'Timesheet details modified'
        }
      ]
    };
    
    timesheetService.mockTimesheets[index] = updatedTimesheet;
    return { message: 'Timesheet updated successfully', timesheet: updatedTimesheet };
  },

  deleteTimesheet: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = timesheetService.mockTimesheets.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Timesheet not found');
    }
    
    timesheetService.mockTimesheets.splice(index, 1);
    return { message: 'Timesheet deleted successfully' };
  },

  clockIn: async (staffId, clockData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTimesheet = {
      id: Date.now().toString(),
      staffId: staffId,
      staffName: 'Current User',
      date: new Date().toISOString().split('T')[0],
      clockIn: clockData.time,
      clockInMethod: clockData.method || 'web',
      clockInLocation: clockData.location,
      clockOut: null,
      breaks: [],
      totalHours: 0,
      overtimeHours: 0,
      status: 'pending',
      mileage: 0,
      expenses: [],
      notes: '',
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      editHistory: [{
        timestamp: new Date(),
        editedBy: 'Current User',
        action: 'Clocked in',
        changes: 'Started work session'
      }]
    };
    
    timesheetService.mockTimesheets.unshift(newTimesheet);
    return { message: 'Clocked in successfully', timesheet: newTimesheet };
  },

  clockOut: async (staffId, clockData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the most recent timesheet for this staff member without a clock out
    const timesheetIndex = timesheetService.mockTimesheets.findIndex(
      t => t.staffId === staffId && !t.clockOut
    );
    
    if (timesheetIndex === -1) {
      throw new Error('No active timesheet found to clock out');
    }
    
    const timesheet = timesheetService.mockTimesheets[timesheetIndex];
    const clockInTime = new Date(timesheet.clockIn);
    const clockOutTime = clockData.time;
    
    // Calculate total hours
    const totalMinutes = (clockOutTime - clockInTime) / (1000 * 60);
    const breakMinutes = timesheet.breaks.reduce((total, break_) => total + (break_.duration || 0), 0);
    const totalHours = Math.max(0, (totalMinutes - breakMinutes) / 60);
    const overtimeHours = Math.max(0, totalHours - 8);
    
    const updatedTimesheet = {
      ...timesheet,
      clockOut: clockOutTime,
      totalHours,
      overtimeHours,
      updatedAt: new Date(),
      editHistory: [
        ...timesheet.editHistory,
        {
          timestamp: new Date(),
          editedBy: 'Current User',
          action: 'Clocked out',
          changes: `Completed work session - ${totalHours.toFixed(2)} hours`
        }
      ]
    };
    
    timesheetService.mockTimesheets[timesheetIndex] = updatedTimesheet;
    return { message: 'Clocked out successfully', timesheet: updatedTimesheet };
  },

  approveTimesheet: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = timesheetService.mockTimesheets.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Timesheet not found');
    }
    
    const timesheet = timesheetService.mockTimesheets[index];
    const approvedTimesheet = {
      ...timesheet,
      status: 'approved',
      approvedBy: 'Current Manager',
      approvedAt: new Date(),
      updatedAt: new Date(),
      editHistory: [
        ...timesheet.editHistory,
        {
          timestamp: new Date(),
          editedBy: 'Current Manager',
          action: 'Timesheet approved',
          changes: 'Approved by manager'
        }
      ]
    };
    
    timesheetService.mockTimesheets[index] = approvedTimesheet;
    return { message: 'Timesheet approved successfully', timesheet: approvedTimesheet };
  },

  rejectTimesheet: async (id, reason) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = timesheetService.mockTimesheets.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Timesheet not found');
    }
    
    const timesheet = timesheetService.mockTimesheets[index];
    const rejectedTimesheet = {
      ...timesheet,
      status: 'rejected',
      rejectionReason: reason,
      rejectedBy: 'Current Manager',
      rejectedAt: new Date(),
      updatedAt: new Date(),
      editHistory: [
        ...timesheet.editHistory,
        {
          timestamp: new Date(),
          editedBy: 'Current Manager',
          action: 'Timesheet rejected',
          changes: `Rejected: ${reason}`
        }
      ]
    };
    
    timesheetService.mockTimesheets[index] = rejectedTimesheet;
    return { message: 'Timesheet rejected successfully', timesheet: rejectedTimesheet };
  }
};

export const quoteService = {
  // Mock quote data
  mockQuotes: [
    {
      id: '1',
      quoteNumber: 'QUO20260111-001',
      clientId: '1',
      clientName: 'Wilson Family',
      clientPhone: '(555) 123-4567',
      title: 'Weekly House Cleaning Service',
      description: 'Regular weekly cleaning for 3-bedroom, 2-bathroom house including kitchen, living areas, and bedrooms.',
      type: 'regular_cleaning',
      status: 'sent',
      priority: 'medium',
      property: {
        address: {
          street: '123 Oak Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        },
        propertyType: 'residential',
        squareFootage: 1800,
        bedrooms: 3,
        bathrooms: 2,
        floors: 2,
        accessInstructions: 'Key under front door mat',
        specialConditions: 'Two cats, please be careful with breakable items on coffee table'
      },
      services: [
        {
          name: 'General House Cleaning',
          description: 'Dusting, vacuuming, mopping, bathroom and kitchen cleaning',
          category: 'cleaning',
          quantity: 1,
          unitPrice: 120,
          totalPrice: 120,
          frequency: 'weekly',
          estimatedDuration: 180,
          notes: 'Focus on high-traffic areas'
        },
        {
          name: 'Window Cleaning (Interior)',
          description: 'Clean all interior windows and mirrors',
          category: 'cleaning',
          quantity: 1,
          unitPrice: 30,
          totalPrice: 30,
          frequency: 'weekly',
          estimatedDuration: 30,
          notes: 'Use streak-free cleaner'
        }
      ],
      pricing: {
        subtotal: 150,
        discount: { amount: 0, percentage: 0, reason: '' },
        total: 150
      },
      schedule: {
        preferredStartDate: new Date(2026, 0, 20),
        estimatedDuration: 3.5,
        frequency: 'weekly',
        preferredDays: ['friday'],
        preferredTime: 'morning'
      },
      terms: {
        validUntil: new Date(2026, 1, 10),
        paymentTerms: 'upon_completion',
        cancellationPolicy: '24-hour notice required for cancellations',
        specialTerms: 'First cleaning may take longer for deep cleaning setup'
      },
      communication: {
        sentDate: new Date(2026, 0, 11),
        sentBy: 'manager1',
        sentMethod: 'email',
        viewedDate: new Date(2026, 0, 11),
        responses: [
          {
            date: new Date(2026, 0, 11),
            message: 'This looks good, when can we start?',
            respondedBy: 'sarah.wilson@email.com',
            type: 'question'
          }
        ]
      },
      createdBy: 'manager1',
      createdAt: new Date(2026, 0, 10),
      updatedAt: new Date(2026, 0, 11),
      notes: 'Client is very particular about eco-friendly products',
      internalNotes: 'Good client, pays on time, tip generously during holidays'
    },
    {
      id: '2',
      quoteNumber: 'QUO20260111-002',
      clientId: '2',
      clientName: 'Metro Business Center',
      clientPhone: '(555) 234-5678',
      title: 'Office Deep Cleaning Service',
      description: 'Comprehensive deep cleaning for 5,000 sq ft office space including workstations, conference rooms, and common areas.',
      type: 'deep_cleaning',
      status: 'accepted',
      priority: 'high',
      property: {
        address: {
          street: '456 Business Ave, Suite 200',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        },
        propertyType: 'office',
        squareFootage: 5000,
        floors: 1,
        accessInstructions: 'Check in with building security, ask for Jane Smith',
        specialConditions: 'Work must be completed outside business hours (after 6 PM or weekends)'
      },
      services: [
        {
          name: 'Office Deep Cleaning',
          description: 'Comprehensive cleaning including carpet shampooing, window cleaning, and sanitization',
          category: 'cleaning',
          quantity: 1,
          unitPrice: 800,
          totalPrice: 800,
          frequency: 'one-time',
          estimatedDuration: 480,
          notes: 'Include high dusting and light fixture cleaning'
        },
        {
          name: 'Carpet Steam Cleaning',
          description: 'Professional carpet cleaning for entire office area',
          category: 'cleaning',
          quantity: 5000,
          unitPrice: 0.15,
          totalPrice: 750,
          frequency: 'one-time',
          estimatedDuration: 240,
          notes: 'Allow 24 hours drying time'
        },
        {
          name: 'Supply Restocking',
          description: 'Restock all bathroom and kitchen supplies',
          category: 'supplies',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150,
          frequency: 'one-time',
          estimatedDuration: 30,
          notes: 'Client will provide supply list'
        }
      ],
      pricing: {
        subtotal: 1700,
        discount: { amount: 170, percentage: 10, reason: 'New client discount' },
        total: 1530
      },
      schedule: {
        preferredStartDate: new Date(2026, 0, 18),
        estimatedDuration: 12,
        frequency: 'one-time',
        preferredDays: ['saturday'],
        preferredTime: 'morning'
      },
      terms: {
        validUntil: new Date(2026, 1, 25),
        paymentTerms: 'net_30',
        cancellationPolicy: '48-hour notice required',
        specialTerms: 'Certificate of insurance required before work begins'
      },
      communication: {
        sentDate: new Date(2026, 0, 9),
        sentBy: 'manager1',
        sentMethod: 'email',
        viewedDate: new Date(2026, 0, 9),
        responses: [
          {
            date: new Date(2026, 0, 10),
            message: 'Quote accepted, please proceed with scheduling',
            respondedBy: 'facilities@metrobusiness.com',
            type: 'acceptance'
          }
        ]
      },
      createdBy: 'manager1',
      approvedBy: 'manager1',
      approvedAt: new Date(2026, 0, 10),
      createdAt: new Date(2026, 0, 8),
      updatedAt: new Date(2026, 0, 10),
      notes: 'Large commercial client, potential for ongoing contract',
      internalNotes: 'Schedule David for carpet cleaning, Sarah for general cleaning'
    },
    {
      id: '3',
      quoteNumber: 'QUO20260111-003',
      clientId: '3',
      clientName: 'Johnson Family',
      clientPhone: '(555) 345-6789',
      title: 'Move-Out Cleaning Service',
      description: 'Complete move-out cleaning for rental property to ensure deposit return.',
      type: 'move_out',
      status: 'viewed',
      priority: 'medium',
      property: {
        address: {
          street: '789 Pine Street, Apt 4B',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94607'
        },
        propertyType: 'residential',
        squareFootage: 1200,
        bedrooms: 2,
        bathrooms: 1,
        floors: 1,
        accessInstructions: 'Property manager has keys, call 30 minutes before arrival',
        specialConditions: 'Pet odors need special attention, some wall scuff marks to address'
      },
      services: [
        {
          name: 'Move-Out Deep Clean',
          description: 'Comprehensive cleaning including appliances, inside cabinets, baseboards, and detailed bathroom cleaning',
          category: 'cleaning',
          quantity: 1,
          unitPrice: 250,
          totalPrice: 250,
          frequency: 'one-time',
          estimatedDuration: 360,
          notes: 'Must meet landlord inspection standards'
        },
        {
          name: 'Carpet Deodorizing',
          description: 'Pet odor treatment and carpet deodorizing',
          category: 'cleaning',
          quantity: 1,
          unitPrice: 75,
          totalPrice: 75,
          frequency: 'one-time',
          estimatedDuration: 60,
          notes: 'Use pet-safe odor elimination products'
        }
      ],
      pricing: {
        subtotal: 325,
        discount: { amount: 0, percentage: 0, reason: '' },
        total: 325
      },
      schedule: {
        preferredStartDate: new Date(2026, 0, 15),
        estimatedDuration: 7,
        frequency: 'one-time',
        preferredDays: ['tuesday', 'wednesday'],
        preferredTime: 'morning'
      },
      terms: {
        validUntil: new Date(2026, 0, 20),
        paymentTerms: 'immediate',
        cancellationPolicy: '24-hour notice required',
        specialTerms: 'Guarantee: Will re-clean any areas that don\'t pass landlord inspection at no charge'
      },
      communication: {
        sentDate: new Date(2026, 0, 11),
        sentBy: 'manager1',
        sentMethod: 'email',
        viewedDate: new Date(2026, 0, 11),
        responses: []
      },
      createdBy: 'manager1',
      createdAt: new Date(2026, 0, 11),
      updatedAt: new Date(2026, 0, 11),
      notes: 'Time-sensitive, tenant moves out Jan 16th',
      internalNotes: 'May need extra time for odor treatment'
    },
    {
      id: '4',
      quoteNumber: 'QUO20260111-004',
      clientId: '4',
      clientName: 'Green Valley Hotel',
      clientPhone: '(555) 456-7890',
      title: 'Hotel Room Deep Cleaning',
      description: 'Deep cleaning service for 20 hotel rooms including carpet cleaning and sanitization.',
      type: 'deep_cleaning',
      status: 'draft',
      priority: 'low',
      property: {
        address: {
          street: '321 Hotel Boulevard',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94108'
        },
        propertyType: 'commercial',
        squareFootage: 8000,
        floors: 2,
        accessInstructions: 'Report to front desk, ask for housekeeping manager',
        specialConditions: 'Work must be coordinated with hotel occupancy schedule'
      },
      services: [
        {
          name: 'Hotel Room Deep Clean',
          description: 'Deep cleaning of hotel rooms including bathroom sanitization and carpet cleaning',
          category: 'cleaning',
          quantity: 20,
          unitPrice: 45,
          totalPrice: 900,
          frequency: 'one-time',
          estimatedDuration: 600,
          notes: 'Include mattress sanitization'
        }
      ],
      pricing: {
        subtotal: 900,
        discount: { amount: 90, percentage: 10, reason: 'Volume discount' },
        total: 810
      },
      schedule: {
        preferredStartDate: new Date(2026, 0, 25),
        estimatedDuration: 10,
        frequency: 'one-time',
        preferredDays: ['monday', 'tuesday'],
        preferredTime: 'morning'
      },
      terms: {
        validUntil: new Date(2026, 1, 11),
        paymentTerms: 'net_15',
        cancellationPolicy: '72-hour notice required',
        specialTerms: 'Work schedule subject to hotel occupancy rates'
      },
      createdBy: 'manager1',
      createdAt: new Date(2026, 0, 11),
      updatedAt: new Date(2026, 0, 11),
      notes: 'Potential for ongoing monthly deep cleaning contract',
      internalNotes: 'Still finalizing service details with client'
    },
    {
      id: '5',
      quoteNumber: 'QUO20260111-005',
      clientId: '5',
      clientName: 'Tech Startup Inc',
      clientPhone: '(555) 567-8901',
      title: 'Post-Construction Cleanup',
      description: 'Complete post-construction cleaning for newly renovated office space.',
      type: 'post_construction',
      status: 'rejected',
      priority: 'medium',
      property: {
        address: {
          street: '555 Innovation Drive',
          city: 'Palo Alto',
          state: 'CA',
          zipCode: '94301'
        },
        propertyType: 'office',
        squareFootage: 3500,
        floors: 1,
        accessInstructions: 'Construction site - hard hats required',
        specialConditions: 'Heavy dust and debris, construction materials may still be present'
      },
      services: [
        {
          name: 'Post-Construction Deep Clean',
          description: 'Removal of construction dust, debris cleanup, and detailed cleaning of all surfaces',
          category: 'cleaning',
          quantity: 1,
          unitPrice: 1200,
          totalPrice: 1200,
          frequency: 'one-time',
          estimatedDuration: 720,
          notes: 'Include HVAC vent cleaning and window washing'
        },
        {
          name: 'Floor Treatment',
          description: 'Deep cleaning and protective treatment for new flooring',
          category: 'cleaning',
          quantity: 3500,
          unitPrice: 0.25,
          totalPrice: 875,
          frequency: 'one-time',
          estimatedDuration: 240,
          notes: 'Wait for floor sealant to cure before cleaning'
        }
      ],
      pricing: {
        subtotal: 2075,
        discount: { amount: 0, percentage: 0, reason: '' },
        total: 2075
      },
      schedule: {
        preferredStartDate: new Date(2026, 0, 30),
        estimatedDuration: 16,
        frequency: 'one-time',
        preferredDays: ['saturday', 'sunday'],
        preferredTime: 'flexible'
      },
      terms: {
        validUntil: new Date(2026, 0, 25),
        paymentTerms: 'net_30',
        cancellationPolicy: '48-hour notice required',
        specialTerms: 'Price subject to site inspection, may require additional charges for excessive debris'
      },
      communication: {
        sentDate: new Date(2026, 0, 8),
        sentBy: 'manager1',
        sentMethod: 'email',
        viewedDate: new Date(2026, 0, 9),
        responses: [
          {
            date: new Date(2026, 0, 10),
            message: 'Thank you for the quote. We\'ve decided to go with another vendor who was significantly lower.',
            respondedBy: 'admin@techstartup.com',
            type: 'rejection'
          }
        ]
      },
      createdBy: 'manager1',
      createdAt: new Date(2026, 0, 8),
      updatedAt: new Date(2026, 0, 10),
      notes: 'Competitive bid situation',
      internalNotes: 'Lost to competitor - review pricing strategy for post-construction jobs'
    }
  ],

  getQuotes: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filteredQuotes = [...quoteService.mockQuotes];
    
    // Filter by status
    if (params.status && params.status !== 'all') {
      filteredQuotes = filteredQuotes.filter(q => q.status === params.status);
    }
    
    // Filter by type
    if (params.type && params.type !== 'all') {
      filteredQuotes = filteredQuotes.filter(q => q.type === params.type);
    }
    
    return {
      quotes: filteredQuotes,
      total: filteredQuotes.length
    };
  },

  getQuote: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const quote = quoteService.mockQuotes.find(q => q.id === id);
    if (!quote) {
      throw new Error('Quote not found');
    }
    return quote;
  },

  getQuoteById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const quote = quoteService.mockQuotes.find(q => q.id === id);
    if (!quote) {
      throw new Error('Quote not found');
    }
    return quote;
  },

  createQuote: async (quoteData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newQuote = {
      id: Date.now().toString(),
      quoteNumber: `QUO${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(quoteService.mockQuotes.length + 1).padStart(3, '0')}`,
      ...quoteData,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    quoteService.mockQuotes.unshift(newQuote);
    return { message: 'Quote created successfully', quote: newQuote };
  },

  updateQuote: async (id, quoteData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const index = quoteService.mockQuotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    const updatedQuote = {
      ...quoteService.mockQuotes[index],
      ...quoteData,
      updatedAt: new Date()
    };
    
    quoteService.mockQuotes[index] = updatedQuote;
    return { message: 'Quote updated successfully', quote: updatedQuote };
  },

  deleteQuote: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = quoteService.mockQuotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    quoteService.mockQuotes.splice(index, 1);
    return { message: 'Quote deleted successfully' };
  },

  sendQuote: async (id, sendData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = quoteService.mockQuotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    quoteService.mockQuotes[index] = {
      ...quoteService.mockQuotes[index],
      status: 'sent',
      communication: {
        ...quoteService.mockQuotes[index].communication,
        sentDate: new Date(),
        sentMethod: 'email'
      },
      updatedAt: new Date()
    };
    
    return { message: 'Quote sent successfully' };
  },

  acceptQuote: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = quoteService.mockQuotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    quoteService.mockQuotes[index] = {
      ...quoteService.mockQuotes[index],
      status: 'accepted',
      updatedAt: new Date()
    };
    
    return { message: 'Quote accepted successfully' };
  },

  rejectQuote: async (id, reason) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = quoteService.mockQuotes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Quote not found');
    }
    
    quoteService.mockQuotes[index] = {
      ...quoteService.mockQuotes[index],
      status: 'rejected',
      communication: {
        ...quoteService.mockQuotes[index].communication,
        responses: [
          ...(quoteService.mockQuotes[index].communication?.responses || []),
          {
            date: new Date(),
            message: reason,
            respondedBy: 'System',
            type: 'rejection'
          }
        ]
      },
      updatedAt: new Date()
    };
    
    return { message: 'Quote rejected successfully' };
  },

  duplicateQuote: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const originalQuote = quoteService.mockQuotes.find(q => q.id === id);
    if (!originalQuote) {
      throw new Error('Quote not found');
    }
    
    const duplicatedQuote = {
      ...originalQuote,
      id: Date.now().toString(),
      quoteNumber: `QUO${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(quoteService.mockQuotes.length + 1).padStart(3, '0')}`,
      title: `${originalQuote.title} (Copy)`,
      status: 'draft',
      communication: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    quoteService.mockQuotes.unshift(duplicatedQuote);
    return { message: 'Quote duplicated successfully', quote: duplicatedQuote };
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