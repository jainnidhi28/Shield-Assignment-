import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create form data for backend
      const formDataObj = new FormData();
      formDataObj.append('username', formData.username.trim());
      formDataObj.append('password', formData.password);

      const response = await api.post('/token', formDataObj);

      console.log('Login successful:', response.data);

      // Use the auth context to handle login
      login(response.data.access_token);

      // Navigate to the home page
      navigate('/home', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError(error.response.data.detail || 'Failed to login. Please try again.');
        }
      } else if (error.request) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError('An error occurred while logging in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="#1a237e" gutterBottom align="center">
          Login to Shield
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a237e',
                },
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#1a237e',
              },
            }}
          />

          <TextField
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1a237e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a237e',
                },
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: '#1a237e',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#000051',
              },
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="register-link"
                style={{
                  color: '#1a237e',
                  textDecoration: 'none'
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>

        <style>
          {`
            .register-link:hover {
              text-decoration: underline;
            }
          `}
        </style>
      </Paper>
    </Container>
  );
};

export default Login; 