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
  Snackbar,
} from '@mui/material';
import { PersonAdd as RegisterIcon } from '@mui/icons-material';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      console.log('Attempting to register with:', { username: formData.username, email: formData.email });
      
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      };

      console.log('Sending registration data:', registrationData);

      const registerResponse = await api.post('/register', registrationData);
      console.log('Registration successful:', registerResponse.data);
      
      setSuccess('Registration successful! Logging you in...');

      // Prepare login data for token request
      const loginFormData = new FormData();
      loginFormData.append('username', registrationData.username);
      loginFormData.append('password', registrationData.password);

      console.log('Attempting to login with:', loginFormData.get('username'));

      // Login the user
      const loginResponse = await api.post('/token', loginFormData);

      console.log('Login successful:', loginResponse.data);

      // Use auth context to handle login
      login(loginResponse.data.access_token);

      // Show success message before navigation
      setSuccess('Successfully registered and logged in!');
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 1500);

    } catch (error: any) {
      console.error('Registration/Login error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        // Handle specific error cases
        if (error.response.status === 400) {
          if (error.response.data.detail?.includes('Username already registered')) {
            setError('Username already exists. Please choose a different username.');
          } else if (error.response.data.detail?.includes('Email already registered')) {
            setError('Email already exists. Please use a different email address.');
          } else {
            setError(error.response.data.detail || 'Registration failed. Please try again.');
          }
        } else if (error.response.status === 422) {
          setError('Please check your input: username, email, and password are required.');
        } else {
          setError(error.response.data.detail || 'An unexpected error occurred. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Something else happened while setting up the request
        setError('An error occurred while processing your request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="#1a237e" gutterBottom align="center">
          Register for Shield
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
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
            label="Email"
            name="email"
            type="email"
            value={formData.email}
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

          <TextField
            required
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
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
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <RegisterIcon />}
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#000051',
              },
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="login-link"
                style={{
                  color: '#1a237e',
                  textDecoration: 'none'
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>

        <style>
          {`
            .login-link:hover {
              text-decoration: underline;
            }
          `}
        </style>
      </Paper>
    </Container>
  );
};

export default Register; 