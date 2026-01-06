import React from 'react';
import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode }) => {
  return (
    <div className="w-full border rounded-xl shadow code-editor-container">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{
          minimap: { enabled: window.innerWidth > 768 },
          fontSize: window.innerWidth < 480 ? 12 : 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          folding: window.innerWidth > 768,
        }}
      />
    </div>
  );
};

export default CodeEditor;
