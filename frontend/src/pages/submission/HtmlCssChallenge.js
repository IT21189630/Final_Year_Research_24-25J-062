import React, { useState } from "react";

const HtmlCssChallenge = () => {
  const [htmlCode, setHtmlCode] = useState("<div>Hello World</div>");
  const [cssCode, setCssCode] = useState("div { color: red; }");
  const [preview, setPreview] = useState("");
  const [similarity, setSimilarity] = useState("")


  // Update the live preview
  const updatePreview = () => {
    setPreview(`
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>${htmlCode}</body>
      </html>
    `);
  };

  // Submit code to backend
  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/submit-html-css", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlCode, cssCode, challengeId: "refImg1" }),
      });
      const data = await response.json();

      if(data){
        alert(`Screenshot saved at: ${data.screenshotPath} Similarity:${data.similarity}`);
        setSimilarity(data.similarity);
      }
      
    } catch (err) {
      console.error("Error submitting solution:", err);
    }
  };

  return (
    <div>
      <h1>HTML/CSS Challenge</h1>
      <textarea style={{width:650, height:650}}
        value={htmlCode}
        onChange={(e) => setHtmlCode(e.target.value)}
        placeholder="Write HTML code"
      />
      <textarea style={{width:650, height:650}}
        value={cssCode}
        onChange={(e) => setCssCode(e.target.value)}
        placeholder="Write CSS code"
      />
      <button onClick={updatePreview}>Update Preview</button>
      <iframe
        title="Live Preview"
        srcDoc={preview}
        style={{ width: "85%", height: "500px", border: "1px solid black" }}
      />
      <button onClick={handleSubmit}>Submit</button>
      <h2>Similarity : {similarity}</h2>
    </div>
  );
};

export default HtmlCssChallenge;
