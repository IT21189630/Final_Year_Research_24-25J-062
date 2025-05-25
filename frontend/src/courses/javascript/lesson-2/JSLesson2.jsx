import React from "react";
import { useNavigate } from "react-router-dom";
import SpaceBackground from "../../../images/js-lessons/space-station-bg.png";
import AstronautGuide from "../../../images/js-lessons/js-upcoming-image.PNG";
import "./js-lesson2.styles.css";

function JSLesson2() {
	const navigate = useNavigate();

	const goBackToMissions = () => {
		navigate("/student/dashboard/js-courses");
	};

	return (
		<div className="js2-main-container">
			<div className="js2-coming-soon-container">
				<div
					className="js2-background"
					style={{ backgroundImage: `url(${SpaceBackground})` }}
				>
					<div className="js2-content">
						<div className="js2-astronaut-section">
							<img
								className="js2-astronaut-guide"
								src={AstronautGuide}
								alt="astronaut-guide"
							/>
						</div>

						<div className="js2-mission-info">
							<h1 className="js2-mission-title">
								🚀 JS Mission-02
							</h1>
							<h2 className="js2-mission-subtitle">
								Functions & Spacecraft Systems
							</h2>

							<div className="js2-coming-soon-badge">
								⏰ COMING SOON ⏰
							</div>

							<p className="js2-description">
								Space Cadet, your next mission is currently
								being prepared by our space engineers! In
								Mission-02, you'll learn to control your
								spacecraft's functions and master JavaScript
								function declarations.
							</p>

							<div className="js2-mission-preview">
								<h3>🛸 What You'll Learn:</h3>
								<ul>
									<li>🔧 Creating JavaScript functions</li>
									<li>
										🎯 Function parameters and arguments
									</li>
									<li>🔄 Return values and function calls</li>
									<li>
										🚀 Building spacecraft control systems
									</li>
								</ul>
							</div>

							<div className="js2-action-buttons">
								<button
									className="js2-back-btn"
									onClick={goBackToMissions}
								>
									Return to Mission Control
								</button>
							</div>

							<div className="js2-status-message">
								<p>
									✨ Complete Mission-01 and stay tuned for
									the next exciting JavaScript space
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

export default JSLesson2;
