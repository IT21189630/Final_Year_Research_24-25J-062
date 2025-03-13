// EditorComponent.js
import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleEditor = ({ 
    title, 
    language, 
    value, 
    onChange, 
    options, 
    isExpanded, 
    onToggle, 
    height 
  }) => {
    return (
      <div className="editor-container" style={{ height: `${height}px` }}>
        <div className="editor-title">
          <span>{title}</span>
          <button onClick={onToggle}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        <div className="editor-content" style={{ height: `calc(${height}px - 40px)` }}>
          <MonacoEditor
            height="100%"
            width="100%"
            language={language}
            value={value}
            onChange={onChange}
            options={options}
          />
        </div>
      </div>
    );
  };
  
  const EditorComponent = ({ 
    htmlCode, 
    cssCode, 
    jsCode, 
    handleEditorChange, 
    editorOptions,
    expandedStates,
    setExpandedState,
    editorHeights
  }) => {
    return (
      <div className="html-css-code-blocks">
        <CollapsibleEditor 
          title="HTML"
          language="html"
          value={htmlCode}
          onChange={(newValue) => handleEditorChange(newValue, 'html')}
          options={editorOptions}
          isExpanded={expandedStates.html}
          onToggle={() => setExpandedState('html', !expandedStates.html)}
          height={editorHeights.html}
        />
        <CollapsibleEditor 
          title="CSS"
          language="css"
          value={cssCode}
          onChange={(newValue) => handleEditorChange(newValue, 'css')}
          options={editorOptions}
          isExpanded={expandedStates.css}
          onToggle={() => setExpandedState('css', !expandedStates.css)}
          height={editorHeights.css}
        />
        <CollapsibleEditor 
          title="JavaScript"
          language="javascript"
          value={jsCode}
          onChange={(newValue) => handleEditorChange(newValue, 'javascript')}
          options={editorOptions}
          isExpanded={expandedStates.js}
          onToggle={() => setExpandedState('js', !expandedStates.js)}
          height={editorHeights.js}
        />
      </div>
    );
  };

export default EditorComponent;