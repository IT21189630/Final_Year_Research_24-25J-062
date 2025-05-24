// AttemptChallenge.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AttemptChallenge.css';

const AttemptChallenge = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [htmlCode, setHtmlCode] = useState('<div id="challenge-solution">\n  <!-- Your HTML here -->\n</div>');
  const [cssCode, setCssCode] = useState('#challenge-solution {\n  /* Your CSS here */\n}');
  const [jsCode, setJsCode] = useState('// Your JavaScript here\n');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const previewFrameRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [processingStage, setProcessingStage] = useState(null); // tracks current processing stage
  const [processingProgress, setProcessingProgress] = useState(0); 
    
  // Track browser size
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/dailychallenge/${id || 'today'}`);
        setChallenge(response.data);
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge details');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  // Function to format description with line breaks
  const formatDescription = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Update preview when code changes with a unique ID to ensure fresh rendering
  const updatePreview = () => {
    const timestamp = new Date().getTime();
    const combinedCode = `
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: auto; }
            html { width: 100%; height: 100%; }
            ${cssCode}
          </style>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            // Helper function to communicate iframe readiness back to parent
            function notifyReady() {
              window.parent.postMessage({ type: 'IFRAME_READY', timestamp: ${timestamp} }, '*');
            }
            
            // Notify when fully loaded
            window.addEventListener('load', function() {
              // Wait a short time to ensure all resources are loaded
              setTimeout(notifyReady, 300);
            });

            // User's JavaScript code wrapped in a try-catch for error handling
            try {
              ${jsCode}
            } catch (error) {
              console.error('Error in user JavaScript:', error);
              window.parent.postMessage({ type: 'JS_ERROR', error: error.toString() }, '*');
            }
          </script>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
    
    if (previewFrameRef.current) {
      // Create a data URL from the HTML content
      const blob = new Blob([combinedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Set the iframe src to the data URL
      previewFrameRef.current.src = url;
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewFrameRef.current && previewFrameRef.current.src) {
        URL.revokeObjectURL(previewFrameRef.current.src);
      }
    };
  }, []);

  // Capture function that uses direct communication with the iframe
  const captureIframe = () => {
    return new Promise((resolve, reject) => {
      if (!previewFrameRef.current) {
        reject('No iframe to capture');
        return;
      }
      
      // Function to process messages from the iframe
      const messageHandler = (event) => {
        if (event.data && event.data.type === 'IFRAME_CAPTURE_RESULT') {
          window.removeEventListener('message', messageHandler);
          resolve(event.data.imageData);
        }
      };
      
      // Listen for messages from the iframe
      window.addEventListener('message', messageHandler);
      
      try {
        // Inject the html2canvas script into the iframe
        const iframe = previewFrameRef.current;
        const iframeWindow = iframe.contentWindow;
        const iframeDoc = iframe.contentDocument || iframeWindow.document;
        
        // Create a script element for html2canvas
        const script = iframeDoc.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => {
          // Once html2canvas is loaded, capture the content
          const captureScript = iframeDoc.createElement('script');
          captureScript.textContent = `
            html2canvas(document.body, {
              backgroundColor: null,
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true,
              width: document.body.scrollWidth,
              height: document.body.scrollHeight
            }).then(function(canvas) {
              // Send the captured image back to the parent window
              window.parent.postMessage({ 
                type: 'IFRAME_CAPTURE_RESULT', 
                imageData: canvas.toDataURL('image/png')
              }, '*');
            }).catch(function(err) {
              console.error('Capture failed:', err);
              window.parent.postMessage({ 
                type: 'IFRAME_CAPTURE_ERROR', 
                error: err.toString()
              }, '*');
            });
          `;
          iframeDoc.body.appendChild(captureScript);
        };
        
        script.onerror = () => {
          window.removeEventListener('message', messageHandler);
          reject('Failed to load html2canvas in iframe');
        };
        
        iframeDoc.head.appendChild(script);
        
        // Set a timeout in case capture fails
        setTimeout(() => {
          window.removeEventListener('message', messageHandler);
          reject('Capture timed out');
        }, 10000);
      } catch (err) {
        window.removeEventListener('message', messageHandler);
        reject(err);
      }
    });
  };

  // Fallback method using DOM cloning
  const captureByCloning = () => {
    return new Promise((resolve, reject) => {
      try {
        // Wait for iframe to be fully loaded
        setTimeout(async () => {
          try {
            // Get the iframe document
            const iframe = previewFrameRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Create a deep clone of the iframe's body
            const clonedBody = document.createElement('div');
            clonedBody.innerHTML = iframeDoc.body.innerHTML;
            
            // Apply styles from iframe
            const styles = Array.from(iframeDoc.styleSheets)
              .map(styleSheet => {
                try {
                  return Array.from(styleSheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
                } catch (e) {
                  console.log('Cannot access stylesheet rules');
                  return '';
                }
              })
              .join('\n');
            
            const styleElement = document.createElement('style');
            styleElement.textContent = styles + '\n' + cssCode;
            clonedBody.appendChild(styleElement);
            
            // Position the clone offscreen for capturing
            clonedBody.style.position = 'fixed';
            clonedBody.style.top = '0';
            clonedBody.style.left = '-9999px';
            clonedBody.style.width = `${iframe.clientWidth}px`;
            clonedBody.style.height = `${iframe.clientHeight}px`;
            clonedBody.style.overflow = 'hidden';
            clonedBody.style.backgroundColor = 'white';
            
            // Append to document for capturing
            document.body.appendChild(clonedBody);
            
            // Dynamically import html2canvas
            const { default: html2canvas } = await import('html2canvas');
            
            const canvas = await html2canvas(clonedBody, {
              backgroundColor: 'white',
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true
            });
            
            const dataUrl = canvas.toDataURL('image/png');
            
            // Clean up
            document.body.removeChild(clonedBody);
            
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        }, 1000); // Give iframe time to render
      } catch (err) {
        reject(err);
      }
    });
  };

  // Handle JavaScript errors from the iframe
  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.data && event.data.type === 'IFRAME_READY') {
        console.log('Iframe reported ready at:', event.data.timestamp);
      } else if (event.data && event.data.type === 'JS_ERROR') {
        console.error('JavaScript error in iframe:', event.data.error);
        // You could display this error to the user if needed
      }
    };
    
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Handle submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setProcessingStage('preparing');
      setProcessingProgress(10);
      
      // Try capture methods in sequence
      let previewImage = null;
      try {
        console.log('Attempting direct iframe capture...');
        setProcessingStage('capturing');
        setProcessingProgress(20);
        previewImage = await captureIframe();
      } catch (err) {
        console.error('Error with iframe capture:', err);
        try {
          console.log('Falling back to DOM cloning method...');
          previewImage = await captureByCloning();
        } catch (err2) {
          console.error('Error with DOM cloning method:', err2);
          throw new Error('Failed to capture preview');
        }
      }
      
      if (!previewImage) {
        throw new Error('Failed to capture preview');
      }
      
      // Send submission to backend
      setProcessingStage('comparing');
      setProcessingProgress(60);
      
      // Create a custom timeout to show progress animation
      const progressTimer = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 90) return prev + 2; // Smaller increment (2% instead of 5%)
          return prev;
        });
      }, 1200);
      
      const response = await axios.post('http://localhost:5000/api/dailysubmission', {
        challengeId: challenge._id,
        htmlCode,
        cssCode,
        jsCode,
        outputImage: previewImage
      });
      
      clearInterval(progressTimer);
      setProcessingProgress(550);
      setProcessingStage('complete');
      
      setResult(response.data);
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setError('Failed to submit challenge');
      setProcessingStage('error');
    } finally {
      setSubmitting(false);
    }
  };

  const LoadingOverlay = ({ stage, progress }) => {
    // Map stages to descriptive messages
    const stageMessages = {
      preparing: "Preparing your submission...",
      capturing: "Capturing your solution...",
      comparing: "Comparing with reference image and evaluating JavaScript...",
      complete: "Processing complete!",
      error: "Error processing submission"
    };
  
    // Default message if stage is not recognized
    const message = stageMessages[stage] || "Processing...";
    
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3>{message}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  

  // Update preview on code change or initial load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updatePreview();
    }, 1000); // Debounce preview updates
    
    return () => clearTimeout(timeoutId);
  }, [htmlCode, cssCode, jsCode]);

  // Update preview when window size changes
  useEffect(() => {
    updatePreview();
  }, [windowSize]);

  if (loading) {
    return <div className="challenge-loading">Loading challenge...</div>;
  }

  if (error) {
    return <div className="challenge-error">{error}</div>;
  }

  if (!challenge) {
    return <div className="no-challenge">Challenge not found</div>;
  }

  return (
    <div className="attempt-challenge-container">
      <div className="title-container">
        <button 
          className="back-button" 
          onClick={() => navigate('/today-challenge')}
          aria-label="Back to Today's Challenge"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="challenge-title">Attempt Challenge: {challenge.title}</h1>
      </div>
      
      {result ? (
        <div className="submission-result">
          <h2>Your Submission Result</h2>
          <div className="score-container">
            <div className="score-display">
              <h3>Overall Score</h3>
              <div className="score-circle" style={{'--score': `${result.score}%`}}>
                <span className="score-value">{result.score.toFixed(2)}%</span>
              </div>
            </div>
            
            <div className="score-breakdown">
              <div className="score-item">
                <h3>Visual Score</h3>
                <div className="score-pill">
                  <span>{result.visualScore.toFixed(2)}%</span>
                </div>
              </div>
              <div className="score-item">
                <h3>JS Correctness</h3>
                <div className="score-pill">
                  <span>{result.correctnessScore.toFixed(2)}%</span>
                </div>
              </div>
              <div className="score-item">
                <h3>JS Quality</h3>
                <div className="score-pill">
                  <span>{result.jsScore.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="comparison-container">
            <div className="comparison-item">
              <h3>Reference Image</h3>
              <img src={challenge.imageUrl} alt="Reference" className="comparison-image" />
            </div>
            <div className="comparison-item">
              <h3>Your Solution</h3>
              <img src={result.outputImage} alt="Your solution" className="comparison-image" />
            </div>
          </div>
          
          {result.jsEvaluation && (
            <div className="js-evaluation">
              <h3>JavaScript Evaluation</h3>
              <div className="js-evaluation-content">
                <pre>{result.jsEvaluation}</pre>
              </div>
            </div>
          )}
          
          {result.relevanceFeedback && result.relevanceFeedback.length > 0 && (
            <div className="js-relevance">
              <h3>Challenge Relevance Feedback</h3>
              <div className="js-relevance-content">
                <ul>
                  {result.relevanceFeedback.map((feedback, index) => (
                    <li key={index}>{feedback}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="action-button retry-button" 
              onClick={() => setResult(null)}
            >
              Try Again
            </button>
            <button 
              className="action-button return-button" 
              onClick={() => navigate('/')}
            >
              Return Home
            </button>
          </div>
        </div>
      ) : (
        <div className="challenge-workspace">
          <div className="challenge-info-section">
            <div className="reference-section">
              <h2>Challenge Information</h2>
              <div className="reference-content">
                <div className="reference-image-container">
                  <img src={challenge.imageUrl} alt={challenge.title} className="reference-image" />
                </div>
                <div className="challenge-details">
                  <h3>Description</h3>
                  <div className="challenge-description">
                    {formatDescription(challenge.description)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="editors-section">
            {/* <h2>Code Editors</h2> */}
            <div className="editors-container">
              <div className="editor-container html-editor-container">
                <div className="editor-header">
                  <h3>HTML</h3>
                </div>
                <textarea
                  className="code-editor html-editor"
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  spellCheck="false"
                />
              </div>
              
              <div className="editor-container css-editor-container">
                <div className="editor-header">
                  <h3>CSS</h3>
                </div>
                <textarea
                  className="code-editor css-editor"
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  spellCheck="false"
                />
              </div>
              
              <div className="editor-container js-editor-container">
                <div className="editor-header">
                  <h3>JavaScript</h3>
                </div>
                <textarea
                  className="code-editor js-editor"
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  spellCheck="false"
                />
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h2>Preview</h2>
            <div 
              className="preview-container" 
              ref={previewContainerRef}
            >
              <iframe 
                ref={previewFrameRef}
                title="Preview"
                className="preview-frame"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <button 
              className="submit-button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Submit Solution'}
            </button>

            {submitting && processingStage && (
              <LoadingOverlay 
                stage={processingStage} 
                progress={processingProgress} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptChallenge;