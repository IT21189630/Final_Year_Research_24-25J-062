import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import GalacticBackground from "../../../images/lessons/planet-exterior.jpg";
import TargetOutput from "../../../images/lessons/target-output-lesson-9.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import { elementNames } from "./labels";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson9.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson9() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Planetary Survey</title>
  </head>
  <body>
    <form>
      <!-- Add the label for "Planet Name:" below -->

      <!-- Add the text input field here -->

      <!-- Add the label for "Planet Type:" below -->

      <!-- Add the label for "Gas Giant" radio button -->

      <!-- Add the code for "Gas Giant" radio button value should be "gas-giant" -->

      <!-- Add the label for "Terrestrial" radio button -->

      <!-- Add the code for "Terrestrial" radio button value should be "terrestrial" -->

      <!-- Add the code for "Submit" button for submit the form -->
    
    </form>  
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    `Use <label> to declare a informative text for a form element.`,
    `Use attribute type="text" for text fields and type="radio" for radio buttons.`,
    `Remember to add the "value" attribute for radio buttons to distinguish them. `,
    `Use type="submit" in a button to submit the form. `,
    `Make sure you create the elements where comments are mentioned.`,
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(hints.length);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [planetNameLabelVisibility, setPlanetNameLabelVisibility] =
    useState(false);
  const [planetTypeLabelVisibility, setPlanetTypeLabelVisibility] =
    useState(false);
  const [typeOneLabelVisibility, setTypeOneLabelVisibility] = useState(false);
  const [typeTwoLabelVisibility, setTypeTwoLabelVisibility] = useState(false);
  const [textFieldVisbility, setTextFieldVisbility] = useState(false);
  const [rdbtnOneVisbility, SetRdbtnOneVisbility] = useState(false);
  const [rdbtnTwoVisbility, SetRdbtnTwoVisbility] = useState(false);
  const [submitBtnVisibility, setSubmitBtnVisibility] = useState(false);
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
    const headBeforeBody =
      /<html[^>]*>\s*<head[^>]*>[\s\S]*<\/head>\s*<body[^>]*>[\s\S]*<\/body>\s*<\/html>/i.test(
        htmlContent
      );
    const hasHtmlTag = /<html[^>]*>[\s\S]*<\/html>/i.test(htmlContent);
    const hasHeadTag = /<head[^>]*>[\s\S]*<\/head>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>[\s\S]*<\/body>/i.test(htmlContent);
    const hasTitleTag = /<title[^>]*>[\s\S]*<\/title>/i.test(htmlContent);

    const checkElementAppearance = () => {
      if (
        planetNameLabelVisibility &&
        planetTypeLabelVisibility &&
        typeOneLabelVisibility &&
        typeTwoLabelVisibility &&
        textFieldVisbility &&
        rdbtnOneVisbility &&
        rdbtnTwoVisbility &&
        submitBtnVisibility
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
      checkElementAppearance()
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
        const nextLevel = 10;
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
      if (attemptCounter > 0) {
        setAttemptCounter((prev) => prev - 1);
      }
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const hasPlanetNameLabel = new RegExp(
      `<label>\\s*${elementNames.firstLabel}\\s*<\\/label>`,
      "i"
    ).test(htmlContent);

    const hasPlanetTypeLabel = new RegExp(
      `<label>\\s*${elementNames.secondLabel}\\s*<\\/label>`,
      "i"
    ).test(htmlContent);

    const hasPlanetTypeOneLabel = new RegExp(
      `<label>\\s*${elementNames.typeLabelOne}\\s*<\\/label>`,
      "i"
    ).test(htmlContent);

    const hasPlanetTypeTwoLabel = new RegExp(
      `<label>\\s*${elementNames.typeLabelTwo}\\s*<\\/label>`,
      "i"
    ).test(htmlContent);

    const hasTextField = /<input\s+type=["']text["']\s*\/?>/i.test(htmlContent);

    const hasRadioInputOne =
      /<input\s+type=["']radio["']\s+value=["']gas-giant["']\s*\/?>/i.test(
        htmlContent
      );

    const hasRadioInputTwo =
      /<input\s+type=["']radio["']\s+value=["']terrestrial["']\s*\/?>/i.test(
        htmlContent
      );

    const hasSubmitButton =
      /<button\s+type=["']submit["']\s*>\s*Submit\s*<\/button>/i.test(
        htmlContent
      );

    setPlanetNameLabelVisibility(hasPlanetNameLabel);
    setPlanetTypeLabelVisibility(hasPlanetTypeLabel);
    setTypeOneLabelVisibility(hasPlanetTypeOneLabel);
    setTypeTwoLabelVisibility(hasPlanetTypeTwoLabel);
    setTextFieldVisbility(hasTextField);
    SetRdbtnOneVisbility(hasRadioInputOne);
    SetRdbtnTwoVisbility(hasRadioInputTwo);
    setSubmitBtnVisibility(hasSubmitButton);
  };

  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    value: htmlInput,
    height: "800px",
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
            <div className="lesson">Lesson-09</div>
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
              09.Planetary Survey Form - Part 1
            </h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              In this lesson, we're diving into the world of HTML Forms, a
              fundamental aspect of web development. Forms are essential for
              gathering information from users, whether it's filling out a
              survey, signing up for a newsletter, or completing an online
              order. This lesson will focus on creating simple forms using text
              fields, radio buttons, and a button to submit the form. Here’s
              what you’ll learn and why it’s important: <br />
              <br />
              <b>Why Forms Are Important</b>
              <ol>
                <li>
                  Forms are the primary way to collect data from users on the
                  web.
                </li>
                <li>
                  hey are used in almost every website you visit, from search
                  bars to registration forms.
                </li>
                <li>
                  Understanding forms is crucial for any web developer because
                  they are the bridge between user interaction and the data you
                  collect.
                </li>
              </ol>
              {/* lesson content */}
              <b>Key Concepts We’ll Cover</b>
              <ol>
                {/* text fields */}
                <li>
                  <b>Text Fields (&lt;input type="text"/&gt;):</b>
                </li>
                <ul>
                  <li>
                    These allow users to enter text information, such as names
                    or email addresses. No closing tag required. just put
                    forward slash before the end bracket.
                  </li>
                  <li>
                    Essential for gathering user input like personal details,
                    feedback, or search queries.
                  </li>
                  <li>
                    Use the placeholder attribute to provide hints for what
                    should be entered.
                  </li>
                </ul>

                {/* radio buttons */}
                <li>
                  <b>
                    Radio Buttons (&lt;input type="radio"
                    value="sample-value"/&gt;):
                  </b>
                </li>
                <ul>
                  <li>
                    Used when you want users to select one option from a set of
                    predefined choices.The value attribute is what gets sent
                    when the form is submitted, so you know which option was
                    chosen.
                  </li>
                  <li>
                    Without a value, you won't know the user's selection, making
                    the form data incomplete. No closing tag required. just put
                    forward slash before the end bracket.
                  </li>
                  <li>
                    Great for situations where a single choice needs to be made
                    (like choosing a preferred option or category).
                  </li>
                </ul>

                {/* buttons */}
                <li>
                  <b>
                    Buttons (&lt;button type="radio" value="sample-value"&gt;
                    Button-Name &lt;button&gt;):
                  </b>
                </li>
                <ul>
                  <li>
                    A button triggers the submission of the form or can be used
                    for other actions like resetting fields.
                  </li>
                  <li>
                    The type attribute (type="submit") specifies the button’s
                    behavior. "submit" is for send data.
                  </li>
                </ul>
              </ol>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              <b>Mission Brief:</b> You as an astronaut got a task to develop a
              form which helps other astronaut to record their discoveries of
              the planets. To decide it needs a further inspection, Now you have
              the knowledge to develope a simple form which should have a text
              input and radio buttons and a form submit button.
              <br />
              <br />
              <b>Your Tasks:</b>
              <br />
              <br />
              <ol>
                <li>
                  <b>"{elementNames.firstLabel}" label</b> - Create a label
                  named {elementNames.firstLabel}
                </li>
                <li>
                  <b>Create text input field:</b> - Create a text input field to
                  get the user input.
                </li>
                <li>
                  <b>"{elementNames.secondLabel}" label</b> - Create a label
                  named {elementNames.secondLabel}
                </li>
                <li>
                  <b>"{elementNames.typeLabelOne}" label</b> - Create a label
                  named {elementNames.typeLabelOne}
                </li>
                <li>
                  <b>Create a rabio button for above label</b> - Create a radio
                  button for above label. remeber to add a value="gas-giant" for
                  identification.
                </li>
                <li>
                  <b>"{elementNames.typeLabelTwo}" label</b> - Create a label
                  named {elementNames.typeLabelTwo}
                </li>
                <li>
                  <b>Create a "Submit" button</b> - Create a button called
                  "Submit" to submit the form.
                </li>
              </ol>
              To help you out, We provided you the code snippet. Create
              necessary elements where comments mentioned.
            </p>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, You should be able to see planetary survey form. Final
              output should be like image given below.
            </p>

            <img
              src={TargetOutput}
              className="target-output-img-l9"
              alt="target_output_lesson9"
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
            <span className="form-header">Planetary Survey Form</span>
            <div className="survey-form-container">
              <div className="user-input-block-vertical">
                {planetNameLabelVisibility && (
                  <label htmlFor="planet-name">{elementNames.firstLabel}</label>
                )}
                {textFieldVisbility && (
                  <input
                    type="text"
                    id="planet-name"
                    className="survey-form-text-input"
                  />
                )}
              </div>

              <div className="user-input-block-vertical">
                {planetTypeLabelVisibility && (
                  <label htmlFor="planet-type">
                    {elementNames.secondLabel}
                  </label>
                )}
                <div className="input-radio-container">
                  {typeOneLabelVisibility && (
                    <label for="gas-giant">{elementNames.typeLabelOne}</label>
                  )}
                  {rdbtnOneVisbility && (
                    <input
                      className="form-control-input"
                      type="radio"
                      id="gas-giant"
                      name="planet-type"
                    />
                  )}
                </div>
                <div className="input-radio-container">
                  {typeTwoLabelVisibility && (
                    <label for="terrestrial">{elementNames.typeLabelTwo}</label>
                  )}
                  {rdbtnTwoVisbility && (
                    <input
                      className="form-control-input"
                      type="radio"
                      id="terrestrial"
                      name="planet-type"
                    />
                  )}
                </div>

                {submitBtnVisibility && (
                  <button className="btn btn-primary">Submit</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson9;
