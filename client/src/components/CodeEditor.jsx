import React, { useEffect, useState } from 'react';
import Editor, { useMonaco } from "@monaco-editor/react";
import { useTheme } from '../components/ThemeContext'; // your theme hook

const CodeEditor = ({ language, code, setCode }) => {
  const monaco = useMonaco();
  const { isDark } = useTheme();
  const [editorTheme, setEditorTheme] = useState(null);

  useEffect(() => {
    if (!monaco) return;

    // Dark theme (slightly modify vs-dark or leave default)
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: '', foreground: 'F5F5F5', background: '000000' }, // default text
        { token: 'keyword', foreground: 'A78BFA' },
        { token: 'number', foreground: '10B981' },
        { token: 'string', foreground: 'FBBF24' },
        { token: 'comment', foreground: '888888', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.lineHighlightBackground': 'rgba(124, 58, 237, 0.2)',
        'editorLineNumber.foreground': '#888888',
        'editorCursor.foreground': '#A78BFA',
      }
    });

    // Light theme
    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: '', foreground: '1a1a1a', background: 'fdfdfd' },
        { token: 'keyword', foreground: '7C3AED' },
        { token: 'number', foreground: '059669' },
        { token: 'string', foreground: 'D97706' },
        { token: 'comment', foreground: '555555', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#fdfdfd',
        'editor.lineHighlightBackground': 'rgba(124, 58, 237, 0.1)',
        'editorLineNumber.foreground': '#555555',
        'editorCursor.foreground': '#7C3AED',
      }
    });
    
    setEditorTheme(isDark ? "custom-dark" : "custom-light");
  }, [monaco, isDark]);

  if (!editorTheme) return null;

  return (
    <div className="w-full h-[70vh] border rounded-xl shadow">
      <Editor
        height="70vh"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        theme={editorTheme}
        options={{
          fontFamily: 'Fira Code, monospace',
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: "none",
        }}
      />
    </div>
  );
};

export default CodeEditor;
