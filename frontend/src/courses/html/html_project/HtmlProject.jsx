import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import GalacticBackground from "../../../images/lessons/planet-exterior.jpg";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import MiniProjectOutput from "../../../images/lessons/mini-project-target-output.png";
import { MdClose } from "react-icons/md";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import AstroHeadshot from "../../../images/lessons/astro-headshot.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { recommendationEngine } from "../../../components/course-progress-updater/RecommendationEngine";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./html_project.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";
import HtmlCssErrorComponentEnhanced from "../../../pages/virtual-coding-lab/html_error_component_enhanced";

function HtmlProject() {
  const dispatch = useDispatch();
  const { course_id, current_level } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Mission Control Communications</title>
  </head>
  <body>
    <!-- Write all your answers inside this(body) section -->
    <!-- start with the heading of the bio data -->

    <!-- display the image of the astronaut -->

    <!-- Put the paragraph about the astronaut here-->

    <!-- List the exeperience of the astronaut here -->

    <!-- List the skills of the astronaut here -->

  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "<img> tag is use for show images. hope you remember related attributes!",
    "You definietly know how headings work right h1 to ??",
    "Two types of lists are there right, <ul> and <ol>",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 900, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [startAttempt, setStartAttempt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTargetOutput, setShowTargetOutput] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showHeadshot, setShowHeadshot] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false);
  const [showExperience1, setShowExperience1] = useState(false);
  const [showExperience2, setShowExperience2] = useState(false);
  const [showExperience3, setShowExperience3] = useState(false);
  const [showSkill1, setShowSkill1] = useState(false);
  const [showSkill2, setShowSkill2] = useState(false);
  const [showSkill3, setShowSkill3] = useState(false);
  const [globalErrorState, setGlobalErrorState] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [errorChecker, setErrorChecker] = useState(false);

  const editorRef = useRef();

  const errorCheckerHandler = () => {
    setErrorChecker((prvState) => !prvState);
  };

  const useHintSystem = () => {
    if (hintCounter > 0) {
      setHintCounter((prev) => prev - 1);
      setHint(currentHint);
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
    const hasTitleTag =
      /<title[^>]*>\s*Mission\s*Control\s*Communications\s*<\/title>/i.test(
        htmlContent
      );

    const hasHeadline = /<h1[^>]*>[^<]*bio\s*data\s*form[^<]*<\/h1>/i.test(
      htmlContent
    );

    const hasHeadshot =
      /<img\s+[^>]*src=["']\.\/my_photos\/headshot\.png["'][^>]*\/?>/i.test(
        htmlContent
      );

    const hasParagraph =
      /<p[^>]*>\s*<b>\s*About\s*Jack\s*Smith:\s*<\/b>[\s\S]*?<\/p>/i.test(
        htmlContent
      );

    const hasWorkExperienceList = /<ol[^>]*>\s*([\s\S]*?)<\/ol>/i.test(
      htmlContent
    );
    const hasExperience1 =
      /<li[^>]*>\s*Assistant\s*Pilot\s*-\s*4\s*years\s*<\/li>/i.test(
        htmlContent
      );
    const hasExperience2 =
      /<li[^>]*>\s*Trainee\s*Astronaut\s*-\s*4\s*years\s*<\/li>/i.test(
        htmlContent
      );
    const hasExperience3 =
      /<li[^>]*>\s*Senior\s*Astronaut\s*-\s*1\s*year\s*<\/li>/i.test(
        htmlContent
      );

    const hasSkillsList = /<ul[^>]*>\s*([\s\S]*?)<\/ul>/i.test(htmlContent);
    const hasSkill1 = /<li[^>]*>\s*Adaptability\s*<\/li>/i.test(htmlContent);
    const hasSkill2 = /<li[^>]*>\s*Effective\s*Communication\s*<\/li>/i.test(
      htmlContent
    );
    const hasSkill3 = /<li[^>]*>\s*Good\s*with\s*teamwork\s*<\/li>/i.test(
      htmlContent
    );

    const hasNecessaryElements = () => {
      return (
        hasHeadline &&
        hasHeadshot &&
        hasParagraph &&
        hasWorkExperienceList &&
        hasExperience1 &&
        hasExperience2 &&
        hasExperience3 &&
        hasSkillsList &&
        hasSkill1 &&
        hasSkill2 &&
        hasSkill3
      );
    };

    if (
      headBeforeBody &&
      hasHtmlTag &&
      hasHeadTag &&
      hasBodyTag &&
      hasTitleTag &&
      hasNecessaryElements()
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
        const nextLevel = current_level > 21 ? current_level : 21;
        recommendationEngine(score, "HTML-101", "five", user_id);
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

  const validateHTML = (html) => {
    const trimmed = html.trim().toLowerCase();

    // === Check critical root <html> wrapper ===
    if (!/^<html[^>]*>[\s\S]*<\/html>$/.test(trimmed)) {
      setGlobalErrorState(true);
      if (!/<html[^>]*>/.test(trimmed)) {
        setCurrentHint("Missing opening <html> tag.");
      } else if (!/<\/html>/.test(trimmed)) {
        setCurrentHint("Missing closing </html> tag.");
      } else {
        setCurrentHint(
          "Root <html> tags are malformed or do not wrap all content."
        );
      }
      resetDisplayStates(); // Hide all
      return false;
    }

    const insideHtml =
      trimmed.match(/^<html[^>]*>([\s\S]*)<\/html>$/i)?.[1] || "";

    const headOpen = insideHtml.indexOf("<head");
    const headClose = insideHtml.indexOf("</head>");
    const bodyOpen = insideHtml.indexOf("<body");
    const bodyClose = insideHtml.indexOf("</body>");

    if (headOpen === -1 && bodyOpen === -1) {
      setGlobalErrorState(true);
      setCurrentHint("Missing both <head> and <body> sections inside <html>.");
      resetDisplayStates(); // Hide all
      return false;
    } else if (headOpen === -1) {
      setGlobalErrorState(true);
      setCurrentHint("Missing <head> section inside <html>.");
      resetDisplayStates(); // Hide all
      return false;
    } else if (bodyOpen === -1) {
      setGlobalErrorState(true);
      setCurrentHint("Missing <body> section inside <html>.");
      resetDisplayStates(); // Hide all
      return false;
    }

    if (headClose > bodyOpen || headClose === -1 || bodyClose === -1) {
      setGlobalErrorState(true);
      setCurrentHint(
        "Malformed structure: <body> must come after closing </head>."
      );
      resetDisplayStates(); // Hide all
      return false;
    }

    // === Parse the document ===
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html.trim(), "text/html");

      setGlobalErrorState(false);
      setCurrentHint("");

      // === Validate individual elements ===

      // Headline <h1>
      const bodyHTML = doc.body.innerHTML.trim();
      const expectedH1 = "<h1>Bio Data Form</h1>";

      // Check for the exact <h1> tag inside body
      if (bodyHTML.includes(expectedH1)) {
        setShowHeadline(true);
      } else {
        setShowHeadline(false);
        if (!doc.querySelector("h1")) {
          setCurrentHint(
            (h) => h + " Missing heading: <h1>Bio Data Form</h1>. "
          );
        } else {
          setCurrentHint((h) => h + " Incorrect or malformed heading tag. ");
        }
      }

      // Image
      const image = doc.querySelector("img[src='./my_photos/headshot.png']");
      if (image) {
        setShowHeadshot(true);
      } else {
        setShowHeadshot(false);
        setCurrentHint((h) => h + " Missing or incorrect image tag. ");
      }

      // Paragraph with <b>About Jack Smith:</b>
      const paragraph = doc.querySelector("p b");
      if (paragraph && paragraph.closest("p")) {
        setShowParagraph(true);
      } else {
        setShowParagraph(false);
        setCurrentHint(
          (h) =>
            h +
            " Missing or malformed paragraph with <b>About Jack Smith:</b>. "
        );
      }

      // Experience list
      const expItems = [...doc.querySelectorAll("li")].map((li) =>
        li.textContent.trim()
      );
      const expectedExperiences = [
        "Assistant Pilot - 4 years",
        "Trainee Astronaut - 4 years",
        "Senior Astronaut - 1 year",
      ];
      const experiencesMatched = expectedExperiences.every((exp) =>
        expItems.includes(exp)
      );
      if (experiencesMatched) {
        setShowExperience1(true);
        setShowExperience2(true);
        setShowExperience3(true);
      } else {
        setShowExperience1(false);
        setShowExperience2(false);
        setShowExperience3(false);
        setCurrentHint(
          (h) => h + " One or more experience items missing or incorrect. "
        );
      }

      // Skills list
      const expectedSkills = [
        "Adaptability",
        "Effective Communication",
        "Good with teamwork",
      ];
      const skillsMatched = expectedSkills.every((skill) =>
        expItems.includes(skill)
      ); // Same li’s? Should ideally separate experience/skills list in real HTML
      if (skillsMatched) {
        setShowSkill1(true);
        setShowSkill2(true);
        setShowSkill3(true);
      } else {
        setShowSkill1(false);
        setShowSkill2(false);
        setShowSkill3(false);
        setCurrentHint(
          (h) => h + " One or more skill items missing or incorrect. "
        );
      }

      // Finally, allow display of any elements that passed
      return true;
    } catch (e) {
      setGlobalErrorState(true);
      setCurrentHint("There is a syntax error in your HTML structure.");
      resetDisplayStates(); // Hide all
      return false;
    }
  };

  const resetDisplayStates = () => {
    setShowHeadline(false);
    setShowHeadshot(false);
    setShowParagraph(false);
    setShowExperience1(false);
    setShowExperience2(false);
    setShowExperience3(false);
    setShowSkill1(false);
    setShowSkill2(false);
    setShowSkill3(false);
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
    validateHTML(htmlInput);
    const errorBanner = document.querySelector(".global-error-marker");
    if (globalErrorState) {
      errorBanner.classList.add("show-error-marker");
    } else {
      errorBanner.classList.remove("show-error-marker");
    }
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

  const displayOutput = () => {
    setShowTargetOutput(true);
  };

  const closeDisplayOutput = () => {
    setShowTargetOutput(false);
  };

  return (
    <>
      {/* target output modal */}
      {showTargetOutput && (
        <div className="target-output-modal">
          <button
            className="target-output-close-btn"
            onClick={closeDisplayOutput}
          >
            <MdClose />
          </button>

          <img
            src={MiniProjectOutput}
            alt="target-output"
            className="target-image"
          />
        </div>
      )}

      {/* error checker modal */}
      {errorChecker && (
        <div className="error-checker-cont">
          <HtmlCssErrorComponentEnhanced htmlCode={htmlInput} cssCode={""} />
        </div>
      )}

      <PerformanceSummaryModal
        visibility={showModal}
        score={performanceScore}
      />
      <div className="main-container">
        {/* This is the part where we teach the concept and declare the challenge - workbench */}
        <div className="workbench-area">
          {/* lesson details ribbon */}
          <div className="lesson-info-ribbon">
            <div className="lesson">Lesson-20(Final Project)</div>
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

            <div
              className="error-checker-toggler"
              onClick={() => errorCheckerHandler()}
            >
              Error Checker
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
            <h2 className="lesson-heading">20.Final Project</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Congratualtion, you finally here the last evaluation lesson of the
              HTML 101 course. In here we are going to test your capabilities
              and whether you understood the lessons correctly. <br /> <br />
              <ul typeof="box">
                <li>
                  You will need to use your knowledge about basic html elements
                  like images, lists, paragraphs etc.
                </li>
                <li>
                  Try to complete without consuming any hints. We know you are
                  capable friend.
                </li>
              </ul>
            </p>
            {/* display output close btn */}
            <button
              className="target-output-btn"
              onClick={() => displayOutput()}
            >
              Show Target Output
            </button>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Congrats! after your previous commitment we have decided that we
              should promote you for the higher position. so to do that we need
              a bio data of yours for information collection. Use the your html
              knowledge to build the bio data form. Final output should be
              identical to the image given below.
            </p>
            <ol>
              <li className="task-item">
                You should include an image of Jack Smith, image can be
                collected from "./my_photos/headshot.png".
              </li>
              <li className="task-item">
                Include and brief introduction of Jack Smith. use given below
                paragraph for that. make sure to include necessary formattings.
              </li>
              <br />
              <p>
                <b>About Jack Smith:</b> <br /> Jack Smith is a skilled
                astronaut and mission specialist, known for his expertise in
                planetary exploration and deep-space navigation. With years of
                training at the Space Academy, he has led multiple missions to
                uncharted worlds, collecting crucial data for future
                interstellar travel. Passionate about discovery, Jack is
                dedicated to pushing the boundaries of human space exploration
                while ensuring the safety of his crew. 🚀✨
              </p>
              <li className="task-item">
                List experience as ordered list. Experiences are Assistant Pilot
                - 4 years, Trainee Astronaut - 4 years, Senior Astronaut - 1
                year.
              </li>
              <li className="task-item">
                List three skills as unordered list. Skills are Adaptability,
                Effective Communication, Good with teamwork.
              </li>
            </ol>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly.
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
          style={{ backgroundImage: `url(${GalacticBackground})` }}
        >
          <div className="global-error-marker">
            Major syntax issue found! Please check your code!
          </div>

          <div className="space-center-area">
            <div className={`motivater ${hint === "" ? "fade" : ""}`}>
              <img
                className="astro-guider"
                src={AstronautGuider}
                alt="astronaut-image"
              />
              {/* Display either the regular hint or a global error hint */}
              <p className="motive-text">
                {globalErrorState ? currentHint : hint}
              </p>
            </div>

            {/* tablet screen */}
            <div
              className="tablet-screen"
              style={{ backgroundImage: `url(${TabletScreen})` }}
            >
              <div className="bio-data-form">
                {showHeadline && (
                  <h4 className="bio-data-heading">Bio Data Form</h4>
                )}

                <div className="upper-row">
                  {/* astronaut profile */}
                  {showHeadshot && (
                    <div
                      style={{ backgroundImage: `url(${AstroHeadshot})` }}
                      className="headhsot-compartment"
                    ></div>
                  )}

                  {/* astronaut about self */}
                  {showParagraph && (
                    <p className="about-astro-paragraph">
                      <b>About Jack Smith:</b> <br /> Jack Smith is a skilled
                      astronaut and mission specialist, known for his expertise
                      in planetary exploration and deep-space navigation. With
                      years of training at the Space Academy, he has led
                      multiple missions to uncharted worlds, collecting crucial
                      data for future interstellar travel. Passionate about
                      discovery, Jack is dedicated to pushing the boundaries of
                      human space exploration while ensuring the safety of his
                      crew. 🚀✨
                    </p>
                  )}
                </div>

                <div className="lower-row">
                  {/* strengths */}
                  <div className="partition">
                    {(showExperience1 ||
                      showExperience2 ||
                      showExperience3) && (
                      <h6 style={{ fontFamily: "monospace" }}>
                        Work Experience
                      </h6>
                    )}
                    <ol>
                      {showExperience1 && <li>Assistan Pilot - 4 years</li>}
                      {showExperience2 && <li>Trainee Astronaut - 4 years</li>}
                      {showExperience3 && <li>Senior Astronaut - 1 year</li>}
                    </ol>
                  </div>

                  {/* skills */}
                  <div className="partition">
                    {(showSkill1 || showSkill2 || showSkill3) && (
                      <h6 style={{ fontFamily: "monospace" }}>Skills</h6>
                    )}
                    <ul>
                      {showSkill1 && <li>Adaptability</li>}
                      {showSkill2 && <li>Effective Communication</li>}
                      {showSkill3 && <li>Good with teamwork</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HtmlProject;
