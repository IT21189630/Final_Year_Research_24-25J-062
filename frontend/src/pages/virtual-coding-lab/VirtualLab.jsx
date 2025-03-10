import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { parseFragment } from 'parse5'; // Corrected for handling HTML fragments
import './virtualLab.css';
import { MdDelete } from "react-icons/md";
import { io } from 'socket.io-client';
import { debounce } from 'lodash';

function VirtualLab() {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [message, setMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [codeName, setCodeName] = useState('');
  const [userSnippets, setUserSnippets] = useState([]);
  const [currentSnippetId, setCurrentSnippetId] = useState(null);
  const [htmlErrors, setHtmlErrors] = useState([]);
  const [socket, setSocket] = useState(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [showCollaboratorInput, setShowCollaboratorInput] = useState(false);
  const [jsErrors, setJsErrors] = useState([]);

  const emitCodeUpdateRef = useRef(
    debounce((roomId, type, content) => {
      if (socket && roomId) {
        socket.emit('codeUpdate', { roomId, type, content });
      }
    }, 500)
  );

  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
  };

  const user = useSelector((state) => state.user);
  const userId = user?.user_id;

  // WebSocket Initialization
  useEffect(() => {
    const newSocket = io('http://localhost:4010');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

    // Handle WebSocket events
    useEffect(() => {
      if (!socket) return;
  
      const handleInitialCode = ({ htmlCode: initialHtml, cssCode: initialCss, jsCode: initialJs }) => {
        setHtmlCode(initialHtml || '');
        setCssCode(initialCss || '');
        setJsCode(initialJs || '');
      };
  
      const handleCodeUpdate = ({ type, content }) => {
        switch (type) {
          case 'htmlCode':
            setHtmlCode(content);
            break;
          case 'cssCode':
            setCssCode(content);
            break;
          case 'jsCode':
            setJsCode(content);
            break;
          default:
            break;
        }
      };
  
      socket.on('initialCode', handleInitialCode);
      socket.on('codeUpdate', handleCodeUpdate);
  
      return () => {
        socket.off('initialCode', handleInitialCode);
        socket.off('codeUpdate', handleCodeUpdate);
      };
    }, [socket]);

      // Join room when snippet changes
  useEffect(() => {
    if (socket && currentSnippetId) {
      socket.emit('joinRoom', currentSnippetId);
    }
  }, [currentSnippetId, socket]);

  useEffect(() => {
    const savedHtml = localStorage.getItem('htmlCode') || '';
    const savedCss = localStorage.getItem('cssCode') || '';
    const savedJs = localStorage.getItem('jsCode') || '';
    setHtmlCode(savedHtml);
    setCssCode(savedCss);
    setJsCode(savedJs);
  }, []);

  useEffect(() => {
    localStorage.setItem('htmlCode', htmlCode);
  }, [htmlCode]);

  useEffect(() => {
    localStorage.setItem('cssCode', cssCode);
  }, [cssCode]);

  useEffect(() => {
    localStorage.setItem('jsCode', jsCode);
  }, [jsCode]);

  // useEffect(() => {
  //   if (userId) {
  //     axios
  //       .get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`)
  //       .then((response) => {
  //         setUserSnippets(response.data);
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching snippets:', error);
  //         setMessage('Failed to fetch user snippets');
  //       });
  //   }
  // }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Fetch user snippets and collaborated snippet IDs in parallel
    const fetchSnippets = async () => {
        try {
            const [userSnippetsResponse, collaboratedSnippetIdsResponse] = await Promise.all([
                axios.get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`),
                axios.get(`http://localhost:4000/gamified-learning/api/user-management/auth/${userId}/collaborated-snippets`)
            ]);

            // User snippets already have { id, codeName }
            const userSnippets = userSnippetsResponse.data;

            // Collaborated snippet IDs
            const collaboratedSnippetIds = collaboratedSnippetIdsResponse.data || [];

            // Fetch details of each collaborated snippet
            let collaboratedSnippets = [];
            if (collaboratedSnippetIds.length > 0) {
                const snippetDetailsRequests = collaboratedSnippetIds.map(id =>
                    axios.get(`http://localhost:4010/virtual-lab/get-snippet/${id}`)
                );

                const snippetDetailsResponses = await Promise.all(snippetDetailsRequests);
                collaboratedSnippets = snippetDetailsResponses.map(res => res.data);
            }

            // Merge both sets of snippets
            const combinedSnippets = [...userSnippets, ...collaboratedSnippets];

            console.log('Final Combined Snippets:', combinedSnippets);

            setUserSnippets(combinedSnippets);
        } catch (error) {
            console.error('Error fetching snippets:', error);
            setMessage('Failed to fetch user snippets');
        }
    };

    fetchSnippets();
}, [userId]);




  const fetchSnippetById = async (snippetId) => {
    try {
      const response = await axios.get(`http://localhost:4010/virtual-lab/read-snippet/${snippetId}`);
      if (response.status === 200) {
        const { htmlCode, cssCode, jsCode, codeName } = response.data;
        setHtmlCode(htmlCode || '');
        setCssCode(cssCode || '');
        setJsCode(jsCode || '');
        setCodeName(codeName || '');
        setCurrentSnippetId(snippetId);
        setMessage('Snippet loaded successfully!');
      } else {
        setMessage('Failed to load snippet.');
      }
    } catch (error) {
      console.error('Error fetching snippet:', error);
      setMessage('Error loading snippet.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  

  const saveToBackend = async () => {
    if (!userId) {
      setMessage('User is not logged in!');
      return;
    }
    if (!codeName.trim()) {
      setMessage('File name cannot be empty!');
      return;
    }
    try {
      const url = currentSnippetId
        ? `http://localhost:4010/virtual-lab/update-snippet/${currentSnippetId}`
        : 'http://localhost:4010/virtual-lab/save-snippet';
      const method = currentSnippetId ? 'put' : 'post';
      const response = await axios({
        method,
        url,
        data: {
          user_id: userId,
          htmlCode,
          cssCode,
          jsCode,
          codeName,
        },
      });
      if (response.status === 200) {
        if (!currentSnippetId) {
          setCurrentSnippetId(response.data._id);
        }
        setMessage(currentSnippetId ? 'Snippet updated successfully!' : 'Code saved to server!');
        const updatedSnippets = await axios.get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`);
        setUserSnippets(updatedSnippets.data);
      } else {
        setMessage('Failed to save code to server.');
      }
    } catch (error) {
      setMessage('Error saving to server.');
      console.error(error);
    }
    setShowPrompt(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const createNewSnippet = () => {
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setCodeName('');
    setCurrentSnippetId(null);
  };

  // const handleEditorChange = (code, language) => {
  //   if (language === 'html') {
  //     setHtmlCode(code);
  //   } else if (language === 'css') {
  //     setCssCode(code);
  //   } else if (language === 'javascript') {
  //     setJsCode(code);
  //   }
  // };


    // Modified handleEditorChange with WebSocket emission
    const handleEditorChange = (newValue, language) => {
      let type;
      switch (language) {
        case 'html':
          type = 'htmlCode';
          setHtmlCode(newValue);
          break;
        case 'css':
          type = 'cssCode';
          setCssCode(newValue);
          break;
        case 'javascript':
          type = 'jsCode';
          setJsCode(newValue);
          break;
        default:
          return;
      }
  
      if (currentSnippetId) {
        emitCodeUpdateRef.current(currentSnippetId, type, newValue);
      }
    };

    const emitCodeUpdate = (roomId, type, content) => {
      console.log(`📤 Emitting codeUpdate: Room - ${roomId}, Type - ${type}, Content -`, content);
      socket.emit("codeUpdate", { roomId, type, content });
    };
    emitCodeUpdateRef.current = emitCodeUpdate;

  const generateOutput = () => `
    <html>
      <style>${cssCode}</style>
      <body>${htmlCode}</body>
      <script>${jsCode}</script>
    </html>
  `;

  const deleteSnippet = async (snippetId) => {
    try {
      const response = await axios.delete(`http://localhost:4010/virtual-lab/delete-snippet/${snippetId}`);
      if (response.status === 202) {
        setMessage('Snippet deleted successfully!');
        const updatedSnippets = await axios.get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`);
        setUserSnippets(updatedSnippets.data);

         // Update state by filtering out the deleted snippet
        // setUserSnippets((prevSnippets) => prevSnippets.filter((s) => s.id !== snippetId));
      } else {
        setMessage('Failed to delete snippet.');
      }
    } catch (error) {
      setMessage('Error deleting snippet.');
      console.error(error);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const detectHtmlErrors = (htmlCode) => {
    try {
      const document = parseFragment(htmlCode); // Parse the HTML as a fragment
      const errors = [];
  
      // Helper function to traverse nodes recursively
      const traverse = (node, parentTag) => {
        if (node.tagName) {
          // Check for invalid nesting
          if (parentTag === 'p' && node.tagName === 'div') {
            errors.push('Invalid nesting: <div> cannot be inside <p>.');
          }
  
          // Check for missing attributes
          if (node.tagName === 'img' && !node.attrs.some((attr) => attr.name === 'alt')) {
            errors.push('Missing alt attribute on <img> tag.');
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
  
      // Start traversing from the parsed document's child nodes
      document.childNodes.forEach((node) => traverse(node, null));
  
      // Ensure <html> and <body> tags are present for full documents
      if (!/<html>/.test(htmlCode)) {
        errors.push('Missing <html> root tag.');
      }
      if (!/<body>/.test(htmlCode)) {
        errors.push('Missing <body> tag.');
      }
  
      return errors.length > 0 ? errors : ['No structural errors detected.'];
    } catch (error) {
      return ['Error parsing HTML structure.'];
    }
  };

  const validateHtml = () => {
    const errors = detectHtmlErrors(htmlCode);
    setHtmlErrors(errors);
    if (errors.length > 0) {
      setMessage(`HTML Errors: ${errors.join(', ')}`);
    } else {
      setMessage('No structural errors found!');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  // Add this function to handle collaborator addition
const handleAddCollaborator = async () => {
  if (!currentSnippetId) {
    setMessage('No snippet selected');
    return;
  }
  if (!collaboratorEmail.trim()) {
    setMessage('Please enter a valid email address');
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:4010/virtual-lab/${currentSnippetId}/add-collaborator`,
      { email: collaboratorEmail }
    );

    if (response.status === 200) {
      setMessage('Collaborator added successfully!');
      setCollaboratorEmail('');
      setShowCollaboratorInput(false);
    }
  } catch (error) {
    setMessage(error.response?.data?.message || 'Error adding collaborator');
  }
  setTimeout(() => setMessage(''), 3000);
};


// Add this validation function
const validateJs = async () => {
  try {
    if (!jsCode.trim()) {
      setMessage('JavaScript code cannot be empty!');
      return;
    }

    const response = await axios.post('http://localhost:5000/analyze', {
      code: jsCode
    });

    console.log('Full API response:', response); 
    console.log('Response data:', response.data); 

    if (response.data.error) {
      setJsErrors([response.data.error]);
    } else {
      const { predicted_error, confidence, probabilities } = response.data;
      const formattedError = `${predicted_error} (${(confidence * 100).toFixed(1)}% confidence)`;
      const detailedErrors = Object.entries(probabilities).map(([errorType, prob]) => 
        `${errorType}: ${(prob * 100).toFixed(1)}%`
      );
      
      setJsErrors([formattedError, ...detailedErrors]);
    }
    
    setMessage('JavaScript analysis completed!');
  } catch (error) {
    setJsErrors(['Error analyzing JavaScript code']);
    console.error('JS validation error:', error);
  }
  setTimeout(() => setMessage(''), 5000);
};

  return (
    <div className="virtual-lab-main-container">
      <div className="virtual-lab-user-history">
        <h3>Snippet History</h3>
        {userSnippets.length > 0 ? (
          <ul>
            {userSnippets.map((snippet) => (
              <li key={snippet._id} onClick={() => fetchSnippetById(snippet.id)}>
                <div className="snippet-list-item">
                  {snippet.codeName}
                  <div
                    className="delete-snippet"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSnippet(snippet.id);
                    }}
                  >
                    <MdDelete size={25} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No snippets found.</p>
        )}
      </div>
      <div className="virtual-lab-container">
        <div className="html-css-code-blocks">
          <div className="editor-container">
            <h3>HTML</h3>
            <MonacoEditor
              height="300px"
              language="html"
              value={htmlCode}
              onChange={(newValue) => handleEditorChange(newValue, 'html')}
              options={editorOptions}
            />
          </div>
          <div className="editor-container">
            <h3>CSS</h3>
            <MonacoEditor
              height="300px"
              language="css"
              value={cssCode}
              onChange={(newValue) => handleEditorChange(newValue, 'css')}
              options={editorOptions}
            />
          </div>
          <div className="editor-container">
            <h3>JavaScript</h3>
            <MonacoEditor
              height="300px"
              language="javascript"
              value={jsCode}
              onChange={(newValue) => handleEditorChange(newValue, 'javascript')}
              options={editorOptions}
            />
          </div>
        </div>

        <div className="snippet-actions">
          <button onClick={() => setShowPrompt(true)} className="save-button">
            {currentSnippetId ? 'Update Snippet' : 'Save to Server'}
          </button>
          <button onClick={createNewSnippet} className="new-snippet-button">
            New Snippet
          </button>
          <button onClick={validateHtml} className="validate-button">
            Validate HTML
          </button>
          <button onClick={validateJs} className="validate-button">
            Analyze JavaScript
          </button>
          {currentSnippetId && (
            <button 
              onClick={() => setShowCollaboratorInput(!showCollaboratorInput)}
              className="collaborator-button"
            >
              {showCollaboratorInput ? 'Cancel' : 'Add Collaborator'}
            </button>
          )}
          {showCollaboratorInput && currentSnippetId && (
            <div className="collaborator-input">
              <input
                type="email"
                placeholder="Enter collaborator's email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                className="email-input"
              />
              <button 
                onClick={handleAddCollaborator}
                className="confirm-collaborator-button"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {showPrompt && (
          <div className="save-prompt">
            <input
              type="text"
              placeholder="Enter file name"
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              className="code-name-input"
            />
            <button onClick={saveToBackend} className="confirm-save-button">
              Confirm Save
            </button>
            <button onClick={() => setShowPrompt(false)} className="cancel-save-button">
              Cancel
            </button>
          </div>
        )}

        {message && <p className="message">{message}</p>}

        <div className="output-container">
          <h3>Output</h3>
          <iframe
            title="Live Output"
            srcDoc={generateOutput()}
            width="100%"
            height="300px"
          ></iframe>
        </div>

        <div className="html-errors">
          <h3>Validation Errors:</h3>
          {htmlErrors.length > 0 ? (
            <ul>
              {htmlErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          ) : (
            <p>No errors found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VirtualLab;
