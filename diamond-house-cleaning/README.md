# Diamond House Cleaning Services - Full-Stack Web Platform

A comprehensive house cleaning service platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features online booking, payment processing, admin management, and a responsive user interface.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with role-based access control
- **Service Management**: Dynamic service catalog with pricing and add-ons
- **Online Booking**: Multi-step booking wizard with real-time availability
- **Payment Integration**: Secure Razorpay payment gateway integration
- **Admin Dashboard**: Comprehensive admin panel for business management
- **Review System**: Customer reviews and ratings for services
- **Notification System**: Email and SMS notifications for bookings

### Technical Features
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **SEO Optimized**: Meta tags, structured data, and performance optimizations
- **Security**: Input validation, rate limiting, CORS, and secure headers
- **Scalable Architecture**: Modular codebase with clean separation of concerns
- **Docker Support**: Containerized deployment with docker-compose
- **Testing Setup**: Jest and React Testing Library configuration

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Redux Toolkit** - State management with async thunks
- **React Router** - Client-side routing
- **CSS3** - Custom design system with CSS variables
- **Axios** - HTTP client for API calls
- **React Toastify** - Notification system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework with middleware
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Bcrypt** - Password hashing
- **Razorpay** - Payment gateway integration
- **Winston** - Logging system

### DevOps & Tools
- **Docker** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
diamond-house-cleaning-services/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html              # HTML template with SEO
│   │   └── favicon.ico
│   └── src/
│       ├── components/              # Reusable UI components
│       ├── pages/                   # Page components
│       ├── redux/                   # State management
│       │   ├── slices/             # Redux slices
│       │   └── store.js            # Store configuration
│       ├── routes/                  # Route components
│       ├── services/                # API services
│       ├── styles/                  # Global styles
│       ├── hooks/                   # Custom React hooks
│       └── utils/                   # Utility functions
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   ├── controllers/             # Route controllers
│   │   ├── models/                  # MongoDB models
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Custom middleware
│   │   ├── services/                # Business logic services
│   │   ├── utils/                   # Utility functions
│   │   └── app.js                  # Express app setup
│   ├── uploads/                     # File uploads directory
│   ├── logs/                        # Application logs
│   └── Dockerfile                   # Backend Docker config
├── docker-compose.yml               # Multi-container setup
├── Dockerfile                       # Frontend Docker config
├── nginx.conf                       # Nginx configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (optional)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/diamond-house-cleaning-services.git
   cd diamond-house-cleaning-services
   ```

2. **Environment Setup**
   ```bash
   # Backend environment variables
   cp server/.env.example server/.env
   # Edit server/.env with your configuration

   # Frontend environment variables (if needed)
   cp client/.env.example client/.env
   ```

3. **Using Docker (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

4. **Manual Setup**

   **Backend:**
   ```bash
   cd server
   npm install
   npm run dev  # Development
   npm start    # Production
   ```

   **Frontend:**
   ```bash
   cd client
   npm install
   npm start    # Development server
   npm run build # Production build
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/diamond-house-cleaning-services
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Email Configuration (AWS SES, SendGrid, etc.)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@diamondhousecleaning.com

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Client URL
CLIENT_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# E2E tests (if configured)
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment

1. **Build and deploy with Docker:**
   ```bash
   # Build images
   docker-compose build

   # Deploy
   docker-compose up -d

   # Scale services if needed
   docker-compose up -d --scale backend=3
   ```

2. **Manual deployment:**
   ```bash
   # Backend
   cd server
   npm run build
   npm start

   # Frontend (serve build directory)
   cd client
   npm run build
   # Serve build/ directory with nginx/apache
   ```

### Environment Setup for Production

- Set `NODE_ENV=production`
- Configure production database (MongoDB Atlas)
- Set up SSL certificates
- Configure domain and DNS
- Set up monitoring and logging
- Configure backup strategies

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh JWT token

### Service Endpoints
- `GET /api/v1/services` - Get all services
- `GET /api/v1/services/:id` - Get service details
- `POST /api/v1/services` - Create service (Admin)

### Booking Endpoints
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get user bookings
- `PUT /api/v1/bookings/:id` - Update booking

### Payment Endpoints
- `POST /api/v1/payments/create-order` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** on API endpoints
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers
- **XSS Protection** and CSRF prevention

## 📱 Responsive Design

- **Mobile-First Approach**: Optimized for mobile devices
- **Breakpoint System**: 320px, 768px, 1024px, 1440px
- **Touch-Friendly UI**: Proper touch targets
- **Performance Optimized**: Lazy loading and code splitting

## 🔍 SEO Optimization

- **Meta Tags**: Dynamic meta tags for all pages
- **Structured Data**: JSON-LD for rich snippets
- **Open Graph**: Social media sharing optimization
- **Performance**: Core Web Vitals optimization
- **Accessibility**: WCAG 2.1 AA compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@diamondhousecleaning.com or join our Slack channel.

## 🙏 Acknowledgments

- React community for excellent documentation
- MongoDB for robust database solutions
- Razorpay for seamless payment integration
- Open source community for amazing tools and libraries

---

**Built with ❤️ for professional cleaning services**#   D i m o n d - H o u s e - C l e a n i n g - w e b s i t e s  
 #   D i m o n d - H o u s e - C l e a n i n g - w e b s i t e s  
 #   D i m o n d - H o u s e - C l e a n i n g - w e b s i t e s  
 