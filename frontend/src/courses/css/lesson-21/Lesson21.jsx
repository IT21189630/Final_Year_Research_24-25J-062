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
import "./lesson21.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson21() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `
  <!--Use the given below div to write your styles! -->
  
  <div>We did it!</div>
  
  `;
  const hintDuration = 5000;
  const hints = [
    "Two css properties are used to change the background colors and font colors.",
    "Flag color should be red.",
    "'color' property can be used for change the text(font) color.",
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

    const hasFlagStyles =
      /<div\s+style=["'][^"']*width:\s*200px;[^"']*height:\s*125px;[^"']*background-color:\s*red;[^"']*["']>/i.test(
        htmlContent
      );
    const hasTextColor =
      /<div\s+style=["'][^"']*color:\s*white;[^"']*["']>/i.test(htmlContent);

    const hasNecessaryElements = () => hasFlagStyles && hasTextColor;

    if (hasNecessaryElements()) {
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

        const nextLevel = 22;
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
        "Not an acceptable answer! Make sure the styles are correct."
      );
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();
    const hasFlagStyles =
      /<div\s+style=["'][^"']*width:\s*200px;[^"']*height:\s*125px;[^"']*background-color:\s*red;[^"']*["']>/i.test(
        htmlContent
      );
    const hasTextColor =
      /<div\s+style=["'][^"']*color:\s*white;[^"']*["']>/i.test(htmlContent);

    setFlagVisibility(hasFlagStyles);
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
            <h2 className="lesson-heading">21.Introduction to CSS</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              As we described in the previous course HTML is the basic structure
              of the web page. It is similar to the structure of a building. But
              the structure is not enough to build an interactive website. That
              is why we need css. <br /> <br />
              We can write css in 3 different ways. <code>
                Inline CSS
              </code>, <code>Internal CSS</code> and <code>External CSS</code>
              <br />
              <br />
              In this lesson we will see how inline CSS can be used in our
              projects to build custom shapes and style them. Example:{" "}
              <code>color: red;</code>
              As you can see in this line, every css code line has 3 parts.
              first one is property there are lot of css properties we use for
              different purposes. <code>"color"</code> is also a property. A
              property must always have a value. Value is set after putting the
              colon(:) in the above example value of the color property is{" "}
              <code>"red"</code>. This means font color should be red. dont
              forget to end your css statements with a semi colon(;) otherwise
              it may not work.
              <br />
              <br />
              When writing internal CSS, we write all our css statements inside
              a HTML tag. it can be a div, h1, p, span etc. <br />
              Example{" "}
              <code>
                <p>&lt;p style="color: blue;"&gt;Sample Paragraph&lt;/p&gt;</p>
              </code>{" "}
              <br />
              In the above example we set the color of the paragraph to blue.
              like that when you write css as inline statements you need to use
              the <code>style=""</code> attribute and write your css inside the
              quotes.
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Let's check whether you grasped the concept of inline css
              correctly. Here is what you have to do. Astronaut Jack Smith sent
              into a new planet and he landed in there successfully. now he want
              to take a picture with a flag. Flag color should be light-blue.
              instructions are given below.
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

export default Lesson21;
