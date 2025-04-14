import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axios';

interface MissionData {
  _id: string;
  mission_type: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  details: Record<string, string>;
}

const formatTimestamp = (isoString: string): string => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString(); // Or use a more specific format if needed
  } catch (e) {
    console.error("Error formatting timestamp:", isoString, e);
    return isoString; // Return original string if formatting fails
  }
};

const getMissionTitle = (missionType: string): string => {
  const titles: Record<string, string> = {
    'drone-surveillance': 'Deploy Drone Surveillance Unit',
    'secure-communications': 'Setup Secure Communications Relay',
    'intelligence-sync': 'Sync Classified Intelligence Database'
  };
  return titles[missionType] || '';
};

const getFieldHeaders = (missionType: string): string[] => {
  const headers: Record<string, string[]> = {
    'drone-surveillance': ['Drone ID', 'Operation Area', 'Payload'],
    'secure-communications': ['Relay ID', 'Channel', 'Encryption Protocol'],
    'intelligence-sync': ['Database Name', 'Sync Frequency', 'Transmission Channel']
  };
  return headers[missionType] || [];
};

const getFieldKeys = (missionType: string): string[] => {
  const keys: Record<string, string[]> = {
    'drone-surveillance': ['drone_id', 'operation_area', 'payload'],
    'secure-communications': ['relay_id', 'channel', 'encryption_protocol'],
    'intelligence-sync': ['database_name', 'sync_frequency', 'transmission_channel']
  };
  return keys[missionType] || [];
};

const MissionList = () => {
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { missionType } = useParams<{ missionType: string }>();
  const title = getMissionTitle(missionType || '');
  const headers = getFieldHeaders(missionType || '');
  const fieldKeys = getFieldKeys(missionType || '');

  useEffect(() => {
    fetchMissions();
  }, [missionType]);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching missions for type:', missionType);
      const response = await api.get('/missions/list', {
        params: {
          mission_type: missionType
        }
      });

      console.log('Missions response:', response.data);
      
      // The backend now filters by mission_type, so we don't need to filter here
      setMissions(response.data.map((m: any) => ({ ...m, _id: m._id || m.id })));
    } catch (error: any) {
      console.error('Fetch error details:', error.response || error);
      const errorMessage = error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch missions. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequest = () => {
    navigate(`/mission/${missionType}/new`);
  };

  const isSelected = (id: string) => selectedMissions.indexOf(id) !== -1;
  
  const handleSelectClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selectedMissions.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedMissions, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedMissions.slice(1));
    } else if (selectedIndex === selectedMissions.length - 1) {
      newSelected = newSelected.concat(selectedMissions.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedMissions.slice(0, selectedIndex),
        selectedMissions.slice(selectedIndex + 1),
      );
    }
    setSelectedMissions(newSelected);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = missions.map((n) => n._id);
      setSelectedMissions(newSelecteds);
      return;
    }
    setSelectedMissions([]);
  };

  const handleDeleteModeToggle = () => {
    setDeleteMode(!deleteMode);
    setSelectedMissions([]);
    setError('');
  };

  const handleConfirmSelections = () => {
    if (selectedMissions.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError('');
    let successCount = 0;
    const failedIds: string[] = [];

    for (const missionId of selectedMissions) {
      try {
        console.log(`Attempting to delete mission: ${missionId} (type: ${missionType})`);
        const missionToDelete = missions.find(m => m._id === missionId); 
        if (!missionToDelete) {
            console.warn(`Mission with ID ${missionId} not found in current list.`);
            continue; 
        }
        await api.delete(`/missions/${missionToDelete.mission_type}/${missionId}`);
        successCount++;
        console.log(`Successfully deleted mission: ${missionId}`);
      } catch (err: any) {
        console.error(`Failed to delete mission ${missionId}:`, err.response?.data || err.message);
        failedIds.push(missionId);
      }
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeleteMode(false); 
    setSelectedMissions([]);

    if (failedIds.length > 0) {
      setError(`Failed to delete ${failedIds.length} mission(s). Please try again.`);
    } else {
      setSuccess(`Successfully deleted ${successCount} mission(s).`);
    }

    fetchMissions();
  };

  const handleCloseDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
  };

  const handleUpdateRequest = (missionId: string) => {
    if (!missionType || !missionId) return;
    navigate(`/mission/${missionType}/${missionId}/edit`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" color="#1a237e">
          {title} Requests
        </Typography>
        <Box>
          {deleteMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleConfirmSelections}
                disabled={selectedMissions.length === 0 || isDeleting}
                sx={{
                  backgroundColor: '#2e7d32',
                  mr: 2,
                  '&:hover': {
                    backgroundColor: '#1b5e20',
                  },
                }}
              >
                Confirm Delete
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={handleDeleteModeToggle}
                disabled={isDeleting}
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
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteModeToggle}
                disabled={isLoading || missions.length === 0}
                sx={{
                  backgroundColor: '#d32f2f',
                  mr: 2,
                  '&:hover': {
                    backgroundColor: '#b71c1c',
                  },
                }}
              >
                Delete Request
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRequest}
                disabled={isLoading}
                sx={{
                  backgroundColor: '#1a237e',
                  '&:hover': {
                    backgroundColor: '#000051',
                  },
                }}
              >
                Add New Request
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="mission requests table">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {deleteMode && (
                <TableCell padding="checkbox">
                   <Checkbox
                    color="primary"
                    indeterminate={
                      selectedMissions.length > 0 && selectedMissions.length < missions.length
                    }
                    checked={missions.length > 0 && selectedMissions.length === missions.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all missions' }}
                  />
                </TableCell>
              )}
              {headers.map((header) => (
                <TableCell key={header} sx={{ fontWeight: 'bold' }}>
                  {header}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', pl: 4 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={headers.length + (deleteMode ? 2 : 1)} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : missions.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={headers.length + (deleteMode ? 2 : 1)} 
                  align="center"
                >
                  No missions found
                </TableCell>
              </TableRow>
            ) : (
              missions.map((mission) => {
                const isItemSelected = isSelected(mission._id);
                return (
                  <TableRow
                    key={mission._id}
                    hover
                    onClick={(event) => deleteMode && handleSelectClick(event, mission._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={deleteMode && isItemSelected}
                  >
                    {deleteMode && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': `mission-checkbox-${mission._id}` }}
                        />
                      </TableCell>
                    )}
                    {fieldKeys.map((key) => (
                      <TableCell key={key}>{mission.details[key] || 'N/A'}</TableCell>
                    ))}
                    <TableCell sx={{ pl: 4 }}>{formatTimestamp(mission.timestamp)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Mission">
                        <IconButton 
                          onClick={(e) => { e.stopPropagation(); handleUpdateRequest(mission._id); }}
                          color="primary"
                          disabled={deleteMode || isDeleting}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={!isDeleting ? handleCloseDialog : undefined}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {selectedMissions.length} selected mission{selectedMissions.length > 1 ? 's' : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            color="primary" 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MissionList;