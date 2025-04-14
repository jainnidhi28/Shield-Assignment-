import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation'; // Import the existing Navigation bar
import { Box } from '@mui/material';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 1 /* Add some margin top if needed */ }}>
        <Outlet /> {/* Child routes will render here */}
      </Box>
      {/* Optional: Add a Footer component here */}
    </Box>
  );
};

export default MainLayout; 