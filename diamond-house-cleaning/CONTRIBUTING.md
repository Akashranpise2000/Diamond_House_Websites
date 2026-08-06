# Contributing to Diamond House Cleaning Services

Thank you for your interest in contributing to the Diamond House Cleaning Services project!

## Development Setup

### Prerequisites

- Node.js (v18+)
- MongoDB (v6.0+)
- npm or yarn

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd diamond-house-cleaning
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd client
   npm install
   ```

4. **Configure environment variables**
   - Copy `server/.env.example` to `server/.env` and update values
   - Copy `client/.env.example` to `client/.env` (if needed)

5. **Start MongoDB**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0

   # Or use local MongoDB installation
   ```

6. **Start the development servers**

   Terminal 1 (Backend):

   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Frontend):

   ```bash
   cd client
   npm start
   ```

## Project Structure

```
diamond-house-cleaning/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux state management
│   │   └── utils/        # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── models/        # Mongoose models
│       ├── routes/        # API routes
│       ├── middleware/    # Express middleware
│       └── services/     # Business logic
└── docker-compose.yml     # Docker orchestration
```

## Coding Standards

### Backend (Node.js)

- Use ESLint for code linting
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Validate all inputs using express-validator

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use Redux for state management
- Style with CSS modules or styled-components

## Security Guidelines

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Sanitize all user inputs
- Implement proper authentication and authorization
- Use parameterized queries to prevent SQL injection

## Testing

Run tests:

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit them
3. Push to the branch: `git push origin feature/your-feature`
4. Create a Pull Request

## License

This project is licensed under the ISC License.
