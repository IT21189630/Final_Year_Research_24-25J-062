import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import SpaceshipInterior from "../../../images/lessons/spaceship-interior.jpg";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson26.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson26() {
  const dispatch = useDispatch();
  const { course_id, current_level } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Space Station Control Panel</title>
    <style>
      /* We've already set up some basic styles for you */
      body {
        font-family: Arial, sans-serif;
        background-color: #111827;
        color: #ffffff;
        margin: 0;
        padding: 20px;
      }
      
      .control-panel {
        width: 600px;
        height: 400px;
        background-color: #1f2937;
        border: 2px solid #374151;
        border-radius: 10px;
        position: relative;
        overflow: hidden;
      }
      
      .panel-label {
        background-color: #4b5563;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: bold;
      }
      
      .status-indicator {
        width: 80px;
        height: 80px;
        background-color: #10b981;
        border-radius: 50%;
        text-align: center;
        line-height: 80px;
        font-weight: bold;
      }
      
      .alert-message {
        background-color: #ef4444;
        color: white;
        padding: 10px;
        border-radius: 5px;
        width: 180px;
        text-align: center;
      }
      
      .mission-timer {
        background-color: #f59e0b;
        color: black;
        font-weight: bold;
        padding: 10px;
        border-radius: 5px;
        width: 140px;
        text-align: center;
      }
      
      .control-button {
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
      }
      
      /* Add your position properties below for each element */
      
    </style>
  </head>
  <body>
    <h1>Space Station Control Panel</h1>
    
    <div class="control-panel">
      <div class="panel-label">Main Control System</div>
      <div class="status-indicator">ONLINE</div>
      <div class="alert-message">Oxygen levels: Check required</div>
      <div class="mission-timer">Mission Time: 15:42:07</div>
      <button class="control-button">Restart Systems</button>
    </div>
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Remember to use position: absolute for elements that need precise placement",
    "Use the top, right, bottom, left properties to position elements from their respective edges",
    "For the alert message, try using position: absolute with right: 20px and top: 20px",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [panelLabelPositioned, setPanelLabelPositioned] = useState(false);
  const [statusIndicatorPositioned, setStatusIndicatorPositioned] =
    useState(false);
  const [alertMessagePositioned, setAlertMessagePositioned] = useState(false);
  const [missionTimerPositioned, setMissionTimerPositioned] = useState(false);
  const [controlButtonPositioned, setControlButtonPositioned] = useState(false);
  const [startAttempt, setStartAttempt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const editorRef = useRef();

  const useHintSystem = () => {
    if (hintCounter > 0) {
      setHintCounter((prev) => prev - 1);
      setHint(hints.reverse()[hintCounter - 1]);
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    } else {
      setHint("No more hints left my friend!");
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    }
  };

  const validateAnswer = async (consumedTime) => {
    let htmlContent = htmlInput.trim();

    // Validate if <style> tag is present
    const hasStyleTag = /<style>[\s\S]*<\/style>/i.test(htmlContent);

    // Validate Panel Label
    const hasPanelLabelPosition =
      /\.panel-label\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.panel-label\s*{[\s\S]*top:\s*10px;[\s\S]*}/i.test(htmlContent) &&
      /\.panel-label\s*{[\s\S]*left:\s*10px;[\s\S]*}/i.test(htmlContent);

    // Validate Status Indicator
    const hasStatusIndicatorPosition =
      /\.status-indicator\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.status-indicator\s*{[\s\S]*top:\s*50px;[\s\S]*}/i.test(htmlContent) &&
      /\.status-indicator\s*{[\s\S]*left:\s*50px;[\s\S]*}/i.test(htmlContent);

    // Validate Alert Message
    const hasAlertMessagePosition =
      /\.alert-message\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.alert-message\s*{[\s\S]*right:\s*20px;[\s\S]*}/i.test(htmlContent) &&
      /\.alert-message\s*{[\s\S]*top:\s*20px;[\s\S]*}/i.test(htmlContent);

    // Validate Mission Timer
    const hasMissionTimerPosition =
      /\.mission-timer\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.mission-timer\s*{[\s\S]*bottom:\s*20px;[\s\S]*}/i.test(htmlContent) &&
      /\.mission-timer\s*{[\s\S]*left:\s*20px;[\s\S]*}/i.test(htmlContent);

    // Validate Control Button
    const hasControlButtonPosition =
      /\.control-button\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.control-button\s*{[\s\S]*bottom:\s*20px;[\s\S]*}/i.test(htmlContent) &&
      /\.control-button\s*{[\s\S]*right:\s*20px;[\s\S]*}/i.test(htmlContent);

    if (
      hasStyleTag &&
      hasPanelLabelPosition &&
      hasStatusIndicatorPosition &&
      hasAlertMessagePosition &&
      hasMissionTimerPosition &&
      hasControlButtonPosition
    ) {
      setActivate(false);
      let score = 0;
      if (consumedTime !== null) {
        score = lessonPerformanceScoreCalculator(maximumMargins, {
          usedHints: hints.length - hintCounter,
          consumedTime,
          usedAttempts: 5 - attemptCounter,
        });
        setPerformanceScore(score);
        setShowModal(true);
        const nextLevel = current_level > 27 ? current_level : 27;
        const updateFlag = await updateCourseProgress(
          user_id,
          course_id,
          lesson_id,
          score,
          nextLevel
        );
        if (updateFlag) {
          dispatch(updateProgress({ current_level: nextLevel }));
          toast.success("Your progress updated!");
        }
      }
    } else {
      toast.error(
        "Not all requirements are met! Review the challenge instructions."
      );
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    // Panel Label Validation
    const hasPanelLabelPosition =
      /\.panel-label\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.panel-label\s*{[\s\S]*top:\s*10px;[\s\S]*}/i.test(htmlContent) &&
      /\.panel-label\s*{[\s\S]*left:\s*10px;[\s\S]*}/i.test(htmlContent);

    // Status Indicator Validation
    const hasStatusIndicatorPosition =
      /\.status-indicator\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.status-indicator\s*{[\s\S]*top:\s*50px;[\s\S]*}/i.test(htmlContent) &&
      /\.status-indicator\s*{[\s\S]*left:\s*50px;[\s\S]*}/i.test(htmlContent);

    // Alert Message Validation
    const hasAlertMessagePosition =
      /\.alert-message\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.alert-message\s*{[\s\S]*right:\s*20px;[\s\S]*}/i.test(htmlContent) &&
      /\.alert-message\s*{[\s\S]*top:\s*20px;[\s\S]*}/i.test(htmlContent);

    // Mission Timer Validation
    const hasMissionTimerPosition =
      /\.mission-timer\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.mission-timer\s*{[\s\S]*bottom:\s*20px;[\s\S]*}/i.test(htmlContent) &&
      /\.mission-timer\s*{[\s\S]*left:\s*20px;[\s\S]*}/i.test(htmlContent);

    // Control Button Validation
    const hasControlButtonPosition =
      /\.control-button\s*{[\s\S]*position:\s*absolute;[\s\S]*}/i.test(
        htmlContent
      ) &&
      /\.control-button\s*{[\s\S]*bottom:\s*20px;[\s\S]*}/i.test(htmlContent) &&
      /\.control-button\s*{[\s\S]*right:\s*20px;[\s\S]*}/i.test(htmlContent);

    setPanelLabelPositioned(hasPanelLabelPosition);
    setStatusIndicatorPositioned(hasStatusIndicatorPosition);
    setAlertMessagePositioned(hasAlertMessagePosition);
    setMissionTimerPositioned(hasMissionTimerPosition);
    setControlButtonPositioned(hasControlButtonPosition);
  };

  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    value: htmlInput,
    height: "500px",
    extensions: [html()],
    theme: oneDark,
    onChange: (value) => {
      setHtmlInput(value);
      validateHTML(value);
    },
    options: {
      lineNumbers: true,
      tabSize: 2,
      indentWithTabs: true,
    },
  });

  useEffect(() => {
    validateHTML();
  }, [htmlInput]);

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
      <PerformanceSummaryModal
        visibility={showModal}
        score={performanceScore}
      />
      <div className="main-container">
        {/* This is the part where we teach the concept and declare the challenge - workbench */}
        <div className="workbench-area">
          {/* lesson details ribbon */}
          <div className="lesson-info-ribbon">
            <div className="lesson">Lesson-26</div>
            <div className="timer">
              <span className="timer-icon">
                <IoMdTimer />
              </span>
              <span className="time-displayer">
                <Timer
                  activate={activate}
                  onStop={(finalTime) => {
                    validateAnswer(finalTime);
                  }}
                />
              </span>
            </div>
            <div className="attempt-counter">
              <span className="timer-icon">
                <FaStar />
              </span>
              <span className="time-displayer">{attemptCounter}</span>
            </div>
          </div>

          {/* lesson content */}
          <div className="lesson-content-partition">
            <h2 className="lesson-heading">
              26. CSS Positioning for Space Station Control Panel
            </h2>

            {/* Lesson Introduction */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Now that we've mastered the CSS Box Model, let's explore CSS
              positioning. Positioning allows you to precisely control where
              elements appear on the page, which is essential for creating
              complex layouts like control panels and dashboards.
              <br />
              <br />
              CSS offers several positioning methods:
              <ul typeof="box">
                <li>
                  <code>static</code>: The default positioning (follows normal
                  document flow).
                </li>
                <li>
                  <code>relative</code>: Positioned relative to its normal
                  position.
                </li>
                <li>
                  <code>absolute</code>: Positioned relative to its nearest
                  positioned ancestor.
                </li>
                <li>
                  <code>fixed</code>: Positioned relative to the viewport (stays
                  in place when scrolling).
                </li>
                <li>
                  <code>sticky</code>: Behaves like relative until it reaches a
                  scroll threshold, then becomes fixed.
                </li>
              </ul>
              When using <code>absolute</code> or <code>fixed</code>{" "}
              positioning, you can specify the exact location using{" "}
              <code>top</code>, <code>right</code>, <code>bottom</code>, and{" "}
              <code>left</code> properties. These properties determine the
              distance from the respective edge of the containing element.
            </p>

            {/* Challenge Section */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              The space station control panel needs a proper layout! You'll use
              CSS positioning to arrange the control panel elements in their
              correct positions to create a functional and organized interface.
            </p>

            <ol>
              <li className="task-item">
                Position the panel label at the top-left corner of the control
                panel:
                <ul>
                  <li>
                    Use <code>position: absolute;</code>
                  </li>
                  <li>
                    Set <code>top: 10px;</code> and <code>left: 10px;</code>
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Position the status indicator below the panel label:
                <ul>
                  <li>
                    Use <code>position: absolute;</code>
                  </li>
                  <li>
                    Set <code>top: 50px;</code> and <code>left: 50px;</code>
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Position the alert message in the top-right corner:
                <ul>
                  <li>
                    Use <code>position: absolute;</code>
                  </li>
                  <li>
                    Set <code>right: 20px;</code> and <code>top: 20px;</code>
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Position the mission timer in the bottom-left corner:
                <ul>
                  <li>
                    Use <code>position: absolute;</code>
                  </li>
                  <li>
                    Set <code>bottom: 20px;</code> and <code>left: 20px;</code>
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Position the control button in the bottom-right corner:
                <ul>
                  <li>
                    Use <code>position: absolute;</code>
                  </li>
                  <li>
                    Set <code>bottom: 20px;</code> and <code>right: 20px;</code>
                  </li>
                </ul>
              </li>
            </ol>

            <p>
              Once you've positioned all elements correctly, you'll have a
              properly organized space station control panel ready for mission
              control! 🚀
            </p>
            {!startAttempt && (
              <button className="attempt-btn" onClick={() => beginChallenge()}>
                Start Attempt
              </button>
            )}
            {startAttempt && (
              <div className="code-editor-container">
                <div ref={editorRef} />
                <button className="attempt-btn" onClick={useHintSystem}>
                  Use a Hint ({hintCounter})
                </button>
                <button
                  className="attempt-btn"
                  onClick={() => {
                    validateAnswer(null);
                  }}
                >
                  Submit Answer
                </button>
                <br />
              </div>
            )}
          </div>
        </div>
        {/* This is the playground area where user can see whether answer is correct */}
        <div
          className="playground-area"
          style={{ backgroundImage: `url(${SpaceshipInterior})` }}
        >
          <div className="space-center-area">
            <div className={`motivater ${hint === "" ? "fade" : ""}`}>
              <img
                className="astro-guider"
                src={AstronautGuider}
                alt="astronaut-image"
              />
              <p className="motive-text">{hint}</p>
            </div>

            {/* tablet screen */}
            <div
              className="tablet-screen"
              style={{ backgroundImage: `url(${TabletScreen})` }}
            >
              <div className="doc-container">
                <div className="control-panel-preview">
                  <div className="control-panel">
                    <div
                      className="panel-label"
                      style={{
                        position: panelLabelPositioned ? "absolute" : "static",
                        top: panelLabelPositioned ? "10px" : "auto",
                        left: panelLabelPositioned ? "10px" : "auto",
                      }}
                    >
                      Main Control System
                    </div>
                    <div
                      className="status-indicator"
                      style={{
                        position: statusIndicatorPositioned
                          ? "absolute"
                          : "static",
                        top: statusIndicatorPositioned ? "50px" : "auto",
                        left: statusIndicatorPositioned ? "50px" : "auto",
                      }}
                    >
                      ONLINE
                    </div>
                    <div
                      className="alert-message"
                      style={{
                        position: alertMessagePositioned
                          ? "absolute"
                          : "static",
                        right: alertMessagePositioned ? "20px" : "auto",
                        top: alertMessagePositioned ? "20px" : "auto",
                      }}
                    >
                      Oxygen levels: Check required
                    </div>
                    <div
                      className="mission-timer"
                      style={{
                        position: missionTimerPositioned
                          ? "absolute"
                          : "static",
                        bottom: missionTimerPositioned ? "20px" : "auto",
                        left: missionTimerPositioned ? "20px" : "auto",
                      }}
                    >
                      Mission Time: 15:42:07
                    </div>
                    <button
                      className="control-button"
                      style={{
                        position: controlButtonPositioned
                          ? "absolute"
                          : "static",
                        bottom: controlButtonPositioned ? "20px" : "auto",
                        right: controlButtonPositioned ? "20px" : "auto",
                      }}
                    >
                      Restart Systems
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson26;
