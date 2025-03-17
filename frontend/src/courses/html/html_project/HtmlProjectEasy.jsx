import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import GalacticBackground from "../../../images/lessons/galactic-map.jpg";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import { MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import Timer from "../../../components/timer/Timer";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";
import "./html_project.styles.css";

function HtmlProjectEasy() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Space Station Dashboard</title>
  </head>
  <body>
    <!-- Create your space station dashboard below -->
    <!-- Add a main heading for the dashboard -->

    <!-- Create a mission status section with a heading -->

    <!-- Add a table with mission details -->

    <!-- Add a crew section with a heading -->

    <!-- Create an unordered list of crew members -->

  </body>
</html>`;

  const hintDuration = 5000;
  const hints = [
    "Use <h1> for main headings and <h2> for section headings",
    "Create tables using <table>, <tr>, <th>, and <td> tags",
    "Use <ul> and <li> tags for unordered lists",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 600, maxAttempts: 5 };

  // States
  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [startAttempt, setStartAttempt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTargetOutput, setShowTargetOutput] = useState(false);

  // Dashboard element visibility states
  const [showMainHeading, setShowMainHeading] = useState(false);
  const [showMissionHeading, setShowMissionHeading] = useState(false);
  const [showMissionTable, setShowMissionTable] = useState(false);
  const [showCrewHeading, setShowCrewHeading] = useState(false);
  const [showCrewList, setShowCrewList] = useState(false);

  const editorRef = useRef();

  const useHintSystem = () => {
    if (hintCounter > 0) {
      setHintCounter((prev) => prev - 1);
      setHint(hints[3 - hintCounter]);
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    } else {
      setHint("No more hints available!");
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    // Check for main heading
    const hasMainHeading =
      /<h1[^>]*>\s*Space\s*Station\s*Dashboard\s*<\/h1>/i.test(htmlContent);

    // Check for mission status section
    const hasMissionHeading = /<h2[^>]*>\s*Mission\s*Status\s*<\/h2>/i.test(
      htmlContent
    );

    // Check for mission table
    const hasMissionTable = /<table[^>]*>[\s\S]*?<\/table>/i.test(htmlContent);
    const hasTableHeaders = /<th[^>]*>[\s\S]*?<\/th>/i.test(htmlContent);
    const hasTableData = /<td[^>]*>[\s\S]*?<\/td>/i.test(htmlContent);

    // Check for crew section
    const hasCrewHeading = /<h2[^>]*>\s*Crew\s*Members\s*<\/h2>/i.test(
      htmlContent
    );

    // Check for crew list
    const hasCrewList = /<ul[^>]*>[\s\S]*?<\/ul>/i.test(htmlContent);
    const hasCrewItems = /<li[^>]*>[\s\S]*?<\/li>/i.test(htmlContent);

    // Update visibility states
    setShowMainHeading(hasMainHeading);
    setShowMissionHeading(hasMissionHeading);
    setShowMissionTable(hasMissionTable && hasTableHeaders && hasTableData);
    setShowCrewHeading(hasCrewHeading);
    setShowCrewList(hasCrewList && hasCrewItems);
  };

  const validateAnswer = async (consumedTime) => {
    let htmlContent = htmlInput.trim();

    // Check basic HTML structure
    const hasHtmlStructure =
      /<html[^>]*>[\s\S]*<head[^>]*>[\s\S]*<\/head>[\s\S]*<body[^>]*>[\s\S]*<\/body>[\s\S]*<\/html>/i.test(
        htmlContent
      );
    const hasTitle =
      /<title[^>]*>\s*Space\s*Station\s*Dashboard\s*<\/title>/i.test(
        htmlContent
      );

    // Check for main heading
    const hasMainHeading =
      /<h1[^>]*>\s*Space\s*Station\s*Dashboard\s*<\/h1>/i.test(htmlContent);

    // Check for mission status section
    const hasMissionHeading = /<h2[^>]*>\s*Mission\s*Status\s*<\/h2>/i.test(
      htmlContent
    );

    // Check for mission table
    const hasMissionTable = /<table[^>]*>[\s\S]*?<\/table>/i.test(htmlContent);
    const hasTableHeaders = /<th[^>]*>[\s\S]*?<\/th>/i.test(htmlContent);
    const hasTableRows = /<tr[^>]*>[\s\S]*?<\/tr>/i.test(htmlContent);
    const hasTableData = /<td[^>]*>[\s\S]*?<\/td>/i.test(htmlContent);

    // Check for crew section
    const hasCrewHeading = /<h2[^>]*>\s*Crew\s*Members\s*<\/h2>/i.test(
      htmlContent
    );

    // Check for crew list
    const hasCrewList = /<ul[^>]*>[\s\S]*?<\/ul>/i.test(htmlContent);
    const hasCrewItems = /<li[^>]*>[\s\S]*?<\/li>/i.test(htmlContent);

    // Check if all required elements are present
    const hasAllRequiredElements =
      hasHtmlStructure &&
      hasTitle &&
      hasMainHeading &&
      hasMissionHeading &&
      hasMissionTable &&
      hasTableHeaders &&
      hasTableRows &&
      hasTableData &&
      hasCrewHeading &&
      hasCrewList &&
      hasCrewItems;

    if (hasAllRequiredElements) {
      setActivate(false);
      let score = 0;
      if (consumedTime !== null) {
        console.log({
          usedHints: hints.length - hintCounter,
          consumedTime,
          usedAttempts: 5 - attemptCounter,
        });
        score = lessonPerformanceScoreCalculator(maximumMargins, {
          usedHints: hints.length - hintCounter,
          consumedTime,
          usedAttempts: 5 - attemptCounter,
        });
        setPerformanceScore(score);
        setShowModal(true);
        const nextLevel = 15;
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
          toast.success("Your progress has been updated!");
        }
      }
    } else {
      toast.error("Your solution is not correct. Try again!");
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    value: htmlInput,
    height: "500px",
    extensions: [html()],
    theme: oneDark,
    onChange: (value) => {
      setHtmlInput(value);
      validateHTML();
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

  const displayOutput = () => {
    setShowTargetOutput(true);
  };

  const closeDisplayOutput = () => {
    setShowTargetOutput(false);
  };

  return (
    <>
      {/* Target output modal */}
      {showTargetOutput && (
        <div className="target-output-modal">
          <button
            className="target-output-close-btn"
            onClick={closeDisplayOutput}
          >
            <MdClose />
          </button>
          <div className="target-output-content">
            <h1>Space Station Dashboard</h1>

            <h2>Mission Status</h2>
            <table>
              <tr>
                <th>Mission Name</th>
                <th>Status</th>
                <th>Duration</th>
              </tr>
              <tr>
                <td>Deep Space Exploration</td>
                <td>In Progress</td>
                <td>45 days</td>
              </tr>
              <tr>
                <td>Mars Sample Return</td>
                <td>Scheduled</td>
                <td>120 days</td>
              </tr>
            </table>

            <h2>Crew Members</h2>
            <ul>
              <li>Commander Sarah Chen</li>
              <li>Pilot Alex Rodriguez</li>
              <li>Engineer Priya Sharma</li>
              <li>Medical Officer James Wilson</li>
            </ul>
          </div>
        </div>
      )}

      <PerformanceSummaryModal
        visibility={showModal}
        score={performanceScore}
      />

      <div className="main-container">
        {/* Workbench Area */}
        <div className="workbench-area">
          {/* Lesson info ribbon */}
          <div className="lesson-info-ribbon">
            <div className="lesson">Recommendation Lesson (Easy)</div>
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

          {/* Lesson content */}
          <div className="lesson-content-partition">
            <h2 className="lesson-heading">Space Station Dashboard</h2>

            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Welcome to the Space Station Dashboard project! In this exercise,
              you'll apply your HTML skills to create a simple dashboard for a
              space station. This will help you practice using various HTML
              elements, including headings, tables, and lists.
              <br />
              <br />
              <ul typeof="box">
                <li>
                  You'll need to implement proper HTML structure with headings,
                  tables, and lists.
                </li>
                <li>
                  Focus on organizing your content in a logical, readable
                  manner.
                </li>
                <li>
                  Try to complete the challenge without using hints if possible.
                </li>
              </ul>
            </p>

            {/* Display target output button */}
            <button
              className="target-output-btn"
              onClick={() => displayOutput()}
            >
              Show Target Output
            </button>

            {/* Challenge */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Your task is to create a Space Station Dashboard HTML page. The
              dashboard should display mission status and crew information. The
              final output should match the target example shown when clicking
              "Show Target Output".
            </p>
            <ol>
              <li className="task-item">
                Create a main heading for the dashboard titled "Space Station
                Dashboard".
              </li>
              <li className="task-item">
                Create a "Mission Status" section with a second-level heading.
              </li>
              <li className="task-item">
                Add a table with mission details, including columns for Mission
                Name, Status, and Duration.
              </li>
              <li className="task-item">
                Include at least two missions in your table: "Deep Space
                Exploration" (In Progress, 45 days) and "Mars Sample Return"
                (Scheduled, 120 days).
              </li>
              <li className="task-item">
                Create a "Crew Members" section with a second-level heading.
              </li>
              <li className="task-item">
                Add an unordered list of crew members: Commander Sarah Chen,
                Pilot Alex Rodriguez, Engineer Priya Sharma, and Medical Officer
                James Wilson.
              </li>
            </ol>
            <p>
              Remember to use proper HTML structure and appropriate tags for
              each element. Make sure your page is well-formatted and correctly
              structured.
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
              </div>
            )}
          </div>
        </div>

        <div
          className="playground-area"
          style={{ backgroundImage: `url(${GalacticBackground})` }}
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
              <div className="bio-data-form"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HtmlProjectEasy;
