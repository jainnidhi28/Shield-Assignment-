import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { Send as SendIcon, Save as SaveIcon } from '@mui/icons-material';
import api from '../utils/axios';

const getMissionTitle = (missionType: string): string => {
  const titles: Record<string, string> = {
    'drone-surveillance': 'Deploy Drone Surveillance Unit',
    'secure-communications': 'Setup Secure Communications Relay',
    'intelligence-sync': 'Sync Classified Intelligence Database'
  };
  return titles[missionType] || '';
};

const getFieldKeys = (missionType: string): string[] => {
  const keys: Record<string, string[]> = {
    'drone-surveillance': ['drone_id', 'operation_area', 'payload'],
    'secure-communications': ['relay_id', 'channel', 'encryption_protocol'],
    'intelligence-sync': ['database_name', 'sync_frequency', 'transmission_channel']
  };
  return keys[missionType] || [];
};

const getFieldLabel = (key: string): string => {
  return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const MissionRequest = () => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const navigate = useNavigate();
  const { missionType, missionId } = useParams<{ missionType: string; missionId?: string }>();
  
  const isEditMode = Boolean(missionId);
  const title = getMissionTitle(missionType || '');
  const fieldKeys = getFieldKeys(missionType || '');

  useEffect(() => {
    const fetchMissionData = async () => {
      if (isEditMode && missionId && missionType) {
        setIsLoadingData(true);
        setError('');
        try {
          // First try to get the specific mission by ID
          const response = await api.get(`/missions/${missionType}/${missionId}`);
          if (response.data && response.data.mission && response.data.mission.details) {
            console.log("Edit Mode: Prefilling form with data:", response.data.mission.details);
            setFormData(response.data.mission.details);
          } else {
            // Fallback to searching in the mission list
            const listResponse = await api.get('/missions/list', {
              params: { mission_type: missionType }
            });
            const mission = listResponse.data.find((m: any) => m._id === missionId || m.id === missionId);
            
            if (mission && mission.details) {
              console.log("Edit Mode: Prefilling form with data from list:", mission.details);
              setFormData(mission.details);
            } else {
              console.error(`Edit Mode: Mission with ID ${missionId} not found.`);
              setError(`Mission details not found for ID ${missionId}.`);
            }
          }
        } catch (err: any) {
          console.error('Failed to fetch mission data for edit:', err);
          setError(err.response?.data?.detail || 'Could not load mission data. Please try again later.');
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchMissionData();
  }, [missionId, missionType, isEditMode]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear any error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionType) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let response;
      if (isEditMode && missionId) {
        console.log(`Updating mission ${missionId} with payload:`, { details: formData });
        response = await api.put(`/missions/${missionType}/${missionId}`, { details: formData });
        setSuccess('Mission updated successfully!');
      } else {
        const createPayload = {
          mission_type: missionType,
          details: formData,
          timestamp: new Date().toISOString()
        };
        console.log('Creating new mission with payload:', createPayload);
        response = await api.post('/missions/submit', createPayload);
        setSuccess('Mission submitted successfully!');
      }

      console.log('Submit/Update response:', response.data);
      
      // Wait a moment before redirecting to show the success message
      setTimeout(() => {
        navigate(`/mission/${missionType}`);
      }, 1500);

    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Error response data:', error.response?.data);

      let errorMessage = 'Failed to submit mission request';
      const detail = error.response?.data?.detail;

      if (detail) {
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map((err: any) => `${err.loc.slice(1).join('.')} - ${err.msg}`)
            .join('; ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
      return (
          <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
             <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" color="#1a237e" gutterBottom>
                   Loading Mission Data...
                </Typography>
                {fieldKeys.map(key => <Skeleton key={key} variant="rectangular" height={56} sx={{ mt: 2, mb: 1 }} />)}
                <Skeleton variant="rectangular" height={40} width={120} sx={{ mt: 3 }} />
             </Paper>
          </Container>
       );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" color="#1a237e" gutterBottom>
          {isEditMode ? `Update ${title}` : title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {fieldKeys.map((field) => (
            <TextField
              key={field}
              required
              fullWidth
              label={getFieldLabel(field)}
              value={formData[field] || ''}
              onChange={handleChange(field)}
              margin="normal"
              variant="outlined"
              disabled={isSubmitting || isLoadingData}
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
          ))}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || isLoadingData}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? <SaveIcon /> : <SendIcon />)}
              sx={{
                backgroundColor: '#1a237e',
                '&:hover': {
                  backgroundColor: '#000051',
                },
              }}
            >
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? 'Save Changes' : 'Submit Request')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/mission/${missionType}`)}
              disabled={isSubmitting || isLoadingData}
              sx={{
                borderColor: '#1a237e',
                color: '#1a237e',
                '&:hover': {
                  borderColor: '#000051',
                  backgroundColor: 'rgba(26, 35, 126, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MissionRequest; 