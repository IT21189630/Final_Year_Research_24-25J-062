import React from "react";
import Lock from "../../images/placeholder/lock.png";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { mountLesson } from "../../features/Lesson.slice";
import "./milestone.styles.css";

function Milestone(props) {
  const { current_level } = useSelector((state) => state.progress);
  const { level, url, _id } = props;
  const lock = current_level < level;
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const lessonNavigator = (URL, lessonId) => {
    navigate(URL);
    dispatch(
      mountLesson({
        lesson_id: lessonId,
      })
    );
  };

  return (
    <div className="milestone-container">
      {level % 5 == 0 && <div className="cp-indicator">cp</div>}
      {lock && (
        <div className="level-locker">
          <img src={Lock} alt="lock" className="lvl-lock" />
        </div>
      )}
      <div
        className="level-navigator"
        onClick={() => lessonNavigator(url, _id)}
      >
        <div className="level-content">
          <span className="level-indicator">{level}</span>
        </div>
      </div>
    </div>
  );
}

export default Milestone;
