import React from 'react';
import { useState } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode, theme }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div 
      className={`code-editor-wrapper ${focused ? "focused" : ""}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="w-full h-[70vh] border rounded-xl shadow">
        <Editor
          height="70vh"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme={theme}
          options={{
            fontFamily: "Courier New, monospace",
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
