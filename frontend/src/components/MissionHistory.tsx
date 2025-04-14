import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import axios from 'axios';

interface MissionHistoryItem {
  mission: string;
  details: Record<string, string>;
  submitted_by: string;
  submitted_at: string;
}

const MissionHistory = () => {
  const [history, setHistory] = useState<MissionHistoryItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMissionHistory();
  }, []);

  const fetchMissionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/missions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (err) {
      setError('Failed to load mission history');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Mission History
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mission Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Submitted At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.mission}</TableCell>
                  <TableCell>
                    {Object.entries(item.details).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>{item.submitted_by}</TableCell>
                  <TableCell>{formatDate(item.submitted_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default MissionHistory; 