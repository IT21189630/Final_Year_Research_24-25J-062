import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import SpaceshipInterior from "../../../images/lessons/spaceship-interior.jpg";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson24.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson24() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Spaceship Communication Console</title>
    <style>
      /* Define your text styles here */
      .alert-message {
        color: red;
      }
      
      .system-message {
        color: blue;
      }
      
      .crew-message {
        color: green;
      }
    </style>
  </head>
  <body>
    <!-- Apply text styling to these communication messages -->
    <div class="alert-message">WARNING: Asteroid field ahead!</div>
    <div class="system-message">Oxygen levels: Normal</div>
    <div class="crew-message">Captain: Everyone report to the bridge</div>
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Use font-size property to make text larger or smaller (e.g., font-size: 24px)",
    "Make text bold with font-weight property (e.g., font-weight: bold)",
    "Change typeface with font-family (e.g., font-family: monospace, Arial, sans-serif)",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [alertStyled, setAlertStyled] = useState(false);
  const [systemStyled, setSystemStyled] = useState(false);
  const [crewStyled, setCrewStyled] = useState(false);
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
    const hasStyleTag = /<style>[\s\S]*<\/style>/i.test(htmlContent);
    const hasAlertFontSize =
      /\.alert-message\s*{[\s\S]*font-size:\s*24px;[\s\S]*}/i.test(htmlContent);
    const hasAlertFontWeight =
      /\.alert-message\s*{[\s\S]*font-weight:\s*bold;[\s\S]*}/i.test(
        htmlContent
      );
    const hasAlertTextAlign =
      /\.alert-message\s*{[\s\S]*text-align:\s*center;[\s\S]*}/i.test(
        htmlContent
      );

    const hasSystemFontFamily =
      /\.system-message\s*{[\s\S]*font-family:\s*monospace;[\s\S]*}/i.test(
        htmlContent
      );
    const hasSystemFontSize =
      /\.system-message\s*{[\s\S]*font-size:\s*18px;[\s\S]*}/i.test(
        htmlContent
      );

    const hasCrewFontStyle =
      /\.crew-message\s*{[\s\S]*font-style:\s*italic;[\s\S]*}/i.test(
        htmlContent
      );

    const alertFullyStyled =
      hasAlertFontSize && hasAlertFontWeight && hasAlertTextAlign;
    const systemFullyStyled = hasSystemFontFamily && hasSystemFontSize;
    const crewFullyStyled = hasCrewFontStyle;

    if (
      hasStyleTag &&
      alertFullyStyled &&
      systemFullyStyled &&
      crewFullyStyled
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
        const nextLevel = 25;
        const updateFlag = await updateCourseProgress(
          user_id,
          course_id,
          lesson_id,
          score,
          nextLevel
        );
        if (updateFlag) {
          dispatch(
            updateProgress({
              current_level: nextLevel,
            })
          );
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

    const hasAlertFontSize =
      /\.alert-message\s*{[\s\S]*font-size:\s*24px;[\s\S]*}/i.test(htmlContent);
    const hasAlertFontWeight =
      /\.alert-message\s*{[\s\S]*font-weight:\s*bold;[\s\S]*}/i.test(
        htmlContent
      );
    const hasAlertTextAlign =
      /\.alert-message\s*{[\s\S]*text-align:\s*center;[\s\S]*}/i.test(
        htmlContent
      );

    const hasSystemFontFamily =
      /\.system-message\s*{[\s\S]*font-family:\s*monospace;[\s\S]*}/i.test(
        htmlContent
      );
    const hasSystemFontSize =
      /\.system-message\s*{[\s\S]*font-size:\s*18px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCrewFontStyle =
      /\.crew-message\s*{[\s\S]*font-style:\s*italic;[\s\S]*}/i.test(
        htmlContent
      );

    setAlertStyled(hasAlertFontSize && hasAlertFontWeight && hasAlertTextAlign);
    setSystemStyled(hasSystemFontFamily && hasSystemFontSize);
    setCrewStyled(hasCrewFontStyle);
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
            <div className="lesson">Lesson-24</div>
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
              24.CSS Text Styling for Spaceship Communications
            </h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Now that we've learned about internal CSS, borders, and
              border-radius, let's discover how to style text to make our
              messages clear and easy to read. In a spaceship, different types
              of messages need different visual treatments to help astronauts
              quickly understand their importance.
              <br />
              <br />
              CSS offers several properties specifically for styling text:
              <ul typeof="box">
                <li>
                  <code>font-size</code>: Controls how big or small text appears
                  (measured in px, em, rem, etc.)
                </li>
                <li>
                  <code>font-weight</code>: Makes text bold (values include
                  normal, bold, 100-900)
                </li>
                <li>
                  <code>font-family</code>: Changes the typeface (like Arial,
                  Times New Roman, monospace)
                </li>
                <li>
                  <code>color</code>: Sets the text color (like red, #FF0000,
                  rgb(255,0,0))
                </li>
                <li>
                  <code>text-align</code>: Controls alignment (left, right,
                  center, justify)
                </li>
                <li>
                  <code>font-style</code>: Makes text italic or normal
                </li>
              </ul>
              By using these properties, we can create different visual
              hierarchies for our text content, making important messages stand
              out and ensuring clarity in communication.
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              The spaceship's communication console needs an upgrade! Currently,
              all message types look similar except for their background colors.
              Your job is to style each message type to make them more readable
              and appropriate for their purpose.
            </p>
            <ol>
              <li className="task-item">
                For <strong>Alert Messages</strong> (highest priority):
                <ul>
                  <li>
                    Make text large using <code>font-size: 24px;</code>
                  </li>
                  <li>
                    Make text bold using <code>font-weight: bold;</code>
                  </li>
                  <li>
                    Center the text using <code>text-align: center;</code>
                  </li>
                </ul>
              </li>
              <li className="task-item">
                For <strong>System Messages</strong> (technical information):
                <ul>
                  <li>
                    Use a monospace font with{" "}
                    <code>font-family: monospace;</code>
                  </li>
                  <li>
                    Make text slightly larger using{" "}
                    <code>font-size: 18px;</code>
                  </li>
                </ul>
              </li>
              <li className="task-item">
                For <strong>Crew Messages</strong> (personal communications):
                <ul>
                  <li>
                    Make text italic using <code>font-style: italic;</code>
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, Message types should be display as headings in the
              picture like below.
            </p>
            {!startAttempt && (
              <button className="attempt-btn" onClick={() => beginChallenge()}>
                Start Attempt
              </button>
            )}
            {/* <button onClick={activateTimer}>Activate/Deactivate</button> */}
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
                {/* alert messages */}
                <div
                  style={{ color: "red" }}
                  className={`${alertStyled ? "alert-message" : ""}`}
                >
                  WARNING: Asteroid field ahead!
                </div>

                {/* system messages */}
                <div
                  style={{ marginTop: "30px", color: "blue" }}
                  className={`${systemStyled ? "system-message" : ""}`}
                >
                  Oxygen levels: Normal
                </div>

                {/* personal communications */}
                <div
                  style={{ marginTop: "30px", color: "green" }}
                  className={`${crewStyled ? "crew-message" : ""}`}
                >
                  Captain: Everyone report to the bridge
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson24;
