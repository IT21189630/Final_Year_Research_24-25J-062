import React from "react";
import Lock from "../../images/placeholder/lock.png";
import Logo from "../../images/logo/log-var-6.png";
import axiosInstanceLessonMangement from "../../axios/axiosInstanceLessonMangement";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import "./course-card.css";

function CourseCard(props) {
  const { name, visibility, image, index, description, price, _id } = props;

  const { user_id } = useSelector((state) => state.user);

  const enrollCourse = async (courseId, userId) => {
    try {
      const response = await axiosInstanceLessonMangement.post(
        "/progress/create",
        { courseId, userId }
      );
      if (response.data) {
        toast.success("You have enrolled to the course!");
      }
    } catch (error) {
      toast.error(
        error.response.data ? error.response.data.message : "Enrollment Failed!"
      );
    }
  };
  return (
    <div className="course-card-container">
      <div className="ribbon">
        <span>Level {index + 1}</span>
      </div>
      {!visibility && (
        <div className="course-lock-scrn">
          <img src={Lock} alt="lock-icon" className="lock-icon" />
          <span className="lock-scrn-text">Locked!</span>
        </div>
      )}
      <div className="course-info-container">
        <div className="front-row-options">
          <img src={Logo} className="logo-card" />
        </div>
        <div className="course-image-container">
          <img src={image} alt="course-image" className="course-image" />
          <div className="support-circle"></div>
        </div>
        <span className="level-counter">Level {index + 1}</span>
        <span className="level-name">{name}</span>
        <p className="course-description">
          {description.substr(0, 150)}
          <span className="fw-medium"> See More...</span>
        </p>
        <div className="course-price-container">
          <span className="price-prompt">
            Enroll to this level for {price > 0 ? `$${price}.00` : "Free"}
          </span>
          {price > 0 ? (
            <button className="enroll-btn">Buy Now</button>
          ) : (
            <button
              className="enroll-btn"
              onClick={() => enrollCourse(_id, user_id)}
            >
              Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
