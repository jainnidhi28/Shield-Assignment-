import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MissionList from './components/MissionList';
import MissionRequest from './components/MissionRequest';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import MainLayout from './components/MainLayout';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            element={ 
              <ProtectedRoute>
                <MainLayout /> 
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/mission/:missionType" element={<MissionList />} />
            <Route path="/mission/:missionType/new" element={<MissionRequest />} />
            <Route path="/mission/:missionType/:missionId/edit" element={<MissionRequest />} />
          </Route>
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
