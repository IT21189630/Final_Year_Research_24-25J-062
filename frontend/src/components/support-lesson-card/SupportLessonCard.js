import React from "react";
import { formatDistance } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./support-lesson-card.styles.css";
import { FaPlay } from "react-icons/fa";

function SupportLessonCard(props) {
  const navigate = useNavigate();
  const { recommendation_id, createdAt } = props;
  const { scope, lesson_type, url, description } = recommendation_id;
  const createdDate = formatDistance(new Date(createdAt), new Date(), {
    addSuffix: true,
  });
  const difficulty = lesson_type.split(" ")[1];

  const DifficultBadge = () => {
    return <div className="badge hard">Hard</div>;
  };

  const EasyBadge = () => {
    return <div className="badge easy">Easy</div>;
  };

  const goToLesson = (url) => {
    navigate(url);
  };

  return (
    <div className="sl-card-container">
      <div className="top-row">
        <span className="sl-name">{scope}</span>
        <span className="sl-difficulty-badge">
          {difficulty.toLowerCase().includes("easy") ? (
            <EasyBadge />
          ) : (
            <DifficultBadge />
          )}
        </span>
      </div>
      <div className="bottom-row">
        <span className="sl-desc">{description.substr(0, 118)}</span>
      </div>
      <div className="sl-nav-btn" onClick={() => goToLesson(url)}>
        <FaPlay className="sl-play-icon" />
        <span>Play</span>
      </div>
      <span className="sl-date-notification">{createdDate}</span>
    </div>
  );
}

export default SupportLessonCard;
