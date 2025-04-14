import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UserProfile: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Handle loading state from AuthContext
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Handle case where user is not authenticated (should ideally be caught by ProtectedRoute)
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Not authorized to view this page or user data is unavailable.</Alert>
      </Container>
    );
  }

  // Display user profile data
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ fontSize: 80, color: '#1a237e', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        <Box sx={{ width: '100%', mt: 2 }}>
          <List dense>
            <ListItem>
              <ListItemText primary="Username" secondary={user.username || 'N/A'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Email" secondary={user.email || 'N/A'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Full Name" secondary={user.fullName || '-'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Security Level" secondary={user.securityLevel || '-'} />
            </ListItem>
            <ListItem>
              <ListItemText primary="2FA Enabled" secondary={user.twoFactorEnabled ? 'Yes' : 'No'} />
            </ListItem>
            {/* Add more fields from the user object as needed */}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile; 