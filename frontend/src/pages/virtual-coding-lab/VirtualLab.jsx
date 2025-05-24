import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { parseFragment } from 'parse5'; // Corrected for handling HTML fragments
import './virtualLab.css';
import { MdDelete } from "react-icons/md";
import { io } from 'socket.io-client';
import { debounce } from 'lodash';
import EditorComponent from './editorComponent'; // Add this import
import jsPDF from 'jspdf';
import { MdMoreVert, MdAdd, MdSearch } from "react-icons/md";
import { JSHINT } from 'jshint';
import { MdGroupAdd } from "react-icons/md";
import { MdLightbulbOutline } from "react-icons/md";


import HtmlCssErrorComponent from "./html_error_component";


const validateJsWithJSHint = (code) => {
  JSHINT(code, {
    undef: true,         // Warn on undefined variables
    // unused: true,        // Warn on unused variables
    esversion: 2021,     // Support modern JS
    browser: true,       // Allow browser globals (console, window, etc.)
    devel: true,         // Allow development globals (console, alert, etc.)
    node: true,          // Allow Node.js globals (optional, if you use require/module)
    // asi: true,           // Tolerate missing semicolons (optional)
    curly: true,         // Require curly braces for all blocks (optional)
    eqeqeq: true,        // Require === and !== (optional)
    globals: {           // Add any custom globals here
      React: true,
      module: true,
      require: true,
      process: true,
    }
  });
  return JSHINT.errors
    .filter(e => e)
    .map(e => `${e.reason} (line ${e.line})`);
};


function VirtualLab() {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [message, setMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [codeName, setCodeName] = useState('');
  const [userSnippets, setUserSnippets] = useState([]);
  // const [currentSnippetId, setCurrentSnippetId] = useState(null);
  const [htmlErrors, setHtmlErrors] = useState([]);
  const [socket, setSocket] = useState(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [showCollaboratorInput, setShowCollaboratorInput] = useState(false);
  const [jsErrors, setJsErrors] = useState([]);
  const [errorTypes, setErrorTypes] = useState([]);
  const [showRecommendationPopup, setShowRecommendationPopup] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');
  const [showCollaboratorPopup, setShowCollaboratorPopup] = useState(false);
  const [isCreatingNewSnippet, setIsCreatingNewSnippet] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  
  
  const [currentSnippetId, setCurrentSnippetId] = useState(() => localStorage.getItem('currentSnippetId') || null);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);

const [testHtml, setTestHtml] = useState('<div><img src="x.png"></div>');
const [testCss, setTestCss] = useState('body { color: red }');

useEffect(() => {
  const savedSnippetId = localStorage.getItem('currentSnippetId');
  if (savedSnippetId) {
    setCurrentSnippetId(savedSnippetId);
    // Optionally, fetch the snippet data as well:
    fetchSnippetById(savedSnippetId);
  }
}, []);

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

  // Filtered snippets based on search
  const filteredSnippets = userSnippets.filter(snippet =>
  snippet.codeName?.toLowerCase().includes(searchTerm.toLowerCase())
);

  // WebSocket Initialization
  useEffect(() => {
    const newSocket = io('http://localhost:4010');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

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

 

    // Fetch user snippets and collaborated snippet IDs in parallel
const fetchSnippets = async () => {
  try {
    console.log("Fetching snippets for userId:", userId);

    const userSnippetsResponse = await axios.get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`);
    const collaboratedSnippetIdsResponse = await axios.get(`http://localhost:4000/gamified-learning/api/user-management/auth/${userId}/collaborated-snippets`);

    console.log("Fetching snippets for userId:", userSnippetsResponse);
    console.log("Fetching snippets for userId:", collaboratedSnippetIdsResponse);

    const userSnippets = userSnippetsResponse.data;
    const collaboratedSnippetIds = collaboratedSnippetIdsResponse.data || [];

    console.log("Fetching snippets for userId 2:", userSnippets);
    console.log("Fetching snippets for userId 2:", collaboratedSnippetIds.length);

    let collaboratedSnippets = [];
    if (collaboratedSnippetIds.length > 0) {
  console.log("Fetching snippets details:");
  try {
    const snippetDetailsRequests = collaboratedSnippetIds.map(id =>
      axios.get(`http://localhost:4010/virtual-lab/get-snippet/${id}`)
    );
    console.log("Fetching snippets for userId 4:", snippetDetailsRequests);
    const snippetDetailsResponses = await Promise.all(snippetDetailsRequests);
    console.log("Fetching snippets for userId 5:", snippetDetailsResponses);
    collaboratedSnippets = snippetDetailsResponses.map(res => res.data);
  } catch (err) {
    console.error("Error fetching one or more collaborated snippets:", err);
  }
}

    console.log("Fetching snippets for userId 3:", collaboratedSnippets);

    const combinedSnippets = [...userSnippets, ...collaboratedSnippets];
    console.log('Final Combined Snippets:', combinedSnippets);

    setUserSnippets(combinedSnippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    setMessage('Failed to fetch user snippets');
  }
};

    useEffect(() => {
      console.log("userId in useEffect:", userId);
  if (!userId) return;
  fetchSnippets();
}, [userId]);

const saveRecommendationAsPDF = () => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Recommendations', 10, 10);

  // Add recommendation text
  doc.setFontSize(12);
  const textLines = doc.splitTextToSize(recommendationText, 180); // Wrap text to fit within the page width
  doc.text(textLines, 10, 20);

  // Save the PDF
  doc.save('recommendations.pdf');
};


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

        setHtmlErrors([]);
        setJsErrors([]);
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

  useEffect(() => {
  if (currentSnippetId) {
    localStorage.setItem('currentSnippetId', currentSnippetId);
  }
}, [currentSnippetId]);

  // const saveToBackend = async () => {
  //   if (!userId) {
  //     setMessage('User is not logged in!');
  //     return;
  //   }
  //   if (!codeName.trim()) {
  //     setMessage('File name cannot be empty!');
  //     return;
  //   }
  //   try {
  //     const url = currentSnippetId
  //       ? `http://localhost:4010/virtual-lab/update-snippet/${currentSnippetId}`
  //       : 'http://localhost:4010/virtual-lab/save-snippet';
  //     const method = currentSnippetId ? 'put' : 'post';
  //     const response = await axios({
  //       method,
  //       url,
  //       data: {
  //         user_id: userId,
  //         htmlCode,
  //         cssCode,
  //         jsCode,
  //         codeName,
  //       },
  //     });
  //     if (response.status === 200) {
  //       if (!currentSnippetId) {
  //         setCurrentSnippetId(response.data._id);
  //       }
  //       setMessage(currentSnippetId ? 'Snippet updated successfully!' : 'Code saved to server!');
  //       const updatedSnippets = await axios.get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`);
  //       setUserSnippets(updatedSnippets.data);
  //     } else {
  //       setMessage('Failed to save code to server.');
  //     }
  //   } catch (error) {
  //     setMessage('Error saving to server.');
  //     console.error(error);
  //   }
  //   setShowPrompt(false);
  //   setTimeout(() => setMessage(''), 3000);
  // };

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
      const url = 'http://localhost:4010/virtual-lab/save-snippet'; // Always use the save URL
      const response = await axios.post(url, {
        user_id: userId,
        htmlCode,
        cssCode,
        jsCode,
        codeName,
      });
  
      if (response.status === 200) {
        setCurrentSnippetId(response.data._id); // Set the new snippet ID
        setMessage('Code saved to server!');
        
        const updatedSnippets = await axios.get(`http://localhost:4010/virtual-lab/get-user-snippet/${userId}`);
        setUserSnippets(updatedSnippets.data);
        await fetchSnippets();
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
    setIsCreatingNewSnippet(true);
  };

  const handleSaveSnippet = () => {
  setShowPrompt(true); // Show the save prompt
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

  const logErrorsToServer = async (errors, fileType) => {
    if (!userId || errors.length === 0) return;
  
    try {
      const errorLogs = errors.map(error => ({
        timestamp: new Date().toISOString(),
        errorType: error,
        fileType: fileType
      }));
  
      await axios.post('http://localhost:4010/error-log/add-error', {
        userID: userId,
        errorLogs: errorLogs,
        lastUpdated: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('Error logging errors:', error);
    }
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
    setJsErrors([]);
    
    if (errors.length > 0) {
      logErrorsToServer(errors, 'HTML');
      setMessage('HTML validation errors found!');
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
      setShowCollaboratorPopup(false)
    }
  } catch (error) {
    setMessage(error.response?.data?.message || 'Error adding collaborator');
  }
  setTimeout(() => setMessage(''), 3000);
};


// Add this validation function
// Update validateJs function
const validateJs = async () => {
  try {
    if (!jsCode.trim()) {
      setMessage('JavaScript code cannot be empty!');
      return;
    }

    const response = await axios.post('http://localhost:5000/analyze', {
      code: jsCode
    });

    let errors = [];
    if (response.data.error) {
      errors = [response.data.prediction];
    } else {
      errors = [response.data.prediction];
    }

    setJsErrors(errors);
    setHtmlErrors([]);
    
    if (errors.length > 0) {
      logErrorsToServer(errors, 'JavaScript');
      // setMessage('JavaScript errors found!');
    } else {
      // setMessage('No JavaScript errors found!');
    }

  } catch (error) {
    setJsErrors(['Error analyzing JavaScript code']);
    console.error('JS validation error:', error);
  }
  setTimeout(() => setMessage(''), 5000);
};

// In VirtualLab component
const containerRef = useRef(null);
const [containerHeight, setContainerHeight] = useState(0);

useEffect(() => {
  if (!containerRef.current) return;

  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      setContainerHeight(entry.contentRect.height);
    }
  });

  resizeObserver.observe(containerRef.current);
  return () => resizeObserver.disconnect();
}, []);

const [expandedStates, setExpandedStates] = useState({
  html: true,
  css: true,
  js: true
});

const [editorHeights, setEditorHeights] = useState({
  html: 180,
  css: 180,
  js: 180
});

// Add this effect to calculate heights
useEffect(() => {
  const totalHeight = 540; // Total height for all editors
  const expandedCount = Object.values(expandedStates).filter(Boolean).length;
  const baseHeight = expandedCount > 0 ? totalHeight / expandedCount : 0;

  const newHeights = {
    html: expandedStates.html ? baseHeight : 40, // 40px for collapsed title bar
    css: expandedStates.css ? baseHeight : 40,
    js: expandedStates.js ? baseHeight : 40
  };

  setEditorHeights(newHeights);
}, [expandedStates]);

// Add this state update handler
const handleExpandedState = (editor, isExpanded) => {
  setExpandedStates(prev => ({
    ...prev,
    [editor]: isExpanded
  }));
};

const fetchErrorTypes = async (userId) => {
  if (!userId) {
    console.error("User ID is required to fetch error types.");
    return;
  }

  try {
    const response = await axios.get(`http://localhost:4010/error-log/error-types/${userId}`);
    if (response.status === 200) {
      // console.log("Error Types:", response.data.errorTypes);
      setErrorTypes(response.data.errorTypes);
      console.log("Error Types:", errorTypes);
    } else {
      console.log("Failed to fetch error types. Status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching error types:", error);
  }
};

useEffect(() => {
  if (userId) {
    fetchErrorTypes(userId);
  }
}, [userId]);

// const getPredictedErrors = async () => {
//   if (errorTypes.length === 0) {
//     console.error("Error Types array is empty. Cannot send prediction request.");
//     return;
//   }

//   try {
//     const response = await axios.post(
//       "http://localhost:5010/predict",{
//         errors: errorTypes, // Send errorTypes as the input
//       });

//     if (response.status === 200) {
//       console.log("Predicted Errors:", response.data.predictions);
//     } else {
//       console.error("Failed to get predictions. Status:", response.status);
//     }
//   } catch (error) {
//     console.error("Error fetching predictions:", error.response?.data || error.message);
//   }
// };

const getPredictedErrors = async () => {
  if (errorTypes.length === 0) {
    console.error("Error Types array is empty. Cannot send prediction request.");
    return;
  }

  const dummyErrors = [
  "Unclosed or misplaced tag: <div>.",
  "Missing semicolon.",
  "Expected '{' and instead saw 'expression'."
];

  try {
    // Step 1: Send errorTypes to the /predict endpoint
    // const predictResponse = await axios.post("http://localhost:5010/predict", {
    const predictResponse = await axios.post("https://maleesha27233-research-lstm-network.hf.space/gradio_api/call/predict_next_error", {
      // data: [JSON.stringify(errorTypes)], // Send errorTypes as the input
       
    data: [JSON.stringify(errorTypes)]
  
    });

    console.log("Predicted Response id:", predictResponse.data.event_id);

     // Step 2: Get event_id from response
    const eventId = predictResponse.data.event_id;
    if (!eventId) {
      console.error("No event_id returned from prediction API.");
      return;
    }

 const pollResponse = await axios.get(
  `https://maleesha27233-research-lstm-network.hf.space/gradio_api/call/predict_next_error/${eventId}`
);

// This gives you the raw string, like:
// "event: complete\ndata: [{...}]"
const rawResponse = pollResponse.data;
console.log("Raw Response:", rawResponse);

// Extract the 'data: ...' line using regex or string split
const dataLine = rawResponse.split("\n").find(line => line.startsWith("data:"));

let predictedErrors = [];

if (dataLine) {
  const jsonString = dataLine.replace("data: ", "");
  const dataArr = JSON.parse(jsonString);
  console.log("Parsed Data Array:", dataArr);

  if (dataArr.length > 0 && dataArr[0].predictions) {
    predictedErrors = dataArr[0].predictions.map(p => p.error);
  }

  console.log("Predicted Errors:", predictedErrors);
} else {
  console.error("No data line found in response.");
}


  if (predictResponse.status === 200) {
  // Get the first element and parse it
  
  console.log("Predicted Errors:", predictedErrors);

  // Step 2: Send predictedErrors to the OpenAI /recommendation endpoint
  const recommendationResponse = await axios.post("http://localhost:4010/code/recommendation", {
    predictedErrors, // Now this is an array of errors
  });

      if (recommendationResponse.status === 200) {
        const recommendation = recommendationResponse.data.recommendation;
        console.log("Recommendation:", recommendation);

        // Set the recommendation text and show the pop-up
        setRecommendationText(recommendation);
        setShowRecommendationPopup(true);
      } else {
        console.error("Failed to get recommendations. Status:", recommendationResponse.status);
      }
    } else {
      console.error("Failed to get predictions. Status:", predictResponse.status);
    }
  } catch (error) {
    console.error("Error during prediction or recommendation:", error.response?.data || error.message);
  }
};

// const getPredictedErrors = async () => {
//   if (errorTypes.length === 0) {
//     console.error("Error Types array is empty. Cannot send prediction request.");
//     return;
//   }

//   try {
//     // Format the data according to the Gradio API's expected format
//     // For Gradio API, we need to send an array where the first element is our input
//     console.log("Sending error types:", errorTypes);
    
//     const predictResponse = await axios.post(
//       "https://maleesha27233-research-lstm-network.hf.space/gradio_api/call/predict_next_error", // Changed to /api/predict
//       {
//         data: [JSON.stringify(errorTypes)] // Send as a JSON string
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log("Full prediction response:", predictResponse);

//     if (predictResponse.status === 200) {
//       // Gradio API usually returns data.data for the actual output
//       const result = predictResponse.data.data;
      
//       console.log("Raw prediction result:", result);
      
//       // Parse the result based on the structure we expect from the updated backend
//       let predictedErrors;
      
//       if (typeof result === 'string') {
//         // If it's a string (JSON), parse it
//         try {
//           const parsed = JSON.parse(result);
//           predictedErrors = parsed.predictions || [];
//         } catch (e) {
//           console.error("Error parsing prediction result:", e);
//           predictedErrors = [];
//         }
//       } else if (result && result.predictions) {
//         // If it's already an object with predictions
//         predictedErrors = result.predictions;
//       } else {
//         console.error("Unexpected result format:", result);
//         predictedErrors = [];
//       }
      
//       console.log("Processed Predicted Errors:", predictedErrors);

//       // Step 2: Send predictedErrors to the OpenAI /recommendation endpoint
//       try {
//         const recommendationResponse = await axios.post("http://localhost:4010/code/recommendation", {
//           predictedErrors, // Send predicted errors to OpenAI route
//         });

//         if (recommendationResponse.status === 200) {
//           const recommendation = recommendationResponse.data.recommendation;
//           console.log("Recommendation:", recommendation);

//           // Set the recommendation text and show the pop-up
//           setRecommendationText(recommendation);
//           setShowRecommendationPopup(true);
//         } else {
//           console.error("Failed to get recommendations. Status:", recommendationResponse.status);
//         }
//       } catch (recError) {
//         console.error("Error during recommendation:", recError.response?.data || recError.message);
//         // Still show what we got from predictions even if recommendation fails
//         setRecommendationText(`Could not get recommendation, but predicted errors are: ${JSON.stringify(predictedErrors)}`);
//         setShowRecommendationPopup(true);
//       }
//     } else {
//       console.error("Failed to get predictions. Status:", predictResponse.status);
//     }
//   } catch (error) {
//     console.error("Error during prediction:", error);
//     console.error("Error details:", error.response?.data || error.message);
//     alert("Failed to get error predictions. Check console for details.");
//   }
// };

console.log("Error Types Array:", errorTypes);
console.log("Is Array:", Array.isArray(errorTypes));
console.log("All Strings:", errorTypes.every((item) => typeof item === "string"));

  return (
    <div className="virtual-lab-main-container">
      <div className="virtual-lab-user-history">
        <div className="lab-history-header">
          <div className={`search-area${showSearchPopup ? ' expanded' : ''}`}>
            {!showSearchPopup && (
              <span
                className="search-lab-icon"
                title="Search Labs"
                onClick={() => setShowSearchPopup(true)}
                style={{ cursor: 'pointer' }}
              >
                <MdSearch size={22} />
              </span>
            )}
            {showSearchPopup && (
              <>
                <input
                  type="text"
                  className="lab-search-input"
                  placeholder="Search labs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => { setShowSearchPopup(false); setSearchTerm(''); }}
                  className="close-search-btn"
                  style={{ marginLeft: 4 }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
          {!showSearchPopup && (
            <button
              className="new-lab-icon"
              title="Create New Lab"
              onClick={createNewSnippet}
            >
              <MdAdd size={24} />
            </button>
          )}
        </div>
  <h3 className='lab-history-title'>Coding Labs</h3>
  {filteredSnippets.length > 0 ? (
  <ul className='snippet-list'>
    {filteredSnippets.map((snippet) => (
      <li key={snippet.id} onClick={() => fetchSnippetById(snippet.id)}>
        <div className="snippet-list-item">
          {snippet.codeName}
          <div
            className="snippet-actions-menu"
            onClick={e => {
              e.stopPropagation();
              setMenuOpenId(menuOpenId === snippet.id ? null : snippet.id);
            }}
            ref={menuOpenId === snippet.id ? menuRef : null}
          >
            <MdMoreVert size={22} />
            {menuOpenId === snippet.id && (
              <div className="snippet-dropdown-menu">
                <button onClick={e => {
                  e.stopPropagation();
                  deleteSnippet(snippet.id);
                  setMenuOpenId(null);
                }}>
                  Delete
                </button>
                {/* Add more actions here if needed */}
              </div>
            )}
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
      <EditorComponent
          htmlCode={htmlCode}
          cssCode={cssCode}
          jsCode={jsCode}
          handleEditorChange={handleEditorChange}
          editorOptions={editorOptions}
          expandedStates={expandedStates}
          setExpandedState={handleExpandedState}
          editorHeights={editorHeights}
        />
        {/* <div className="html-css-code-blocks">
          <div className="editor-container">
            <span className='editor-title'>HTML</span>
            <MonacoEditor
              height="150px"
              width="400px"
              language="html"
              value={htmlCode}
              onChange={(newValue) => handleEditorChange(newValue, 'html')}
              options={editorOptions}
            />
          </div>
          <div className="editor-container">
          <span className='editor-title'>CSS</span>
            <MonacoEditor
              height="150px"
              width="400px"
              language="css"
              value={cssCode}
              onChange={(newValue) => handleEditorChange(newValue, 'css')}
              options={editorOptions}
            />
          </div>
          <div className="editor-container">
          <span className='editor-title'>JavaScript</span>
            <MonacoEditor
              height="150px"
              width="400px"
              language="javascript"
              value={jsCode}
              onChange={(newValue) => handleEditorChange(newValue, 'javascript')}
              options={editorOptions}
            />
          </div>
        </div> */}

        {/* <div className="snippet-actions">
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
        </div> */}

      {showPrompt && (
  <div className="save-prompt-overlay">
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
      <button
        onClick={() => {
          setShowPrompt(false);
          setIsCreatingNewSnippet(false); // Reset the state
        }}
        className="cancel-save-button"
      >
        Cancel
      </button>
    </div>
  </div>
)}

        <div className="real-time-container">
          {/* <div style={{ margin: 24, background: "#fff", borderRadius: 8 }}>
  <h4>Test HTML/CSS Error Component</h4>
  <textarea
    value={testHtml}
    onChange={e => setTestHtml(e.target.value)}
    placeholder="Enter HTML code"
    rows={4}
    cols={40}
    style={{ display: "block", marginBottom: 8 }}
  />
  <textarea
    value={testCss}
    onChange={e => setTestCss(e.target.value)}
    placeholder="Enter CSS code"
    rows={4}
    cols={40}
    style={{ display: "block", marginBottom: 8 }}
  />
  <HtmlCssErrorComponent htmlCode={testHtml} cssCode={testCss} />
</div> */}
          <div className="output-container">
            
            <iframe
              title="Live Output"
              srcDoc={generateOutput()}
              width="100%"
              height="480px"
            ></iframe>
          </div>

          <div className="snippet-actions">
          {/* <button onClick={() => setShowPrompt(true)} className="save-button">
            {currentSnippetId ? 'Update Snippet' : 'Save to Server'}
          </button> */}
          <button
            onClick={isCreatingNewSnippet ? handleSaveSnippet : createNewSnippet}
            className="new-snippet-button"
          >
            {isCreatingNewSnippet ? 'Save Snippet' : 'New Snippet'}
          </button>
          <button
  onClick={() => {
    validateHtml();
    setShowValidationPopup(true);
  }}
  className="validate-button"
>
  Validate HTML
</button>
          {/* <button onClick={validateJs} className="validate-button">
            Analyze JavaScript
          </button> */}
          <button
  onClick={() => {
    const jshintResults = validateJsWithJSHint(jsCode);
    setJsErrors(jshintResults);
    setHtmlErrors([]);
    setShowValidationPopup(true);
    if (jshintResults.length > 0) {
      setMessage('JSHint found issues!');
      logErrorsToServer(jshintResults, 'JavaScript');
    } else {
      setMessage('No JSHint issues found!');
    }
    setTimeout(() => setMessage(''), 5000);
  }}
  className="validate-button"
>
  JSHint Check
</button>
<button onClick={getPredictedErrors} className="recommandation-button" title="Get Recommendations">
  <MdLightbulbOutline size={20} style={{ verticalAlign: 'middle', marginRight: 4 }} />
  Recommendations
</button>          {currentSnippetId && (
            <button 
            onClick={() => setShowCollaboratorPopup(true)}
            className="collaborator-button"
          >
             <MdGroupAdd size={20} style={{ verticalAlign: 'middle', marginRight: 4 }} />
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

        {/* <div className="html-errors">
  <h3>
    <span role="img" aria-label="validation">🛡️</span> Validation Results
  </h3>

  {htmlErrors.length > 0 && (
    <div className="error-block html-error-block">
      <h4>
        <span role="img" aria-label="html">🔴</span> HTML Errors
      </h4>
      <ul>
        {htmlErrors.map((error, index) => (
          <li key={`html-${index}`}>
            <span className="error-icon">❌</span> {error}
          </li>
        ))}
      </ul>
    </div>
  )}

  {jsErrors.length > 0 && (
    <div className="error-block js-error-block">
      <h4>
        <span role="img" aria-label="js">🟠</span> JavaScript Errors
      </h4>
      <ul>
        {jsErrors.map((error, index) => (
          <li key={`js-${index}`}>
            <span className="error-icon">⚠️</span> {error}
          </li>
        ))}
      </ul>
    </div>
  )}

  {htmlErrors.length === 0 && jsErrors.length === 0 && (
    <div className="no-errors-block">
      <span className="success-icon" role="img" aria-label="success">✅</span>
      <p>No errors found.</p>
    </div>
  )}
</div> */}

        </div>  
      </div>
      {showRecommendationPopup && (
        <div className="recommendation-popup-overlay">
          <div className="recommendation-popup">
            <div className="popup-content">
              <h3>Recommendations</h3>
              <p>{recommendationText}</p>
              <div className="rec-pop-up-actions">
              <button onClick={() => setShowRecommendationPopup(false)}> Close </button>
              <button onClick={saveRecommendationAsPDF}>Save as PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showValidationPopup && (
  <div className="validation-popup-overlay" onClick={() => setShowValidationPopup(false)}>
    <div className="validation-popup" onClick={e => e.stopPropagation()}>
      <h3>
        <span role="img" aria-label="validation">🛡️</span> Validation Results
      </h3>
      {htmlErrors.length > 0 && (
        <div className="error-block html-error-block">
          <h4>
            <span role="img" aria-label="html">🔴</span> HTML Errors
          </h4>
          <ul>
            {htmlErrors.map((error, index) => (
              <li key={`html-${index}`}>
                <span className="error-icon">❌</span> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
      {jsErrors.length > 0 && (
        <div className="error-block js-error-block">
          <h4>
            <span role="img" aria-label="js">🟠</span> JavaScript Errors
          </h4>
          <ul>
            {jsErrors.map((error, index) => (
              <li key={`js-${index}`}>
                <span className="error-icon">⚠️</span> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
      {htmlErrors.length === 0 && jsErrors.length === 0 && (
        <div className="no-errors-block">
          <span className="success-icon" role="img" aria-label="success">✅</span>
          <p>No errors found.</p>
        </div>
      )}
      <button className="close-search-btn" onClick={() => setShowValidationPopup(false)} style={{marginTop: 16}}>Close</button>
    </div>
  </div>
)}

      {/* {showSearchPopup && (
        <div className="search-popup-overlay" onClick={() => { setShowSearchPopup(false); setSearchTerm(''); }}>
          <div className="search-popup" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              className="lab-search-input"
              placeholder="Search labs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button onClick={() => { setShowSearchPopup(false); setSearchTerm(''); }} className="close-search-btn">Close</button>
          </div>
        </div>
      )} */}

      {showCollaboratorPopup && (
        <div className="collaborator-popup-overlay">
          <div className="collaborator-popup">
            <div className="popup-content">
              <h3>Add Collaborator</h3>
              <input
                type="email"
                placeholder="Enter collaborator's email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                className="email-input"
              />
              <div className="popup-actions">
                <button onClick={handleAddCollaborator} className="confirm-collaborator-button">
                  Add
                </button>
                <button onClick={() => setShowCollaboratorPopup(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
  
};



export default VirtualLab;
