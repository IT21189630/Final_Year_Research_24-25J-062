import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import SpaceshipDashboard from "../../../images/lessons/dashboard-spaceship.jpg";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson23.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson23() {
  const dispatch = useDispatch();
  const { course_id, current_level } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `
  <!--Write your CSS inside the <style> tag and apply it using class selectors-->
<html>
<head>
  <title>Spaceship Dashboard</title>
  <style>
    /* Place your button styles here */
    .orange-btn {
      background-color: orange;
    }
    
    .green-btn {
      background-color: green;
    }
    
    .blue-btn {
      background-color: blue;
    }
  </style>
</head>
<body>
  <div class="orange-btn">Navigation</div>
  <div class="green-btn">Systems</div>
  <div class="blue-btn">Communications</div>
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
  const [roundOrangeBtn, setRoundOrangeBtn] = useState(false);
  const [roundBlueBtn, setRoundBlueBtn] = useState(false);
  const [roundGreenBtn, setRoundGreenBtn] = useState(false);
  const [orangeBorder, setOrangeBorder] = useState(false);
  const [greenBorder, setGreenBorder] = useState(false);
  const [blueBorder, setBlueBorder] = useState(false);
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

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const hasStyleTag = /<style>[\s\S]*<\/style>/i.test(htmlContent);

    const hasOrangeBorder =
      /\.orange-btn\s*{[\s\S]*border:\s*3px\s+solid\s+white;[\s\S]*}/i.test(
        htmlContent
      );
    const hasGreenBorder =
      /\.green-btn\s*{[\s\S]*border:\s*3px\s+solid\s+white;[\s\S]*}/i.test(
        htmlContent
      );
    const hasBlueBorder =
      /\.blue-btn\s*{[\s\S]*border:\s*3px\s+solid\s+white;[\s\S]*}/i.test(
        htmlContent
      );

    const hasOrangeBorderRadius =
      /\.orange-btn\s*{[\s\S]*border-radius:\s*50%;[\s\S]*}/i.test(htmlContent);
    const hasGreenBorderRadius =
      /\.green-btn\s*{[\s\S]*border-radius:\s*50%;[\s\S]*}/i.test(htmlContent);
    const hasBlueBorderRadius =
      /\.blue-btn\s*{[\s\S]*border-radius:\s*50%;[\s\S]*}/i.test(htmlContent);

    // Update state based on CSS validation
    setOrangeBorder(hasOrangeBorder);
    setGreenBorder(hasGreenBorder);
    setBlueBorder(hasBlueBorder);

    setRoundOrangeBtn(hasOrangeBorderRadius);
    setRoundGreenBtn(hasGreenBorderRadius);
    setRoundBlueBtn(hasBlueBorderRadius);
  };

  const validateAnswer = async (consumedTime) => {
    let htmlContent = htmlInput.trim();

    const hasStyleTag = /<style>[\s\S]*<\/style>/i.test(htmlContent);

    // Check for all required CSS properties
    const hasOrangeBorder =
      /\.orange-btn\s*{[\s\S]*border:\s*3px\s+solid\s+white;[\s\S]*}/i.test(
        htmlContent
      );
    const hasGreenBorder =
      /\.green-btn\s*{[\s\S]*border:\s*3px\s+solid\s+white;[\s\S]*}/i.test(
        htmlContent
      );
    const hasBlueBorder =
      /\.blue-btn\s*{[\s\S]*border:\s*3px\s+solid\s+white;[\s\S]*}/i.test(
        htmlContent
      );

    const hasOrangeBorderRadius =
      /\.orange-btn\s*{[\s\S]*border-radius:\s*50%;[\s\S]*}/i.test(htmlContent);
    const hasGreenBorderRadius =
      /\.green-btn\s*{[\s\S]*border-radius:\s*50%;[\s\S]*}/i.test(htmlContent);
    const hasBlueBorderRadius =
      /\.blue-btn\s*{[\s\S]*border-radius:\s*50%;[\s\S]*}/i.test(htmlContent);

    // Check if all required properties are present
    if (
      hasStyleTag &&
      hasOrangeBorder &&
      hasGreenBorder &&
      hasBlueBorder &&
      hasOrangeBorderRadius &&
      hasGreenBorderRadius &&
      hasBlueBorderRadius
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

        const nextLevel = current_level > 24 ? current_level : 24;
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
        "Not an acceptable answer! Make sure to add borders and border-radius to all buttons."
      );
      setAttemptCounter((prev) => prev - 1);
    }
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
            <div className="lesson">Lesson-23</div>
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
            <h2 className="lesson-heading">23.CSS Borders and Border Radius</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Now that we've learned about internal CSS and class selectors,
              let's explore how to add borders and create rounded shapes!
              <br />
              <br />
              <strong>CSS Borders</strong> allow us to add lines around our
              elements. We can control their:
              <ul>
                <li>Width - how thick the border is (using pixels)</li>
                <li>Style - solid, dashed, dotted, or other patterns</li>
                <li>Color - any color we want!</li>
              </ul>
              For example: <code>border: 2px solid blue;</code> creates a
              2-pixel thick solid blue border.
              <br />
              <br />
              <strong>Border Radius</strong> lets us round the corners of
              elements. A small value like <code>border-radius: 5px;</code>{" "}
              gives slight rounding, while using{" "}
              <code>border-radius: 50%;</code> can turn a square into a perfect
              circle!
              <br />
              <br />
              These properties are perfect for creating buttons, panels, and
              other interactive elements on websites and applications.
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Look at the spaceship dashboard! It has three box-shaped control
              buttons bottom of the left corner, but they need to look more
              modern and user-friendly. Your mission is to transform these
              square buttons into rounded ones using CSS borders and
              border-radius.
            </p>
            <ol>
              <li className="task-item">
                Use the <code>.orange-btn</code>, <code>.blue-btn</code> and{" "}
                <code>.green-btn</code> class to style all three buttons at
                once.
              </li>
              <li className="task-item">
                Add a border to each button using the <code>border</code>{" "}
                property. The border should be <code>3px solid white</code>.
              </li>
              <li className="task-item">
                Make the buttons rounded by adding{" "}
                <code>border-radius: 10px;</code> to give them slightly rounded
                corners.
              </li>
              <li className="task-item">
                At the end, all 3 buttons should rounded and have a white color
                border <code>3px solid</code>
              </li>
            </ol>
            <p>
              Remember to put your CSS code inside the{" "}
              <code>&lt;style&gt;</code> tags and use proper selectors with dots
              (.) for classes! Once you complete these steps correctly, your
              spaceship dashboard will have professional-looking control
              buttons!
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
          style={{ backgroundImage: `url(${SpaceshipDashboard})` }}
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

            {/* button holder */}
            <div className="btn-holder">
              <div
                style={{
                  borderRadius: roundOrangeBtn ? "50%" : "0",
                  border: orangeBorder ? "3px solid white" : "",
                }}
                className="orange-btn dash-btn"
              ></div>
              <div
                style={{
                  borderRadius: roundBlueBtn ? "50%" : "0",
                  border: blueBorder ? "3px solid white" : "",
                }}
                className="blue-btn dash-btn"
              ></div>
              <div
                style={{
                  borderRadius: roundGreenBtn ? "50%" : "0",
                  border: greenBorder ? "3px solid white" : "",
                }}
                className="green-btn dash-btn"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson23;
