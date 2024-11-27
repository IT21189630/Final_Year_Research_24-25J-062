import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "./level-displayer.styles.css";
import ErrorPage from "../../error-page/ErrorPage";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";
import Milestone from "../../../components/level-milestone/Milestone";

function LevelDisplayer() {
  const { user_id } = useSelector((state) => state.user);
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchCourseLevels = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceLessonMangement.get(`/courses/${id}`);
      if (response.data) {
        setCourse(response.data);
        setLoading(false);
        toast.success("Course levels loaded!");
        console.log(response.data); // Ensure this logs the correct structure
      }
    } catch (error) {
      setError(true);
      setLoading(false);
      toast.error("Cannot fetch course levels!");
    }
  };

  useEffect(() => {
    fetchCourseLevels();
  }, [user_id]);

  if (loading) return <></>;
  if (error) return <ErrorPage />;
  if (!course) return <div>No course data available.</div>;

  return (
    <>
      <LoadingScreen />
      <div className="level-displayer-page-container">
        <div className="filter-container"></div>
        <div className="level-displayer-container">
          {/* Use optional chaining to safely access properties */}
          <span className="page-headline">{course?.name || "Course Name"}</span>
          <div className="level-displayer">
            {course.lessons?.length > 0 ? (
              course.lessons.map((lesson, index) => (
                <Milestone key={index} {...lesson} />
              ))
            ) : (
              <div>No lessons available.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LevelDisplayer;
