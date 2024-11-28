import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./performance-summary-modal.styles.css";

function PerformanceSummaryModal(props) {
  const { course_id } = useSelector((state) => state.progress);
  let { visibility, score } = props;
  const navigate = useNavigate();
  useEffect(() => {
    if (visibility && score) {
      const circularBar = document.querySelector(".score-displayer");
      const progressValue = document.querySelector(".score-indicator");
      const speed = 20;

      let progressStartValue = 0;
      const progress = setInterval(() => {
        progressStartValue++;
        progressValue.textContent = `${progressStartValue}`;
        circularBar.style.background = `conic-gradient(var(--crimson-red) ${
          progressStartValue * 3.6
        }deg, #ededed 0deg)`;

        if (progressStartValue === score) {
          clearInterval(progress);
        }
      }, speed);

      return () => clearInterval(progress);
    }
  }, [visibility, score]);

  const backToCourses = () => {
    navigate(`/student/dashboard/course/levels/${course_id}`);
  };

  return (
    visibility && (
      <div className="ps-modal-container">
        <div className="ps-modal-area">
          <h4 className="modal-header">
            Bravo! You've Mastered the Challenge! 🎉
          </h4>
          <div className="score-displayer">
            <span className="score-indicator"></span>
            <span className="score-indicator-tail">pts</span>
          </div>
          <p className="summary-para">
            You have completed the challenge and your performance score is
            <b> {score} points</b>. Kep up the good work! Complete challenge in
            less time and first attempt to gain more points.
          </p>

          <button onClick={backToCourses} className="modal-close-btn">
            Back to Course
          </button>
        </div>
      </div>
    )
  );
}

export default PerformanceSummaryModal;
