import React from "react";
import Lock from "../../images/placeholder/lock.png";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./milestone.styles.css";

function Milestone(props) {
  const { current_level } = useSelector((state) => state.progress);
  const { level, url } = props;
  const lock = current_level < level;

  const navigate = useNavigate();

  const navigateToLesson = (URL) => {
    navigate(URL);
  };
  return (
    <div className="milestone-container">
      {lock && (
        <div className="level-locker">
          <img src={Lock} alt="lock" className="lvl-lock" />
        </div>
      )}
      <div className="level-navigator" onClick={() => navigateToLesson(url)}>
        <div className="level-content">
          <span className="level-indicator">{level}</span>
        </div>
      </div>
    </div>
  );
}

export default Milestone;
