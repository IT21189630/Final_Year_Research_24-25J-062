import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import PackageMockup from "../../../images/lessons/package-box.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson25.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson25() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<html>
  <head>
    <title>Spaceship Storage Compartments</title>
    <style>
      /* We've already set up some basic styles for you */
      body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
      }
      
      .compartment {
        background-color: #ffffff;
        color: #333333;
        border: 2px solid #cccccc;
        width: 200px;
      }
      
      .critical-supplies {
        background-color: #ffebee;
        color: #c62828;
        border-color: #c62828;
      }
      
      .scientific-equipment {
        background-color: #e3f2fd;
        color: #0d47a1;
        border-color: #0d47a1;
      }
      
      .personal-items {
        background-color: #e8f5e9;
        color: #2e7d32;
        border-color: #2e7d32;
      }
      
      /* Add your box model properties below for each compartment type */
      
    </style>
  </head>
  <body>
    <div class="compartment critical-supplies">
      Critical Supplies: Oxygen tanks, medical kits, emergency rations
    </div>
    
    <div class="compartment scientific-equipment">
      Scientific Equipment: Sample containers, analyzers, microscopes
    </div>
    
    <div class="compartment personal-items">
      Personal Items: Photos, journals, comfort items
    </div>
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Remember the box model consists of content, padding, border, and margin properties",
    "Use padding to create space between content and border (e.g., padding: 15px)",
    "Use margin to create space between elements (e.g., margin-bottom: 20px)",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [criticalStyled, setCriticalStyled] = useState(false);
  const [scientificStyled, setScientificStyled] = useState(false);
  const [personalStyled, setPersonalStyled] = useState(false);
  const [criticalSuppliesPadding, setCriticalSuppliesPadding] = useState(false);
  const [personalSuppliesPadding, setPersonalSuppliesPadding] = useState(false);
  const [scientificSuppliesPadding, setScientificSuppliesPadding] =
    useState(false);
  const [criticalSupplyBorder, setCriticalSupplyBorder] = useState(false);
  const [criticalSupplyMargin, setCriticalSupplyMargin] = useState(false);
  const [scientificSupplyMargin, setScientificSupplyMargin] = useState(false);
  const [personalItemsMargin, setPersonalItemsMargin] = useState(false);
  const [boxShadow, setBoxShadow] = useState(false);
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

    // Validate if <style> tag is present
    const hasStyleTag = /<style>[\s\S]*<\/style>/i.test(htmlContent);

    // Validate Critical Supplies Box
    const hasCriticalPadding =
      /\.critical-supplies\s*{[\s\S]*padding:\s*20px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCriticalMargin =
      /\.critical-supplies\s*{[\s\S]*margin-bottom:\s*30px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCriticalBorderRadius =
      /\.critical-supplies\s*{[\s\S]*border-radius:\s*10px;[\s\S]*}/i.test(
        htmlContent
      );

    // Validate Scientific Equipment Box
    const hasScientificPadding =
      /\.scientific-equipment\s*{[\s\S]*padding:\s*15px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasScientificMargin =
      /\.scientific-equipment\s*{[\s\S]*margin-bottom:\s*30px;[\s\S]*}/i.test(
        htmlContent
      );

    // Validate Personal Items Box
    const hasPersonalPadding =
      /\.personal-items\s*{[\s\S]*padding:\s*10px;[\s\S]*}/i.test(htmlContent);
    const hasPersonalMargin =
      /\.personal-items\s*{[\s\S]*margin-top:\s*0;[\s\S]*}/i.test(htmlContent);
    const hasPersonalBoxShadow =
      /\.personal-items\s*{[\s\S]*box-shadow:\s*0\s+5px\s+10px\s+rgba\(255,\s*255,\s*255,\s*0\.4\);[\s\S]*}/i.test(
        htmlContent
      );

    const criticalFullyStyled =
      hasCriticalPadding && hasCriticalMargin && hasCriticalBorderRadius;
    const scientificFullyStyled = hasScientificPadding && hasScientificMargin;
    const personalFullyStyled =
      hasPersonalPadding && hasPersonalMargin && hasPersonalBoxShadow;

    if (
      hasStyleTag &&
      criticalFullyStyled &&
      scientificFullyStyled &&
      personalFullyStyled
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
        const nextLevel = 26;
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
        "Not all requirements are met! Review the challenge instructions."
      );
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const hasCriticalPadding =
      /\.critical-supplies\s*{[\s\S]*padding:\s*20px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCriticalMargin =
      /\.critical-supplies\s*{[\s\S]*margin-bottom:\s*30px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasCriticalBorderRadius =
      /\.critical-supplies\s*{[\s\S]*border-radius:\s*10px;[\s\S]*}/i.test(
        htmlContent
      );

    const hasScientificPadding =
      /\.scientific-equipment\s*{[\s\S]*padding:\s*15px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasScientificMargin =
      /\.scientific-equipment\s*{[\s\S]*margin-bottom:\s*30px;[\s\S]*}/i.test(
        htmlContent
      );
    const hasScientificBorderWidth =
      /\.scientific-equipment\s*{[\s\S]*border-width:\s*4px;[\s\S]*}/i.test(
        htmlContent
      );

    // Personal Items Validation
    const hasPersonalPadding =
      /\.personal-items\s*{[\s\S]*padding:\s*10px;[\s\S]*}/i.test(htmlContent);
    const hasPersonalMargin =
      /\.personal-items\s*{[\s\S]*margin-top:\s*0;[\s\S]*}/i.test(htmlContent);
    const hasPersonalBoxShadow =
      /\.personal-items\s*{[\s\S]*box-shadow:\s*0\s+5px\s+10px\s+rgba\(255,\s*255,\s*255,\s*0\.4\);[\s\S]*}/i.test(
        htmlContent
      );

    setCriticalSupplyMargin(hasCriticalMargin);
    setScientificSupplyMargin(hasScientificMargin);
    setPersonalItemsMargin(hasPersonalMargin);

    setCriticalSuppliesPadding(hasCriticalPadding);
    setScientificSuppliesPadding(hasScientificPadding);
    setPersonalSuppliesPadding(hasPersonalPadding);

    setCriticalSupplyBorder(hasCriticalBorderRadius);

    setBoxShadow(hasPersonalBoxShadow);

    setCriticalStyled(
      hasCriticalPadding && hasCriticalMargin && hasCriticalBorderRadius
    );
    setScientificStyled(
      hasScientificPadding && hasScientificMargin && hasScientificBorderWidth
    );
    setPersonalStyled(
      hasPersonalPadding && hasPersonalMargin && hasPersonalBoxShadow
    );
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
            <div className="lesson">Lesson-25</div>
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
              25. CSS Box Model for Spaceship Storage Compartments
            </h2>

            {/* Lesson Introduction */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Now that we've learned about internal CSS, it's time to understand
              the CSS Box Model, which controls the spacing, layout, and
              structure of elements. Just like a spaceship's storage
              compartments are carefully organized to keep supplies safe and
              accessible, the box model helps structure web pages efficiently.
              <br />
              <br />
              The CSS Box Model consists of four key parts:
              <ul typeof="box">
                <li>
                  <code>content</code>: The actual text or images inside the
                  element.
                </li>
                <li>
                  <code>padding</code>: Space between the content and the
                  element's border.
                </li>
                <li>
                  <code>border</code>: The outline around the element.
                </li>
                <li>
                  <code>margin</code>: Space outside the border, separating
                  elements from each other.
                </li>
              </ul>
              By adjusting these properties, we can control how elements are
              spaced and styled for a structured and visually appealing layout.
            </p>

            {/* Challenge Section */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              The spaceship's storage compartments need better organization and
              styling! Your mission is to use CSS Box Model properties to
              improve the compartments’ spacing, layout, and readability.
            </p>

            <ol>
              <li className="task-item">
                Add padding to each compartment to create space around the
                content. Example:
                <ul>
                  <li>
                    Use <code>padding: 20px;</code> for Critical Supplies.
                  </li>
                  <li>
                    Use <code>padding: 15px;</code> for Scientific Equipment.
                  </li>
                  <li>
                    Use <code>padding: 10px;</code> for Personal Items.
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Apply margin to separate the compartments visually. Example:
                <ul>
                  <li>
                    Use <code>margin-bottom: 30px;</code> for Critical Supplies
                    and Scientific Equipment.
                  </li>
                  <li>
                    Use <code>margin-top: 0;</code> for Personal Items.
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Add border-radius for a smoother appearance:
                <ul>
                  <li>
                    Apply <code>border-radius: 10px;</code> to Critical
                    Supplies.
                  </li>
                </ul>
              </li>

              <li className="task-item">
                Apply box-shadow to highlight the Personal Items compartment.
                <ul>
                  <li>
                    Use{" "}
                    <code>
                      box-shadow: 0 5px 10px rgba(255, 255, 255, 0.4);
                    </code>
                  </li>
                </ul>
              </li>
            </ol>

            <p>
              Once you apply these CSS styles correctly, the spaceship’s storage
              compartments will be well-organized and visually structured. 🚀
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
        <div className="playground-area" style={{ backgroundColor: "#2c3e50" }}>
          <div className="space-center-area">
            <div className={`motivater ${hint === "" ? "fade" : ""}`}>
              <img
                className="astro-guider"
                src={AstronautGuider}
                alt="astronaut-image"
              />
              <p className="motive-text">{hint}</p>
            </div>

            <div className="compartment-canvas">
              {/* critical supplies */}
              <div
                className="compartment"
                style={{
                  padding: criticalSuppliesPadding ? "20px" : 0,
                  transform: criticalSupplyMargin ? "translateY(-30px)" : 0,
                  borderRadius: criticalSupplyBorder ? "10px" : 0,
                }}
              >
                <div className="compartment-label">Critical Supplies</div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
              </div>

              {/* scientific supplies */}
              <div
                className="compartment"
                style={{
                  padding: scientificSuppliesPadding ? "15px" : 0,
                  transform: scientificSupplyMargin ? "translateY(-30px)" : 0,
                }}
              >
                <div className="compartment-label">Scientific Supplies</div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
              </div>

              {/* personal items */}
              <div
                className="compartment"
                style={{
                  padding: personalSuppliesPadding ? "10px" : 0,
                  boxShadow: boxShadow
                    ? "5px 5px 10px rgba(255,255,255,.2)"
                    : "rgba(0,0,0,0)",
                }}
              >
                <div className="compartment-label">Personal Items</div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
                <div
                  className="box"
                  style={{ backgroundImage: `url(${PackageMockup})` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson25;
