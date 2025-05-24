import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { HiSparkles } from "react-icons/hi2";
import "./js-level-displayer.styles.css";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import JsMilestone from "../../../components/js-milestone/JsMilestone";

function JsLevelDisplayer() {
	const { user_id } = useSelector((state) => state.user);
	const [loading, setLoading] = useState(false);
	const [completedLessons, setCompletedLessons] = useState(0);

	// Static JS lessons data - you can expand this as you add more lessons
	const jsLessons = [
		{
			level: 1,
			title: "Variables & Mission Control",
			description: "Learn JavaScript variables and basic syntax",
			url: "/js/lesson1",
		},
		{
			level: 2,
			title: "Functions & Spacecraft Systems",
			description: "Master JavaScript functions",
			url: "/js/lesson2",
		},
		{
			level: 3,
			title: "Arrays & Data Structures",
			description: "Organize data with arrays",
			url: "/js/lesson3",
		},
		{
			level: 4,
			title: "Objects & Mission Parameters",
			description: "Work with JavaScript objects",
			url: "/js/lesson4",
		},
		{
			level: 5,
			title: "Loops & Automated Systems",
			description: "Control program flow with loops",
			url: "/js/lesson5",
		},
	];

	// Function to check if a lesson is unlocked
	const isLessonUnlocked = (lessonLevel) => {
		// Level 1 is always unlocked
		if (lessonLevel === 1) return true;

		// Other levels unlock after completing the previous one
		// For now, we'll use a simple system where only level 1 is unlocked
		// TODO: In the future, you can check actual completion status from backend
		return completedLessons >= lessonLevel - 1;
	};

	const progressPercentage = (completedLessons / jsLessons.length) * 100;

	useEffect(() => {
		// TODO: In the future, you can fetch actual completion status from your backend
		// For now, we'll assume only level 1 is unlocked
		setCompletedLessons(0);
		toast.success("JavaScript missions loaded!");
	}, [user_id]);

	if (loading) return <LoadingScreen />;

	return (
		<>
			<div className="js-level-displayer-page-container">
				<div className="js-filter-container"></div>
				<div className="js-ld-main-cont">
					<div className="js-level-displayer-container">
						<span className="js-page-headline">
							JavaScript Space Missions
						</span>
						<div className="js-level-displayer">
							{jsLessons.map((lesson, index) => (
								<JsMilestone
									key={index}
									level={lesson.level}
									title={lesson.title}
									description={lesson.description}
									url={lesson.url}
									isUnlocked={isLessonUnlocked(lesson.level)}
								/>
							))}
						</div>
						<div className="js-cp-alert-box">
							<div className="js-cp-placeholder">JS</div>
							<span>
								JavaScript Missions: Each mission will challenge
								your programming skills and unlock new space
								exploration capabilities. Complete missions in
								order to progress through your JavaScript
								journey.
							</span>
						</div>
					</div>
					<div className="js-ld-stat-box">
						<div className="js-ld-course-progress-container">
							<span className="js-ld-progress-label">
								<HiSparkles className="js-ld-spark" />
								Mission Progress:{" "}
								<span className="js-ld-curr-progress">
									Completed {completedLessons} out of{" "}
									{jsLessons.length}
								</span>
							</span>
							<div className="js-ld-enr-progress-bar-cont">
								<div
									className="js-ld-enr-filled-bar"
									style={{
										width: `${
											progressPercentage > 100
												? 100
												: progressPercentage
										}%`,
									}}
								></div>
								<div className="js-ld-enr-full-bar"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default JsLevelDisplayer;
