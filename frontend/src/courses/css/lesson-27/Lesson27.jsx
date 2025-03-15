import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import ControlPanel from "../../../images/lessons/dashboard-spaceship.jpg";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson27.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson27() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Space Station Control Panel</title>
    <style>
      /* We've already set up some basic styles for you */
      body {
        font-family: 'Arial', sans-serif;
        background-color: #1a1a2e;
        color: #e2e2e2;
        padding: 20px;
      }
      
      .control-panel {
        background-color: #16213e;
        border-radius: 10px;
        padding: 20px;
        border: 2px solid #0f3460;
      }
      
      .panel-section {
        margin-bottom: 15px;
        padding: 15px;
        background-color: #0f3460;
        border-radius: 5px;
      }
      
      .control-button {
        background-color: #e94560;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        margin: 5px;
        cursor: pointer;
      }
      
      .system-indicator {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 10px;
      }
      
      .status-online {
        background-color: #4cc9f0;
      }
      
      .status-standby {
        background-color: #f8961e;
      }
      
      .status-offline {
        background-color: #e94560;
      }
      
      .system-name {
        margin: 5px;
        padding: 5px;
        border: 1px solid #4cc9f0;
        border-radius: 5px;
      }
      
      /* Add your flexbox properties below */
      
    </style>
  </head>
  <body>
    <div class="control-panel">
      <h1>Space Station Control Panel</h1>
      
      <div class="panel-section navigation-controls">
        <h2>Navigation Controls</h2>
        <div class="buttons-container">
          <button class="control-button">Thrusters</button>
          <button class="control-button">Orientation</button>
          <button class="control-button">Autopilot</button>
          <button class="control-button">Dock</button>
        </div>
      </div>
      
      <div class="panel-section life-support">
        <h2>Life Support Systems</h2>
        <div class="systems-container">
          <div class="system-item">
            <span class="system-indicator status-online"></span>
            <span class="system-name">Oxygen</span>
          </div>
          <div class="system-item">
            <span class="system-indicator status-online"></span>
            <span class="system-name">Temperature</span>
          </div>
          <div class="system-item">
            <span class="system-indicator status-standby"></span>
            <span class="system-name">Water Recycling</span>
          </div>
          <div class="system-item">
            <span class="system-indicator status-offline"></span>
            <span class="system-name">Waste Management</span>
          </div>
        </div>
      </div>
      
      <div class="panel-section communications">
        <h2>Communications</h2>
        <div class="comms-container">
          <div class="comms-channels">
            <button class="control-button">Ground Control</button>
            <button class="control-button">System Broadcast</button>
            <button class="control-button">Emergency</button>
          </div>
          <div class="comms-status">
            <div class="system-item">
              <span class="system-indicator status-online"></span>
              <span class="system-name">Main Antenna</span>
            </div>
            <div class="system-item">
              <span class="system-indicator status-standby"></span>
              <span class="system-name">Backup Antenna</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Remember that flexbox has main and cross axes - use 'flex-direction' to set the primary axis",
    "For the Life Support systems, try 'flex-wrap: wrap' to allow items to wrap to the next line",
    "Use 'justify-content' to control alignment along the main axis and 'align-items' for the cross axis",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [navControlsStyled, setNavControlsStyled] = useState(false);
  const [lifeSupportStyled, setLifeSupportStyled] = useState(false);
  const [communicationsStyled, setCommunicationsStyled] = useState(false);
  const [navButtonsFlexed, setNavButtonsFlexed] = useState(false);
  const [systemsFlexed, setSystemsFlexed] = useState(false);
  const [systemsWrapped, setSystemsWrapped] = useState(false);
  const [commsFlexed, setCommsFlexed] = useState(false);
  const [commsSpaceBetween, setCommsSpaceBetween] = useState(false);
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

    // Validate Navigation Controls
    const hasNavFlexDisplay =
      /\.buttons-container\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(
        htmlContent
      );
    const hasNavJustifyContent =
      /\.buttons-container\s*{[\s\S]*justify-content:\s*center;[\s\S]*}/i.test(
        htmlContent
      );

    // Validate Life Support Systems
    const hasSystemsFlexDisplay =
      /\.systems-container\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(
        htmlContent
      );
    const hasSystemsFlexWrap =
      /\.systems-container\s*{[\s\S]*flex-wrap:\s*wrap;[\s\S]*}/i.test(
        htmlContent
      );
    const hasSystemItemWidth =
      /\.system-item\s*{[\s\S]*flex:\s*1\s+0\s+45%;[\s\S]*}/i.test(
        htmlContent
      ) || /\.system-item\s*{[\s\S]*width:\s*45%;[\s\S]*}/i.test(htmlContent);

    // Validate Communications
    const hasCommsFlexDisplay =
      /\.comms-container\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(htmlContent);
    const hasCommsJustifyContent =
      /\.comms-container\s*{[\s\S]*justify-content:\s*space-between;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCommsChannelsFlexDisplay =
      /\.comms-channels\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(htmlContent);
    const hasCommsChannelsFlexDirection =
      /\.comms-channels\s*{[\s\S]*flex-direction:\s*column;[\s\S]*}/i.test(
        htmlContent
      );

    const navFullyStyled = hasNavFlexDisplay && hasNavJustifyContent;
    const systemsFullyStyled =
      hasSystemsFlexDisplay && hasSystemsFlexWrap && hasSystemItemWidth;
    const commsFullyStyled =
      hasCommsFlexDisplay &&
      hasCommsJustifyContent &&
      hasCommsChannelsFlexDisplay &&
      hasCommsChannelsFlexDirection;

    if (
      hasStyleTag &&
      navFullyStyled &&
      systemsFullyStyled &&
      commsFullyStyled
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
        const nextLevel = 28;
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

    // Navigation Controls validation
    const hasNavFlexDisplay =
      /\.buttons-container\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(
        htmlContent
      );
    const hasNavJustifyContent =
      /\.buttons-container\s*{[\s\S]*justify-content:\s*center;[\s\S]*}/i.test(
        htmlContent
      );

    // Life Support Systems validation
    const hasSystemsFlexDisplay =
      /\.systems-container\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(
        htmlContent
      );
    const hasSystemsFlexWrap =
      /\.systems-container\s*{[\s\S]*flex-wrap:\s*wrap;[\s\S]*}/i.test(
        htmlContent
      );
    const hasSystemItemWidth =
      /\.system-item\s*{[\s\S]*flex:\s*1\s+0\s+45%;[\s\S]*}/i.test(
        htmlContent
      ) || /\.system-item\s*{[\s\S]*width:\s*45%;[\s\S]*}/i.test(htmlContent);

    // Communications validation
    const hasCommsFlexDisplay =
      /\.comms-container\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(htmlContent);
    const hasCommsJustifyContent =
      /\.comms-container\s*{[\s\S]*justify-content:\s*space-between;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCommsChannelsFlexDisplay =
      /\.comms-channels\s*{[\s\S]*display:\s*flex;[\s\S]*}/i.test(htmlContent);
    const hasCommsChannelsFlexDirection =
      /\.comms-channels\s*{[\s\S]*flex-direction:\s*column;[\s\S]*}/i.test(
        htmlContent
      );

    setNavButtonsFlexed(hasNavFlexDisplay);
    setSystemsFlexed(hasSystemsFlexDisplay);
    setSystemsWrapped(hasSystemsFlexWrap);
    setCommsFlexed(hasCommsFlexDisplay);
    setCommsSpaceBetween(hasCommsJustifyContent);

    setNavControlsStyled(hasNavFlexDisplay && hasNavJustifyContent);
    setLifeSupportStyled(
      hasSystemsFlexDisplay && hasSystemsFlexWrap && hasSystemItemWidth
    );
    setCommunicationsStyled(
      hasCommsFlexDisplay &&
        hasCommsJustifyContent &&
        hasCommsChannelsFlexDisplay &&
        hasCommsChannelsFlexDirection
    );
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
            <div className="lesson">Lesson-27</div>
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
              27. CSS Flexbox for Space Station Control Panel
            </h2>

            {/* Lesson Introduction */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              As our space journey continues, we need more advanced layout
              techniques to organize our control panels efficiently. CSS Flexbox
              is a powerful layout method designed for arranging items in rows
              or columns, providing space distribution and alignment
              capabilities.
              <br />
              <br />
              Flexbox consists of two main components:
              <ul typeof="box">
                <li>
                  <code>Flex Container</code>: The parent element with{" "}
                  <code>display: flex</code> applied
                </li>
                <li>
                  <code>Flex Items</code>: The children elements inside the flex
                  container
                </li>
              </ul>
              Key Flexbox properties include:
              <ul typeof="box">
                <li>
                  <code>display: flex</code>: Activates flexbox layout
                </li>
                <li>
                  <code>flex-direction</code>: Sets the direction of items (row,
                  column)
                </li>
                <li>
                  <code>justify-content</code>: Aligns items along the main axis
                </li>
                <li>
                  <code>align-items</code>: Aligns items along the cross axis
                </li>
                <li>
                  <code>flex-wrap</code>: Controls whether items wrap to new
                  lines
                </li>
              </ul>
              Using these properties, we can create responsive, dynamic layouts
              perfect for space station control interfaces.
            </p>

            {/* Challenge Section */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              The space station control panel needs a layout upgrade using
              Flexbox! Your mission is to organize the different control
              sections using CSS Flexbox properties.
            </p>

            <ol>
              <li className="task-item">
                Style the Navigation Controls buttons:
                <ul>
                  <li>
                    Add <code>display: flex</code> to the{" "}
                    <code>buttons-container</code> class
                  </li>
                  <li>
                    Center the buttons with <code>justify-content: center</code>
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Organize the Life Support Systems indicators:
                <ul>
                  <li>
                    Add <code>display: flex</code> to the{" "}
                    <code>systems-container</code> class
                  </li>
                  <li>
                    Enable wrapping with <code>flex-wrap: wrap</code>
                  </li>
                  <li>
                    Set each <code>system-item</code> to take up 45% of the
                    space using <code>flex: 1 0 45%</code>
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Create a Communications panel layout:
                <ul>
                  <li>
                    Add <code>display: flex</code> to the{" "}
                    <code>comms-container</code> class
                  </li>
                  <li>
                    Use <code>justify-content: space-between</code> to separate
                    the channel controls and status indicators
                  </li>
                  <li>
                    Add <code>display: flex</code> to the{" "}
                    <code>comms-channels</code> class
                  </li>
                  <li>
                    Set <code>flex-direction: column</code> to stack channel
                    buttons vertically
                  </li>
                </ul>
              </li>
            </ol>

            <p>
              Once you apply these CSS flexbox styles correctly, the space
              station control panel will have an organized, professional layout
              suitable for mission control! 🚀
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
        <div className="playground-area" style={{ backgroundColor: "#0a0a1a" }}>
          <div className="space-center-area">
            <div className={`motivater ${hint === "" ? "fade" : ""}`}>
              <img
                className="astro-guider"
                src={AstronautGuider}
                alt="astronaut-image"
              />
              <p className="motive-text">{hint}</p>
            </div>

            <div className="control-panel-canvas">
              {/* Control Panel Display */}
              <div className="control-panel-preview">
                <h2>Space Station Control Panel Preview</h2>

                {/* Navigation Controls */}
                <div className="panel-section-preview">
                  <h3>Navigation Controls</h3>
                  <div
                    className={`buttons-row ${
                      navButtonsFlexed ? "flex-active justify-center" : ""
                    }`}
                  >
                    <button className="preview-button">Thrusters</button>
                    <button className="preview-button">Orientation</button>
                    <button className="preview-button">Autopilot</button>
                    <button className="preview-button">Dock</button>
                  </div>
                </div>

                {/* Life Support Systems */}
                <div className="panel-section-preview">
                  <h3>Life Support Systems</h3>
                  <div
                    className={`systems-grid ${
                      systemsFlexed ? "flex-active" : ""
                    } ${systemsWrapped ? "flex-wrap" : ""}`}
                  >
                    <div className="system-indicator-item">
                      <span className="indicator online"></span>
                      <span className="system">Oxygen</span>
                    </div>
                    <div className="system-indicator-item">
                      <span className="indicator online"></span>
                      <span className="system">Temperature</span>
                    </div>
                    <div className="system-indicator-item">
                      <span className="indicator standby"></span>
                      <span className="system">Water Recycling</span>
                    </div>
                    <div className="system-indicator-item">
                      <span className="indicator offline"></span>
                      <span className="system">Waste Management</span>
                    </div>
                  </div>
                </div>

                {/* Communications */}
                <div className="panel-section-preview">
                  <h3>Communications</h3>
                  <div
                    className={`comms-layout ${
                      commsFlexed ? "flex-active" : ""
                    } ${commsSpaceBetween ? "space-between" : ""}`}
                  >
                    <div className="channels-col">
                      <button className="preview-button">Ground Control</button>
                      <button className="preview-button">
                        System Broadcast
                      </button>
                      <button className="preview-button">Emergency</button>
                    </div>
                    <div className="status-col">
                      <div className="system-indicator-item">
                        <span className="indicator online"></span>
                        <span className="system">Main Antenna</span>
                      </div>
                      <div className="system-indicator-item">
                        <span className="indicator standby"></span>
                        <span className="system">Backup Antenna</span>
                      </div>
                    </div>
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

export default Lesson27;
