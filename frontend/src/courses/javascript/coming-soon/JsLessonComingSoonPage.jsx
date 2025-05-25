import React from "react";
import { useNavigate } from "react-router-dom";
import SpaceBackground from "../../../images/js-lessons/space-station-bg.png";
import AstronautGuide from "../../../images/js-lessons/js-upcoming-image.PNG";
import "./js-lesson-coming-soon.styles.css";

function JsLessonComingSoonPage({ lessonNumber, lessonTitle, learningPoints }) {
	const navigate = useNavigate();

	const goBackToMissions = () => {
		navigate("/student/dashboard/js-courses");
	};

	return (
		<div className="js-coming-soon-main-container">
			<div className="js-coming-soon-container">
				<div
					className="js-coming-soon-background"
					style={{ backgroundImage: `url(${SpaceBackground})` }}
				>
					<div className="js-coming-soon-content">
						<div className="js-coming-soon-astronaut-section">
							<img
								className="js-coming-soon-astronaut-guide"
								src={AstronautGuide}
								alt="astronaut-guide"
							/>
						</div>

						<div className="js-coming-soon-mission-info">
							<h1 className="js-coming-soon-mission-title">
								🚀 JS Mission-
								{lessonNumber.toString().padStart(2, "0")}
							</h1>
							<h2 className="js-coming-soon-mission-subtitle">
								{lessonTitle}
							</h2>

							<div className="js-coming-soon-badge">
								⏰ COMING SOON ⏰
							</div>

							<p className="js-coming-soon-description">
								Space Cadet, your next mission is currently
								being prepared by our space engineers! In
								Mission-
								{lessonNumber.toString().padStart(2, "0")},
								you'll master advanced JavaScript concepts to
								control your spacecraft.
							</p>

							<div className="js-coming-soon-mission-preview">
								<h3>🛸 What You'll Learn:</h3>
								<ul>
									{learningPoints.map((point, index) => (
										<li key={index}>{point}</li>
									))}
								</ul>
							</div>

							<div className="js-coming-soon-action-buttons">
								<button
									className="js-coming-soon-back-btn"
									onClick={goBackToMissions}
								>
									Return to Mission Control
								</button>
							</div>

							<div className="js-coming-soon-status-message">
								<p>
									✨ Complete previous missions and stay tuned
									for the next exciting JavaScript space
									adventure!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default JsLessonComingSoonPage;
