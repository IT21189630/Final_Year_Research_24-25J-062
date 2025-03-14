import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './TodayChallenge.css';

const TodayChallenge = () => {
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

  return (
    <div className="today-challenge-container">
      <h1 className="challenge-title">Today's Challenge</h1>
      
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
          <div className="challenge-image-container">
            <img 
              src={challenge.imageUrl} 
              alt={challenge.title} 
              className="challenge-image" 
            />
          </div>
          
          <div className="challenge-description">
            <p>{challenge.description}</p>
          </div>
        </div>
        
        <div className="challenge-actions">
          <Link to={`/attempt/${challenge._id}`} className="attempt-button">
            Attempt Challenge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TodayChallenge;