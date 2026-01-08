# Production Deployment Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or MongoDB Atlas)
3. **Firebase Project** (for authentication)

## Environment Setup

1. Copy `.env.example` to `.env` in the server directory
2. Update the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   FRONTEND_URL=your_frontend_domain
   NODE_ENV=production
   PORT=4334
   ```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string and update `MONGODB_URI`

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use default connection string: `mongodb://localhost:27017/justcoding`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Update Firebase config in `client/src/firebase.js`

## Deployment Steps

### Backend Deployment

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting service

## Hosting Recommendations

### Backend
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern alternative to Heroku
- **DigitalOcean App Platform**: Good performance and pricing
- **AWS/GCP/Azure**: For enterprise deployments

### Frontend
- **Vercel**: Excellent for React apps (recommended)
- **Netlify**: Great alternative with good features
- **Firebase Hosting**: Integrates well with Firebase Auth

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Update `allowedOrigins` in server for production domains
3. **Rate Limiting**: Configured and enabled by default
4. **Input Validation**: All endpoints have input validation
5. **MongoDB**: Use MongoDB Atlas with authentication in production

## Performance Optimization

1. **Caching**: Consider adding Redis for session caching
2. **CDN**: Use a CDN for static assets
3. **Compression**: Enable gzip compression (handled by hosting platforms)
4. **Database Indexing**: Indexes are configured in the models

## Monitoring

1. **Health Check**: Available at `/health` endpoint
2. **Error Handling**: All errors are handled gracefully
3. **Logging**: Minimal logging for security (no sensitive data)

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Check connection string and network access
2. **CORS Errors**: Verify `FRONTEND_URL` in environment variables
3. **Firebase Auth**: Ensure Firebase config is correct
4. **Port Issues**: Check if port 4334 is available or change in `.env`

### Debug Mode

For debugging, temporarily add console.log statements but remove before production deployment.

## Scaling

The application is designed to be stateless and can be horizontally scaled:

1. **Load Balancer**: Use a load balancer for multiple server instances
2. **Database**: MongoDB Atlas handles scaling automatically
3. **Session Storage**: Consider Redis for shared session storage
4. **File Storage**: Use cloud storage for file uploads if needed

## Backup Strategy

1. **Database**: MongoDB Atlas provides automatic backups
2. **Code**: Use Git for version control
3. **Environment**: Document all environment variables
4. **Firebase**: Export Firebase configuration

## Updates and Maintenance

1. **Dependencies**: Regularly update npm packages
2. **Security**: Monitor for security vulnerabilities
3. **Database**: Monitor database performance and usage
4. **Logs**: Regularly check application logs for issues