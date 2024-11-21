import React, { useState, useEffect, useRef } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import GalacticMap from "../../../images/lessons/galactic-map.jpg";
import TargetOutput from "../../../images/lessons/target-output-lesson-4.png";
import AnchorSyntax from "../../../images/lessons/anchor-tag-syntax.png";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import Timer from "../../../components/timer/Timer";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { planetFusion, planetNeptune, planetKeplar } from "./planet-info";
import { MdClose } from "react-icons/md";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson4.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson4() {
  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Galactic Map</title>
  </head>
  <body>
    <!-- Link to information of planet fusion-x -->

    <!-- Link to information of planet keplar-22 -->

    <!-- Link to information of planet neptune -->
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
  const [planetInfo, setPlanetInfo] = useState(null);
  const [fusionXVisibility, setFusionXVisibility] = useState(false);
  const [keplarVisibility, setKeplarVisibility] = useState(false);
  const [neptuneVisibility, setNeptuneVisibility] = useState(false);
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

    const hasFusionXLinkRegex = new RegExp(
      `<a\\s+href=["']\\s*${planetFusion.link}\\s*["']\\s*>\\s*${planetFusion.name}\\s*<\\/a>`,
      "i"
    ).test(htmlContent);

    const hasKeplar22LinkRegex = new RegExp(
      `<a\\s+href=["']\\s*${planetKeplar.link}\\s*["']\\s*>\\s*${planetKeplar.name}\\s*<\\/a>`,
      "i"
    ).test(htmlContent);
    const hasNeptuneLinkRegex = new RegExp(
      `<a\\s+href=["']\\s*${planetNeptune.link}\\s*["']\\s*>\\s*${planetNeptune.name}\\s*<\\/a>`,
      "i"
    ).test(htmlContent);

    const linkValidator = () => {
      if (hasFusionXLinkRegex && hasKeplar22LinkRegex && hasNeptuneLinkRegex) {
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
      linkValidator()
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
    const hasFusionXLinkRegex = new RegExp(
      `<a\\s+href=["']\\s*${planetFusion.link}\\s*["']\\s*>\\s*${planetFusion.name}\\s*<\\/a>`,
      "i"
    ).test(htmlContent);

    const hasKeplar22LinkRegex = new RegExp(
      `<a\\s+href=["']\\s*${planetKeplar.link}\\s*["']\\s*>\\s*${planetKeplar.name}\\s*<\\/a>`,
      "i"
    ).test(htmlContent);
    const hasNeptuneLinkRegex = new RegExp(
      `<a\\s+href=["']\\s*${planetNeptune.link}\\s*["']\\s*>\\s*${planetNeptune.name}\\s*<\\/a>`,
      "i"
    ).test(htmlContent);

    setFusionXVisibility(hasFusionXLinkRegex);
    setKeplarVisibility(hasKeplar22LinkRegex);
    setNeptuneVisibility(hasNeptuneLinkRegex);
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

  const closePlanetInfo = () => {
    setPlanetInfo(null);
  };

  const planetInfoChanger = (planet) => {
    setPlanetInfo(planet);
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
            <div className="lesson">Lesson-04</div>
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
            <h2 className="lesson-heading">04.Build a Galactic Map</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Imagine you're looking at a big book, and you want to jump to a
              different page. Instead of flipping through all the pages, you can
              use a magic link that takes you straight to the page you want.
              This magic link is like a shortcut. In the world of web pages, we
              call this link the <b>anchor tag!</b>. Below you can see how it
              works. <br /> <br />
              <img src={AnchorSyntax} alt="syntax-of-the-anchor-tag" />
              <ol>
                <li>
                  <b>The Anchor Tag (&lt;a&gt;) </b>
                </li>
                <p>
                  &lt;a&gt; is the opening tag, telling the web browser that
                  we're creating a link. <b>href</b> is like the address of the
                  page you want to visit. It stands for Hypertext Reference.
                  When someone clicks your link, the web browser goes to this
                  address.The text between the &lt;a&gt; and &lt;a&gt; is the
                  part that people can click. This is the text that shows up on
                  the page.
                </p>
              </ol>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              Welcome to the Galactic Map linking challenge! Your task is to
              create clickable links for three planets on the Galactic Map using
              the skills you've learned about the anchor (&lt;a&gt;) tag. <br />{" "}
              <br />
              <b>Your Task:</b> <br />
              Your challenge is to list the planets with their names display
              near them and once click them your colleagues should be able to
              navigate to the information of that planet:
              <br />
              <br />
              <ol>
                <li>
                  <b>Planet Name</b> should be display as the anchor text.
                </li>
                <li>
                  <b>Link</b> is the place where planet information is available
                </li>
              </ol>
              To help you out, here are the relevant planet names and their
              information pages.You can copy and paste these directly, then add
              the appropriate tags and formatting as instructed.
            </p>
            <ol>
              <li>
                Planet Fusion-X - It is the green color planet.
                <b>{planetFusion.name}</b> should be displayed as the planet
                name. Once it clicked user should navigated to the{" "}
                <b>{planetFusion.link}</b>. Click and see you can see the
                information.
              </li>
              <li>
                Planet Kepler-22 - It is the green color planet.
                <b>{planetKeplar.name}</b> should be displayed as the planet
                name. Once it clicked user should navigated to the{" "}
                <b>{planetKeplar.link}</b>. Click and see you can see the
                information.
              </li>
              <li>
                Planet Neptune - It is the purple color planet.
                <b>{planetNeptune.name}</b> should be displayed as the planet
                name. Once it clicked user should navigated to the{" "}
                <b>{planetNeptune.link}</b>. Click and see you can see the
                information.
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
              className="target-output-img-l4"
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
          className="playground-area"
          style={{ backgroundImage: `url(${GalacticMap})` }}
        >
          <div className={`motivater ${hint === "" ? "fade" : ""}`}>
            <img
              className="astro-guider"
              src={AstronautGuider}
              alt="astronaut-image"
            />
            <p className="motive-text">{hint}</p>
          </div>
          <div className="galactic-map-container">
            {fusionXVisibility && (
              <div
                className="planet-info-cont fusion-X"
                onClick={() => planetInfoChanger(planetFusion)}
              >
                Fusion-X
              </div>
            )}
            {keplarVisibility && (
              <div
                className="planet-info-cont keplar-22"
                onClick={() => planetInfoChanger(planetKeplar)}
              >
                Keplar-22
              </div>
            )}
            {neptuneVisibility && (
              <div
                className="planet-info-cont neptune"
                onClick={() => planetInfoChanger(planetNeptune)}
              >
                Neptune
              </div>
            )}
          </div>
          {planetInfo && (
            <div className="planet-information-modal">
              <div
                className="close-modal-btn"
                onClick={() => closePlanetInfo()}
              >
                <MdClose />
              </div>
              <span className="planet-name">
                {planetInfo ? planetInfo.name : ""}
              </span>
              <p className="planet-info">{planetInfo ? planetInfo.info : ""}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Lesson4;
