import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import GalacticBackground from "../../../images/lessons/planet-exterior.jpg";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import AstroHeadshot from "../../../images/lessons/astro-headshot.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./html_project.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function HtmlProjectHard() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Space Station Management Interface</title>
    <style>
      /* You can add your CSS here */
    </style>
  </head>
  <body>
    <!-- Create a comprehensive Space Station Management Interface -->
    <!-- Include ALL the requested elements in the instructions -->

    <!-- 1. Create the main header and navigation menu -->

    <!-- 2. Create the Station Status dashboard with table -->

    <!-- 3. Create the Crew Assignments section with definition list -->

    <!-- 4. Create the Maintenance Request form -->

    <!-- 5. Create the Emergency Protocols section -->

  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Remember to use semantic HTML5 elements like <header>, <nav>, <section>, <footer> to structure your document",
    "When creating forms, each input should have a proper label with the 'for' attribute matching input 'id'",
    "Tables need <thead> and <tbody> sections, with proper use of <th> for headers",
    "Definition lists use <dl>, <dt> (term), and <dd> (description) tags",
    "Don't forget to include required attributes for inputs like 'required', 'type', etc.",
  ];
  const maximumMargins = { maxHints: 5, maxTime: 1200, maxAttempts: 3 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(5);
  const [attemptCounter, setAttemptCounter] = useState(3);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [startAttempt, setStartAttempt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTargetOutput, setShowTargetOutput] = useState(false);

  // Progress tracking for different sections
  const [hasHeader, setHasHeader] = useState(false);
  const [hasNavMenu, setHasNavMenu] = useState(false);
  const [hasStatusTable, setHasStatusTable] = useState(false);
  const [hasCrewList, setHasCrewList] = useState(false);
  const [hasMaintenanceForm, setHasMaintenanceForm] = useState(false);
  const [hasEmergencyProtocols, setHasEmergencyProtocols] = useState(false);
  const [hasFormValidation, setHasFormValidation] = useState(false);
  const [hasSemanticStructure, setHasSemanticStructure] = useState(false);
  const [hasFooter, setHasFooter] = useState(false);

  const editorRef = useRef();

  const useHintSystem = () => {
    if (hintCounter > 0) {
      setHintCounter((prev) => prev - 1);
      setHint(hints[5 - hintCounter]);
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    } else {
      setHint("No more hints available, commander!");
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    }
  };

  const validateAnswer = async (consumedTime) => {
    let htmlContent = htmlInput.trim();

    // Basic HTML structure validation
    const hasDocStructure =
      /<html[^>]*>[\s\S]*<head[^>]*>[\s\S]*<\/head>\s*<body[^>]*>[\s\S]*<\/body>\s*<\/html>/i.test(
        htmlContent
      );

    const hasTitleTag =
      /<title[^>]*>\s*Space\s*Station\s*Management\s*Interface\s*<\/title>/i.test(
        htmlContent
      );

    // Check for header with h1
    const hasProperHeader =
      /<header[^>]*>\s*[\s\S]*?<h1[^>]*>\s*Space\s*Station\s*[\s\S]*?<\/h1>[\s\S]*?<\/header>/i.test(
        htmlContent
      );

    // Check for navigation menu
    const hasProperNavMenu =
      /<nav[^>]*>\s*<ul[^>]*>(\s*<li[^>]*>[\s\S]*?<\/li>){3,}[\s\S]*?<\/ul>\s*<\/nav>/i.test(
        htmlContent
      );

    // Check for station status table with proper structure
    const hasProperTable =
      /<table[^>]*>[\s\S]*?<thead[^>]*>[\s\S]*?<tr[^>]*>(\s*<th[^>]*>[\s\S]*?<\/th>){2,}[\s\S]*?<\/tr>[\s\S]*?<\/thead>[\s\S]*?<tbody[^>]*>[\s\S]*?<\/tbody>[\s\S]*?<\/table>/i.test(
        htmlContent
      );

    // Check for definition list
    const hasDefinitionList =
      /<dl[^>]*>(\s*<dt[^>]*>[\s\S]*?<\/dt>\s*<dd[^>]*>[\s\S]*?<\/dd>){2,}[\s\S]*?<\/dl>/i.test(
        htmlContent
      );

    // Check for maintenance form with required fields
    const hasProperForm =
      /<form[^>]*>[\s\S]*?<label[^>]*>[\s\S]*?<\/label>[\s\S]*?<input[^>]*required[^>]*>[\s\S]*?<textarea[^>]*>[\s\S]*?<\/textarea>[\s\S]*?<select[^>]*>[\s\S]*?<\/select>[\s\S]*?<button[^>]*type=["']submit["'][^>]*>[\s\S]*?<\/button>[\s\S]*?<\/form>/i.test(
        htmlContent
      );

    // Check for emergency protocols section with ordered list
    const hasEmergencySection =
      /<section[^>]*>\s*[\s\S]*?<h2[^>]*>\s*Emergency\s*Protocols\s*<\/h2>[\s\S]*?<ol[^>]*>(\s*<li[^>]*>[\s\S]*?<\/li>){3,}[\s\S]*?<\/ol>[\s\S]*?<\/section>/i.test(
        htmlContent
      );

    // Check for semantic structure using multiple section tags
    const hasMultipleSections =
      (htmlContent.match(/<section[^>]*>/g) || []).length >= 3;

    // Check for footer
    const hasProperFooter = /<footer[^>]*>[\s\S]*?<\/footer>/i.test(
      htmlContent
    );

    const allRequirementsMet =
      hasDocStructure &&
      hasTitleTag &&
      hasProperHeader &&
      hasProperNavMenu &&
      hasProperTable &&
      hasDefinitionList &&
      hasProperForm &&
      hasEmergencySection &&
      hasMultipleSections &&
      hasProperFooter;

    if (allRequirementsMet) {
      setActivate(false);
      let score = 0;
      if (consumedTime !== null) {
        score = lessonPerformanceScoreCalculator(maximumMargins, {
          usedHints: hints.length - hintCounter,
          consumedTime,
          usedAttempts: 3 - attemptCounter,
        });
        setPerformanceScore(score);
        setShowModal(true);
        const nextLevel = 20;
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
          toast.success("Mission complete! Progress updated.");
        }
      }
    } else {
      toast.error("Your space station interface is incomplete!");
      setAttemptCounter((prev) => prev - 1);
      if (attemptCounter <= 1) {
        toast.error(
          "This is your final attempt. Use your HTML knowledge wisely!"
        );
      }
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    // Check individual components to provide visual feedback
    setHasHeader(
      /<header[^>]*>[\s\S]*?<h1[^>]*>[\s\S]*?<\/h1>[\s\S]*?<\/header>/i.test(
        htmlContent
      )
    );
    setHasNavMenu(
      /<nav[^>]*>[\s\S]*?<ul[^>]*>[\s\S]*?<li[^>]*>[\s\S]*?<\/li>[\s\S]*?<\/ul>[\s\S]*?<\/nav>/i.test(
        htmlContent
      )
    );
    setHasStatusTable(
      /<table[^>]*>[\s\S]*?<thead[^>]*>[\s\S]*?<tr[^>]*>[\s\S]*?<th[^>]*>[\s\S]*?<\/tr>[\s\S]*?<\/thead>[\s\S]*?<tbody[^>]*>[\s\S]*?<\/tbody>[\s\S]*?<\/table>/i.test(
        htmlContent
      )
    );
    setHasCrewList(
      /<dl[^>]*>[\s\S]*?<dt[^>]*>[\s\S]*?<\/dt>[\s\S]*?<dd[^>]*>[\s\S]*?<\/dd>[\s\S]*?<\/dl>/i.test(
        htmlContent
      )
    );
    setHasMaintenanceForm(
      /<form[^>]*>[\s\S]*?<input[^>]*>[\s\S]*?<textarea[^>]*>[\s\S]*?<\/textarea>[\s\S]*?<button[^>]*>[\s\S]*?<\/button>[\s\S]*?<\/form>/i.test(
        htmlContent
      )
    );
    setHasEmergencyProtocols(
      /<section[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?Emergency[\s\S]*?<\/h2>[\s\S]*?<ol[^>]*>[\s\S]*?<li[^>]*>[\s\S]*?<\/li>[\s\S]*?<\/ol>[\s\S]*?<\/section>/i.test(
        htmlContent
      )
    );
    setHasFormValidation(/<input[^>]*required[^>]*>/i.test(htmlContent));
    setHasSemanticStructure(
      (htmlContent.match(/<section[^>]*>/g) || []).length >= 3
    );
    setHasFooter(/<footer[^>]*>[\s\S]*?<\/footer>/i.test(htmlContent));
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

  const closeDisplayOutput = () => {
    setShowTargetOutput(false);
  };

  return (
    <>
      <PerformanceSummaryModal
        visibility={showModal}
        score={performanceScore}
      />
      <div className="main-container">
        <div className="workbench-area">
          <div className="lesson-info-ribbon">
            <div className="lesson">Recommendation Level (Hard)</div>
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

          <div className="lesson-content-partition">
            <h2 className="lesson-heading">
              Final Project: Advanced HTML 101 Challenge
            </h2>

            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Congratulations on reaching the final challenge of the HTML 101
              course! This advanced project will test your comprehensive
              understanding of HTML elements, semantic structure, and best
              practices.
              <br /> <br />
              <ul typeof="box">
                <li>
                  You'll apply knowledge of semantic HTML5 elements, forms with
                  validation, tables, lists, and proper document structure.
                </li>
                <li>
                  This challenge requires attention to detail and proper nesting
                  of elements.
                </li>
                <li>Try</li>
              </ul>
            </p>

            <h3 className="lesson-sub-headings">Mission Briefing</h3>
            <p className="mission-para">
              As a space station developer, your task is to create a
              comprehensive Space Station Management Interface using HTML. This
              interface will be used by astronauts to monitor station status,
              assign crew members, request maintenance, and access emergency
              protocols.
            </p>

            <h3 className="lesson-sub-headings">Requirements</h3>
            <div className="challenge-requirements">
              <ol typeof="box">
                <li>
                  <strong>Create a Main Header and Navigation:</strong>
                  <ul className="sub-requirement">
                    <li>
                      Use semantic <code>&lt;header&gt;</code> with{" "}
                      <code>&lt;h1&gt;</code> title
                    </li>
                    <li>
                      Include a <code>&lt;nav&gt;</code> with at least 4
                      navigation links in an unordered list
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Station Status Dashboard:</strong>
                  <ul className="sub-requirement">
                    <li>
                      Create a <code>&lt;table&gt;</code> with proper{" "}
                      <code>&lt;thead&gt;</code> and <code>&lt;tbody&gt;</code>
                    </li>
                    <li>Include columns for System, Status, and Last Check</li>
                    <li>
                      Add at least 4 different station systems with their
                      statuses
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Crew Assignments Section:</strong>
                  <ul className="sub-requirement">
                    <li>
                      Use a definition list <code>&lt;dl&gt;</code> with{" "}
                      <code>&lt;dt&gt;</code> and <code>&lt;dd&gt;</code>{" "}
                      elements
                    </li>
                    <li>
                      List at least 4 crew members and their assigned duties
                    </li>
                    <li>Include location information for each crew member</li>
                  </ul>
                </li>
                <li>
                  <strong>Maintenance Request Form:</strong>
                  <ul className="sub-requirement">
                    <li>
                      Create a <code>&lt;form&gt;</code> with appropriate{" "}
                      <code>&lt;label&gt;</code> elements
                    </li>
                    <li>
                      Include inputs for location, issue description (textarea),
                      priority (select)
                    </li>
                    <li>Add proper validation attributes (required fields)</li>
                    <li>Include a submit button</li>
                  </ul>
                </li>
                <li>
                  <strong>Emergency Protocols Section:</strong>
                  <ul className="sub-requirement">
                    <li>
                      Use an ordered list <code>&lt;ol&gt;</code> for
                      step-by-step emergency procedures
                    </li>
                    <li>Include at least 3 different emergency scenarios</li>
                    <li>Each scenario should have at least 3 steps</li>
                  </ul>
                </li>
                <li>
                  <strong>Proper Document Structure:</strong>
                  <ul className="sub-requirement">
                    <li>
                      Use semantic <code>&lt;section&gt;</code> elements to
                      divide content
                    </li>
                    <li>
                      Include a <code>&lt;footer&gt;</code> with copyright and
                      contact information
                    </li>
                    <li>Ensure proper nesting of all HTML elements</li>
                  </ul>
                </li>
              </ol>
            </div>
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

export default HtmlProjectHard;
