import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
} from '@mui/material';
import axios from 'axios';

const PasswordReset = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:8000/reset-password', { email });
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset instructions');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        margin: 0,
        padding: 0,
      }}
    >
      <Container 
        component="main" 
        maxWidth="xs"
        sx={{
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {message}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
              >
                Send Reset Instructions
              </Button>
              <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main', alignSelf: 'center' }}>
                Back to Login
              </Link>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PasswordReset; 