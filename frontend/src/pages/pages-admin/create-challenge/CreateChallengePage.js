import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Box, Paper, Typography, TextField, 
  Button, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, CircularProgress, Snackbar, Alert
} from '@mui/material';

const CreateChallengePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner'
  });
  const [referenceImage, setReferenceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setErrors({
        ...errors,
        referenceImage: 'Please select an image file (PNG, JPG, JPEG)'
      });
      return;
    }
    
    setReferenceImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear error for this field
    if (errors.referenceImage) {
      setErrors({
        ...errors,
        referenceImage: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!referenceImage) {
      newErrors.referenceImage = 'Reference image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      // Create form data for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('difficultyLevel', formData.difficultyLevel);
      data.append('referenceImage', referenceImage);
      
      await axios.post('http://localhost:5000/api/challenges', data, {
        // headers: {
        //   'Authorization': `Bearer ${token}`,
        //   'Content-Type': 'multipart/form-data'
        // }
      });
      
      setAlert({
        open: true,
        message: 'Challenge created successfully!',
        severity: 'success'
      });
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        difficultyLevel: 'beginner'
      });
      setReferenceImage(null);
      setImagePreview(null);
      
      // Navigate back to admin dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating challenge:', err);
      setAlert({
        open: true,
        message: err.response?.data?.message || 'Failed to create challenge',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Daily Challenge
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              name="title"
              label="Challenge Title"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.title}
              onChange={handleInputChange}
              error={!!errors.title}
              helperText={errors.title}
            />
            
            <TextField
              name="description"
              label="Challenge Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="difficulty-level-label">Difficulty Level</InputLabel>
              <Select
                labelId="difficulty-level-label"
                name="difficultyLevel"
                value={formData.difficultyLevel}
                label="Difficulty Level"
                onChange={handleInputChange}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Reference Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {errors.referenceImage && (
                <FormHelperText error>{errors.referenceImage}</FormHelperText>
              )}
              
              {imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Image Preview:
                  </Typography>
                  <img 
                    src={imagePreview} 
                    alt="Reference Preview" 
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Challenge'}
              </Button>
            </Box>
          </form>
        </Paper>
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

export default CreateChallengePage;