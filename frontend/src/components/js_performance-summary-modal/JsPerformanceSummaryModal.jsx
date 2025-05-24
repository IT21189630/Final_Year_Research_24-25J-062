import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaSpinner } from "react-icons/fa";
import "./js-performance-summary-modal.styles.css";

function JsPerformanceSummaryModal(props) {
	const { course_id } = useSelector((state) => state.progress);
	let { visibility, score, aiFeedback, loadingFeedback } = props;
	const navigate = useNavigate();

	useEffect(() => {
		if (visibility && score) {
			const circularBar = document.querySelector(".js-score-displayer");
			const progressValue = document.querySelector(".js-score-indicator");
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
		navigate(`/student/dashboard/overview`);
	};

	return (
		visibility && (
			<div className="js-modal-container">
				<div className="js-modal-area">
					<h4 className="js-modal-header">
						🚀 Mission Accomplished, Space Cadet! 🎉
					</h4>
					<div className="js-score-displayer">
						<span className="js-score-indicator"></span>
						<span className="js-score-indicator-tail">pts</span>
					</div>
					<p className="js-summary-para">
						Outstanding work! You've successfully completed your
						JavaScript mission and earned
						<b> {score} points</b>. Your coding skills are evolving
						rapidly! Complete future missions faster and with fewer
						hints to unlock even higher scores.
					</p>

					{/* AI Feedback Section */}
					<div className="js-ai-feedback-section">
						<div className="js-ai-feedback-header">
							<FaRobot className="js-ai-icon" />
							<span>AI Mission Analyst</span>
						</div>
						<div className="js-ai-feedback-content">
							{loadingFeedback ? (
								<div className="js-loading-feedback">
									<FaSpinner className="js-spinner" />
									<span>
										Analyzing your mission performance...
									</span>
								</div>
							) : aiFeedback ? (
								<p className="js-ai-feedback-text">
									{aiFeedback}
								</p>
							) : (
								<p className="js-ai-feedback-text">
									Excellent work completing this JavaScript
									mission! Your coding journey is off to a
									great start.
								</p>
							)}
						</div>
					</div>

					<button
						onClick={backToCourses}
						className="js-modal-close-btn"
					>
						Return to Mission Control
					</button>
				</div>
			</div>
		)
	);
}

export default JsPerformanceSummaryModal;
