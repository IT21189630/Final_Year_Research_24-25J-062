import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Spinner from '../layout/Spinner';

const ChallengeList = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await axios.get('http://localhost:5000/gamified-learning/api/submission-management/challenges');
        setChallenges(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="challenge-list">
      <h2>Available Challenges</h2>
      {challenges.length === 0 ? (
        <p>No challenges available at the moment.</p>
      ) : (
        <div className="challenge-grid">
          {challenges.map(challenge => (
            <div key={challenge._id} className="challenge-card">
              <h3>{challenge.title}</h3>
              <div className="challenge-image">
                <img src={`/${challenge.referenceImagePath}`} alt={challenge.title} />
              </div>
              <p className="challenge-difficulty">Difficulty: {challenge.difficulty}</p>
              <Link to={`/challenge/${challenge._id}`} className="btn btn-primary">
                Take Challenge
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeList;