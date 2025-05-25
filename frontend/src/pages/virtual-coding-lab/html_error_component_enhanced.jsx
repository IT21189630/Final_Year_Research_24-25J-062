import React, { useState } from "react";
import { parseFragment } from "parse5";

/**
 * Detects basic HTML structural errors using parse5.
 * @param {string} htmlCode
 * @returns {string[]} Array of error messages
 */
function detectHtmlErrors(htmlCode) {
  try {
    const document = parseFragment(htmlCode);
    const errors = [];

    // Helper function to traverse nodes recursively
    const traverse = (node, parentTag) => {
      if (node.tagName) {
        // Example: Invalid nesting
        if (parentTag === "p" && node.tagName === "div") {
          errors.push("Invalid nesting: <div> cannot be inside <p>.");
        }
        // Example: Missing alt attribute
        if (
          node.tagName === "img" &&
          !(node.attrs || []).some((attr) => attr.name === "alt")
        ) {
          errors.push("Missing alt attribute on <img> tag.");
        }
        // Detect improper tag closure by manually analyzing raw HTML
        const openingTag = `<${node.tagName}`;
        const closingTag = `</${node.tagName}>`;
        if (
          !htmlCode.includes(openingTag) ||
          !htmlCode.includes(closingTag) ||
          htmlCode.indexOf(openingTag) > htmlCode.indexOf(closingTag)
        ) {
          errors.push(`Unclosed or misplaced tag: <${node.tagName}>.`);
        }
      }
      // Recursively check child nodes
      if (node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach((child) => traverse(child, node.tagName));
      }
    };

    document.childNodes.forEach((node) => traverse(node, null));

    // Ensure <html> and <body> tags are present for full documents
    if (!/<html>/.test(htmlCode)) {
      errors.push("Missing <html> root tag.");
    }
    if (!/<body>/.test(htmlCode)) {
      errors.push("Missing <body> tag.");
    }

    return errors.length > 0 ? errors : ["No structural errors detected."];
  } catch (error) {
    return ["Error parsing HTML structure."];
  }
}

/**
 * Detects basic CSS syntax errors.
 * @param {string} cssCode
 * @returns {string[]} Array of error messages
 */
function detectCssErrors(cssCode) {
  const errors = [];
  // Very basic checks (for demo purposes)
  // 1. Unclosed curly braces
  const openBraces = (cssCode.match(/{/g) || []).length;
  const closeBraces = (cssCode.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push("Mismatched number of '{' and '}' in CSS.");
  }
  // 2. Missing semicolons (simple check)
  const lines = cssCode.split("\n");
  lines.forEach((line, idx) => {
    if (
      line.trim() &&
      !line.trim().startsWith("@") &&
      !line.trim().endsWith("{") &&
      !line.trim().endsWith("}") &&
      !line.trim().endsWith(";")
    ) {
      errors.push(`Possible missing semicolon at line ${idx + 1}.`);
    }
  });
  return errors.length > 0 ? errors : ["No CSS syntax errors detected."];
}

/**
 * HTML and CSS Error Detection Component
 * @param {object} props
 * @param {string} props.htmlCode
 * @param {string} props.cssCode
 */
const HtmlCssErrorComponentEnhanced = ({ htmlCode = "", cssCode = "" }) => {
  const [htmlErrors, setHtmlErrors] = useState([]);
  const [cssErrors, setCssErrors] = useState([]);

  const handleCheck = () => {
    setHtmlErrors(detectHtmlErrors(htmlCode));
    setCssErrors(detectCssErrors(cssCode));
  };

  return (
    <div
      style={{
        background: "#f8fafd",
        borderRadius: 8,
        padding: 20,
        margin: 16,
      }}
    >
      <h3>HTML & CSS Syntax Error Detection</h3>
      <button className="er-ch-btn" onClick={handleCheck}>
        Check Errors
      </button>
      <div>
        <h4>HTML Errors:</h4>
        <ul>
          {htmlErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4>CSS Errors:</h4>
        <ul>
          {cssErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HtmlCssErrorComponentEnhanced;
