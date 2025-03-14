import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Paper } from '@mui/material';

const DailyChallengePage = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentChallenge = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:5000/api/challenges/current', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setChallenge(response.data.challenge);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load today\'s challenge. Please try again later.');
        setLoading(false);
      }
    };

    fetchCurrentChallenge();
  }, []);

  const handleAttemptChallenge = () => {
    navigate(`/student/dashboard/attempt-challenge/${challenge._id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  if (!challenge) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No active challenge available
          </Typography>
          <Typography variant="body1">
            Check back later for today's HTML/CSS challenge.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Today's Challenge
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            {challenge.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {challenge.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img 
              src={`http://localhost:5000/${challenge.referenceImage}`} 
              alt="Challenge Reference" 
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleAttemptChallenge}
            >
              Attempt Challenge
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DailyChallengePage;