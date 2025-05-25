// TodayChallenge.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './TodayChallenge.css';

const TodayChallenge = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayChallenge = async () => {
      try {
        setLoading(true);
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        const response = await axios.get(`http://localhost:5000/api/dailychallenge/today`);
        
        if (response.data) {
          setChallenge(response.data);
        } else {
          setError('No challenge found for today');
        }
      } catch (err) {
        console.error('Error fetching today\'s challenge:', err);
        setError('Failed to load today\'s challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayChallenge();
  }, []);

  if (loading) {
    return <div className="challenge-loading">Loading today's challenge...</div>;
  }

  if (error) {
    return <div className="challenge-error">{error}</div>;
  }

  if (!challenge) {
    return <div className="no-challenge">No challenge available for today</div>;
  }

  // Function to preserve line breaks from database
  const formatDescription = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="today-challenge-container">
      <div className="title-container">
        <button 
          className="back-button" 
          onClick={() => navigate('/student/dashboard/')}
          aria-label="Back to Today's Challenge"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="challenge-title">Today's Challenge</h1>
      </div>
      
      
      <div className="challenge-card">
        <div className="challenge-header">
          <h2>{challenge.title}</h2>
          <div className="challenge-date">
            {new Date(challenge.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <div className="challenge-content">
          <div className="challenge-flex-container">
            <div className="challenge-image-container">
              <img 
                src={challenge.imageUrl} 
                alt={challenge.title} 
                className="challenge-image" 
              />
            </div>
            
            <div className="challenge-description">
              {formatDescription(challenge.description)}
            </div>
          </div>
        </div>
        
        <div className="challenge-actions">
          <Link to={`/student/dashboard/attempt/${challenge._id}`} className="attempt-button">
            Attempt Challenge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TodayChallenge;