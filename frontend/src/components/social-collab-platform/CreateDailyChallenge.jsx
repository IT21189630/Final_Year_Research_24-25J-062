import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateDailyChallenge.css';

const CreateDailyChallenge = () => {
  const [formData, setFormData] = useState({
    date: new Date(),
    title: '',
    description: '',
    jscode: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !image) {
      setMessage({ text: 'All fields are required', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const data = new FormData();
      data.append('date', formData.date.toISOString());
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('image', image);
      data.append('jscode', formData.jscode);

      const response = await axios.post('http://localhost:5000/api/dailychallenge', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setMessage({ text: 'Daily challenge created successfully!', type: 'success' });
        setFormData({
          date: new Date(),
          title: '',
          description: '',
          jscode:''
        });
        setImage(null);
        setPreviewUrl('');
      }
    } catch (error) {
      console.error('Error creating daily challenge:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to create daily challenge', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-challenge-container">
      <h1>Create Daily Challenge</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <DatePicker
            id="date"
            selected={formData.date}
            onChange={handleDateChange}
            className="form-control"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter challenge title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="5"
            placeholder="Enter challenge description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="jscode">JS Code</label>
          <textarea
            id="jscode"
            name="jscode"
            value={formData.jscode}
            onChange={handleChange}
            className="form-control"
            rows="5"
            placeholder="Enter js code"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Reference Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            className="form-control"
            accept="image/*"
          />
          
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
};

export default CreateDailyChallenge;