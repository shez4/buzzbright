# BuzzBright - Cleaning Company Management System

A comprehensive web application for managing cleaning company operations, built with Node.js/Express backend and React frontend.

## Features

### 🏢 Core Management
- **Job Scheduling & Management** - Create, assign, and track cleaning jobs
- **Staff Assignment & Availability** - Manage staff schedules and availability
- **Timesheet Logging & Approvals** - Track work hours with approval workflow
- **Quote Creation & Tracking** - Generate and manage customer quotes
- **Client/Contact Management** - Comprehensive customer relationship management
- **Inventory Tracking** - Monitor supplies and equipment
- **Notifications & Reminders** - Automated notifications system

### 👥 User Roles
- **Admin** - Full system access and management
- **Manager** - Operational management and oversight
- **Staff** - Job execution and time tracking

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

### Frontend
- **React 18** with functional components
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Formik** with **Yup** for form handling
- **React Toastify** for notifications
- **Recharts** for data visualization
- **React Big Calendar** for scheduling

## Project Structure

```
buzzbright/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/buzzbright.git
   cd buzzbright
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   # Start development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buzzbright
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Database Models

### Core Entities
- **Users** - System users with role-based access
- **Staff** - Employee information and schedules
- **Clients** - Customer information and preferences
- **Jobs** - Cleaning jobs with assignments and tracking
- **Quotes** - Price estimates and proposals
- **Timesheets** - Work time tracking with approvals
- **Inventory** - Supplies and equipment management
- **Notifications** - System notifications and preferences

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Jobs Management
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/status` - Update job status

### Staff Management
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff member
- `GET /api/staff/:id/availability` - Get availability
- `POST /api/staff/:id/availability` - Set availability

### Additional Endpoints
- Timesheets: `/api/timesheets`
- Quotes: `/api/quotes`
- Clients: `/api/clients`
- Inventory: `/api/inventory`
- Notifications: `/api/notifications`

## Features in Development

- [ ] Advanced job scheduling with calendar view
- [ ] Mobile app for staff time tracking
- [ ] GPS-based clock in/out verification
- [ ] Automated quote generation
- [ ] Client portal for service requests
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting software
- [ ] Multi-language support

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement in production
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, email support@buzzbright.com or create an issue in the GitHub repository.

## Roadmap

### Phase 1 (Current)
- ✅ Basic project structure
- ✅ User authentication system
- ✅ Database schema design
- ✅ Core API endpoints
- ✅ React frontend setup
- ✅ Dashboard and navigation

### Phase 2 (Next)
- [ ] Complete job management system
- [ ] Staff availability tracking
- [ ] Timesheet approval workflow
- [ ] Quote generation system
- [ ] Client management features

### Phase 3 (Future)
- [ ] Mobile application
- [ ] Advanced reporting
- [ ] Third-party integrations
- [ ] Multi-tenant support
- [ ] Advanced scheduling algorithms