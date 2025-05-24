import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Spinner from '../layout/Spinner';
import SubmissionForm from '../submission/SubmissionForm';

const ChallengeDetail = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/gamified-learning/api/submission-management/challenges/${id}`);
        setChallenge(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  // if (loading) {
  //   return <Spinner />;
  // }

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  return (
    <div className="challenge-detail">
      <h2>{challenge.title}</h2>
      <div className="challenge-info">
        <div className="reference-image">
          <h3>Reference Image</h3>
          <img src={`/${challenge.referenceImagePath}`} alt={challenge.title} />
        </div>
        <div className="challenge-description">
          <h3>Description</h3>
          <p>{challenge.description}</p>
          <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
        </div>
      </div>
      <div className="submission-section">
        <h3>Submit Your Solution</h3>
        <SubmissionForm challengeId={challenge._id} />
      </div>
    </div>
  );
};

export default ChallengeDetail;