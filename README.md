# S.H.I.E.L.D. Ops Request Portal

A secure portal for S.H.I.E.L.D. agents to submit mission requests.

## Prerequisites

- Python 3.8+
- MongoDB
- Node.js (for frontend)
- npm (for frontend)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Available Users

The following users are available for testing:
- Username: `agent.coulson`, Password: `shield123`
- Username: `agent.pepper`, Password: `shield123`
- Username: `agent.may`, Password: `shield123`

## Features

- Secure login with JWT authentication
- View available mission types
- Submit mission requests
- View mission history
- Real-time form validation
- Responsive design

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is properly configured
- Input validation is implemented
- Environment variables are used for sensitive data

## Testing

To run the tests:
```bash
cd backend
pytest
```

## Architecture

The application follows a client-server architecture:
- Frontend: React-based SPA
- Backend: FastAPI REST API
- Database: MongoDB

## Error Handling

The application includes comprehensive error handling for:
- Authentication failures
- Invalid input data
- Database errors
- Network issues 