import React, { useState } from "react";

const HtmlCssChallenge = () => {
  const [htmlCode, setHtmlCode] = useState("<div>Hello World</div>");
  const [cssCode, setCssCode] = useState("div { color: red; }");
  const [preview, setPreview] = useState("");
  const [similarity, setSimilarity] = useState(-1)


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
      const response = await fetch("http://localhost:5000/gamified-learning/api/submission-management/submission/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlCode, cssCode, challengeId: "67482a990ff156a20f5632d2", userId:"674ac997afe5d075cf9ca8dc", username:"Binod Gayasri" }),
      });
      const data = await response.json();

      if(data){
        alert(`Similarity:${data.visualSimilarity}`);
        setSimilarity(data.visualSimilarity);
      }
      
    } catch (err) {
      console.error("Error submitting solution:", err);
    }
  };

  return (
    <div style={{margin:30}}>
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
      {similarity>=0?
      <h2>Similarity : {parseFloat(similarity.toFixed(6))*100}%</h2>
      :
      ""
      }
    </div>
  );
};

export default HtmlCssChallenge;
