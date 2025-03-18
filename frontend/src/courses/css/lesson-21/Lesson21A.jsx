import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import SpaceStationBackground from "../../../images/lessons/spaceship-interior.jpg";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import SpaceStationCrew from "../../../images/lessons/space-station-crew.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson21.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson21A() {
  const dispatch = useDispatch();
  const { course_id, current_level } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `
  <!--Create a space station crew badge using inline CSS-->
  
  <div>
    <h2>CREW MEMBER</h2>
    <p>Orion Space Station</p>
    <p>Name: John Doe</p>
    <p>Role: Engineer</p>
  </div>
  
  `;
  const hintDuration = 5000;
  const hints = [
    "Use border-radius to create the circular shape of the badge.",
    "The background color should be silver to represent a metallic badge.",
    "Text should be navy blue for better contrast against the silver background.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [textFormatted, setTextFormatted] = useState(false);
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
      setHint("No more hints left, astronaut!");
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    }
  };

  const validateAnswer = async (consumedTime) => {
    let htmlContent = htmlInput.trim();

    const hasBadgeStyles =
      /<div\s+style=["'][^"']*width:\s*150px;[^"']*height:\s*150px;[^"']*background-color:\s*silver;[^"']*border-radius:\s*50%;[^"']*["']>/i.test(
        htmlContent
      );
    const hasTextColor =
      /<div\s+style=["'][^"']*color:\s*navy;[^"']*["']>/i.test(htmlContent);

    const hasNecessaryElements = () => hasBadgeStyles && hasTextColor;

    if (hasNecessaryElements()) {
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

        const nextLevel = current_level > 22 ? current_level : 22;
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
        "Not quite right! Make sure your badge has all the required styles."
      );
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();
    const hasBadgeStyles =
      /<div\s+style=["'][^"']*width:\s*150px;[^"']*height:\s*150px;[^"']*background-color:\s*silver;[^"']*border-radius:\s*50%;[^"']*["']>/i.test(
        htmlContent
      );
    const hasTextColor =
      /<div\s+style=["'][^"']*color:\s*navy;[^"']*["']>/i.test(htmlContent);

    setBadgeVisible(hasBadgeStyles);
    setTextFormatted(hasTextColor);
  };

  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    value: htmlInput,
    height: "400px",
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
        {/* Lesson content and workbench */}
        <div className="workbench-area">
          {/* lesson details ribbon */}
          <div className="lesson-info-ribbon">
            <div className="lesson">Lesson-21</div>
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
            <h2 className="lesson-heading">21. More on Inline CSS</h2>
            {/* lesson introduction and concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Continuing our journey into CSS, we're going to explore more
              inline CSS properties. As we learned in the previous lesson,
              inline CSS is written directly within HTML elements using the{" "}
              <code>style</code> attribute. <br />
              <br />
              In this lesson, we'll focus on some important CSS properties that
              help create shapes and containers for our space station projects:
              <br />
              <code>background-color</code>: Sets the background color of an
              element
              <br />
              <code>width</code> and <code>height</code>: Define dimensions of
              an element
              <br />
              <code>border-radius</code>: Creates rounded corners or circular
              shapes
              <br />
              <code>text-align</code>: Controls the alignment of text
              <br />
              <code>padding</code>: Creates space inside an element around its
              content
              <br />
              <br />
              Remember, inline CSS is written directly within HTML tags using
              the <code>style</code> attribute. Multiple properties can be
              combined, each separated by a semicolon.
              <br />
              <br />
              Example:{" "}
              <code>
                &lt;div style="background-color: black; color: white; width:
                200px; height: 100px; text-align: center;"&gt; Space Station
                Alpha&lt;/div&gt;
              </code>
              <br />
              <br />
              This creates a black rectangle with white text, 200 pixels wide
              and 100 pixels tall, with text centered.
            </p>

            {/* challenge */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              On the Orion Space Station, crew members need identification
              badges. Your task is to create a crew badge using inline CSS. The
              badge should be circular, representing the traditional space
              agency badge shape.
            </p>
            <ol>
              <li className="task-item">
                Use the provided div element in the editor to create a circular
                badge.
              </li>
              <li className="task-item">
                Set the width and height to 150px using the <code>width:</code>{" "}
                and <code>height:</code> properties.
              </li>
              <li className="task-item">
                Make the badge silver by setting the{" "}
                <code>background-color:</code> to "silver".
              </li>
              <li className="task-item">
                Create a circular shape by adding{" "}
                <code>border-radius: 50%;</code> to the style.
              </li>
              <li className="task-item">
                Center the text inside the badge with{" "}
                <code>text-align: center;</code>
              </li>
              <li className="task-item">
                Add some padding with <code>padding: 10px;</code> to give the
                text some space.
              </li>
              <li className="task-item">
                Set the text color to navy blue using <code>color: navy;</code>
              </li>
            </ol>
            <p>
              When you've completed these steps correctly, your crew badge will
              appear on the space station!
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
        {/* Playground area */}
        <div
          className="playground-area"
          style={{ backgroundImage: `url(${SpaceStationBackground})` }}
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
            {/* badge display area */}
            <div className="badge-display-area"></div>
            {badgeVisible && (
              <div className="badge-container">
                {textFormatted && (
                  <div className="badge-content">
                    <h2>CREW MEMBER</h2>
                    <p>Orion Space Station</p>
                    <p>Name: John Doe</p>
                    <p>Role: Engineer</p>
                  </div>
                )}
              </div>
            )}
            <img
              src={SpaceStationCrew}
              alt="crew-member"
              className="crew-member"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson21A;
