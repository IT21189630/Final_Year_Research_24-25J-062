import React from "react";
import "./enrollment-card.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { save } from "../../features/Progress.slice";
import { HiSparkles } from "react-icons/hi2";
import { FaPlay } from "react-icons/fa";

function EnrollmentCard(props) {
  const dispatch = useDispatch();
  const { course_id, current_level } = props;
  const { _id, image, description, lessons, name } = course_id;
  const progressPercentage = ((current_level - 1) / lessons.length) * 100;

  const navigate = useNavigate();

  const gotoLevelsPage = (courseID) => {
    navigate(`/student/dashboard/course/levels/${courseID}`);
    dispatch(
      save({
        current_level,
        course_id: _id,
        course_name: name,
      })
    );
  };

  return (
    <div className="enrollment-card-container">
      {/* course image */}
      <div className="enr-course-image-cont">
        <img
          src={image}
          alt="enrolled-course-image"
          className="enr-course-image"
        />
        <div className="enr-support-cirle"></div>
      </div>
      {/* course information */}
      <div className="enr-course-content">
        <span className="enr-course-name">{name}</span>
        <p className="enr-course-description">
          <span>About the level:</span>
          {description.substr(0, 150)}
        </p>
        <div className="bottom-ribbon">
          {/* first-col */}
          <div className="enr-course-progress-container">
            <span className="progress-label">
              <HiSparkles className="spark" />
              Course Progress:{" "}
              <span className="curr-progress">
                Completed {current_level - 1} out of {lessons.length}
              </span>
            </span>
            <div className="enr-progress-bar-cont">
              <div
                className="enr-filled-bar"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              <div className="enr-full-bar"></div>
            </div>
          </div>
          {/* second-col */}
          <div
            className="course-nav-btn-cont"
            onClick={() => gotoLevelsPage(_id)}
          >
            <FaPlay className="play-icon" />
            <span>Continue</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentCard;
