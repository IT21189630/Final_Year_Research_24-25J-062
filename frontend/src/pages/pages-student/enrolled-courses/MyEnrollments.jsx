import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import "./my-enrollments.styles.css";
import ErrorPage from "../../error-page/ErrorPage";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import axiosInstanceLessonMangement from "../../../axios/axiosInstanceLessonMangement";
import EnrollmentCard from "../../../components/enrollment-card/EnrollmentCard";

function MyEnrollments() {
  const { user_id } = useSelector((state) => state.user);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchUserEnrollments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstanceLessonMangement.get(
        `/progress/user/${user_id}`
      );
      if (response.data) {
        console.log(response.data);
        setEnrolledCourses(response.data);
        setLoading(false);
        toast.success("User enrollments fetched!");
      }
    } catch (error) {
      setError(true);
      toast.error("Can not fetch user enrollments!");
    }
  };

  useEffect(() => {
    fetchUserEnrollments();
  }, [user_id]);

  return (
    <>
      <LoadingScreen />
      <div className="enrollments-page-container">
        <div className="filter-container"></div>
        <div className="enrollments-content-container">
          <span className="page-headline">My Enrollments</span>
          {error || loading ? (
            <ErrorPage />
          ) : (
            <div className="enrolled-course-info-container">
              {enrolledCourses?.length > 0 ? (
                enrolledCourses.map((course, index) => {
                  return <EnrollmentCard key={index} {...course} />;
                })
              ) : (
                <div> No enrolled courses available </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyEnrollments;
