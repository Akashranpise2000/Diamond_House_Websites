# Deployment Guide for Diamond House Cleaning Services

This guide provides step-by-step instructions for deploying the MERN stack application to Render.

## Prerequisites

1. **GitHub/GitLab/Bitbucket account** - For storing your code
2. **Render account** - Sign up at https://render.com
3. **MongoDB database** - Use MongoDB Atlas (free tier) or Render's managed MongoDB

---

## Backend Deployment (API)

### Step 1: Prepare Your Code

The backend has been configured with the following files:
- `server/render.yaml` - Render blueprint configuration
- `server/healthcheck.js` - Health check endpoint
- `server/logs/.gitkeep` - Logs directory
- `server/uploads/.gitkeep` - Uploads directory

### Step 2: Set Up MongoDB

1. Create a free MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier)
3. Create a database user with username and password
4. Get the connection string (replace password in the string)

### Step 3: Deploy to Render

#### Option A: Using Render Dashboard

1. Push your code to GitHub
2. Log in to Render and create a new Web Service
3. Connect your GitHub repository
4. Configure the following:
   - **Name**: `diamond-house-cleaning-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Region**: Choose closest to your users

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=generate_a_secure_random_string
   JWT_REFRESH_SECRET=generate_another_secure_random_string
   JWT_EXPIRE=24h
   JWT_REFRESH_EXPIRE=7d
   ```

6. Click "Create Web Service"

#### Option B: Using render.yaml (Blueprints)

1. Push your code to GitHub
2. In Render dashboard, click "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Add the required environment variables in the Render dashboard

### Step 4: Verify Backend is Working

After deployment, visit:
```
https://your-backend-service.onrender.com/api/v1/health
```

---

## Frontend Deployment

### Step 1: Update Environment Variables

Before building, update the API URL in `client/.env.production`:
```
REACT_APP_API_URL=https://your-backend-service.onrender.com/api/v1
```

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard

1. Create a new Static Site in Render
2. Connect your GitHub repository
3. Configure:
   - **Name**: `diamond-house-cleaning-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-service.onrender.com/api/v1
   ```

#### Option B: Using render.yaml

The frontend already has a `render.yaml` file. After deploying the backend:
1. Update the `REACT_APP_API_URL` in `client/render.yaml`
2. Use Render Blueprint to deploy

---

## Environment Variables Summary

### Backend (server/.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-in-production
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Optional (for payment features)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Optional (for email)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

### Frontend (client/.env)

```env
REACT_APP_API_URL=https://your-backend.onrender.com/api/v1
```

---

## Troubleshooting

### Common Issues

1. **CORS errors**: The backend CORS is configured to accept requests from `CLIENT_URL` environment variable. Make sure to set it.

2. **Database connection failed**: Verify your MongoDB connection string is correct and the IP whitelist includes Render's IPs.

3. **Static files not loading**: Check that the `/uploads` directory is properly configured.

4. **Health check failing**: Ensure the health check path `/api/v1/health` is accessible.

### Logs

- Backend logs: Available in Render dashboard under "Logs"
- To view logs locally: `npm run dev` and check `server/logs/`

---

## Security Notes

1. **Change JWT secrets** - Generate strong random strings for production
2. **Enable HTTPS** - Render provides free SSL certificates
3. **Environment variables** - Never commit secrets to version control
4. **Rate limiting** - Already configured, but monitor for abuse

---

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| API URL | http://localhost:5000 | https://your-api.onrender.com |
| Logs | Console + File | File only |
| CORS | localhost:3000 | Your production domain |
| Error Stack | Visible | Hidden |

---

## Quick Commands

```bash
# Backend
cd server
npm install
npm run dev    # Development
npm start      # Production

# Frontend
cd client
npm install
npm run dev    # Development
npm run build  # Production build
```

---

## Support

For issues or questions, please refer to the project documentation or open an issue on GitHub.
