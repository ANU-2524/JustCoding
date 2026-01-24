# 🐳 Docker Setup Guide for JustCode

This guide will help you get JustCode up and running using Docker, making local development and deployment much easier.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

To verify your installation:

```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

This is the easiest way to get started. It will spin up MongoDB, the backend server, and the frontend client all at once.

1. **Clone the repository**

```bash
git clone https://github.com/ANU-2524/JustCoding.git
cd JustCoding
```

2. **Set up environment variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your configuration
# At minimum, you need to add your OPENAI_API_KEY
```

3. **Start all services**

```bash
docker-compose up
```

That's it! 🎉

- Frontend will be available at: http://localhost:5173
- Backend API will be available at: http://localhost:4334
- MongoDB will be running on: localhost:27017

To run in detached mode (background):

```bash
docker-compose up -d
```

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

### Option 2: Building Individual Containers

If you want more control, you can build and run containers individually.

#### Build and Run MongoDB

```bash
docker run -d \
  --name justcode-mongodb \
  -p 27017:27017 \
  -v justcode-mongodb-data:/data/db \
  mongo:6.0
```

#### Build and Run Backend Server

```bash
# Build the image
cd server
docker build -t justcode-server .

# Run the container
docker run -d \
  --name justcode-server \
  -p 4334:4334 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/justcoding \
  -e OPENAI_API_KEY=your_api_key_here \
  justcode-server
```

#### Build and Run Frontend Client (Development)

```bash
# Build the image
cd client
docker build -f Dockerfile.dev -t justcode-client-dev .

# Run the container
docker run -d \
  --name justcode-client-dev \
  -p 5173:5173 \
  -v $(pwd):/app \
  -v /app/node_modules \
  justcode-client-dev
```

## 🛠 Development Workflow

### Hot Reloading

The Docker Compose setup includes volume mounts for both client and server, enabling hot-reloading during development:

- Any changes you make to the code will automatically reflect in the running containers
- No need to rebuild unless you change dependencies

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View logs for a specific service
docker-compose logs server
docker-compose logs client-dev
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f server
```

### Rebuilding After Dependency Changes

If you modify `package.json` or `package-lock.json`:

```bash
# Rebuild all services
docker-compose up --build

# Rebuild a specific service
docker-compose up --build server
```

### Accessing Container Shell

```bash
# Access server container
docker exec -it justcode-server sh

# Access client container
docker exec -it justcode-client-dev sh

# Access MongoDB container
docker exec -it justcode-mongodb mongosh
```

## 📦 Production Deployment

For production, use the optimized production Dockerfiles:

1. **Update docker-compose.yml**

   Comment out the `client-dev` service and uncomment `client-prod` service

2. **Build production images**

```bash
docker-compose -f docker-compose.yml up --build -d
```

The production frontend will be served with Nginx on port 80.

### Environment Variables for Production

Make sure to set these in your production environment:

```bash
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
OPENAI_API_KEY=your_production_api_key
FRONTEND_URL=your_production_frontend_url
```

## 🔧 Troubleshooting

### Port Already in Use

If you get an error about ports already being in use:

```bash
# Find and stop the process using the port
# On Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:5173 | xargs kill -9
```

Or change the port in `docker-compose.yml`:

```yaml
ports:
  - "3000:5173"  # Use port 3000 instead
```

### MongoDB Connection Issues

If the server can't connect to MongoDB:

1. Check if MongoDB is healthy:
   ```bash
   docker-compose ps
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Try restarting services:
   ```bash
   docker-compose restart
   ```

### Clean Slate Reset

To completely reset everything:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove all images
docker rmi $(docker images -q justcode*)

# Start fresh
docker-compose up --build
```

### Permission Errors on Linux

If you encounter permission errors on Linux:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for changes to take effect
```

## 📊 Health Checks

All containers include health checks. Check their status:

```bash
docker-compose ps
```

Healthy services will show "Up" with status "healthy".

## 🌐 Networking

All services are connected through a custom Docker network (`justcode-network`). This allows:

- Services to communicate using service names (e.g., `mongodb://mongodb:27017`)
- Isolated network environment
- Easy service discovery

## 💾 Persistent Data

MongoDB data is persisted in Docker volumes:

- `justcode-mongodb-data`: Database files
- `justcode-mongodb-config`: MongoDB configuration

To backup your database:

```bash
docker exec justcode-mongodb mongodump --out /data/backup
docker cp justcode-mongodb:/data/backup ./mongodb-backup
```

## 🎯 Best Practices

1. **Never commit `.env` files** - Add them to `.gitignore`
2. **Use `.env.example`** for sharing required variables
3. **Keep images small** - Use Alpine Linux base images
4. **Separate dev and prod** - Use different Dockerfiles for different environments
5. **Health checks** - Always include health checks for production
6. **Volume management** - Regularly clean up unused volumes

## 📝 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🤝 Contributing

If you're contributing Docker-related improvements:

1. Test both development and production setups
2. Update this documentation if needed
3. Ensure `.dockerignore` files are optimized
4. Test on different platforms (Windows, Mac, Linux)

## ❓ Need Help?

If you run into issues with Docker setup:

1. Check the [Troubleshooting](#-troubleshooting) section above
2. Open an issue on GitHub with:
   - Your Docker version
   - Your OS
   - Error logs (`docker-compose logs`)
   - Steps to reproduce

---

Happy Dockerizing! 🐳✨
