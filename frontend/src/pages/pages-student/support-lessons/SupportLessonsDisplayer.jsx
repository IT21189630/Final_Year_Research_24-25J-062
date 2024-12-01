import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import "./support-lessons.styles.css";
import ErrorPage from "../../error-page/ErrorPage";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import axiosInstance from "../../../axios/axiosInstanceSupportLessons";
import SupportLessonCard from "../../../components/support-lesson-card/SupportLessonCard";

function SupportLessonsDisplayer() {
  const { user_id } = useSelector((state) => state.user);
  const [supportLessons, setSupportLessons] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSupportLessons = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/${user_id}`);
      if (response.data) {
        setSupportLessons(response.data);
        setLoading(false);
        toast.success("your support lessons retrieved!");
      }
    } catch (error) {
      setError(true);
      setLoading(false);
      toast.error("Cannot fetch support lessons!");
    }
  };

  useEffect(() => {
    fetchSupportLessons();
  }, [user_id]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorPage />;
  if (!supportLessons) return <LoadingScreen />;

  return (
    <>
      <LoadingScreen />
      <div className="support-lessons-displayer-page-container">
        <div className="filter-container"></div>
        <div className="support-lessons-displayer-container">
          {/* Use optional chaining to safely access properties */}
          <span className="page-headline">Practice Lessons</span>
          <div className="support-lessons-displayer">
            {supportLessons?.length > 0 ? (
              supportLessons.map((lesson, index) => (
                <SupportLessonCard {...lesson} key={index} />
              ))
            ) : (
              <div>No support lessons available.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SupportLessonsDisplayer;
