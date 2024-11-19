import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import SpaceshipInterior from "../../../images/lessons/spaceship-interior.jpg";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import TargetOutput from "../../../images/lessons/target-output-lesson-2.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson2.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson2() {
  const initialCode = `<html>
  <head>
    <title>Mission Control Communications</title>
  </head>
  <body>
    <!-- Write all your answers inside this(body) section -->
    <!-- Primary Alert -->

    <!-- System Warning -->

    <!-- Mission Update -->

    <!-- Crew Status -->

    <!-- Equipment Check -->

    <!-- Daily Logs -->
    
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "<h1> is the largest heading. it suitable for important messages, headlines.",
    "<h6> is the smallest heading. suitable for normal titles and topics.",
    "As number value increses, font size is decresed accordingly.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [primaryAlertsVisibility, setPrimaryAlertsVisibility] = useState(false);
  const [systemWarningsVisibility, setSystemWarningsVisibility] =
    useState(false);
  const [missionUpdatesVisibility, setMissionUpdatesVisibility] =
    useState(false);
  const [crewStatusVisibility, setCrewStatusVisibility] = useState(false);
  const [equipmentCheckVisibility, setEquipmentCheckVisibility] =
    useState(false);
  const [dailyLogsVisibility, setDailyLogsVisibility] = useState(false);
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

  const validateAnswer = (consumedTime) => {
    let htmlContent = htmlInput.trim();
    const headBeforeBody =
      /<html[^>]*>\s*<head[^>]*>[\s\S]*<\/head>\s*<body[^>]*>[\s\S]*<\/body>\s*<\/html>/i.test(
        htmlContent
      );
    const hasHtmlTag = /<html[^>]*>[\s\S]*<\/html>/i.test(htmlContent);
    const hasHeadTag = /<head[^>]*>[\s\S]*<\/head>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>[\s\S]*<\/body>/i.test(htmlContent);
    const hasTitleTag = /<title[^>]*>[\s\S]*<\/title>/i.test(htmlContent);
    const hasHeadingType1 = /<h1[^>]*>\s*Primary Alerts\s*<\/h1>/i.test(
      htmlContent
    );
    const hasHeadingType2 = /<h2[^>]*>\s*System Warnings\s*<\/h2>/i.test(
      htmlContent
    );
    const hasHeadingType3 = /<h3[^>]*>\s*Mission Updates\s*<\/h3>/i.test(
      htmlContent
    );
    const hasHeadingType4 = /<h4[^>]*>\s*Crew Status\s*<\/h4>/i.test(
      htmlContent
    );
    const hasHeadingType5 = /<h5[^>]*>\s*Equipment Check\s*<\/h5>/i.test(
      htmlContent
    );
    const hasHeadingType6 = /<h6[^>]*>\s*Daily Logs\s*<\/h6>/i.test(
      htmlContent
    );

    const hasNecessaryHeadings = () => {
      if (
        hasHeadingType1 &&
        hasHeadingType2 &&
        hasHeadingType3 &&
        hasHeadingType4 &&
        hasHeadingType5 &&
        hasHeadingType6
      ) {
        return true;
      } else {
        return false;
      }
    };

    if (
      headBeforeBody &&
      hasHtmlTag &&
      hasHeadTag &&
      hasBodyTag &&
      hasTitleTag &&
      hasNecessaryHeadings()
    ) {
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
      }
    } else {
      toast.error("Not an acceptable answer!");
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();
    const hasHeadingType1 = /<h1[^>]*>\s*Primary Alerts\s*<\/h1>/i.test(
      htmlContent
    );
    const hasHeadingType2 = /<h2[^>]*>\s*System Warnings\s*<\/h2>/i.test(
      htmlContent
    );
    const hasHeadingType3 = /<h3[^>]*>\s*Mission Updates\s*<\/h3>/i.test(
      htmlContent
    );
    const hasHeadingType4 = /<h4[^>]*>\s*Crew Status\s*<\/h4>/i.test(
      htmlContent
    );
    const hasHeadingType5 = /<h5[^>]*>\s*Equipment Check\s*<\/h5>/i.test(
      htmlContent
    );
    const hasHeadingType6 = /<h6[^>]*>\s*Daily Logs\s*<\/h6>/i.test(
      htmlContent
    );

    setPrimaryAlertsVisibility(hasHeadingType1);
    setSystemWarningsVisibility(hasHeadingType2);
    setMissionUpdatesVisibility(hasHeadingType3);
    setCrewStatusVisibility(hasHeadingType4);
    setEquipmentCheckVisibility(hasHeadingType5);
    setDailyLogsVisibility(hasHeadingType6);
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
            <div className="lesson">Lesson-02</div>
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
              02.Mission Control Communication System
            </h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              In HTML, headings help us organize content and make it easier for
              people (and computers) to understand what’s important on the page.
              Think of headings as different levels of importance, like labels
              on different-sized storage boxes. Each heading, from h1 to h6,
              represents a level of priority. <br /> <br />
              <ul typeof="box">
                <li>
                  h1 is the biggest and most important, like the main title of a
                  book.
                </li>
                <li>h6 is the smallest, used for less important notes.</li>
              </ul>
              h6 is the smallest, used for less important notes. By using these
              heading tags, we can give each part of a webpage the right level
              of importance, so readers can quickly see what matters most. It’s
              like setting up signs in a space station — some need to be big and
              bold, while others are smaller and used for everyday tasks.
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              After building the space center, you and your colleagure asked to
              update the communication system with some new messages. Your task
              is to set the headings and your friend will put the relevant
              messages in each section. There are 6 types of messages. Heading
              size represents the priority of the message type. Highest priority
              goes to <b>Primary Alerts</b> and lowest priority is goes to
              <b> Daily Logs</b>. Use the knowledge of the HTML headings that
              your learned to overcome this challenge. Message types has listed
              below based on the importance of their priority.
            </p>
            <ol>
              <li className="task-item">
                Message Type-1 - "Primary Alerts" (Highest Priority)
              </li>
              <li className="task-item">Message Type-2 - "System Warnings"</li>
              <li className="task-item">Message Type-3 - "Mission Updates"</li>
              <li className="task-item">Message Type-4 - "Crew Status"</li>
              <li className="task-item">Message Type-5 - "Equipment Check"</li>
              <li className="task-item">
                Message Type-6 - "Daily Logs" (Lowest Priority)
              </li>
            </ol>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, Message types should be display as headings in the
              picture like below.
            </p>
            <img
              src={TargetOutput}
              className="target-output-img"
              alt="target_output_lesson2"
            />
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
              {/* first msg type */}
              {primaryAlertsVisibility && (
                <>
                  <h1 className="headtp-1">Primary Alerts</h1>
                  <span className="msg-type-divider" />
                </>
              )}

              {/* second msg type */}
              {systemWarningsVisibility && (
                <>
                  <h2 className="headtp-2">System Warnings</h2>
                  <span className="msg-type-divider" />
                </>
              )}

              {/* third msg type */}
              {missionUpdatesVisibility && (
                <>
                  <h3 className="headtp-3">Mission Updates</h3>
                  <span className="msg-type-divider" />
                </>
              )}

              {/* fourth msg type */}
              {crewStatusVisibility && (
                <>
                  <h4 className="headtp-4">Crew Status</h4>
                  <span className="msg-type-divider" />
                </>
              )}

              {/* fifth msg type */}
              {equipmentCheckVisibility && (
                <>
                  <h5 className="headtp-5">Equipment Check</h5>
                  <span className="msg-type-divider" />
                </>
              )}

              {/* sixth msg type */}
              {dailyLogsVisibility && (
                <>
                  <h6 className="headtp-6">Daily Logs</h6>
                  <span className="msg-type-divider" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson2;
