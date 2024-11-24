import React, { useState, useEffect, useRef } from "react";
import Table from "react-bootstrap/Table";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import GalacticBackground from "../../../images/lessons/galactic-background.jpg";
import TargetOutput from "../../../images/lessons/target-output-lesson-5.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson8.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson8() {
  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Mission Briefing</title>
  </head>
  <body>
    <!-- Change the necessary code lines in below code -->
    <h4>Mission Briefing</h4>
      <p>
        Operation Name: Operation Starquest
      </p>

      <p>Mission Objective:</p>
      <ul>
        <li>Collect soil samples from the planet keplar.</li>
      </ul>

      <p>Priority Instruction:</p>
      <ul>
        <li>
          All crew members must be in the control room by 0800 hours
        </li>
      </ul>

      <p>Safety Reminder:</p>
      <ul>
        <li>Activate the safety shield during turbulence.</li>
      </ul>

      <p>Special Note:</p>
      <ul>
        <li>Check the fuel levels before liftoff.</li>
      </ul>
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "<strong> tag is used to make words thicker and highlight it.",
    "<em> tag is used to emphasize words by making them italic.",
    "To underline a word, wrap the word with pair of <u> </u> tag.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 240, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [operationNameFormatting, setOperationNameFormatting] = useState(false);
  const [soilSamplesFormatting, setSoilSampleFormatting] = useState(false);
  const [commenceTimeFormatting, setCommenceTimeFormatting] = useState(false);
  const [safetyShieldFormatting, setSafetyShieldFormatting] = useState(false);
  const [fuelLevelsFormatting, setFuelLevelsFormatting] = useState(false);
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

    const checkFormattings = () => {
      if (
        operationNameFormatting &&
        soilSamplesFormatting &&
        commenceTimeFormatting &&
        safetyShieldFormatting &&
        fuelLevelsFormatting
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
      checkFormattings()
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
          consumedTime: consumedTime,
          usedAttempts: 5 - attemptCounter,
        });
        setPerformanceScore(score);
        setShowModal(true);
      }
    } else {
      toast.error("Not an acceptable answer!");
      if (attemptCounter > 0) {
        setAttemptCounter((prev) => prev - 1);
      }
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const operationNameFormatted = new RegExp(
      `<p>\\s*Operation\\s+Name:\\s*<strong>\\s*Operation\\s*Starquest\\s*<\\/strong>\\s*<\\/p>`,
      "i"
    ).test(htmlContent);

    const soilSamplesFormatted = new RegExp(
      `<ul>\\s*<li>\\s*Collect\\s+<u>\\s*soil\\s+samples\\s*<\\/u>\\s*from\\s+the\\s+planet\\s+keplar\\.\\s*<\\/li>\\s*<\\/ul>`,
      "is"
    ).test(htmlContent);

    const commenceTimeFormatted = new RegExp(
      `<ul>\\s*<li>\\s*All\\s+crew\\s+members\\s+must\\s+be\\s+in\\s+the\\s+control\\s+room\\s+by\\s+<em>\\s*0800\\s*<\\/em>\\s*hours\\s*<\\/li>\\s*<\\/ul>`,
      "i"
    ).test(htmlContent);

    const safetyShieldFormatted = new RegExp(
      `<ul>\\s*<li>\\s*Activate\\s+the\\s+<strong>\\s*safety\\s+shield\\s*<\\/strong>\\s+during\\s+turbulence\\.\\s*<\\/li>\\s*<\\/ul>`,
      "i"
    ).test(htmlContent);

    const fuelLevelsUnderlined = new RegExp(
      `<ul>\\s*<li>\\s*Check\\s+the\\s+<u>\\s*fuel\\s+levels\\s*<\\/u>\\s+before\\s+liftoff\\s*\\.\\s*<\\/li>\\s*<\\/ul>`,
      "i"
    ).test(htmlContent);

    setOperationNameFormatting(operationNameFormatted);
    setSoilSampleFormatting(soilSamplesFormatted);
    setCommenceTimeFormatting(commenceTimeFormatted);
    setSafetyShieldFormatting(safetyShieldFormatted);
    setFuelLevelsFormatting(fuelLevelsUnderlined);
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
            <div className="lesson">Lesson-08</div>
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
            <h2 className="lesson-heading">08.Mission Briefing Highlights</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              In this lesson, we will learn how to emphasize or highlight
              specific parts of text on a webpage using HTML tags. Emphasizing
              text helps to make important information stand out and easier for
              the reader to notice. There are three key tags you will use for
              this purpose:
              <b>How to use these tags?</b>
              <ol>
                <li>
                  <b>&lt;strong&gt;</b> - This tag is used to make text strong
                  or bold. It indicates that the enclosed text is of strong
                  importance. For example, if you want to highlight critical
                  information, you would use the &lt;strong&gt; tag.
                </li>
                <li>
                  <b>&lt;em&gt;</b> - This tag is used to emphasize text by
                  making it italic. It indicates that the enclosed text should
                  be emphasized, but not necessarily in bold. You might use the
                  &lt;em&gt; tag when you want to stress a word or phrase
                  without making it too heavy.
                </li>
                <li>
                  <b>&lt;u&gt;</b> - &lt;u&gt; tag is used to underline text.
                  It's helpful when you want to give a visual cue that the text
                  is important or should be noticed. Unlike &lt;strong&gt; or
                  &lt;em&gt;, it doesn't indicate any specific type of emphasis
                  in meaning but is purely for visual distinction.
                </li>
              </ol>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              <b>Mission Brief:</b> Space Center has decided to commence a
              mission on the planet called kepler. Higher administration already
              submitted the missin briefing document to you. Your task is to
              highlight the important points according to the instructions using
              the concepts you have learned.
              <br />
              <br />
              <b>Your Tasks:</b>
              <br />
              <br />
              <ol>
                <li>
                  <b>Operation Name</b> - You need to highlight "Operation
                  Starquest" by making it more thicker. Which makes it is easy
                  to find.
                </li>

                <li>
                  <b>Mission Objective</b> - In the mission objective, underline
                  the "soil sample" phrase to highlight what needs to be
                  collected.
                </li>

                <li>
                  <b>Priority Instruction</b> - In the priority instruction,
                  highlight the time the need to be present in control room
                  which is "0800" by making it italic.
                </li>

                <li>
                  <b>Safety Reminder</b> - In the safety reminders, highlight
                  the term "safety shield" by making the term more thicker.
                </li>

                <li>
                  <b>Special Note</b> - In the special note, underline the term
                  "fuel levels".
                </li>
              </ol>
              To help you out, We provided you the code snippet. Wrap the
              necessary elements with suitable tags to complete the challenge.
            </p>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, You should be able to see the highlighted parts of the
              mission brief.
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
          className="playground-area-l5"
          style={{ backgroundImage: `url(${GalacticBackground})` }}
        >
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
            <h4 className="briefing-heading">Mission Briefing</h4>

            <p className="op-info">
              Operation Name:{" "}
              {operationNameFormatting ? (
                <strong>Operation Starquest</strong>
              ) : (
                "Operation Starquest"
              )}
            </p>

            <p className="op-info">Mission Objective:</p>
            <ul>
              <li>
                Collect{" "}
                {soilSamplesFormatting ? <u>soil samples</u> : "soil samples"}{" "}
                from the planet keplar.
              </li>
            </ul>

            <p className="op-info">Priority Instruction:</p>
            <ul>
              <li>
                All crew members must be in the control room by{" "}
                {commenceTimeFormatting ? <i>0800</i> : "0800"} hours
              </li>
            </ul>

            <p className="op-info">Safety Reminder:</p>
            <ul>
              <li>
                Activate the{" "}
                {safetyShieldFormatting ? (
                  <strong>safety shield</strong>
                ) : (
                  "safety shield"
                )}{" "}
                during turbulence.
              </li>
            </ul>

            <p className="op-info">Special Note:</p>
            <ul>
              <li>
                Check the{" "}
                {fuelLevelsFormatting ? <u>fuel levels</u> : "fuel levels"}{" "}
                before liftoff .
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson8;
