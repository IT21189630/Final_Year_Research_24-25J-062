import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosRecommendationInstance from "../../../axios/axiosRecommendationInstance";
import "./create-recommendation.styles.css";

const CreateRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [missingVectors, setMissingVectors] = useState(0);
  const [formData, setFormData] = useState({
    scope: "",
    lesson_type: "",
    url: "",
    description: "",
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await axiosRecommendationInstance.get("/");
      if (response.data) {
        setRecommendations(response.data);

        // Count recommendations without description_vector
        const missing = response.data.filter(
          (rec) => !rec.description_vector
        ).length;
        setMissingVectors(missing);
      }
    } catch (err) {
      setError("Failed to fetch recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosRecommendationInstance.post("/", formData);

      if (response.data) {
        setSuccess("Recommendation created successfully!");
        setFormData({
          scope: "",
          lesson_type: "",
          url: "",
          description: "",
        });
        fetchRecommendations();
      }
    } catch (err) {
      setError("Failed to create recommendation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulateVectors = async () => {
    if (missingVectors === 0) return;

    setIsPopulating(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.get(
        "http://localhost:8080/recommendation_engine/v1/populate"
      );

      if (response.data) {
        setSuccess("Vector population process started successfully!");
        // Refetch recommendations after a short delay to allow backend processing
        setTimeout(() => {
          fetchRecommendations();
        }, 2000);
      }
    } catch (err) {
      setError("Failed to populate vectors. Please try again.");
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="create-recommendation-container">
      <h1 className="create-recommendation-title">Create Support Lesson</h1>

      {error && <div className="recommendation-error">{error}</div>}
      {success && <div className="recommendation-success">{success}</div>}

      <div className="recommendation-content">
        <div className="recommendation-form-section">
          <form className="recommendation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="scope">Scope*</label>
              <input
                type="text"
                id="scope"
                name="scope"
                value={formData.scope}
                onChange={handleInputChange}
                placeholder="Enter scope"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lesson_type">Lesson Type*</label>
              <select
                id="lesson_type"
                name="lesson_type"
                value={formData.lesson_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Lesson Type</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="interactive">Interactive</option>
                <option value="exercise">Exercise</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="url">URL*</label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="Enter resource URL"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              className="create-recommendation-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Recommendation"}
            </button>
          </form>

          <div className="vector-status-container">
            <div className="vector-status">
              <h3>Description Vector Status</h3>
              <p>
                {missingVectors === 0
                  ? "All recommendations have description vectors."
                  : `${missingVectors} recommendation(s) missing description vectors.`}
              </p>
              <button
                className="populate-vectors-btn"
                onClick={handlePopulateVectors}
                disabled={missingVectors === 0 || isPopulating}
              >
                {isPopulating ? "Populating..." : "Populate Missing Vectors"}
              </button>
            </div>
          </div>
        </div>

        <div className="recent-recommendations-section">
          <h2 className="recent-recommendations-title">
            Recent Recommendations
          </h2>
          {isLoading && recommendations.length === 0 ? (
            <div className="loading-spinner">Loading...</div>
          ) : recommendations.length === 0 ? (
            <div className="no-recommendations">No recommendations found</div>
          ) : (
            <div className="recommendations-list">
              {recommendations.map((recommendation) => (
                <div key={recommendation._id} className="recommendation-card">
                  <h3 className="recommendation-scope">
                    {recommendation.scope}
                  </h3>
                  <div className="recommendation-details">
                    <span className="recommendation-type">
                      Type: {recommendation.lesson_type}
                    </span>
                    <a
                      href={recommendation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="recommendation-url"
                    >
                      View Resource
                    </a>
                  </div>
                  <p className="recommendation-description">
                    {recommendation.description.length > 100
                      ? `${recommendation.description.substring(0, 100)}...`
                      : recommendation.description}
                  </p>
                  <div className="vector-status-indicator">
                    {recommendation.description_vector ? (
                      <span className="vector-present">Vector Present</span>
                    ) : (
                      <span className="vector-missing">Vector Missing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRecommendation;
