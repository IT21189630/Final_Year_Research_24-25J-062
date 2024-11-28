import React, { useState, useEffect, useRef } from "react";
import Table from "react-bootstrap/Table";
import { useCodeMirror } from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { html } from "@codemirror/lang-html";
import GalacticBackground from "../../../images/lessons/galactic-background.jpg";
import AstronautGuider from "../../../images/lessons/motive-image.png";
import TabletScreen from "../../../images/lessons/tab-screen.png";
import Timer from "../../../components/timer/Timer";
import { useSelector, useDispatch } from "react-redux";
import { updateProgress } from "../../../features/Progress.slice";
import { updateCourseProgress } from "../../../components/course-progress-updater/CourseProgressUpdater";
import { IoMdTimer } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { galacticData } from "./galactic-data";
import { validTable } from "./tableValidator";
import { lessonPerformanceScoreCalculator } from "../../../components/performance-score-calc/PerformanceScoreCalculator";
import "./lesson7.styles.css";
import PerformanceSummaryModal from "../../../components/performance-summary-modal/PerformanceSummaryModal";

function Lesson7() {
  const dispatch = useDispatch();
  const { course_id } = useSelector((state) => state.progress);
  const { user_id } = useSelector((state) => state.user);
  const { lesson_id } = useSelector((state) => state.lesson);

  const initialCode = `<!DOCTYPE html>
<html>
  <head>
    <title>Galactic Discoveries</title>
  </head>
  <body>
    <!-- Write your answer within the table tags -->
    <table>

      
    </table>
  </body>
</html>`;
  const hintDuration = 5000;
  const hints = [
    "Each discovery (data record) is represented as a table row <tr>. ",
    "To give the field names of the table we use <th> tag, AKA table heads.",
    "Make sure to check open and close tags and nesting of the tags.",
  ];
  const maximumMargins = { maxHints: 3, maxTime: 240, maxAttempts: 5 };

  const [activate, setActivate] = useState(false);
  const [htmlInput, setHtmlInput] = useState(initialCode);
  const [hintCounter, setHintCounter] = useState(3);
  const [attemptCounter, setAttemptCounter] = useState(5);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [hint, setHint] = useState("");
  const [tableHeadVisibility, setTableHeadVisibility] = useState(false);
  const [firstRecordVisibility, setFirstRecordVisibility] = useState(false);
  const [secondRecordVisibility, setSecondRecordVisibility] = useState(false);
  const [thirdRecordVisibility, setThirdRecordVisibility] = useState(false);
  const [fourthRecordVisibility, setFourthRecordVisibility] = useState(false);
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

    const tableValidator = () => {
      return validTable.test(htmlContent);
    };

    const result = tableValidator();
    console.log(result);
    console.log(htmlContent);

    if (
      headBeforeBody &&
      hasHtmlTag &&
      hasHeadTag &&
      hasBodyTag &&
      hasTitleTag &&
      tableValidator()
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
        const nextLevel = 8;
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

    const hasTableHead = new RegExp(
      `<tr>\\s*` +
        `<th[^>]*>\\s*${galacticData.tableHeads.field1}\\s*<\\/th>\\s*` +
        `<th[^>]*>\\s*${galacticData.tableHeads.field2}\\s*<\\/th>\\s*` +
        `<th[^>]*>\\s*${galacticData.tableHeads.field3}\\s*<\\/th>\\s*` +
        `<th[^>]*>\\s*${galacticData.tableHeads.field4}\\s*<\\/th>\\s*` +
        `<\\/tr>`,
      "i"
    ).test(htmlContent);

    const hasFirstDataRow = new RegExp(
      `<tr>\\s*` +
        `<td[^>]*>\\s*${galacticData.record1.planetName}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record1.numberOfMoons}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record1.lifeSuitability}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record1.distance}\\s*<\\/td>\\s*` +
        `<\\/tr>`,
      "i"
    ).test(htmlContent);

    const hasSecondDataRow = new RegExp(
      `<tr>\\s*` +
        `<td[^>]*>\\s*${galacticData.record2.planetName}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record2.numberOfMoons}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record2.lifeSuitability}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record2.distance}\\s*<\\/td>\\s*` +
        `<\\/tr>`,
      "i"
    ).test(htmlContent);

    const hasThirdDataRow = new RegExp(
      `<tr>\\s*` +
        `<td[^>]*>\\s*${galacticData.record3.planetName}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record3.numberOfMoons}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record3.lifeSuitability}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record3.distance}\\s*<\\/td>\\s*` +
        `<\\/tr>`,
      "i"
    ).test(htmlContent);

    const hasFourthDataRow = new RegExp(
      `<tr>\\s*` +
        `<td[^>]*>\\s*${galacticData.record4.planetName}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record4.numberOfMoons}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record4.lifeSuitability}\\s*<\\/td>\\s*` +
        `<td[^>]*>\\s*${galacticData.record4.distance}\\s*<\\/td>\\s*` +
        `<\\/tr>`,
      "i"
    ).test(htmlContent);

    setTableHeadVisibility(hasTableHead);
    setFirstRecordVisibility(hasFirstDataRow);
    setSecondRecordVisibility(hasSecondDataRow);
    setThirdRecordVisibility(hasThirdDataRow);
    setFourthRecordVisibility(hasFourthDataRow);
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
            <div className="lesson">Lesson-07</div>
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
            <h2 className="lesson-heading">07.Record Galactic Discoveries</h2>
            {/* lesson introduction and important concepts */}
            <h3 className="lesson-sub-headings">Introduction</h3>
            <p className="introduction-para">
              Welcome to this lesson! Today, we're going to learn about HTML
              tables, HTML tables are a powerful way to organize and display
              data on a webpage. They help structure information into rows and
              columns, making it easier to read and understand. In this lesson,
              you will learn the basics of creating tables using &lt;table&gt;,
              organizing headers with &lt;th&gt;, and arranging data with
              &lt;tr&gt; and &lt;td&gt;. We'll start simple, focusing on
              building a basic table, then explore how to style and enhance your
              tables for a more polished look. By the end, you'll be comfortable
              using tables to present data clearly and effectively in any
              project. <br /> <br />
              <b>How to setup HTML table</b>
              <ol>
                <li>
                  <b>Step 1: Create the Basic Table Structure &lt;table&gt;</b>{" "}
                  - Every HTML table starts with a &lt;table&gt; tag to define
                  the table structure. Let's begin by creating a blank table:
                </li>
                <li>
                  <b>Step 2: Add a Row with &lt;tr&gt;</b> - To add content to
                  the table, we use table rows, which are created with
                  &lt;tr&gt; tags. Each row contains table data or table
                  headers.
                </li>
                <li>
                  <b>Step 3: Add Table Headers with &lt;th&gt;</b> - Table
                  headers (&lt;th&gt;) define the heading of each column. Add
                  these inside your &lt;tr&gt; to specify the table headers:
                </li>
                <li>
                  <b>Step 4: Add Table Data with &lt;td&gt;</b> - To fill your
                  table with data, use the &lt;td&gt; tag inside the &lt;tr&gt;
                  tags. Each &lt;td&gt; represents a cell in the table:
                </li>
              </ol>
            </p>
            {/* challenge for the current lesson */}
            <h3 className="lesson-sub-headings">Challenge</h3>
            <p>
              <b>Mission Brief:</b> Our astronaut has to send a summary of
              recent galactic discoveries to the NASA. The data will be send as
              a table. So you have to use the concepts you learned during this
              lesson to overcome this challenge. you should follow the given
              objectives to successfully complete the challenge.
              <br />
              <br />
              <b>Your Tasks:</b>
              <ol>
                <li>
                  Column headers, also known as column names are the
                  <b>{galacticData.tableHeads.field1}</b>,
                  <b>{galacticData.tableHeads.field2}</b>,
                  <b>{galacticData.tableHeads.field3}</b> and
                  <b>{galacticData.tableHeads.field4}</b>
                </li>
                <li>
                  First discovery was the planet
                  <b>{galacticData.record1.planetName}</b>. It have
                  {galacticData.record1.numberOfMoons} moons. The life
                  Suitability of the planet is
                  {galacticData.record1.lifeSuitability}.Distance to this planet
                  from Earth is {galacticData.record1.distance} million
                  kilometers.
                </li>
                <li>
                  Second discovery was the planet
                  <b>{galacticData.record2.planetName}</b>. It have
                  {galacticData.record2.numberOfMoons} moons. The life
                  Suitability of the planet is
                  {galacticData.record2.lifeSuitability}.Distance to this planet
                  from Earth is {galacticData.record2.distance} million
                  kilometers.
                </li>
                <li>
                  Third discovery was the planet
                  <b>{galacticData.record3.planetName}</b>. It have
                  {galacticData.record3.numberOfMoons} moons. The life
                  Suitability of the planet is
                  {galacticData.record3.lifeSuitability}.Distance to this planet
                  from Earth is {galacticData.record3.distance} million
                  kilometers.
                </li>
                <li>
                  Fourth discovery was the planet
                  <b>{galacticData.record4.planetName}</b>. It have
                  {galacticData.record4.numberOfMoons} moons. The life
                  Suitability of the planet is
                  {galacticData.record4.lifeSuitability}.Distance to this planet
                  from Earth is {galacticData.record4.distance} million
                  kilometers.
                </li>
              </ol>
              To help you out, all the galactic discovery data are mentioned.
              You just simply can copy and paste them if you want to reduce the
              errors.
            </p>
            <p>
              Remember to use the correct opening and closing tags to make sure
              everything is in its proper place. Once you complete these steps
              correctly, New planet discoveries should be visible as a table.
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
          className="playground-area-l5"
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
            className="tablet-screen horizontal"
            style={{ backgroundImage: `url(${TabletScreen})` }}
          >
            <div className="galactic-data-area">
              <Table striped bordered hover>
                {tableHeadVisibility && (
                  <tr>
                    <th>{galacticData.tableHeads.field1}</th>
                    <th>{galacticData.tableHeads.field2}</th>
                    <th>{galacticData.tableHeads.field3}</th>
                    <th>{galacticData.tableHeads.field4}</th>
                  </tr>
                )}
                {firstRecordVisibility && (
                  <tr>
                    <td>{galacticData.record1.planetName}</td>
                    <td>{galacticData.record1.numberOfMoons}</td>
                    <td>{galacticData.record1.lifeSuitability}</td>
                    <td>{galacticData.record1.distance}</td>
                  </tr>
                )}
                {secondRecordVisibility && (
                  <tr>
                    <td>{galacticData.record2.planetName}</td>
                    <td>{galacticData.record2.numberOfMoons}</td>
                    <td>{galacticData.record2.lifeSuitability}</td>
                    <td>{galacticData.record2.distance}</td>
                  </tr>
                )}
                {thirdRecordVisibility && (
                  <tr>
                    <td>{galacticData.record3.planetName}</td>
                    <td>{galacticData.record3.numberOfMoons}</td>
                    <td>{galacticData.record3.lifeSuitability}</td>
                    <td>{galacticData.record3.distance}</td>
                  </tr>
                )}
                {fourthRecordVisibility && (
                  <tr>
                    <td>{galacticData.record4.planetName}</td>
                    <td>{galacticData.record4.numberOfMoons}</td>
                    <td>{galacticData.record4.lifeSuitability}</td>
                    <td>{galacticData.record4.distance}</td>
                  </tr>
                )}
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lesson7;
