import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { HiSparkles } from "react-icons/hi2";
import "./level-displayer.styles.css";
import ErrorPage from "../../error-page/ErrorPage";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";
import Milestone from "../../../components/level-milestone/Milestone";

function LevelDisplayer() {
  const { user_id } = useSelector((state) => state.user);
  const { current_level } = useSelector((state) => state.progress);
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const fetchCourseLevels = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceLessonMangement.get(`/courses/${id}`);
      if (response.data) {
        setCourse(response.data);
        setProgressPercentage(
          ((current_level - 1) / response.data.lessons.length) * 100
        );
        setLoading(false);
        toast.success("Your progress levels fetched!");
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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorPage />;
  if (!course) return <LoadingScreen />;

  return (
    <>
      <LoadingScreen />
      <div className="level-displayer-page-container">
        <div className="filter-container"></div>
        <div className="ld-main-cont">
          <div className="level-displayer-container">
            <span className="page-headline">
              {course?.name || "Course Name"}
            </span>
            <div className="level-displayer">
              {course.lessons?.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <Milestone key={index} {...lesson} />
                ))
              ) : (
                <div>No lessons available.</div>
              )}
            </div>
            <div className="cp-alert-box">
              <div className="cp-placeholder">cp</div>
              <span>
                Lesson Checkpoints: These checkpoints will test your performance
                and recommend you mini-projects, quizzes that you can sharp your
                skills or gain more knowledge.
              </span>
            </div>
          </div>
          <div className="ld-stat-box">
            <div className="ld-course-progress-container">
              <span className="ld-progress-label">
                <HiSparkles className="ld-spark" />
                Course Progress:{" "}
                <span className="ld-curr-progress">
                  Completed {current_level - 1} out of {course.lessons.length}
                </span>
              </span>
              <div className="ld-enr-progress-bar-cont">
                <div
                  className="ld-enr-filled-bar"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                <div className="ld-enr-full-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LevelDisplayer;
