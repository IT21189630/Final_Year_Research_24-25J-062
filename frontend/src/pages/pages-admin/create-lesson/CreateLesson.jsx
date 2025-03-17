import React, { useState, useEffect } from "react";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";
import "./create-lesson.styles.css";

const CreateLesson = () => {
  const [recentLessons, setRecentLessons] = useState([]);
  const getAllLessons = async () => {
    try {
      const lessonRetrievalResponse = await axiosInstanceLessonMangement.get(
        "/lessons"
      );
      if (lessonRetrievalResponse.data) {
        setRecentLessons(lessonRetrievalResponse.data);
      }
    } catch (error) {}
  };

  const [formData, setFormData] = useState({
    title: "",
    url: [""],
    description: "",
    level: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getAllLessons();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "level" ? parseInt(value, 10) : value,
    });
  };

  const handleUrlChange = (index, value) => {
    const updatedUrls = [...formData.url];
    updatedUrls[index] = value;
    setFormData({
      ...formData,
      url: updatedUrls,
    });
  };

  const addUrlField = () => {
    setFormData({
      ...formData,
      url: [...formData.url, ""],
    });
  };

  const removeUrlField = (index) => {
    if (formData.url.length > 1) {
      const updatedUrls = formData.url.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        url: updatedUrls,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validUrls = formData.url.filter((url) => url.trim() !== "");
    if (validUrls.length === 0) {
      setMessage("Error: At least one valid URL is required.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const submissionData = {
      ...formData,
      url: validUrls,
    };

    try {
      const response = await axiosInstanceLessonMangement.post(
        "/lessons",
        submissionData
      );
      if (response.data) {
        setMessage("Lesson created successfully!");
        setFormData({
          title: "",
          url: [""],
          description: "",
          level: 1,
        });
        // Refresh the lessons list
        getAllLessons();
      }
    } catch (error) {
      setMessage(`Error creating lesson: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lesson-management-container">
      <div className="lesson-form-container">
        <h2 className="lesson-form-title">Create New Lesson</h2>

        {message && (
          <div
            className={`lesson-form-message ${
              message.includes("Error")
                ? "lesson-form-error"
                : "lesson-form-success"
            }`}
          >
            {message}
          </div>
        )}

        <form className="lesson-form" onSubmit={handleSubmit}>
          <div className="lesson-form-field">
            <label htmlFor="lesson-title" className="lesson-form-label">
              Title
            </label>
            <input
              type="text"
              id="lesson-title"
              name="title"
              className="lesson-form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="lesson-form-field">
            <label className="lesson-form-label">URLs</label>
            {formData.url.map((url, index) => (
              <div key={index} className="lesson-url-input-group">
                <input
                  type="text"
                  className="lesson-form-input"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="Enter URL"
                  required={index === 0} // Only the first URL is required
                />
                <div className="lesson-url-buttons">
                  <button
                    type="button"
                    className="url-add-button"
                    onClick={addUrlField}
                  >
                    +
                  </button>
                  {formData.url.length > 1 && (
                    <button
                      type="button"
                      className="url-remove-button"
                      onClick={() => removeUrlField(index)}
                    >
                      -
                    </button>
                  )}
                </div>
              </div>
            ))}
            <span className="lesson-form-hint">
              Add one or more URLs for this lesson
            </span>
          </div>

          <div className="lesson-form-field">
            <label htmlFor="lesson-level" className="lesson-form-label">
              Level
            </label>
            <input
              type="number"
              id="lesson-level"
              name="level"
              className="lesson-form-input"
              value={formData.level}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="lesson-form-field">
            <label htmlFor="lesson-description" className="lesson-form-label">
              Description
            </label>
            <textarea
              id="lesson-description"
              name="description"
              className="lesson-form-textarea"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="lesson-form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Lesson"}
          </button>
        </form>
      </div>

      <div className="recent-lessons-container">
        <h3 className="recent-lessons-title">Recently Created Lessons</h3>
        <div className="recent-lessons-list">
          {recentLessons.length > 0 ? (
            recentLessons.reverse().map((lesson) => (
              <div key={lesson._id} className="recent-lesson-item">
                <h4 className="recent-lesson-title">{lesson.title}</h4>
                <div className="recent-lesson-level">Level: {lesson.level}</div>
                {lesson.url ? (
                  <div className="recent-lesson-urls">
                    <span className="recent-lesson-urls-label">
                      Description:
                    </span>
                    {/* <ul className="recent-lesson-url-list">
                      {lesson.url.map((url, index) => (
                        <li key={index} className="recent-lesson-url-item">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Resource {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul> */}
                  </div>
                ) : (
                  <div className="recent-lesson-url">
                    <a
                      href={lesson.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Lesson
                    </a>
                  </div>
                )}
                <p className="recent-lesson-description">
                  {lesson.description}
                </p>
              </div>
            ))
          ) : (
            <p className="recent-lessons-empty">No recent lessons found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
