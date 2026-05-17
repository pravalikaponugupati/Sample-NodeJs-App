# Full-Stack Application - Docker & Azure App Service Deployment

This is a complete full-stack application with a **React Frontend** and **Node.js/Express Backend**, containerized with Docker and ready for deployment on **Azure App Service**.

## Project Structure

```
├── backend/                    # Express API Server
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── Dockerfile             # Backend Docker image
│   └── .dockerignore          # Docker ignore file
├── frontend/                  # React Application
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styling
│   │   └── index.js          # Entry point
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json          # Frontend dependencies
│   ├── Dockerfile            # Frontend Docker image
│   ├── nginx.conf            # Nginx configuration
│   └── .dockerignore         # Docker ignore file
├── .github/
│   └── workflows/
│       └── azure-deploy.yml  # GitHub Actions CI/CD pipeline
├── docker-compose.yml        # Local development environment
└── README.md                 # This file
```

## Features

### Backend (Express API)
- REST API with CORS support
- Health check endpoint
- User management endpoints
- Sample data endpoints
- Error handling middleware
- Environment configuration

### Frontend (React)
- Modern React UI with Hooks
- Axios for API communication
- User listing and creation
- Real-time backend status
- Responsive design
- Nginx reverse proxy

## Prerequisites

### Local Development
- Node.js 18+
- Docker & Docker Compose
- Git

### Azure Deployment
- Azure Subscription
- Azure CLI
- GitHub Account (for CI/CD)
- Docker Registry (GitHub Container Registry or Azure Container Registry)

---

## Local Development

### Option 1: Using Docker Compose (Recommended)

1. **Clone or navigate to the project directory**
   ```bash
   cd "Sample NodeJs App"
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Backend Health: http://localhost:5000/health

4. **Stop the services**
   ```bash
   docker-compose down
   ```

### Option 2: Local Node.js Setup

**Backend Setup:**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

**Frontend Setup (in another terminal):**
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Azure Deployment Guide

### Step 1: Create Resource Group

```bash
az group create \
  --name myResourceGroup \
  --location eastus
```

### Step 2: Create App Service Plans

```bash
# Create App Service Plan for Backend
az appservice plan create \
  --name myBackendPlan \
  --resource-group myResourceGroup \
  --sku B1 \
  --is-linux

# Create App Service Plan for Frontend
az appservice plan create \
  --name myFrontendPlan \
  --resource-group myResourceGroup \
  --sku B1 \
  --is-linux
```

### Step 3: Create Azure Container Registry (Optional)

```bash
az acr create \
  --resource-group myResourceGroup \
  --name mycontainerregistry \
  --sku Basic
```

Or use **GitHub Container Registry** (recommended for GitHub projects).

### Step 4: Create Backend App Service

```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myBackendPlan \
  --name my-backend-app \
  --deployment-container-image-name backend-api:latest
```

### Step 5: Create Frontend App Service

```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myFrontendPlan \
  --name my-frontend-app \
  --deployment-container-image-name frontend-app:latest
```

### Step 6: Configure Docker Settings

**For Backend App Service:**
```bash
az webapp config container set \
  --name my-backend-app \
  --resource-group myResourceGroup \
  --docker-custom-image-name ghcr.io/your-username/your-repo/backend:latest \
  --docker-registry-server-url https://ghcr.io \
  --docker-registry-server-user your-username \
  --docker-registry-server-password $GITHUB_TOKEN
```

**For Frontend App Service:**
```bash
az webapp config container set \
  --name my-frontend-app \
  --resource-group myResourceGroup \
  --docker-custom-image-name ghcr.io/your-username/your-repo/frontend:latest \
  --docker-registry-server-url https://ghcr.io \
  --docker-registry-server-user your-username \
  --docker-registry-server-password $GITHUB_TOKEN
```

### Step 7: Configure App Settings

**Backend Environment Variables:**
```bash
az webapp config appsettings set \
  --name my-backend-app \
  --resource-group myResourceGroup \
  --settings PORT=8080 NODE_ENV=production
```

**Frontend Environment Variables:**
```bash
az webapp config appsettings set \
  --name my-frontend-app \
  --resource-group myResourceGroup \
  --settings WEBSITES_PORT=80 \
  REACT_APP_API_URL=https://my-backend-app.azurewebsites.net
```

---

## GitHub Actions CI/CD Setup

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Step 2: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

```
AZURE_BACKEND_APP_NAME = my-backend-app
AZURE_BACKEND_PUBLISH_PROFILE = <publish-profile-xml>

AZURE_FRONTEND_APP_NAME = my-frontend-app
AZURE_FRONTEND_PUBLISH_PROFILE = <publish-profile-xml>
```

### Step 3: Get Publish Profiles

```bash
# For Backend
az webapp deployment list-publishing-profiles \
  --name my-backend-app \
  --resource-group myResourceGroup \
  --xml > backend-profile.xml

# For Frontend
az webapp deployment list-publishing-profiles \
  --name my-frontend-app \
  --resource-group myResourceGroup \
  --xml > frontend-profile.xml
```

Copy the content of these files and add them as GitHub secrets.

### Step 4: Enable CI/CD

Once secrets are configured, the GitHub Actions workflow will:
1. Trigger on push to `main` or `develop` branch
2. Build Docker images for both backend and frontend
3. Push images to GitHub Container Registry
4. Deploy to respective Azure App Services

### Step 5: Monitor Deployments

- GitHub: Check Actions tab for workflow status
- Azure Portal: Monitor App Service deployments

---

## API Endpoints

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api` | Welcome message |
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create new user |
| GET | `/api/data` | Get sample data |

### Example API Calls

```bash
# Get users
curl http://localhost:5000/api/users

# Add user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Health check
curl http://localhost:5000/health
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Frontend
```
REACT_APP_API_URL=http://localhost:5000
```

For Azure production, update to:
```
REACT_APP_API_URL=https://my-backend-app.azurewebsites.net
```

---

## Docker Commands

### Build Images Individually

```bash
# Build backend
docker build -t backend-api:latest ./backend

# Build frontend
docker build -t frontend-app:latest ./frontend
```

### Run Containers Individually

```bash
# Run backend
docker run -p 5000:5000 backend-api:latest

# Run frontend
docker run -p 3000:80 frontend-app:latest
```

### Push to Registry

```bash
# Tag images
docker tag backend-api:latest ghcr.io/your-username/your-repo/backend:latest
docker tag frontend-app:latest ghcr.io/your-username/your-repo/frontend:latest

# Push to GitHub Container Registry
docker push ghcr.io/your-username/your-repo/backend:latest
docker push ghcr.io/your-username/your-repo/frontend:latest
```

---

## Troubleshooting

### Container won't start
- Check logs: `docker logs <container-id>`
- Verify environment variables are set
- Ensure ports are not already in use

### Frontend can't connect to backend
- Update `REACT_APP_API_URL` environment variable
- Check CORS settings in backend
- Verify backend service is running

### Azure deployment issues
- Check publish profile credentials
- Verify container registry credentials
- Review App Service logs in Azure Portal
- Check resource quotas

### Build failures
- Ensure Node.js version matches (18+)
- Clean npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

---

## Scaling & Performance

### Backend Scaling
- Increase App Service Plan tier (S1, S2, S3)
- Enable auto-scale rules based on CPU/memory
- Use Azure Database for persistent data

### Frontend Scaling
- Use CDN (Azure CDN) for static files
- Enable compression (already in nginx.conf)
- Optimize React build with code splitting

---

## Security Considerations

- [ ] Use HTTPS/TLS certificates
- [ ] Enable CORS only for trusted domains
- [ ] Use Azure Key Vault for secrets
- [ ] Implement authentication/authorization
- [ ] Regular security updates for dependencies
- [ ] Use private container registries in production
- [ ] Implement rate limiting on API
- [ ] Enable monitoring and logging

---

## Monitoring & Logs

### View Azure Logs

```bash
# Streaming logs for backend
az webapp log tail --name my-backend-app --resource-group myResourceGroup

# Streaming logs for frontend
az webapp log tail --name my-frontend-app --resource-group myResourceGroup
```

### Container Logs in Docker

```bash
docker logs backend-api
docker logs frontend-app
```

---

## Cleanup

### Remove Azure Resources

```bash
# Delete resource group (removes all resources)
az group delete \
  --name myResourceGroup \
  --yes --no-wait
```

### Stop Docker Containers

```bash
docker-compose down
```

---

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## License

ISC

## Support

For issues or questions, please create an issue in the GitHub repository.
