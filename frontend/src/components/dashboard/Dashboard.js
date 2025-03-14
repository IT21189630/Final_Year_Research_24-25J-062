import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';

const Dashboard = () => {
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/gamified-learning/api/submission-management/submissions/user');
        setUserSubmissions(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user submissions:', err);
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="dashboard">
      <h2>Your Dashboard</h2>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Submissions</h3>
          <p className="summary-value">{userSubmissions.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Score</h3>
          <p className="summary-value">
            {userSubmissions.length > 0 
              ? Math.round(userSubmissions.reduce((sum, sub) => sum + sub.similarityScore, 0) / userSubmissions.length) 
              : 0}%
          </p>
        </div>
      </div>
      
      <div className="recent-submissions">
        <h3>Recent Submissions</h3>
        {userSubmissions.length === 0 ? (
          <p>You haven't submitted any solutions yet.</p>
        ) : (
          <div className="submission-list">
            {userSubmissions.map(submission => (
              <div key={submission._id} className="submission-card">
                <div className="submission-header">
                  <h4>{submission.challenge.title}</h4>
                  <span className="submission-date">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="submission-content">
                  <div className="submission-images">
                    <div className="image-container">
                      <img src={`/${submission.submissionImagePath}`} alt="Your submission" />
                      <p>Your Submission</p>
                    </div>
                  </div>
                  <div className="submission-details">
                    <div className="score">
                      <span className="score-label">Score:</span>
                      <span className="score-value">{submission.similarityScore}%</span>
                    </div>
                    <div className="feedback">
                      <p>{submission.feedback}</p>
                    </div>
                    <Link to={`/challenge/${submission.challenge._id}`} className="btn btn-secondary">
                      Try Again
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="action-buttons">
        <Link to="/challenges" className="btn btn-primary">
          Browse Challenges
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;