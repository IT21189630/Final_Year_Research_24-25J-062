import React from "react";
import Lock from "../../images/placeholder/lock.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./js-milestone.styles.css";

function JsMilestone({ level, title, description, url, isUnlocked }) {
	const navigate = useNavigate();

	const handleMissionClick = () => {
		if (isUnlocked) {
			navigate(url);
		} else {
			toast.error("Complete the previous mission to unlock this one!");
		}
	};

	return (
		<div className="js-milestone-container">
			{/* Checkpoint indicator for every 5th level */}
			{level % 5 === 0 && <div className="js-cp-indicator">JS</div>}

			{/* Lock overlay for locked lessons */}
			{!isUnlocked && (
				<div className="js-level-locker">
					<img src={Lock} alt="lock" className="js-lvl-lock" />
				</div>
			)}

			{/* Main level content */}
			<div
				className={`js-level-navigator ${
					isUnlocked ? "unlocked" : "locked"
				}`}
				onClick={handleMissionClick}
			>
				<div className="js-level-content">
					<span className="js-level-indicator">{level}</span>
				</div>
			</div>

			{/* Lesson info tooltip (shows on hover) */}
			<div className="js-lesson-info">
				<h4 className="js-lesson-title">{title}</h4>
				<p className="js-lesson-description">{description}</p>
				<span className="js-lesson-status">
					{isUnlocked ? "🚀 Ready to Launch" : "🔒 Locked"}
				</span>
			</div>
		</div>
	);
}

export default JsMilestone;
