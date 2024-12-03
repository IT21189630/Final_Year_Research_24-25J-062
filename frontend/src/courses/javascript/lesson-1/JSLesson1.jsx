import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import SpaceBackground from "../../../images/js-lessons/space-station-bg.png";
import AstronautGuide from "../../../images/js-lessons/js-motive-image.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./js-lesson1.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function JSLesson1() {
  const initialCode = `// Start your JavaScript mission here!\n\n`;
  const hintDuration = 5000;
  const hints = [
    "Remember to use 'let' to declare your variables.",
    "Text values need quotation marks!",
    "Numbers don't need quotes in JavaScript.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [jsInput, setJsInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [missionNameVisible, setMissionNameVisible] = useState(false);
  const [astronautNameVisible, setAstronautNameVisible] = useState(false);
  const [missionDayVisible, setMissionDayVisible] = useState(false);
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
      setHint("No more hints available, Space Cadet!");
      setTimeout(() => {
        setHint("");
      }, hintDuration);
    }
  };

  const validateAnswer = (consumedTime) => {
    let jsContent = jsInput.trim();

    // Validate the JavaScript code
    const hasMissionName = /let\s+missionName\s*=\s*["'].*["']/i.test(jsContent);
    const hasAstronautName = /let\s+astronautName\s*=\s*["'].*["']/i.test(jsContent);
    const hasMissionDay = /let\s+missionDay\s*=\s*1/i.test(jsContent);

    if (hasMissionName && hasAstronautName && hasMissionDay) {
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
      }
    } else {
      toast.error("Mission parameters incorrect. Try again, Space Cadet!");
      setAttemptCounter((prev) => prev - 1);
    }
  };

  const validateJS = () => {
    let jsContent = jsInput.trim();

    // Update visibility based on correct variable declarations
    setMissionNameVisible(/let\s+missionName\s*=\s*["'].*["']/i.test(jsContent));
    setAstronautNameVisible(/let\s+astronautName\s*=\s*["'].*["']/i.test(jsContent));
    setMissionDayVisible(/let\s+missionDay\s*=\s*1/i.test(jsContent));
  };

  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    value: jsInput,
    height: "400px",
    extensions: [javascript()],
    theme: oneDark,
    onChange: (value) => {
      setJsInput(value);
      validateJS();
    },
    options: {
      lineNumbers: true,
      tabSize: 2,
      indentWithTabs: true,
    },
  });

  useEffect(() => {
    validateJS();
  }, [jsInput]);

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
      <PerformanceSummaryModal visibility={showModal} score={performanceScore} />
      <div className="js-main-container">
        {/* Left side - Lesson content and editor */}
        <div className="js-workbench-area">
          <div className="js-lesson-info-ribbon">
            <div className="js-lesson">JS Mission-01</div>
            <div className="js-timer">
              <span className="js-timer-icon">
                <IoMdTimer />
              </span>
              <span className="js-time-display">
                <Timer
                  activate={activate}
                  onStop={(finalTime) => {
                    validateAnswer(finalTime);
                  }}
                />
              </span>
            </div>
            <div className="js-attempt-counter">
              <span className="js-attempt-icon">
                <FaStar />
              </span>
              <span className="js-attempts-left">{attemptCounter}</span>
            </div>
          </div>

          <div className="js-lesson-content">
            <h2 className="js-lesson-heading">01. Launch Your First JavaScript Mission</h2>
            <h3 className="js-lesson-sub-headings">Introduction</h3>
            <p className="js-introduction">
              Think of JavaScript as the control panel of your spaceship 
              - while HTML built the spaceship's structure and CSS made it look amazing, 
              JavaScript is what makes it actually fly! Just like how astronauts need to 
              initialize their systems before takeoff, in JavaScript, we start by 
              learning about variables. 
              <br/><br/>
              Variables are like the storage containers 
              in your spaceship where you keep important information. 
              When you declare a variable, you're creating a special container 
              with a name, and you can put different types of data in it - 
              numbers for coordinates, text for mission logs, or true/false values 
              for system checks. Every time you store something in a variable, 
              it's like logging critical mission data that you can use later. 
              <br/><br/>
              The most important thing about variables is that they can change 
              during your mission - just like how a spaceship's speed or 
              altitude changes during flight. In JavaScript, we create these 
              storage containers using special keywords like 'let' or 'const', 
              give them unique names, and then use the equals sign (=) to put data inside them.
            </p>
            <h3 className="js-lesson-sub-headings">Challenge</h3>
            <p className="js-instruction">
              Welcome, Space Cadet! Your first mission is to initialize the basic 
              systems of your spacecraft using JavaScript variables. Just as a real 
              spacecraft needs to store crucial information before launch, 
              you'll need to create variables to store important mission data. 
              Here's what you need to do:
            </p>
            <ol>
              <li className="js-task-item">
                Create a variable named 'missionName' and store your 
                space mission's name in it (remember, text values 
                need to be in quotes!)
              </li>
              <li className="js-task-item">
              Create a variable called 'astronautName' 
              to store the commander's name (that's you!)
              </li>
              <li className="js-task-item">
              Create a numerical variable 'missionDay' 
              and set it to 1 (this is your first day of the mission)
              </li>
            </ol>
            <p className="js-instruction">
              Remember to use 'let' to declare your variables and don't 
              forget that text values need quotation marks! 
              When you complete these steps correctly, you'll see your 
              mission data appear on the control panel in the 
              playground area. Your spacecraft's systems will 
              initialize, showing you're ready for your JavaScript s
              pace journey! Are you ready to begin your first mission? 
              Click the Begin Mission button to launch your JavaScript
              adventure!
            </p>
            {!startAttempt && (
              <button className="js-attempt-btn" onClick={() => beginChallenge()}>
                Begin Mission
              </button>
            )}
            {startAttempt && (
              <div className="js-editor-container">
                <div ref={editorRef} />
                <button className="js-hint-btn" onClick={useHintSystem}>
                  Request Hint ({hintCounter})
                </button>
                <button className="js-submit-btn" onClick={() => {validateAnswer(null);}}>
                  Launch Mission
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Mission Control Display */}
        <div
          className="js-mission-control"
          style={{ backgroundImage: `url(${SpaceBackground})` }}
        >
          <div className="js-control-panel">
            <div className={`js-astronaut-hint ${hint === "" ? "fade" : ""}`}>
              <img
                className="js-astronaut-guide"
                src={AstronautGuide}
                alt="astronaut-guide"
              />
              <p className="js-hint-text">{hint}</p>
            </div>
            <div className="js-mission-parameter-topic">System Initialization Progress</div>

            {/* Mission Control Display that updates based on correct variables */}
            {missionNameVisible && (
              <div className="js-mission-parameter">Mission Name: Initialized ✓</div>
            )}
            {astronautNameVisible && (
              <div className="js-mission-parameter">Commander Name: Registered ✓</div>
            )}
            {missionDayVisible && (
              <div className="js-mission-parameter">Mission Day: Confirmed ✓</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default JSLesson1;
