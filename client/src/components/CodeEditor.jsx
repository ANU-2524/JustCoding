import React from 'react';
import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode }) => {
  return (
    <div className="w-full h-[70vh] border rounded-xl shadow">
      <Editor
        height="70vh"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;
