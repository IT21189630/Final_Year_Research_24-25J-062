import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import BarrenLandsImage from "../../../images/lessons/barren-lands.jpg";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import SpaceCenterStructure from "../../../images/lessons/space-center-structure.png";
import SignBoard from "../../../images/lessons/sign-board.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson1.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson1() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<!-- Start coding below to build your space base! -->\n\n`;
  const hintDuration = 5000;
  const hints = [
    "<html> tag is the foundation of a web page, same goes for space center.",
    "<title> tag used to give a title, a name for web page.",
    "<body> is used to display the web content, like space center main structure",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [foundationVisibility, setFoundationVisibility] = useState(false);
  const [structureVisibility, setStructureVisibility] = useState(false);
  const [signBoardVisibility, setSignBoardVisibility] = useState(false);
  const [titleVisibility, setTitleVisibility] = useState(false);
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
    const hasTitleTag = /<title[^>]*>\s*My Space Base\s*<\/title>/i.test(
      htmlContent
    );

    if (
      headBeforeBody &&
      hasHtmlTag &&
      hasHeadTag &&
      hasBodyTag &&
      hasTitleTag
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
        const nextLevel = 2;
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

    const hasHtmlTag = /<html[^>]*>[\s\S]*<\/html>/i.test(htmlContent);
    const hasHeadTag = /<head[^>]*>[\s\S]*<\/head>/i.test(htmlContent);
    const hasBodyTag = /<body[^>]*>[\s\S]*<\/body>/i.test(htmlContent);
    const hasTitleTag = /<title[^>]*>\s*My Space Base\s*<\/title>/i.test(
      htmlContent
    );

    setFoundationVisibility(hasHtmlTag);
    setStructureVisibility(hasBodyTag);
    setSignBoardVisibility(hasHeadTag);
    setTitleVisibility(hasTitleTag);
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
            <div className="lesson">Lesson-01</div>
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
            <h2 className="lesson-heading">01.Build Your Space Base</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              An HTML page is like a house that has a basic structure with
              different rooms. In HTML, every webpage has two main parts: the
              Head and the Body. Think of the HTML tag like the outside walls of
              the house, holding everything together. This is why we call it the
              root element. <br /> <br />
              The Head section is where we put important information for the
              browser, like the title of the page (which shows up in the browser
              tab) or links to styles and scripts that make the page look nice
              or work better. We usually can’t see things from the Head section
              directly on the webpage, but they make it run smoothly! <br />
              <br />
              The Body section is like the inside of the house where everything
              we want to see lives. Inside the Body, we can add text, images,
              videos, and anything we want visitors to see or interact with.{" "}
              <br />
              <br /> When we create an HTML page, every tag (like head&, body,
              and html) needs to open and close properly, with the content
              placed between the opening html tag and the closing /html tag.
              This helps keep our webpage structure neat and understandable for
              the browser!
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Now that you’ve learned about the basic structure of an HTML page,
              it’s time to put your knowledge to the test! In this challenge,
              your task is to build the foundation of a space center using HTML.
              Think of HTML as the blueprint or structure for your page. Just
              like a real building's foundation. Here’s what you need to do,
            </p>
            <ol>
              <li className="task-item">
                HTML Root Tag: Begin with the HTML root tag to establish your
                entire document.which also represent foundation of the space
                center
              </li>
              <li className="task-item">
                Head Tag: Inside the head tag, set the page title to be "My
                Space Base", which will appear on the signboard of your space
                center.
              </li>
              <li className="task-item">
                Body Tag: Within the body tag, build the structure of the space
                center itself. This is where the main content of your space
                center will live!
              </li>
            </ol>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, the foundation for your space center will appear in the
              playground area, showing you are ready to explore further HTML
              adventures! When you are ready to begin, click the Start Attempt
              button and let us see you create your own space base!
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
            {foundationVisibility && (
              <div className="space-center-foundation"></div>
            )}
            {structureVisibility && (
              <img
                src={SpaceCenterStructure}
                alt="space-center-structure"
                className="space-center-structure"
              ></img>
            )}
          </div>
          {signBoardVisibility && (
            <div className="sign-board-container">
              <img
                src={SignBoard}
                alt="sign-board-image"
                className="sign-board"
              />
              {titleVisibility && (
                <span className="sign-board-title">My Space Base</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Lesson1;
