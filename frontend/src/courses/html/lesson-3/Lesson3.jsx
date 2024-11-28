import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import CaptainQuarters from "../../../images/lessons/captain-quarters.jpg";
import LogbookPage from "../../../images/lessons/log-book-page.png";
import TargetOutput from "../../../images/lessons/logbook-output.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson3.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson3() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Captain’s Logbook</title>
  </head>
  <body>
    <!-- Write your answer below relevant comments -->
    <!-- Log Entry for Day 1 -->
    

    <!-- Log Entry for Day 2 -->
    

    <!-- Log Entry for Day 3 -->
   
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Paragraph tag, AKA <p> tag is used to display a block of texts.",
    "Use <br> tag to seperate the log date and the log entry.",
    "Have you wrapped the log entry in correct way? Copy and paste the entries",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 480, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [firstEntryVisibility, setFirstEntryVisibility] = useState(false);
  const [secondEntryVisibility, setSecondEntryVisibility] = useState(false);
  const [thirdEntryVisibility, setThirdEntryVisibility] = useState(false);
  const [startAttempt, setStartAttempt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const editorRef = useRef();

  const targetLogEntries = [
    {
      date: "2072-June-05",
      entry:
        "Deployed the new space center module and adjusted communication antennas to improve signal strength.",
    },
    {
      date: "2072-June-06",
      entry:
        "Completed testing of the oxygen recycling unit. Encountered minor issues with pressure control.",
    },
    {
      date: "2072-June-07",
      entry:
        "Initiated solar panel array deployment to boost energy reserves. The team also calibrated the navigation systems to account.",
    },
  ];

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
    const headBeforeBody =
      /<html[^>]*>\s*<head[^>]*>[\s\S]*<\/head>\s*<body[^>]*>[\s\S]*<\/body>\s*<\/html>/i.test(
        htmlContent
      );
    const hasHtmlTag = /<html[^>]*>[\s\S]*<\/html>/i.test(htmlContent);
    const hasHeadTag = /<head[^>]*>[\s\S]*<\/head>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>[\s\S]*<\/body>/i.test(htmlContent);
    const hasTitleTag = /<title[^>]*>[\s\S]*<\/title>/i.test(htmlContent);

    const hasLogEntry1 = new RegExp(
      `<p[^>]*>\\s*${
        targetLogEntries[0].date
      }\\s*<br[^>]*>\\s*${targetLogEntries[0].entry.replace(
        /\s+/g,
        "\\s*"
      )}\\s*</p>`,
      "i"
    ).test(htmlContent);

    const hasLogEntry2 = new RegExp(
      `<p[^>]*>\\s*${
        targetLogEntries[1].date
      }\\s*<br[^>]*>\\s*${targetLogEntries[1].entry.replace(
        /\s+/g,
        "\\s*"
      )}\\s*</p>`,
      "i"
    ).test(htmlContent);

    const hasLogEntry3 = new RegExp(
      `<p[^>]*>\\s*${
        targetLogEntries[2].date
      }\\s*<br[^>]*>\\s*${targetLogEntries[2].entry.replace(
        /\s+/g,
        "\\s*"
      )}\\s*</p>`,
      "i"
    ).test(htmlContent);

    const logEntryValidator = () => {
      if (hasLogEntry1 && hasLogEntry2 && hasLogEntry3) {
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
      logEntryValidator()
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
        const nextLevel = 4;
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
      toast.error("Not an acceptable answer!");
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const hasLogEntry1 = new RegExp(
      `<p[^>]*>\\s*${
        targetLogEntries[0].date
      }\\s*<br[^>]*>\\s*${targetLogEntries[0].entry.replace(
        /\s+/g,
        "\\s*"
      )}\\s*</p>`,
      "i"
    ).test(htmlContent);

    const hasLogEntry2 = new RegExp(
      `<p[^>]*>\\s*${
        targetLogEntries[1].date
      }\\s*<br[^>]*>\\s*${targetLogEntries[1].entry.replace(
        /\s+/g,
        "\\s*"
      )}\\s*</p>`,
      "i"
    ).test(htmlContent);

    const hasLogEntry3 = new RegExp(
      `<p[^>]*>\\s*${
        targetLogEntries[2].date
      }\\s*<br[^>]*>\\s*${targetLogEntries[2].entry.replace(
        /\s+/g,
        "\\s*"
      )}\\s*</p>`,
      "i"
    ).test(htmlContent);

    setFirstEntryVisibility(hasLogEntry1);
    setSecondEntryVisibility(hasLogEntry2);
    setThirdEntryVisibility(hasLogEntry3);
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
            <div className="lesson">Lesson-03</div>
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
            <h2 className="lesson-heading">03.Captain's Log Entries</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              In HTML, structuring text content properly is essential for
              creating easy-to-read and well-organized web pages. Two basic tags
              used for this purpose are the &lt;p&gt;(paragraph) and &lt;br&gt;
              (line break) tags. <br /> <br />
              <ol>
                <li>
                  <b>The Paragraph Tag (&lt;p&gt;) </b>
                </li>
                <p>
                  The &lt;p&gt; tag is used to define a paragraph. When you wrap
                  text in &lt;p&gt;...&lt;/p&gt;, HTML treats it as a single
                  block of content, with a little space automatically added
                  above and below. This helps make text sections easy to read by
                  separating them visually.
                </p>
                <li>
                  <b>The Line Break Tag (&lt;br&gt;)</b>
                </li>
                <p>
                  The &lt;br&gt; tag is used to create a single line break.
                  Unlike the &lt;p&gt; tag, &lt;br&gt; doesn’t create a separate
                  block of text with extra spacing above and below it. Instead,
                  it simply moves the text that follows to a new line without
                  any additional space in between.
                </p>
                <p>
                  Use &lt;br&gt; for smaller breaks within the same block of
                  text, like creating new lines for dates, addresses, or
                  separating information that doesn’t need to be a whole new
                  paragraph. It’s handy for shorter, single-line breaks.
                </p>
              </ol>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Now that you’ve learned about using the &lt;p&gt; and &lt;br&gt;
              tags, it’s time to put your skills to the test! Imagine you’re
              filling out a captain's logbook in space, recording important
              details for each day. <br /> <br />
              <b>Your Task:</b> <br />
              Your challenge is to write 3 captain’s log entries using the
              correct format. Each log entry should have:
              <br />
              <br />
              <ol>
                <li>The date of the entry.</li>
                <li>The log message on a new line right after the date. </li>
              </ol>
              To help you out, here are three example log entries. You can copy
              and paste these directly, then add the appropriate tags and
              formatting as instructed.
            </p>
            <ol>
              <li className="task-item">
                Date: {targetLogEntries[0].date} <br /> Entry:
                {targetLogEntries[0].entry}
              </li>
              <li className="task-item">
                Date: {targetLogEntries[1].date} <br /> Entry:
                {targetLogEntries[1].entry}
              </li>
              <li className="task-item">
                Date: {targetLogEntries[2].date} <br /> Entry:
                {targetLogEntries[2].entry}
              </li>
            </ol>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, Log entry page should look like this.
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
          style={{ backgroundImage: `url(${CaptainQuarters})` }}
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
              className="log-book-page"
              style={{ backgroundImage: `url(${LogbookPage})` }}
            >
              <div className="log-page-heading">Log Entries</div>
              <div className="log-entries-section">
                {/* first log entry */}
                {firstEntryVisibility && (
                  <p className="log-entry">
                    {targetLogEntries[0].date} <br />
                    {targetLogEntries[0].entry}
                  </p>
                )}

                {/* second log entry */}
                {secondEntryVisibility && (
                  <p className="log-entry">
                    {targetLogEntries[1].date} <br />
                    {targetLogEntries[1].entry}
                  </p>
                )}

                {/* third log entry */}
                {thirdEntryVisibility && (
                  <p className="log-entry">
                    {targetLogEntries[2].date} <br />
                    {targetLogEntries[2].entry}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson3;
