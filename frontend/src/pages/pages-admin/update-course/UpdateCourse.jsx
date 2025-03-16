import React, { useState, useEffect } from "react";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";
import "./update-course.styles.css";

const UpdateCourse = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [recentLessons, setRecentLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingCourseDetails, setIsLoadingCourseDetails] = useState(false);
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    price: 0,
    prerequisites: "none",
    image: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAllCourses();
    getAllLessons();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      getCourseDetails(selectedCourseId);
    }
  }, [selectedCourseId]);

  const getAllCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const coursesResponse = await axiosInstanceLessonMangement.get(
        "/courses"
      );
      if (coursesResponse.data) {
        setCourses(coursesResponse.data);
      }
    } catch (error) {
      setError("Failed to fetch courses. Please try again.");
    } finally {
      setIsLoadingCourses(false);
    }
  };

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

  const getCourseDetails = async (courseId) => {
    setIsLoadingCourseDetails(true);
    setError("");
    try {
      const courseResponse = await axiosInstanceLessonMangement.get(
        `/courses/${courseId}`
      );
      if (courseResponse.data) {
        const course = courseResponse.data;

        // Set course data
        setCourseData({
          name: course.name || "",
          description: course.description || "",
          price: course.price || 0,
          prerequisites: course.prerequisites || "none",
          image: course.image || "",
        });

        // Find and set selected lessons
        if (course.lessons && Array.isArray(course.lessons)) {
          const lessonDetails = [];

          // If lessons are objects with full details
          if (
            course.lessons.length > 0 &&
            typeof course.lessons[0] === "object"
          ) {
            setSelectedLessons(course.lessons);
          }
          // If lessons are just IDs, we need to find the corresponding lessons
          else {
            for (const lessonId of course.lessons) {
              const lessonDetail = recentLessons.find(
                (lesson) => lesson._id === lessonId
              );
              if (lessonDetail) {
                lessonDetails.push(lessonDetail);
              }
            }
            setSelectedLessons(lessonDetails);
          }
        } else {
          setSelectedLessons([]);
        }
      }
    } catch (error) {
      setError("Failed to fetch course details. Please try again.");
    } finally {
      setIsLoadingCourseDetails(false);
    }
  };

  const handleCourseSelect = (e) => {
    const courseId = e.target.value;
    setSelectedCourseId(courseId);
  };

  const handleAddLesson = (lesson) => {
    // Check if lesson is already added
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

    if (!selectedCourseId) {
      setError("Please select a course to update");
      return;
    }

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

    // Extract lesson IDs for the API call
    const lessonIds = selectedLessons.map((lesson) => lesson._id);

    try {
      const response = await axiosInstanceLessonMangement.put(
        `/courses/${selectedCourseId}`,
        {
          ...courseData,
          lessons: lessonIds,
        }
      );

      if (response.data) {
        setSuccess("Course updated successfully!");
      }
    } catch (error) {
      setError("Failed to update course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    // In a real implementation, you would handle file upload here
    // For now, we'll just store the file name
    setCourseData({
      ...courseData,
      image: e.target.files[0]?.name || "",
    });
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newSelectedLessons = [...selectedLessons];
    [newSelectedLessons[index - 1], newSelectedLessons[index]] = [
      newSelectedLessons[index],
      newSelectedLessons[index - 1],
    ];
    setSelectedLessons(newSelectedLessons);
  };

  const handleMoveDown = (index) => {
    if (index === selectedLessons.length - 1) return;
    const newSelectedLessons = [...selectedLessons];
    [newSelectedLessons[index], newSelectedLessons[index + 1]] = [
      newSelectedLessons[index + 1],
      newSelectedLessons[index],
    ];
    setSelectedLessons(newSelectedLessons);
  };

  return (
    <div className="update-course-container">
      <h1 className="update-course-title">Update Course</h1>

      <div className="course-selection-container">
        <label htmlFor="course-select">Select a Course to Update:</label>
        <select
          id="course-select"
          value={selectedCourseId}
          onChange={handleCourseSelect}
          disabled={isLoadingCourses}
          className="course-select"
        >
          <option value="">-- Select a Course --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name}
            </option>
          ))}
        </select>
        {isLoadingCourses && <div className="spinner"></div>}
      </div>

      {error && <div className="update-course-error">{error}</div>}
      {success && <div className="update-course-success">{success}</div>}

      {isLoadingCourseDetails ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading course details...</p>
        </div>
      ) : selectedCourseId ? (
        <div className="update-course-content">
          <div className="update-course-form-section">
            <form className="update-course-form" onSubmit={handleSubmit}>
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

              <div className="form-group">
                <label htmlFor="image">Course Image</label>
                {/* <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                /> */}
                {courseData.image && (
                  <div className="current-image">
                    <p>Current image: {courseData.image}</p>
                  </div>
                )}
              </div>

              <h3 className="selected-lessons-title">Current Course Lessons</h3>
              {selectedLessons.length === 0 ? (
                <div className="no-lessons">No lessons selected</div>
              ) : (
                <ul className="selected-lessons-list">
                  {selectedLessons.map((lesson, index) => (
                    <li key={lesson._id} className="selected-lesson-item">
                      <span className="lesson-number">{index + 1}.</span>
                      <span className="lesson-title">{lesson.title}</span>
                      <div className="lesson-actions">
                        <button
                          type="button"
                          className="move-btn move-up"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="move-btn move-down"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === selectedLessons.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="remove-lesson-btn"
                          onClick={() => handleRemoveLesson(lesson._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="submit"
                className="update-course-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Course"}
              </button>
            </form>
          </div>

          <div className="available-lessons-section">
            <h2 className="available-lessons-title">Available Lessons</h2>
            {isLoading && !recentLessons.length ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading lessons...</p>
              </div>
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
                      disabled={selectedLessons.some(
                        (l) => l._id === lesson._id
                      )}
                    >
                      {selectedLessons.some((l) => l._id === lesson._id)
                        ? "Added"
                        : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="select-course-prompt">
          Please select a course from the dropdown to update its details.
        </div>
      )}
    </div>
  );
};

export default UpdateCourse;
