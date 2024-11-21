import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import SpaceGallery from "../../../images/lessons/space-gallery.png";
import TargetOutput from "../../../images/lessons/target-output-lesson-5.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { planetEarth, planetJupiter, planetMars } from "./planet-images";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson5.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson5() {
  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Planetary Gallery</title>
  </head>
  <body>

    <!-- Planet Earth Image -->

    <!-- Planet Mars Image -->

    <!-- Planet Jupiter Image -->

  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Make sure to use <a> tags to create the links with the correct format.",
    "Double-check that the href attribute links to the correct page URL.",
    "The text inside the <a> tag should match the planet's name exactly.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 300, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [planetEarthVisibility, setPlanetEarthVisibility] = useState(false);
  const [planetMarsVisibility, setPlanetMarsVisibility] = useState(false);
  const [planetJupiterVisibility, setPlanetJupiterVisibility] = useState(false);
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

    const hasEarthImageRegex = new RegExp(
      `<img\\s+src=["']\\s*${planetEarth.path}\\s*["']\\s+alt=["']\\s*${planetEarth.alternateText}\\s*["'][^>]*>`,
      "i"
    ).test(htmlContent);

    const hasMarsImageRegex = new RegExp(
      `<img\\s+src=["']\\s*${planetMars.path}\\s*["']\\s+alt=["']\\s*${planetMars.alternateText}\\s*["'][^>]*>`,
      "i"
    ).test(htmlContent);

    const hasJupiterImageRegex = new RegExp(
      `<img\\s+src=["']\\s*${planetJupiter.path}\\s*["']\\s+alt=["']\\s*${planetJupiter.alternateText}\\s*["'][^>]*>`,
      "i"
    ).test(htmlContent);

    const imageValidator = () => {
      if (hasEarthImageRegex && hasMarsImageRegex && hasJupiterImageRegex) {
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
      imageValidator()
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
      }
    } else {
      toast.error("Not an acceptable answer!");
      if (attemptCounter !== 0) {
        setAttemptCounter((prev) => prev - 1);
      }
    }
  };

  const validateHTML = () => {
    let htmlContent = htmlInput.trim();

    const hasEarthImageRegex = new RegExp(
      `<img\\s+src=["']\\s*${planetEarth.path}\\s*["']\\s+alt=["']\\s*${planetEarth.alternateText}\\s*["'][^>]*>`,
      "i"
    ).test(htmlContent);

    const hasMarsImageRegex = new RegExp(
      `<img\\s+src=["']\\s*${planetMars.path}\\s*["']\\s+alt=["']\\s*${planetMars.alternateText}\\s*["'][^>]*>`,
      "i"
    ).test(htmlContent);

    const hasJupiterImageRegex = new RegExp(
      `<img\\s+src=["']\\s*${planetJupiter.path}\\s*["']\\s+alt=["']\\s*${planetJupiter.alternateText}\\s*["'][^>]*>`,
      "i"
    ).test(htmlContent);

    setPlanetEarthVisibility(hasEarthImageRegex);
    setPlanetMarsVisibility(hasMarsImageRegex);
    setPlanetJupiterVisibility(hasJupiterImageRegex);
  };

  const { setContainer } = useCodeMirror({
    container: editorRef.current,
    value: htmlInput,
    height: "380px",
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
            <div className="lesson">Lesson-05</div>
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
            <h2 className="lesson-heading">05.Capture Planetery Photos</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Welcome to the exciting world of images on the web! Have you ever
              wondered how pictures appear on a webpage? It's all thanks to the
              &lt;img&gt; tag! This special HTML tag lets you add pictures to
              any website, bringing it to life with colorful and exciting
              visuals. Think of the &lt;img&gt; tag as a magic window that lets
              you show any picture you want. But to make sure the picture shows
              up properly, there are a few things you need to know: <br />{" "}
              <br />
              <ol>
                <li>
                  <b>src(Source) attribute. </b>
                </li>
                <p>
                  Source (src) Attribute: The src attribute tells the browser
                  where to find the picture. It's like giving a map to your
                  browser so it knows exactly where the image is. You put the
                  image's address (like a link) inside the src.
                </p>
                <li>
                  <b>alt(Alternative Text) attribute. </b>
                </li>
                <p>
                  Alternative Text (alt) Attribute: The alt attribute is like a
                  description for your picture. It helps people understand what
                  the image is, especially if it doesn't load or if someone is
                  using a screen reader. Imagine if the picture can't show up —
                  the alt text will tell you what it was supposed to be!
                </p>
              </ol>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Great job on learning how to use images on your webpage! Now, it's
              time for a fun challenge that puts your new skills to the test. An
              astronaut recently returned from a space mission and captured some
              incredible photos of distant planets! These amazing photos need to
              be displayed in the Art Gallery of the Space Center for everyone
              to see. Your task is to use the skills you've learned about the
              &lt;img&gt; tag to show these photos on the webpage. Here's what
              you need to do:
              <br />
              <br />
              <b>Your Task:</b> <br />
              Your challenge is to list the planets with their names display
              near them and once click them your colleagues should be able to
              navigate to the information of that planet:
              <br />
              <br />
              <ol>
                <li>
                  <b>Find the Photos:</b> The astronaut has shared the photos
                  with you. Each photo is stored in a special folder called
                  "space-gallery." The name of each file is already provided.
                </li>
                <li>
                  <b>Use the Correct src and alt Attributes:</b> To make sure
                  each photo is displayed properly, you'll need to: Use the
                  correct file path in the src attribute. Add a meaningful
                  description in the alt attribute to describe the image
                </li>
                <li>
                  <b>Place Each Image in the Art Gallery:</b> Use the
                  &lt;img&gt; tag to show the photos in the art gallery. Don't
                  forget to follow the format we discussed!
                </li>
              </ol>
              To help you out, here are the relevant paths of the captured
              planet photos and their alternative text to display
              resepectively.You can copy and paste these directly, then add the
              appropriate tags and formatting as instructed.
            </p>
            <ol>
              <li>
                <b>{planetEarth.name}</b> - Image path is
                <b>{planetEarth.path}</b>. You can found the image from this
                path. Alternative text would be{" "}
                <b>{planetEarth.alternateText}</b>.
              </li>
              <br />
              <li>
                <b>{planetMars.name}</b> - Image path is
                <b>{planetMars.path}</b>. You can found the image from this
                path. Alternative text would be{" "}
                <b>{planetMars.alternateText}</b>.
              </li>
              <br />
              <li>
                <b>{planetJupiter.name}</b> - Image path is
                <b>{planetJupiter.path}</b>. You can found the image from this
                path. Alternative text would be{" "}
                <b>{planetJupiter.alternateText}</b>.
              </li>
            </ol>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, Link should be displayed and you should able to see the
              planet information once you clicked it. Refer the sample output
              below.
            </p>
            <img
              src={TargetOutput}
              className="target-output-img-l5"
              alt="target_output_lesson2"
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
          className="playground-area-l5"
          style={{ backgroundImage: `url(${SpaceGallery})` }}
        >
          <div className={`motivater ${hint === "" ? "fade" : ""}`}>
            <img
              className="astro-guider"
              src={AstronautGuider}
              alt="astronaut-image"
            />
            <p className="motive-text">{hint}</p>
          </div>
          <div className="portrait-container">
            {/* earth picture */}
            <div className="picture-cont">
              {planetEarthVisibility && (
                <img
                  src={planetEarth.source}
                  alt={planetEarth.alternateText}
                  className="picture"
                />
              )}
              <span className="img-name">{planetEarth.name}</span>
            </div>
            {/* mars picture */}
            <div className="picture-cont">
              {planetMarsVisibility && (
                <img
                  src={planetMars.source}
                  alt={planetMars.alternateText}
                  className="picture"
                />
              )}
              <span className="img-name">{planetMars.name}</span>
            </div>
            {/* jupiter picture */}
            <div className="picture-cont">
              {planetJupiterVisibility && (
                <img
                  src={planetJupiter.source}
                  alt={planetJupiter.alternateText}
                  className="picture"
                />
              )}
              <span className="img-name">{planetJupiter.name}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson5;
