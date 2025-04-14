import { AppBar, Toolbar, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const missions = [
    {
      title: 'Deploy Drone Surveillance Unit',
      path: '/mission/drone-surveillance'
    },
    {
      title: 'Setup Secure Communications Relay',
      path: '/mission/secure-communications'
    },
    {
      title: 'Sync Classified Intelligence Database',
      path: '/mission/intelligence-sync'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        <ShieldIcon sx={{ mr: 2, fontSize: 28 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            fontWeight: 'bold',
            cursor: 'pointer',
            mr: 4
          }}
          onClick={() => navigate('/home')}
        >
          S.H.I.E.L.D.
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, justifyContent: 'center' }}>
          {missions.map((mission) => (
            <Button
              key={mission.path}
              color="inherit"
              onClick={() => navigate(mission.path)}
              sx={{
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 'normal',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              {mission.title}
            </Button>
          ))}
        </Box>
        <Tooltip title="View Profile">
           <IconButton 
             color="inherit" 
             onClick={() => navigate('/profile')} 
             sx={{ mr: 1 }}
           >
              <AccountCircleIcon />
           </IconButton>
        </Tooltip>
        <Tooltip title="Logout">
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<LogoutIcon />}
            sx={{
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Logout
          </Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 