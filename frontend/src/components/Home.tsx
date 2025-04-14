import { Container, Paper, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Security as SecurityIcon, Speed as SpeedIcon, Lock as LockIcon } from '@mui/icons-material';
import { ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const Home = () => {
  const features: Feature[] = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#1a237e' }} />,
      title: 'Advanced Security',
      description: 'State-of-the-art security protocols and encryption for all operations.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#1a237e' }} />,
      title: 'Real-time Operations',
      description: 'Instant deployment and monitoring of all mission activities.'
    },
  ];

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            mb: 4
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: '#1a237e'
            }}
          >
            Welcome to Shield OPS Portal
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Strategic Homeland Intervention, Enforcement and Logistics Division
          </Typography>
        </Paper>

        <Grid 
          container 
          spacing={3} 
          justifyContent="center"
        >
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4}
              key={index}
              component={Box as any}
            >
              <Paper
                elevation={2}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 