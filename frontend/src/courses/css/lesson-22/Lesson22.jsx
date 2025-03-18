import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import BarrenLandsImage from "../../../images/lessons/barren-lands.jpg";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import AstroStanding from "../../../images/lessons/astro-standing.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson22.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson22() {
  const dispatch = useDispatch();
  const { course_id, current_level } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `
  <!--Write your CSS inside the <style> tag and apply it using class selectors-->
  <html>
  <head>
    <title>Mission Flag</title>
    <style>
      /* Define your flag styles here */
    </style>
  </head>
  <body>
    <div class="flag">We did it!</div>
  </body>
  </html>
  `;

  const hintDuration = 5000;
  const hints = [
    "Use a <style> tag inside the <head> section.",
    "Apply styles using class selectors, not inline styles.",
    "Use .flag { background-color: red; } to change the flag color.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [flagVisibility, setFlagVisibility] = useState(false);
  const [textVisibility, setTextVisibility] = useState(false);
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
    const hasFlagClass =
      /\.flag\s*{[\s\S]*background-color:\s*red;[\s\S]*}/i.test(htmlContent);
    const hasTextColor = /\.flag\s*{[\s\S]*color:\s*white;[\s\S]*}/i.test(
      htmlContent
    );

    if (hasStyleTag && hasFlagClass && hasTextColor) {
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

        const nextLevel = current_level > 23 ? current_level : 23;
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
      toast.error("Not an acceptable answer! Use internal CSS correctly.");
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const hasStyleTag = /<style>[\s\S]*<\/style>/i.test(htmlContent);
    const hasFlagClass =
      /\.flag\s*{[\s\S]*background-color:\s*red;[\s\S]*}/i.test(htmlContent);
    const hasTextColor = /\.flag\s*{[\s\S]*color:\s*white;[\s\S]*}/i.test(
      htmlContent
    );

    setFlagVisibility(hasFlagClass);
    setTextVisibility(hasTextColor);
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
        {/* This is the part where we teach the concept and declare the challenge - workbench */}
        <div className="workbench-area">
          {/* lesson details ribbon */}
          <div className="lesson-info-ribbon">
            <div className="lesson">Lesson-22</div>
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
            <h2 className="lesson-heading">22.Internal CSS with Selectors</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Instead of inline styles, we use **Internal CSS** to separate
              styles from the structure. Internal CSS is written inside a
              `&lt;style&gt;` tag in the `&lt;head&gt;` section and applied
              using class selectors. <br /> <br />
              In the last lesson, we learned how to use inline CSS to style
              elements directly. But what if we need to style multiple elements
              in the same way? Writing styles inside each tag would be
              repetitive and messy. That’s where internal CSS comes in!
              <br />
              <br />
              <code>.selector-name</code> and <code>#selector-name</code> is
              important concept as well. if you use <code>class=""</code>{" "}
              attribute in your element, you should put a "." symbol before the
              classname in your style tags. if you use <code>id=""</code>{" "}
              attribute you should use the "#" symbol before the selector name.
              curly braces are used to set the boundaries of a class.
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              So use the css selector called "flag" and apply the below styles
              for that selector to get the same output as previous lesson.
            </p>
            <ol>
              <li className="task-item">
                There is a div element in the code editor. you have turn it to a
                flag using CSS stylings.
              </li>
              <li className="task-item">
                Width of the flag is 200px (px means pixels). Height of the flag
                is 125px. you can use <code>width:</code> and{" "}
                <code>height:</code> properties to do that.
              </li>
              <li className="task-item">
                Flag color should be "red". use the{" "}
                <code>background-color:</code> css property to change the
                background color
              </li>
              <li className="task-item">
                Text content of the div should be "We did it!" text color should
                be white. use the <code>color:</code> property to change the
                color of text.
              </li>
            </ol>
            <p>
              Remember to put colons(:) and semi-colons(;) where it is necessary
              and everything is in its proper place. Once you complete these
              steps correctly, Flag should be displayed!
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
          style={{ backgroundImage: `url(${BarrenLandsImage})` }}
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
            {/* flag post */}
            <div className="flag-post"></div>
            {flagVisibility && (
              <div className="flag-cont">
                {textVisibility && <span>We did it!</span>}
              </div>
            )}
            <img
              src={AstroStanding}
              alt="astronaut"
              className="astro-standing"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson22;
