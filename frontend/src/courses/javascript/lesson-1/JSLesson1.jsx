import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { useSelector } from "react-redux";
import axios from "axios";
import axiosInstanceGamification from "../../../axios/axiosInstanceGamification";
import SpaceBackground from "../../../images/js-lessons/space-station-bg.png";
import AstronautGuide from "../../../images/js-lessons/js-motive-image.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./js-lesson1.styles.css";
import JsPerformanceSummaryModal from "../../../components/js_performance-summary-modal/JsPerformanceSummaryModal";

function JSLesson1() {
	const { user_id } = useSelector((state) => state.user);
	const initialCode = `// Start your JavaScript mission here!\n\n`;
	const hintDuration = 5000;
	const hints = [
		"Remember to use 'let' to declare your variables.",
		"Text values need quotation marks!",
		"Numbers don't need quotes in JavaScript.",
		"Variable names should be descriptive and meaningful.",
		"Don't forget the semicolon at the end of each statement!",
		"Check your spelling - JavaScript is case-sensitive.",
		"Make sure your variable names don't have spaces.",
		"Use camelCase for multi-word variable names like 'missionName'.",
		"You can also use 'const' for values that won't change.",
		"Single quotes ('') and double quotes (\"\") both work for strings.",
		"Variable names cannot start with a number.",
		"Avoid using JavaScript reserved words like 'function' or 'return'.",
		"Use meaningful names: 'userName' is better than 'x'.",
		"You can declare multiple variables on separate lines for clarity.",
		"The equals sign (=) assigns values, not equality comparison.",
		"JavaScript variables are loosely typed - no need to specify data type.",
		"Try using console.log() to test your variables in the browser console.",
		"Variable names are case-sensitive: 'name' and 'Name' are different.",
		"Use descriptive names that explain what the variable stores.",
		"Remember: let variableName = value; is the basic syntax pattern.",
	];
	const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

	const [activate, setActivate] = useState(false);
	const [jsInput, setJsInput] = useState(initialCode);
	const [hintCounter, setHintCounter] = useState(3);
	const [totalHints, setTotalHints] = useState(3);
	const [attemptCounter, setAttemptCounter] = useState(5);
	const [performanceScore, setPerformanceScore] = useState(0);
	const [hint, setHint] = useState("");
	const [missionNameVisible, setMissionNameVisible] = useState(false);
	const [astronautNameVisible, setAstronautNameVisible] = useState(false);
	const [missionDayVisible, setMissionDayVisible] = useState(false);
	const [startAttempt, setStartAttempt] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [aiFeedback, setAiFeedback] = useState("");
	const [loadingFeedback, setLoadingFeedback] = useState(false);
	const [processingMission, setProcessingMission] = useState(false);
	const [missionCompleted, setMissionCompleted] = useState(false);
	const [inventoryLoading, setInventoryLoading] = useState(true);
	const editorRef = useRef();

	const API_BASE_URL =
		"http://localhost:4003/gamified-learning/api/ai-integration";
	const lessonId = "lesson01";

	const fetchUserInventory = async () => {
		try {
			console.log("Fetching JS lesson inventory for user:", user_id);
			const response = await axiosInstanceGamification.get(
				`/gamified-learning/api/gamification/inventory/${user_id}`
			);

			console.log("JS Lesson Inventory Response:", response.data);

			if (response.data.success) {
				const purchasedHints =
					response.data.inventory.jsLessonHints || 0;
				const defaultHints = 3;
				const totalAvailableHints = defaultHints + purchasedHints;

				console.log(
					`💡 JS Hints: Default: ${defaultHints}, Purchased: ${purchasedHints}, Total: ${totalAvailableHints}`
				);

				setTotalHints(totalAvailableHints);
				setHintCounter(totalAvailableHints);

				maximumMargins.maxHints = totalAvailableHints;

				if (purchasedHints > 0) {
					console.log(
						`🎉 JS Lesson: Found ${purchasedHints} purchased hints!`
					);
					toast.success(
						`🎯 You have ${totalAvailableHints} hints available for this mission!`
					);
				}
			}
		} catch (error) {
			console.error("Error fetching JS lesson inventory:", error);
			setTotalHints(3);
			setHintCounter(3);
		} finally {
			setInventoryLoading(false);
		}
	};

	useEffect(() => {
		if (user_id) {
			fetchUserInventory();
		} else {
			setInventoryLoading(false);
		}
	}, [user_id]);

	const useHintSystem = () => {
		console.log(` Hint requested. Current: ${hintCounter}/${totalHints}`);

		if (hintCounter > 0) {
			setHintCounter((prev) => prev - 1);
			setHint(hints.reverse()[hintCounter - 1]);
			console.log(
				`✅ Hint used! Remaining: ${hintCounter - 1}/${totalHints}`
			);
			setTimeout(() => {
				setHint("");
			}, hintDuration);
		} else {
			setHint("No more hints available, Space Cadet!");
			console.log(" No hints remaining!");
			setTimeout(() => {
				setHint("");
			}, hintDuration);
		}
	};

	const markLessonComplete = async (score) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/js-progress/complete`,
				{
					userId: user_id,
					lessonId,
					score,
				}
			);

			if (response.data.success) {
				console.log("Lesson marked as complete:", response.data);
				if (response.data.progress.scoreAdded > 0) {
					toast.success(
						`🚀 Mission Complete! +${response.data.progress.scoreAdded} points added to your total score!`
					);
				} else {
					toast.success("🚀 Mission Complete! (Score not improved)");
				}
			}
		} catch (error) {
			console.error("Error marking lesson complete:", error);
			toast.error("Mission completed but couldn't update progress!");
		}
	};

	const validateAnswer = async (consumedTime) => {
		if (missionCompleted || processingMission) {
			return;
		}

		setProcessingMission(true);
		setMissionCompleted(true);

		let jsContent = jsInput.trim();

		// Client-side validation first
		const hasMissionName = /let\s+missionName\s*=\s*["'].*["']/i.test(
			jsContent
		);
		const hasAstronautName = /let\s+astronautName\s*=\s*["'].*["']/i.test(
			jsContent
		);
		const hasMissionDay = /let\s+missionDay\s*=\s*1/i.test(jsContent);

		if (hasMissionName && hasAstronautName && hasMissionDay) {
			setActivate(false);

			// Calculate performance score with dynamic hints
			const dynamicMaximumMargins = {
				maxHints: totalHints,
				maxTime: 300,
				maxAttempts: 5,
			};

			const score = lessonPerformanceScoreCalculator(
				dynamicMaximumMargins,
				{
					usedHints: totalHints - hintCounter,
					consumedTime,
					usedAttempts: 5 - attemptCounter,
				}
			);
			setPerformanceScore(score);

			// Get AI feedback
			await getAIFeedback(jsContent, score, consumedTime);

			// Update performance in backend (existing AI integration)
			await updatePerformance(score, consumedTime);

			// Mark lesson as completed (new JS progress tracking)
			await markLessonComplete(score);

			setProcessingMission(false);
			setShowModal(true);
		} else {
			setProcessingMission(false);
			setMissionCompleted(false);
			toast.error(
				"Mission parameters incorrect. Try again, Space Cadet!"
			);
			setAttemptCounter((prev) => prev - 1);
		}
	};

	const getAIFeedback = async (code, score, consumedTime) => {
		try {
			setLoadingFeedback(true);
			const performance = {
				hintsUsed: totalHints - hintCounter,
				completionTime: consumedTime,
				attempts: 5 - attemptCounter,
				score: score,
			};

			const response = await axios.post(
				`${API_BASE_URL}/advanced-feedback`,
				{
					lessonId,
					code,
					userId: user_id,
					performance,
				}
			);

			if (response.data.success) {
				setAiFeedback(response.data.feedback);
			} else {
				setAiFeedback(
					"Great work completing this lesson! Keep practicing to improve your JavaScript skills."
				);
			}
		} catch (error) {
			console.error("Error getting AI feedback:", error);
			setAiFeedback(
				"Excellent work! You've successfully completed this JavaScript mission."
			);
		} finally {
			setLoadingFeedback(false);
		}
	};

	const updatePerformance = async (score, consumedTime) => {
		try {
			await axios.post(`${API_BASE_URL}/update-performance`, {
				userId: user_id,
				lessonId,
				code: jsInput,
				score,
				completionTime: consumedTime,
				hintsUsed: totalHints - hintCounter,
				attempts: 5 - attemptCounter,
			});
		} catch (error) {
			console.error("Error updating performance:", error);
		}
	};

	const validateJS = () => {
		let jsContent = jsInput.trim();

		// Update visibility based on correct variable declarations
		setMissionNameVisible(
			/let\s+missionName\s*=\s*["'].*["']/i.test(jsContent)
		);
		setAstronautNameVisible(
			/let\s+astronautName\s*=\s*["'].*["']/i.test(jsContent)
		);
		setMissionDayVisible(/let\s+missionDay\s*=\s*1/i.test(jsContent));
	};

	const { setContainer } = useCodeMirror({
		container: editorRef.current,
		value: jsInput,
		height: "400px",
		extensions: [javascript()],
		theme: oneDark,
		onChange: (value) => {
			setJsInput(value);
			validateJS();
		},
		options: {
			lineNumbers: true,
			tabSize: 2,
			indentWithTabs: true,
		},
	});

	useEffect(() => {
		validateJS();
	}, [jsInput]);

	useEffect(() => {
		if (editorRef.current) {
			setContainer(editorRef.current);
		}
	}, [setContainer]);

	useEffect(() => {
		if (editorRef.current && startAttempt) {
			setContainer(editorRef.current);
		}
	}, [setContainer, startAttempt]);

	const beginChallenge = () => {
		setStartAttempt(true);
		setActivate(true);
	};

	return (
		<>
			<JsPerformanceSummaryModal
				visibility={showModal}
				score={performanceScore}
				aiFeedback={aiFeedback}
				loadingFeedback={loadingFeedback}
			/>

			{/* Mission Processing Overlay */}
			{processingMission && (
				<div className="js-mission-processing-overlay">
					<div className="js-processing-content">
						<div className="js-processing-spinner"></div>
						<h3 className="js-processing-title">
							🚀 Processing Mission...
						</h3>
						<p className="js-processing-text">
							Analyzing performance and generating AI feedback
						</p>
					</div>
				</div>
			)}

			<div className="js-main-container">
				{/* Left side - Lesson content and editor */}
				<div className="js-workbench-area">
					<div className="js-lesson-info-ribbon">
						<div className="js-lesson">JS Mission-01</div>
						<div className="js-timer">
							<span className="js-timer-icon">
								<IoMdTimer />
							</span>
							<span className="js-time-display">
								<Timer
									activate={activate}
									onStop={(finalTime) => {
										validateAnswer(finalTime);
									}}
								/>
							</span>
						</div>
						<div className="js-attempt-counter">
							<span className="js-attempt-icon">
								<FaStar />
							</span>
							<span className="js-attempts-left">
								{attemptCounter}
							</span>
						</div>
					</div>

					<div className="js-lesson-content">
						<h2 className="js-lesson-heading">
							01. Launch Your First JavaScript Mission
						</h2>

						{/* Debug Info - Remove in production */}
						{/* {!inventoryLoading && (
							<div
								style={{
									fontSize: "12px",
									color: "#00ff00",
									background: "rgba(0,255,0,0.1)",
									padding: "8px",
									borderRadius: "4px",
									marginBottom: "10px",
								}}
							>
								🐛 Debug: Total Hints = {totalHints} (3 default
								+ {totalHints - 3} purchased)
								<button
									onClick={fetchUserInventory}
									style={{
										marginLeft: "10px",
										padding: "2px 8px",
										fontSize: "10px",
										background: "#00ff00",
										color: "#000",
										border: "none",
										borderRadius: "3px",
										cursor: "pointer",
									}}
								>
									🔄 Refresh Hints
								</button>
							</div>
						)} */}

						{inventoryLoading && (
							<div
								style={{
									fontSize: "12px",
									color: "#ffff00",
									background: "rgba(255,255,0,0.1)",
									padding: "8px",
									borderRadius: "4px",
									marginBottom: "10px",
								}}
							>
								⏳ Loading hint inventory...
							</div>
						)}

						<h3 className="js-lesson-sub-headings">Introduction</h3>
						<p className="js-introduction">
							Think of JavaScript as the control panel of your
							spaceship - while HTML built the spaceship's
							structure and CSS made it look amazing, JavaScript
							is what makes it actually fly! Just like how
							astronauts need to initialize their systems before
							takeoff, in JavaScript, we start by learning about
							variables.
							<br />
							<br />
							Variables are like the storage containers in your
							spaceship where you keep important information. When
							you declare a variable, you're creating a special
							container with a name, and you can put different
							types of data in it - numbers for coordinates, text
							for mission logs, or true/false values for system
							checks. Every time you store something in a
							variable, it's like logging critical mission data
							that you can use later.
							<br />
							<br />
							The most important thing about variables is that
							they can change during your mission - just like how
							a spaceship's speed or altitude changes during
							flight. In JavaScript, we create these storage
							containers using special keywords like 'let' or
							'const', give them unique names, and then use the
							equals sign (=) to put data inside them.
						</p>
						<h3 className="js-lesson-sub-headings">Challenge</h3>
						<p className="js-instruction">
							Welcome, Space Cadet! Your first mission is to
							initialize the basic systems of your spacecraft
							using JavaScript variables. Just as a real
							spacecraft needs to store crucial information before
							launch, you'll need to create variables to store
							important mission data. Here's what you need to do:
						</p>
						<ol>
							<li className="js-task-item">
								Create a variable named 'missionName' and store
								your space mission's name in it (remember, text
								values need to be in quotes!)
							</li>
							<li className="js-task-item">
								Create a variable called 'astronautName' to
								store the commander's name (that's you!)
							</li>
							<li className="js-task-item">
								Create a numerical variable 'missionDay' and set
								it to 1 (this is your first day of the mission)
							</li>
						</ol>
						<p className="js-instruction">
							Remember to use 'let' to declare your variables and
							don't forget that text values need quotation marks!
							When you complete these steps correctly, you'll see
							your mission data appear on the control panel in the
							playground area. Your spacecraft's systems will
							initialize, showing you're ready for your JavaScript
							s pace journey! Are you ready to begin your first
							mission? Click the Begin Mission button to launch
							your JavaScript adventure!
						</p>
						{!startAttempt && !inventoryLoading && (
							<button
								className="js-attempt-btn"
								onClick={() => beginChallenge()}
							>
								Begin Mission
							</button>
						)}
						{inventoryLoading && (
							<button className="js-attempt-btn" disabled>
								Loading Mission... ⏳
							</button>
						)}
						{startAttempt && (
							<div className="js-editor-container">
								<div ref={editorRef} />
								<button
									className="js-hint-btn"
									onClick={useHintSystem}
									disabled={hintCounter <= 0}
								>
									Request Hint ({hintCounter})
								</button>
								<button
									className="js-submit-btn"
									onClick={() => {
										validateAnswer(null);
									}}
								>
									Launch Mission
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Right side - Mission Control Display */}
				<div
					className="js-mission-control"
					style={{ backgroundImage: `url(${SpaceBackground})` }}
				>
					<div className="js-control-panel">
						<div
							className={`js-astronaut-hint ${
								hint === "" ? "fade" : ""
							}`}
						>
							<img
								className="js-astronaut-guide"
								src={AstronautGuide}
								alt="astronaut-guide"
							/>
							<p className="js-hint-text">{hint}</p>
						</div>
						<div className="js-mission-parameter-topic">
							System Initialization Progress
						</div>

						{/* Mission Control Display that updates based on correct variables */}
						{missionNameVisible && (
							<div className="js-mission-parameter">
								Mission Name: Initialized ✓
							</div>
						)}
						{astronautNameVisible && (
							<div className="js-mission-parameter">
								Commander Name: Registered ✓
							</div>
						)}
						{missionDayVisible && (
							<div className="js-mission-parameter">
								Mission Day: Confirmed ✓
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default JSLesson1;
