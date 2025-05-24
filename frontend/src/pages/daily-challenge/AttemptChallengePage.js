import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Box, Grid, Paper, Typography, 
  Button, CircularProgress, Divider, Snackbar, Alert
} from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

const AttemptChallengePage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setChallenge(response.data.challenge);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setAlert({
          open: true,
          message: 'Failed to load challenge. Please try again.',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  const handleHtmlChange = (value) => {
    setHtmlCode(value);
  };

  const handleCssChange = (value) => {
    setCssCode(value);
  };

  const handlePreview = () => {
    const combinedCode = `
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
    setPreviewCode(combinedCode);
    
    // Update iframe content
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(combinedCode);
      iframeDoc.close();
    }
  };

  const handleSubmit = async () => {
    if (!htmlCode.trim() || !cssCode.trim()) {
      setAlert({
        open: true,
        message: 'Please provide both HTML and CSS code',
        severity: 'warning'
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:5000/api/submissions',
        {
          challengeId,
          htmlCode,
          cssCode
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setScore(response.data.submission.score);
      setAlert({
        open: true,
        message: `Challenge submitted successfully! Your score: ${response.data.submission.score}%`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setAlert({
        open: true,
        message: 'Failed to submit challenge. Please try again.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!challenge) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Challenge not found
          </Typography>
          <Button variant="contained" onClick={() => navigate('/student/dashboard/challenge')}>
            Back to Challenges
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {challenge.title}
        </Typography>
        
        <Grid container spacing={2}>
          {/* Left panel - Challenge info */}
          <Grid item xs={12} md={3}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Challenge Details
              </Typography>
              <Typography variant="body2" paragraph>
                {challenge.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Reference Image:
              </Typography>
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <img 
                  src={`http://localhost:5000/${challenge.referenceImage}`} 
                  alt="Reference" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
              
              {score !== null && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom>
                    Your Score
                  </Typography>
                  <Box 
                    sx={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto',
                      backgroundColor: score > 80 ? '#4caf50' : score > 60 ? '#ff9800' : '#f44336',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h4">{score}%</Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Middle panel - Code editor */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Code Editor
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                HTML
              </Typography>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, mt: 1 }}>
                <CodeMirror
                  value={htmlCode}
                  height="200px"
                  extensions={[html()]}
                  onChange={handleHtmlChange}
                />
              </Box>
              
              <Typography variant="subtitle2" sx={{ mt: 3 }}>
                CSS
              </Typography>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, mt: 1 }}>
                <CodeMirror
                  value={cssCode}
                  height="200px"
                  extensions={[css()]}
                  onChange={handleCssChange}
                />
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={handlePreview}
                >
                  Preview
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Right panel - Preview */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box 
                sx={{ 
                  border: '1px solid #ddd', 
                  height: 'calc(100% - 40px)', 
                  minHeight: '450px',
                  overflow: 'hidden'
                }}
              >
                <iframe
                  ref={iframeRef}
                  title="preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  sandbox="allow-same-origin"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AttemptChallengePage;