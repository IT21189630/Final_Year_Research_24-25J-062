import React, { useState } from 'react';
import axios from 'axios';
import CodeEditor from '../editor/CodeEditor';

const SubmissionForm = ({ challengeId }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const generatePreview = () => {
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
      </body>
      </html>
    `;
    setPreview(previewHtml);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post('http://localhost:5000/gamified-learning/api/submission-management/submissions', {
        challengeId,
        htmlCode,
        cssCode
      });

      setResult(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting solution:', err);
      setError(err.response?.data?.message || 'An error occurred during submission');
      setLoading(false);
    }
  };

  return (
    <div className="submission-form">
      <div className="code-editors">
        <div className="html-editor">
          <h4>HTML</h4>
          <CodeEditor
            language="html"
            value={htmlCode}
            onChange={setHtmlCode}
          />
        </div>
        <div className="css-editor">
          <h4>CSS</h4>
          <CodeEditor
            language="css"
            value={cssCode}
            onChange={setCssCode}
          />
        </div>
      </div>
      
      <div className="preview-controls">
        <button 
          onClick={generatePreview} 
          className="btn btn-secondary"
          disabled={loading}
        >
          Preview
        </button>
        <button 
          onClick={handleSubmit} 
          className="btn btn-primary"
          disabled={loading || !htmlCode || !cssCode}
        >
          {loading ? 'Submitting...' : 'Submit Solution'}
        </button>
      </div>
      
      {preview && (
        <div className="preview-container">
          <h4>Preview</h4>
          <iframe
            title="Preview"
            srcDoc={preview}
            width="100%"
            height="400px"
            sandbox="allow-scripts"
          />
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {result && (
        <div className="submission-result">
          <h4>Evaluation Result</h4>
          <div className="score-display">
            <div className="score-circle" style={{ 
              background: `conic-gradient(#4CAF50 ${result.similarityScore}%, #f0f0f0 0)` 
            }}>
              <span>{result.similarityScore}%</span>
            </div>
          </div>
          <div className="feedback">
            <h5>Feedback</h5>
            <p>{result.feedback}</p>
          </div>
          <div className="comparison">
            <div className="reference">
              <h5>Reference</h5>
              <img src={`/${result.submission.challenge.referenceImagePath}`} alt="Reference" />
            </div>
            <div className="your-submission">
              <h5>Your Submission</h5>
              <img src={`/${result.submission.submissionImagePath}`} alt="Your submission" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;