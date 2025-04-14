import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  ListItemButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            S.H.I.E.L.D. Dashboard
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>A</Avatar>
            <Box>
              <Typography variant="subtitle1">Agent</Typography>
              <Typography variant="body2" color="text.secondary">
                Level 1 Clearance
              </Typography>
            </Box>
          </Box>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/dashboard')}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/security')}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Security" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/agents')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Agents" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/profile')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        <Container>
          <Typography variant="h4" gutterBottom>
            Welcome to S.H.I.E.L.D.
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Strategic Homeland Intervention, Enforcement and Logistics Division
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3} component={Box as any}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Active Missions</Typography>
                <Typography variant="h3">47</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3} component={Box as any}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Active Agents</Typography>
                <Typography variant="h3">47</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3} component={Box as any}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Threats Detected</Typography>
                <Typography variant="h3">3</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3} component={Box as any}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Security Level</Typography>
                <Typography variant="h3">Alpha</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard; 