import React, { useState } from "react";
import axios from 'axios';
import "./htmlCssChallenge.css";

const HtmlCssChallenge = () => {
  // const [htmlCode, setHtmlCode] = useState("<div>Hello World</div>");
  // const [cssCode, setCssCode] = useState("div { color: red; }");
  // const [preview, setPreview] = useState("");
  // const [similarity, setSimilarity] = useState(-1)


  // // Update the live preview
  // const updatePreview = () => {
  //   setPreview(`
  //     <html>
  //       <head>
  //         <style>${cssCode}</style>
  //       </head>
  //       <body>${htmlCode}</body>
  //     </html>
  //   `);
  // };

  // // Submit code to backend
  // const handleSubmit = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/gamified-learning/api/submission-management/submission/check-similarity", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ htmlCode, cssCode, challengeId: "67482a990ff156a20f5632d2", userId:"674ac997afe5d075cf9ca8dc", username:"Binod Gayasri" }),
  //     });
  //     const data = await response.json();

  //     if(data){
  //       alert(`Similarity:${data.similarity}`);
  //       setSimilarity(data.similarity);
  //     }
      
  //   } catch (err) {
  //     console.error("Error submitting solution:", err);
  //   }
  // };

  const [htmlCode, setHtmlCode] = useState("<div>Hello World</div>");
  const [cssCode, setCssCode] = useState("div { color: red; }");
  const [similarity, setSimilarity] = useState();
  const [preview, setPreview] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!htmlCode.trim()) {
      alert('Please provide HTML code.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/gamified-learning/api/submission-management/submission/check-similarity', {
        htmlCode,
        cssCode: cssCode === "" ? " " : cssCode
      });
      setSimilarity(response.data.similarity);
      alert('Successfully submitted the code.');
    } catch (error) {
      console.error('Error evaluating challenge:', error);
      alert('An error occurred while evaluating your code.');
    }
  };


  return (
    <div className="container">
      <h1>HTML/CSS Challenge</h1>
      <textarea style={{width:580, height:580}}
        value={htmlCode}
        onChange={(e) => setHtmlCode(e.target.value)}
        placeholder="Write HTML code"
      />
      <textarea style={{width:580, height:580}}
        value={cssCode}
        onChange={(e) => setCssCode(e.target.value)}
        placeholder="Write CSS code"
      />
      <button className='submit-btn' onClick={updatePreview}>Update Preview</button>
      <iframe
        title="Live Preview"
        srcDoc={preview}
        style={{ width: "89%", height: "500px", border: "1px solid black" }}
      />
      <button className='submit-btn' onClick={handleSubmit}>Submit</button>
      {similarity>=0?
      <h2 className="similarity">Similarity Score: {parseFloat(similarity.toFixed(6))*100}%</h2>
      :
      ""
      }
    </div>
  );
};

export default HtmlCssChallenge;
