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
import "./js-lesson2.styles.css";
import JsPerformanceSummaryModal from "../../../components/js_performance-summary-modal/JsPerformanceSummaryModal";

function JSLesson2() {
	const { user_id } = useSelector((state) => state.user);
	const initialCode = `// Control your spacecraft functions here!\n\n`;
	const hintDuration = 5000;
	const hints = [
		"Remember to use 'function' keyword to declare a function.",
		"Function names should be descriptive like 'startEngine()'.",
		"Don't forget parentheses () after the function name!",
		"Functions need curly braces {} to contain their code.",
		"Use return statements to send values back from functions.",
		"Parameters go inside the parentheses (param1, param2).",
		"Call functions by writing their name followed by ().",
		"Functions can take inputs and produce outputs.",
		"Function declarations start with the 'function' keyword.",
		"Check your syntax: function name() { code here }",
		"Functions are reusable blocks of code.",
		"Make sure to call your functions after declaring them.",
		"Parameters are like variables that receive values.",
		"Return values let functions communicate back to your code.",
		"Functions help organize and structure your spacecraft code.",
		"Use meaningful names: 'calculateSpeed' not 'func1'.",
		"Functions can call other functions too!",
		"Test your functions by calling them with different values.",
		"Functions are the building blocks of complex programs.",
		"Remember: declare first, then call your function.",
	];

	const [activate, setActivate] = useState(false);
	const [jsInput, setJsInput] = useState(initialCode);
	const [hintCounter, setHintCounter] = useState(3);
	const [totalHints, setTotalHints] = useState(3);
	const [attemptCounter, setAttemptCounter] = useState(5);
	const [performanceScore, setPerformanceScore] = useState(0);
	const [hint, setHint] = useState("");
	const [startEngineVisible, setStartEngineVisible] = useState(false);
	const [calculateSpeedVisible, setCalculateSpeedVisible] = useState(false);
	const [navigationSystemVisible, setNavigationSystemVisible] =
		useState(false);
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
	const lessonId = "lesson02";

	// Fetch user inventory to get total hints
	const fetchUserInventory = async () => {
		try {
			console.log("🔍 Fetching JS lesson inventory for user:", user_id);
			const response = await axiosInstanceGamification.get(
				`/gamified-learning/api/gamification/inventory/${user_id}`
			);

			console.log("📦 JS Lesson Inventory Response:", response.data);

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
			console.error("❌ Error fetching JS lesson inventory:", error);
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
		console.log(`💡 Hint requested. Current: ${hintCounter}/${totalHints}`);

		if (hintCounter > 0) {
			setHintCounter((prev) => prev - 1);
			setHint(hints[totalHints - hintCounter]);
			console.log(
				`✅ Hint used! Remaining: ${hintCounter - 1}/${totalHints}`
			);
			setTimeout(() => {
				setHint("");
			}, hintDuration);
		} else {
			setHint("No more hints available, Space Cadet!");
			console.log("❌ No hints remaining!");
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

		// Client-side validation for functions
		const hasStartEngine =
			/function\s+startEngine\s*\(\s*\)\s*\{[\s\S]*return\s+["'].*["'];?\s*\}/i.test(
				jsContent
			);
		const hasCalculateSpeed =
			/function\s+calculateSpeed\s*\(\s*\w+\s*,\s*\w+\s*\)\s*\{[\s\S]*return\s+[\w\s+\-*/()]+;?\s*\}/i.test(
				jsContent
			);
		const hasNavigationSystem =
			/function\s+navigationSystem\s*\(\s*\w+\s*\)\s*\{[\s\S]*return\s+.*["'][^"']*["']\s*\+\s*\w+;?\s*\}/i.test(
				jsContent
			);

		if (hasStartEngine && hasCalculateSpeed && hasNavigationSystem) {
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
				"Mission functions incomplete. Check your function declarations, Space Cadet!"
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
					"Excellent work mastering JavaScript functions! Your spacecraft systems are fully operational."
				);
			}
		} catch (error) {
			console.error("Error getting AI feedback:", error);
			setAiFeedback(
				"Outstanding! You've successfully programmed your spacecraft's function systems."
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

		// Update visibility based on correct function declarations
		setStartEngineVisible(
			/function\s+startEngine\s*\(\s*\)\s*\{[\s\S]*return\s+["'].*["'];?\s*\}/i.test(
				jsContent
			)
		);
		setCalculateSpeedVisible(
			/function\s+calculateSpeed\s*\(\s*\w+\s*,\s*\w+\s*\)\s*\{[\s\S]*return\s+[\w\s+\-*/()]+;?\s*\}/i.test(
				jsContent
			)
		);
		setNavigationSystemVisible(
			/function\s+navigationSystem\s*\(\s*\w+\s*\)\s*\{[\s\S]*return\s+.*["'][^"']*["']\s*\+\s*\w+;?\s*\}/i.test(
				jsContent
			)
		);
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
						<div className="js-lesson">JS Mission-02</div>
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
							02. Master Spacecraft Function Systems
						</h2>

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
							Excellent work on your first mission, Space Cadet!
							Now it's time to take control of your spacecraft's
							advanced function systems. Think of JavaScript
							functions as specialized control panels - each one
							designed to perform a specific task for your
							spacecraft.
							<br />
							<br />
							Just like how a real spacecraft has different
							systems for engines, navigation, and speed
							calculation, in JavaScript, functions are reusable
							blocks of code that perform specific tasks. When you
							create a function, you're building a custom control
							system that can be activated whenever needed.
							<br />
							<br />
							Functions are incredibly powerful because they can
							take inputs (called parameters), process them, and
							return results. This makes your spacecraft code
							organized, efficient, and ready for any space
							mission scenario!
						</p>
						<h3 className="js-lesson-sub-headings">Challenge</h3>
						<p className="js-instruction">
							Your mission is to create three essential spacecraft
							function systems. Each function will control a
							different aspect of your spacecraft's operations.
							Here's what you need to program:
						</p>
						<ol>
							<li className="js-task-item">
								Create a function called 'startEngine' that
								takes no parameters and returns the string
								"Engine started successfully!"
							</li>
							<li className="js-task-item">
								Create a function called 'calculateSpeed' that
								takes two parameters (distance and time) and
								returns their division (distance/time)
							</li>
							<li className="js-task-item">
								Create a function called 'navigationSystem' that
								takes one parameter (destination) and returns
								the string "Course set for " + destination
							</li>
						</ol>
						<p className="js-instruction">
							Remember the function syntax: function
							name(parameters) {"{"}return value;{"}"}
							When you complete these functions correctly, your
							spacecraft's systems will come online in the mission
							control panel. Ready to program your spacecraft's
							brain? Let's launch into JavaScript functions!
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
							Spacecraft Function Systems Status
						</div>

						{/* Mission Control Display that updates based on correct functions */}
						{startEngineVisible && (
							<div className="js-mission-parameter">
								🔥 Engine System: Online ✓
							</div>
						)}
						{calculateSpeedVisible && (
							<div className="js-mission-parameter">
								⚡ Speed Calculator: Active ✓
							</div>
						)}
						{navigationSystemVisible && (
							<div className="js-mission-parameter">
								🧭 Navigation System: Ready ✓
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default JSLesson2;
