import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Theme } from '@mui/material/styles';
import { GridProps } from '@mui/material/Grid';

interface SecurityMetrics {
  securityScore: number;
  activeThreats: number;
  lastLoginAttempts: LoginAttempt[];
  securityEvents: SecurityEvent[];
}

interface LoginAttempt {
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
  location: string;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    securityScore: 0,
    activeThreats: 0,
    lastLoginAttempts: [],
    securityEvents: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSecurityMetrics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      const response = await axios.get('http://localhost:8000/security/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to load security metrics');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSecurityMetrics();
    const interval = setInterval(fetchSecurityMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchSecurityMetrics]);

  const getSeverityColor = (severity: string): "error" | "warning" | "info" | "default" => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && !metrics.securityScore) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 200 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', my: 2 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 200 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Security Score
            </Typography>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
              <CircularProgress
                variant="determinate"
                value={metrics.securityScore}
                size={120}
                sx={{ position: 'relative' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div" color="text.secondary">
                  {metrics.securityScore}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
            }}
          >
            <Typography component="h2" variant="h6" color="error" gutterBottom>
              Active Threats
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
              <WarningIcon color="error" sx={{ fontSize: 40, mr: 1 }} />
              <Typography variant="h3" component="div">
                {metrics.activeThreats}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
              overflow: 'auto',
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Login Activity
            </Typography>
            <List>
              {metrics.lastLoginAttempts.map((attempt, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {attempt.status === 'success' ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <WarningIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${attempt.ipAddress} (${attempt.location})`}
                    secondary={new Date(attempt.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Security Events
            </Typography>
            <List>
              {metrics.securityEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemIcon>
                    {event.severity === 'high' ? (
                      <WarningIcon color="error" />
                    ) : event.severity === 'medium' ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <InfoIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.description}
                    secondary={new Date(event.timestamp).toLocaleString()}
                  />
                  <Chip
                    label={event.severity.toUpperCase()}
                    color={getSeverityColor(event.severity)}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/request/patrol')}
            >
              Request Patrol
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/history')}
            >
              View Mission History
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SecurityDashboard; 