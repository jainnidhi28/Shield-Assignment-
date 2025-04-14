# Setup Guide

This guide provides detailed instructions for setting up the S.H.I.E.L.D. Operations Request Portal locally.

## Prerequisites

### Required Software
- Python 3.8 or higher
- Node.js 14 or higher
- MongoDB 4.4 or higher
- Git

### System Requirements
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space
- Internet connection for package installation

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/jainnidhi28/Shield-Assignment-.git
cd Shield-Assignment-
```

### 2. Backend Setup

#### 2.1 Create and Activate Virtual Environment
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate
```

#### 2.2 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.3 Environment Configuration
Create a `.env` file in the backend directory:
```bash
touch .env
```

Add the following configuration:
```env
SECRET_KEY=your-secret-key-here
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=shield_ops
CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174"]
```

#### 2.4 Initialize Database
```bash
python init_db.py
```

#### 2.5 Start Backend Server
```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### 3.1 Install Dependencies
```bash
cd ../frontend
npm install
```

#### 3.2 Environment Configuration
Create a `.env` file in the frontend directory:
```bash
touch .env
```

Add the following configuration:
```env
VITE_API_BASE_URL=http://localhost:8000
```

#### 3.3 Start Development Server
```bash
npm start
```

The frontend will be available at `http://localhost:5173`

## Verification

### 1. API Documentation
Access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Test Users
The following test users are available:
```
Username: agent.coulson
Password: shield123

Username: agent.pepper
Password: shield123

Username: agent.may
Password: shield123
```

### 3. Health Check
Verify the backend is running:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## Common Issues and Solutions

### MongoDB Connection Issues
1. Ensure MongoDB service is running:
```bash
# On Windows
net start MongoDB

# On Unix/MacOS
sudo systemctl start mongod
```

2. Verify MongoDB connection:
```bash
mongosh
```

### CORS Issues
If experiencing CORS errors:
1. Verify the frontend URL is listed in `CORS_ORIGINS` in backend `.env`
2. Check that the API URL in frontend `.env` matches the backend server

### Port Conflicts
If ports are already in use:
1. Backend: Use `uvicorn main:app --port 8001 --reload`
2. Frontend: Edit `vite.config.ts` to change the port

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Development Tools

### Recommended IDE Setup
- Visual Studio Code with extensions:
  - Python
  - Pylance
  - ESLint
  - Prettier
  - MongoDB for VS Code

### Debugging
1. Backend: Use VS Code's Python debugger
2. Frontend: Use Chrome DevTools with React Developer Tools

## Deployment Considerations

### Production Setup
1. Use production-grade WSGI server (e.g., Gunicorn)
2. Set up proper MongoDB authentication
3. Configure HTTPS
4. Set up proper logging
5. Configure rate limiting

### Environment Variables
Ensure all sensitive data is configured via environment variables:
- Database credentials
- JWT secret key
- API keys
- Environment-specific URLs 