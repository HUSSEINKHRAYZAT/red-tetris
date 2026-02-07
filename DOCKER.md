# Red Tetris - Docker Setup

This document explains how to run Red Tetris using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Architecture

The application consists of two services:
- **Server**: Node.js backend with Socket.IO (Port 3000)
- **Client**: React/Vite frontend served by Nginx (Port 80)

## Quick Start

### Production Mode

Build and run the entire application:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the application at: http://localhost

### Development Mode

For development with hot-reload:

```bash
# Build and start in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Available Commands

### Production

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# Start services in foreground
docker-compose up

# Stop services
docker-compose stop

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f [service_name]

# Execute command in container
docker-compose exec server sh
docker-compose exec client sh
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild development containers
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## Services

### Server (Backend)

- **Image**: node:20-alpine
- **Port**: 3000
- **Container**: redtetris-server
- **Health Check**: Available

**Environment Variables**:
- `NODE_ENV`: production/development
- `PORT`: 3000

### Client (Frontend)

- **Image**: nginx:alpine (production) / node:20-alpine (development)
- **Port**: 80 (production) / 5173 (development)
- **Container**: redtetris-client
- **Health Check**: Available

## File Structure

```
redtetris/
├── docker-compose.yml           # Production configuration
├── docker-compose.dev.yml       # Development configuration
├── Dockerfile.server            # Server production Dockerfile
├── Dockerfile.server.dev        # Server development Dockerfile
├── Dockerfile.client            # Client production Dockerfile
├── Dockerfile.client.dev        # Client development Dockerfile
├── nginx.conf                   # Nginx configuration
└── .dockerignore               # Docker ignore patterns
```

## Networking

Both services are connected via a custom bridge network `redtetris-network`. The client can communicate with the server using the hostname `server:3000`.

## Volumes (Development Only)

In development mode, source code is mounted as volumes for hot-reloading:
- `./server:/app` - Server source code
- `./client:/app` - Client source code

Node modules are preserved using anonymous volumes to prevent conflicts.

## Health Checks

Both services have health checks configured:
- **Server**: Checks HTTP endpoint every 30s
- **Client**: Checks Nginx every 30s

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Port Already in Use

If ports 80 or 3000 are already in use:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 80
sudo lsof -ti:80 | xargs kill -9

# Or change ports in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead of 80
```

### Rebuild Containers

If you encounter issues, try rebuilding:

```bash
# Remove everything and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
```

### Enter Container Shell

```bash
# Server container
docker-compose exec server sh

# Client container
docker-compose exec client sh
```

### Check Container Status

```bash
docker-compose ps
```

## Performance Tips

1. **Use .dockerignore**: Already configured to exclude `node_modules` and build artifacts
2. **Multi-stage builds**: Production Dockerfile uses multi-stage builds for smaller images
3. **Layer caching**: Package files are copied before source code for better caching
4. **Alpine images**: Using Alpine Linux for smaller image sizes

## Production Deployment

For production deployment:

1. Set environment variables in a `.env` file
2. Use production compose file: `docker-compose up -d`
3. Configure reverse proxy (Nginx/Traefik) for SSL
4. Set up monitoring and logging
5. Configure backups for any persistent data

## Security Considerations

- Don't expose ports unnecessarily
- Use environment variables for sensitive data
- Keep base images updated
- Run containers as non-root user (consider adding USER directive)
- Use Docker secrets for production credentials

## Examples

### Start everything in production mode:
```bash
docker-compose up -d
```

### Start in development mode with rebuild:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### View real-time logs:
```bash
docker-compose logs -f
```

### Stop and clean up:
```bash
docker-compose down -v
```

## Support

For issues, check:
1. Container logs: `docker-compose logs`
2. Container status: `docker-compose ps`
3. Network connectivity: `docker-compose exec server ping client`
