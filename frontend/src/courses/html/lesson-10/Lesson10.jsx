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
import "./Lesson10.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson10() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);
  const [planetaryDetailsVisibility, setPlanetaryDetailsVisibility] =
    useState(false);
  const [atmosphericConditionsVisibility, setAtmosphericConditionsVisibility] =
    useState(false);

  const initialCode = `<!DOCTYPE html>
  <html>
    <head>
      <title>Planetary Registration Form</title>
    </head>
    <body>
      <form>
        <!-- Group basic planetary details here using fieldset -->
        
        <!-- Group atmospheric conditions here using another fieldset -->
      </form>
    </body>
  </html>`;
  const hintDuration = 5000;
  const hints = [
    "Use <fieldset> to group related inputs together.",
    "Each <fieldset> should have a <legend> to describe its section.",
    "Place planetary details in one <fieldset> and atmospheric conditions in another.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 240, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
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

  // const validateAnswer = async (consumedTime) => {
  //   let htmlContent = htmlInput.trim();

  //   const hasPlanetaryDetailsFieldset =
  //     /<fieldset[^>]*>\s*<legend>\s*Planetary Details\s*<\/legend>/i.test(
  //       htmlContent
  //     );

  //   const hasAtmosphericConditionsFieldset =
  //     /<fieldset[^>]*>\s*<legend>\s*Atmospheric Conditions\s*<\/legend>/i.test(
  //       htmlContent
  //     );

  //   if (hasPlanetaryDetailsFieldset && hasAtmosphericConditionsFieldset) {
  //     setActivate(false);
  //     let score = lessonPerformanceScoreCalculator(maximumMargins, {
  //       usedHints: hints.length - hintCounter,
  //       consumedTime,
  //       usedAttempts: 5 - attemptCounter,
  //     });

  //     setPerformanceScore(score);
  //     setShowModal(true);

  //     const nextLevel = 11;
  //     const updateFlag = await updateCourseProgress(
  //       user_id,
  //       course_id,
  //       lesson_id,
  //       score,
  //       nextLevel
  //     );

  //     if (updateFlag) {
  //       dispatch(updateProgress({ current_level: nextLevel }));
  //       toast.success("Your progress updated!");
  //     }
  //   } else {
  //     toast.error(
  //       "Your answer is incorrect! Ensure you use <fieldset> with <legend> for grouping."
  //     );
  //     if (attemptCounter > 0) {
  //       setAttemptCounter((prev) => prev - 1);
  //     }
  //   }
  // };

  const validateAnswer = async (consumedTime) => {
    let htmlContent = htmlInput.trim();
    const hasFieldset = /<fieldset>[\s\S]*?<\/fieldset>/i.test(htmlContent);
    const hasLegends = /<legend>[\s\S]*?<\/legend>/i.test(htmlContent);
    const hasCorrectSections =
      /<fieldset>[\s\S]*Planetary Details[\s\S]*?<\/fieldset>/i.test(
        htmlContent
      ) &&
      /<fieldset>[\s\S]*Atmospheric Conditions[\s\S]*?<\/fieldset>/i.test(
        htmlContent
      );

    if (hasFieldset && hasLegends && hasCorrectSections) {
      setActivate(false);
      let score = lessonPerformanceScoreCalculator(maximumMargins, {
        usedHints: hints.length - hintCounter,
        consumedTime,
        usedAttempts: 5 - attemptCounter,
      });
      setPerformanceScore(score);
      setShowModal(true);
      const nextLevel = 11;
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
    } else {
      toast.error(
        "Your answer is incorrect! Ensure you use <fieldset> with <legend> for grouping."
      );
      if (attemptCounter > 0) {
        setAttemptCounter((prev) => prev - 1);
      }
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

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    // Check if the first fieldset (Planetary Details) exists with the correct legend
    const hasPlanetaryDetailsFieldset =
      /<fieldset[^>]*>\s*<legend>\s*Planetary Details\s*<\/legend>/i.test(
        htmlContent
      );

    // Check if the second fieldset (Atmospheric Conditions) exists with the correct legend
    const hasAtmosphericConditionsFieldset =
      /<fieldset[^>]*>\s*<legend>\s*Atmospheric Conditions\s*<\/legend>/i.test(
        htmlContent
      );

    setPlanetaryDetailsVisibility(hasPlanetaryDetailsFieldset);
    setAtmosphericConditionsVisibility(hasAtmosphericConditionsFieldset);
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
            <div className="lesson">Lesson-10</div>
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
              10. Grouping Inputs with Fieldsets
            </h2>
            <p className="introduction-para">
              Forms help organize information, and fieldsets make forms even
              better! By using <code>&lt;fieldset&gt;</code>, you can group
              related input fields together, making your form easier to read and
              use. Each <code>&lt;fieldset&gt;</code> should have a{" "}
              <code>&lt;legend&gt;</code> to describe what the section is about.
            </p>
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Your task is to create a **Planetary Registration Form** with two
              sections:
            </p>
            <ul>
              <li>A **Planetary Details** section for name and type.</li>
              <li>
                An **Atmospheric Conditions** section for oxygen levels and
                temperature.
              </li>
            </ul>
            <p>
              Use <code>&lt;fieldset&gt;</code> to group them and{" "}
              <code>&lt;legend&gt;</code> to label them correctly. Fieldset acts
              like container for form contents. and legend is used to label that
              container.
            </p>
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
              {/* first fieldset */}
              {planetaryDetailsVisibility && (
                <>
                  <fieldset className="detail-form-l10">
                    <span className="legend-indicator">Planetary Details</span>
                  </fieldset>
                </>
              )}

              {/* second fieldset */}
              {atmosphericConditionsVisibility && (
                <>
                  <fieldset className="detail-form-l10">
                    <span className="legend-indicator">
                      Atmospheric Conditions
                    </span>
                  </fieldset>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson10;
