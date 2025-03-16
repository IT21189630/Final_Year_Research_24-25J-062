import React, { useState, useEffect } from "react";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";
import "./create-course.styles.css";

const CreateCourse = () => {
  const [recentLessons, setRecentLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    price: 0,
    prerequisites: "none",
    image:
      "https://firebasestorage.googleapis.com/v0/b/image-uploading-c4e7e.appspot.com/o/comic-astro-3.png?alt=media&token=cb40bb99-3fd8-4305-b49a-64e07ae3d134",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAllLessons();
  }, []);

  const getAllLessons = async () => {
    setIsLoading(true);
    try {
      const lessonRetrievalResponse = await axiosInstanceLessonMangement.get(
        "/lessons"
      );
      if (lessonRetrievalResponse.data) {
        setRecentLessons(lessonRetrievalResponse.data);
      }
    } catch (error) {
      setError("Failed to fetch lessons. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLesson = (lesson) => {
    if (!selectedLessons.some((l) => l._id === lesson._id)) {
      setSelectedLessons([...selectedLessons, lesson]);
    }
  };

  const handleRemoveLesson = (lessonId) => {
    setSelectedLessons(
      selectedLessons.filter((lesson) => lesson._id !== lessonId)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (
      !courseData.name ||
      !courseData.description ||
      selectedLessons.length === 0
    ) {
      setError(
        "Please fill in all required fields and add at least one lesson"
      );
      setIsLoading(false);
      return;
    }

    const lessonIds = selectedLessons.map((lesson) => lesson._id);

    console.log({
      ...courseData,
      lessons: lessonIds,
    });

    try {
      const response = await axiosInstanceLessonMangement.post("/courses", {
        ...courseData,
        lessons: lessonIds,
      });

      if (response.data) {
        setSuccess("Course created successfully!");
        // Reset form
        setCourseData({
          name: "",
          description: "",
          price: 0,
          prerequisites: "none",
          image: "",
        });
        setSelectedLessons([]);
      }
    } catch (error) {
      setError("Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setCourseData({
      ...courseData,
      image: e.target.files[0]?.name || "",
    });
  };

  return (
    <div className="create-course-container">
      <h1 className="create-course-title">Create New Course</h1>

      {error && <div className="create-course-error">{error}</div>}
      {success && <div className="create-course-success">{success}</div>}

      <div className="create-course-content">
        <div className="create-course-form-section">
          <form className="create-course-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Course Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={courseData.name}
                onChange={handleInputChange}
                placeholder="Enter course name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={courseData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prerequisites">Prerequisites</label>
              <input
                type="text"
                id="prerequisites"
                name="prerequisites"
                value={courseData.prerequisites}
                onChange={handleInputChange}
                placeholder="Enter prerequisites"
              />
            </div>

            {/* <div className="form-group">
              <label htmlFor="image">Course Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div> */}

            <h3 className="selected-lessons-title">Selected Lessons</h3>
            {selectedLessons.length === 0 ? (
              <div className="no-lessons">No lessons selected</div>
            ) : (
              <ul className="selected-lessons-list">
                {selectedLessons.map((lesson, index) => (
                  <li key={lesson._id} className="selected-lesson-item">
                    <span className="lesson-number">{index + 1}.</span>
                    <span className="lesson-title">{lesson.title}</span>
                    <button
                      type="button"
                      className="remove-lesson-btn"
                      onClick={() => handleRemoveLesson(lesson._id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              className="create-course-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Course"}
            </button>
          </form>
        </div>

        <div className="available-lessons-section">
          <h2 className="available-lessons-title">Available Lessons</h2>
          {isLoading && !recentLessons.length ? (
            <div className="loading">Loading lessons...</div>
          ) : (
            <div className="lessons-list">
              {recentLessons.map((lesson) => (
                <div key={lesson._id} className="lesson-card">
                  <div className="lesson-info">
                    <h3 className="lesson-title">{lesson.title}</h3>
                    <span className="lesson-level">
                      Level: {lesson.level || "Beginner"}
                    </span>
                  </div>
                  <button
                    className="add-lesson-btn"
                    onClick={() => handleAddLesson(lesson)}
                    disabled={selectedLessons.some((l) => l._id === lesson._id)}
                  >
                    {selectedLessons.some((l) => l._id === lesson._id)
                      ? "ADDED"
                      : "ADD"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
