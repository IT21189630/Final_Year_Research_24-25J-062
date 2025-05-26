import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { HiSparkles } from "react-icons/hi2";
import "./js-level-displayer.styles.css";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import JsMilestone from "../../../components/js-milestone/JsMilestone";
import axios from "axios";

function JsLevelDisplayer() {
	const { user_id } = useSelector((state) => state.user);
	const [loading, setLoading] = useState(true);
	const [completedLessons, setCompletedLessons] = useState(0);
	const [jsProgress, setJsProgress] = useState(null);

	const API_BASE_URL =
		"http://localhost:4003/gamified-learning/api/ai-integration";

	// Static JS lessons data - you can expand this as you add more lessons
	const jsLessons = [
		{
			level: 1,
			title: "Variables & Mission Control",
			description: "Learn JavaScript variables and basic syntax",
			url: "/js/lesson1",
			lessonId: "lesson01",
		},
		{
			level: 2,
			title: "Functions & Spacecraft Systems",
			description: "Master JavaScript functions",
			url: "/js/lesson2",
			lessonId: "lesson02",
		},
		{
			level: 3,
			title: "Arrays & Data Structures",
			description: "Organize data with arrays",
			url: "/js/lesson3",
			lessonId: "lesson03",
		},
		{
			level: 4,
			title: "Objects & Mission Parameters",
			description: "Work with JavaScript objects",
			url: "/js/lesson4",
			lessonId: "lesson04",
		},
		{
			level: 5,
			title: "Loops & Automated Systems",
			description: "Control program flow with loops",
			url: "/js/lesson5",
			lessonId: "lesson05",
		},
		{
			level: 6,
			title: "Conditional Logic & Decision Making",
			description: "Navigate with if/else statements",
			url: "/js/lesson6",
			lessonId: "lesson06",
		},
		{
			level: 7,
			title: "DOM Manipulation & Interface Control",
			description: "Control spacecraft interfaces",
			url: "/js/lesson7",
			lessonId: "lesson07",
		},
		{
			level: 8,
			title: "Event Handling & Sensor Systems",
			description: "Respond to spacecraft events",
			url: "/js/lesson8",
			lessonId: "lesson08",
		},
		{
			level: 9,
			title: "Error Handling & System Recovery",
			description: "Manage spacecraft emergencies",
			url: "/js/lesson9",
			lessonId: "lesson09",
		},
		{
			level: 10,
			title: "Async Programming & Communications",
			description: "Handle space communications",
			url: "/js/lesson10",
			lessonId: "lesson10",
		},
		{
			level: 11,
			title: "API Integration & External Data",
			description: "Connect to space databases",
			url: "/js/lesson11",
			lessonId: "lesson11",
		},
		{
			level: 12,
			title: "Local Storage & Data Persistence",
			description: "Save mission progress data",
			url: "/js/lesson12",
			lessonId: "lesson12",
		},
		{
			level: 13,
			title: "Advanced Functions & Modules",
			description: "Build complex spacecraft systems",
			url: "/js/lesson13",
			lessonId: "lesson13",
		},
		{
			level: 14,
			title: "Performance Optimization & Efficiency",
			description: "Optimize spacecraft performance",
			url: "/js/lesson14",
			lessonId: "lesson14",
		},
		{
			level: 15,
			title: "Final Mission & Certification",
			description: "Complete your JavaScript space journey",
			url: "/js/lesson15",
			lessonId: "lesson15",
		},
	];

	// Function to check if a lesson is unlocked
	const isLessonUnlocked = (lessonLevel) => {
		// Level 1 is always unlocked
		if (lessonLevel === 1) return true;

		// Other levels unlock after completing the previous one
		return completedLessons >= lessonLevel - 1;
	};

	// Fetch JS progress from backend
	const fetchJsProgress = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${API_BASE_URL}/js-progress/user/${user_id}`
			);

			if (response.data.success) {
				const progress = response.data.progress;
				setJsProgress(progress);
				setCompletedLessons(progress.completedCount);
				toast.success("JavaScript missions loaded!");
			}
		} catch (error) {
			console.error("Error fetching JS progress:", error);
			// If no progress found or error, start with 0 completed lessons
			setCompletedLessons(0);
			toast.success("JavaScript missions loaded!");
		} finally {
			setLoading(false);
		}
	};

	const progressPercentage = (completedLessons / jsLessons.length) * 100;

	useEffect(() => {
		if (user_id) {
			fetchJsProgress();
		}
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
									isCompleted={
										jsProgress &&
										jsProgress.completedLessons.some(
											(completed) =>
												completed.lessonId ===
												lesson.lessonId
										)
									}
									bestScore={
										(jsProgress &&
											jsProgress.completedLessons.find(
												(completed) =>
													completed.lessonId ===
													lesson.lessonId
											)?.bestScore) ||
										0
									}
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
						{jsProgress && jsProgress.totalJsScore > 0 && (
							<div className="js-total-score-display">
								<h3>
									🚀 Total JavaScript Score:{" "}
									{jsProgress.totalJsScore} points
								</h3>
							</div>
						)}
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
