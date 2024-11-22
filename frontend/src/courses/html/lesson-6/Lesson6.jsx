import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import SpaceCenterControlRoom from "../../../images/lessons/space-center-control-room.jpg";
import TargetOutput from "../../../images/lessons/target-output-lesson-5.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import LogbookPage from "../../../images/lessons/log-book-page.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { engineDismantleGuide, engineMaintenanceGuide } from "./tasks";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson6.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson6() {
  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Astronaut Task Checklist</title>
  </head>
  <body>

    <!-- Daily Maintenance Checklist -->
    

    <!-- Mission Preparation Steps -->
    

  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Use <ol> for steps that need to be in a specific order. Items should be inside <li> tags.",
    "Ensure each list item is inside <li>, and close your list with </ul> or </ol>.",
    "Use <ul> for items where order doesn’t matter. Each item should be inside <li> tags",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 240, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [orderedStepOneVisibility, setOrderedStepOneVisibility] =
    useState(false);
  const [orderedStepTwoVisibility, setOrderedStepTwoVisibility] =
    useState(false);
  const [orderedStepThreeVisibility, setOrderedStepThreeVisibility] =
    useState(false);
  const [unorderedStepOneVisibility, setUnorderedStepOneVisibility] =
    useState(false);
  const [unorderedStepTwoVisibility, setUnorderedStepTwoVisibility] =
    useState(false);
  const [unorderedStepThreeVisibility, setUnorderedStepThreeVisibility] =
    useState(false);
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

    const engineDismantleValidations = [
      new RegExp(
        `<ol[^>]*>\\s*<li[^>]*>\\s*${engineDismantleGuide[0]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineDismantleGuide[1]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineDismantleGuide[2]}\\s*<\\/li>`,
        "i"
      ),
    ];

    const dismantleStep1 = engineDismantleValidations[0].test(htmlContent);
    const dismantleStep2 = engineDismantleValidations[1].test(htmlContent);
    const dismantleStep3 = engineDismantleValidations[2].test(htmlContent);

    const enginemaintenanceValidations = [
      new RegExp(
        `<ul[^>]*>\\s*<li[^>]*>\\s*${engineMaintenanceGuide[0]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineMaintenanceGuide[1]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineMaintenanceGuide[2]}\\s*<\\/li>`,
        "i"
      ),
    ];

    const maintenanceStep1 = enginemaintenanceValidations[0].test(htmlContent);
    const maintenanceStep2 = enginemaintenanceValidations[1].test(htmlContent);
    const maintenanceStep3 = enginemaintenanceValidations[2].test(htmlContent);

    const maintenanceStepsValidator = () => {
      if (maintenanceStep1 && maintenanceStep2 && maintenanceStep3) {
        return true;
      } else {
        return false;
      }
    };

    const dismantleStepsValidator = () => {
      if (dismantleStep1 && dismantleStep2 && dismantleStep3) {
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
      dismantleStepsValidator() &&
      maintenanceStepsValidator()
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

    const engineDismantleValidations = [
      new RegExp(
        `<ol[^>]*>\\s*<li[^>]*>\\s*${engineDismantleGuide[0]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineDismantleGuide[1]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineDismantleGuide[2]}\\s*<\\/li>`,
        "i"
      ),
    ];

    const enginemaintenanceValidations = [
      new RegExp(
        `<ul[^>]*>\\s*<li[^>]*>\\s*${engineMaintenanceGuide[0]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineMaintenanceGuide[1]}\\s*<\\/li>`,
        "i"
      ),
      new RegExp(
        `<[^>]*>\\s*<li[^>]*>\\s*${engineMaintenanceGuide[2]}\\s*<\\/li>`,
        "i"
      ),
    ];

    const dismantleStep1 = engineDismantleValidations[0].test(htmlContent);
    const dismantleStep2 = engineDismantleValidations[1].test(htmlContent);
    const dismantleStep3 = engineDismantleValidations[2].test(htmlContent);

    const maintenanceStep1 = enginemaintenanceValidations[0].test(htmlContent);
    const maintenanceStep2 = enginemaintenanceValidations[1].test(htmlContent);
    const maintenanceStep3 = enginemaintenanceValidations[2].test(htmlContent);

    setOrderedStepOneVisibility(dismantleStep1);
    setOrderedStepTwoVisibility(dismantleStep2);
    setOrderedStepThreeVisibility(dismantleStep3);

    setUnorderedStepOneVisibility(maintenanceStep1);
    setUnorderedStepTwoVisibility(maintenanceStep2);
    setUnorderedStepThreeVisibility(maintenanceStep3);
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
            <div className="lesson">Lesson-06</div>
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
            <h2 className="lesson-heading">06.Astronaut Task Checklist</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Welcome to this lesson! Today, we're going to learn about HTML
              lists, a simple but powerful way to organize information on a web
              page. Lists make your content easier to read and more visually
              appealing by structuring it in a clear and logical way. Let’s dive
              in! <br /> <br />
              <b>What is an HTML List</b>
              <p>
                An HTML list is a way of displaying items one after another. You
                might have seen them on websites as bullet points or numbered
                steps. They’re perfect for showing recipes, instructions, tasks,
                or any information that needs to be arranged neatly.here are
                three main types of lists in HTML that you should know about:
              </p>
              <ol>
                <li>
                  <b>Ordered List &lt;ol&gt;</b> - This type of lists are used
                  to represent items that need to be in specific sequence.
                </li>
                <li>
                  <b>Unordered List &lt;ul&gt;</b> - This type of lists are used
                  to represent items that do not have particular order.
                </li>
                <li>
                  <b>Descrption List &lt;dl&gt;</b> - This type is for
                  presenting a list of terms and their descriptions.
                </li>
              </ol>
              <b>How to make a list</b>
              <ul>
                <li>
                  First of all you want to define the syntax of list based on
                  what type of list you want. it can be a &lt;ol&gt; or
                  &lt;ul&gt;
                </li>
                <li>
                  Then in order to represent a list itme of your list you can
                  use &lt;li&gt; tags in between the opening tag and closing tag
                  of your defined list like this, eg:
                  <b>&lt;li&gt;Apple&lt;/li&gt;</b>
                </li>
              </ul>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              <b>Mission Brief:</b> Your fellow astronaut needs a clear and
              organized checklist to maintain the engine of one of our
              spaceships. It’s your job to create this checklist using the
              knowledge you've gained about HTML lists!
              <br />
              <br />
              <b>Your Tasks:</b> <br />
              Create an Ordered List for the engine dismantling steps, making
              sure each task is clearly defined in the correct order. Then,
              create an Unordered List for the engine maintenance guide, where
              tasks can be done in any order. Use what you’ve learned about
              &lt;ol&gt; and &lt;ul&gt; to structure the lists accurately. Use
              the following lists overcome the challenge.
              <br />
              <br />
              <ul>
                <b>Engine Dismantling Steps</b>
                <li>{engineDismantleGuide[0]}</li>
                <li>{engineDismantleGuide[1]}</li>
                <li>{engineDismantleGuide[2]}</li>
              </ul>
              <ul>
                <b>Engine Maintenance Tasks</b>
                <li>{engineMaintenanceGuide[0]}</li>
                <li>{engineMaintenanceGuide[1]}</li>
                <li>{engineMaintenanceGuide[2]}</li>
              </ul>
              To help you out, all the tasks are mentioned. You just simply can
              copy and paste them if you want.
            </p>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, List items should appear in the checklist accordingly.
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
          style={{ backgroundImage: `url(${SpaceCenterControlRoom})` }}
        >
          <div className={`motivater ${hint === "" ? "fade" : ""}`}>
            <img
              className="astro-guider"
              src={AstronautGuider}
              alt="astronaut-image"
            />
            <p className="motive-text">{hint}</p>
          </div>
          {/* todo list */}
          <div
            className="tasks-page"
            style={{ backgroundImage: `url(${LogbookPage})` }}
          >
            <div className="task-page-heading">Tasks Checklist</div>
            <div className="task-entries-section">
              <span className="list-topic">Engine Dismantling Steps</span>
              {/* engine dismantling guide - ordered list */}
              <ol className="list-area">
                {/* first step of engine dismantle */}
                {orderedStepOneVisibility && (
                  <li className="todo-task">{engineDismantleGuide[0]}</li>
                )}
                {/* second step of engine dismantle */}
                {orderedStepTwoVisibility && (
                  <li className="todo-task">{engineDismantleGuide[1]}</li>
                )}
                {/* third step of engine dismantle */}
                {orderedStepThreeVisibility && (
                  <li className="todo-task">{engineDismantleGuide[2]}</li>
                )}
              </ol>

              <span className="list-topic">Engine maintenance Tasks</span>
              {/* engine maintenance guide - unordered list */}
              <ul className="list-area">
                {/* first step of engine maintenance */}
                {unorderedStepOneVisibility && (
                  <li className="todo-task">{engineMaintenanceGuide[0]}</li>
                )}
                {/* second step of engine maintenance */}
                {unorderedStepTwoVisibility && (
                  <li className="todo-task">{engineMaintenanceGuide[1]}</li>
                )}
                {/* third step of engine maintenance */}
                {unorderedStepThreeVisibility && (
                  <li className="todo-task">{engineMaintenanceGuide[2]}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson6;
