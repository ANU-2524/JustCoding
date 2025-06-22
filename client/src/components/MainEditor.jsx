// ✅ src/components/MainEditor.jsx
import { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor';
import { FaSun, FaMoon } from 'react-icons/fa';
// import { v4 as uuidv4 } from 'uuid';
import Loader from './Loader';
import '../Style/MainEdior.css';
import jsPDF from "jspdf";
import { useAuth } from "./AuthContext";

const languages = {
  python:     { name: 'Python',     starter: `print("Hello World")` },
  cpp:        { name: 'C++',        starter: `#include <iostream>\nusing namespace std;\nint main() {\n  return 0;\n}` },
  java:       { name: 'Java',       starter: `public class Main {\n  public static void main(String[] args) {\n    \n  }\n}` },
  javascript: { name: 'JavaScript', starter: `console.log("Hello World");` },
  typescript: { name: 'TypeScript', starter: `console.log("Hello TypeScript");` },
  c:          { name: 'C',          starter: `#include <stdio.h>\nint main() {\n  return 0;\n}` },
  go:         { name: 'Go',         starter: `package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello Go")\n}` },
  ruby:       { name: 'Ruby',       starter: `puts "Hello Ruby"` },
  php:        { name: 'PHP',        starter: `<?php\necho "Hello PHP";` },
  swift:      { name: 'Swift',      starter: `print("Hello Swift")` },
  rust:       { name: 'Rust',       starter: `fn main() {\n  println!("Hello Rust");\n}` }
};

const MainEditor = () => {
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "python");
  const [code, setCode] = useState(() =>
    localStorage.getItem(`code-${localStorage.getItem("lang")}`) || languages.python.starter
  );
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "vs-dark");
  const { logout, currentUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    if (shareId) {
      const data = JSON.parse(localStorage.getItem(`shared-${shareId}`));
      if (data) {
        setLanguage(data.language);
        setCode(data.code);
        setUserInput(data.userInput);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`code-${language}`, code);
    localStorage.setItem("lang", language);
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "vs-dark");
  }, [code, language, theme]);

  const runCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4334/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: userInput }),
      });
      const result = await res.json();
      setOutput(result.output || "No output");
    } catch (err) {
      setOutput("Error running code.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode(languages[language].starter);
    setUserInput("");
    setOutput("");
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const title = `JustCode - ${languages[language].name} Code`;

    doc.setFontSize(14);
    doc.text(title, 10, 10);

    let y = 20;
    const lines = doc.splitTextToSize(code, 180);
    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += 7;
    });

    if (userInput.trim()) {
      doc.addPage();
      doc.text("Input Given:", 10, 10);
      const inputLines = doc.splitTextToSize(userInput, 180);
      inputLines.forEach((line, idx) => doc.text(line, 10, 20 + idx * 7));
    }

    if (output.trim()) {
      doc.addPage();
      doc.text("Output:", 10, 10);
      const outputLines = doc.splitTextToSize(output, 180);
      outputLines.forEach((line, idx) => doc.text(line, 10, 20 + idx * 7));
    }

    doc.save(`${languages[language].name}-Code.pdf`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (err) {
      alert("Logout failed!");
    }
  };

  return (
    <div className={`app-container ${theme === "vs-dark" ? "dark-theme" : "light-theme"}`}>
      {loading && <Loader />}
      <div className="inner-container">
        <div className="header">
          <h1 className="logo">JustCode 🚀</h1>
          <div className="flex gap-2 items-center">
            <button onClick={handleThemeToggle} className="theme-toggle">
              {theme === "vs-dark" ? <FaSun /> : <FaMoon />}
            </button>
            {currentUser && (
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            )}
          </div>
        </div>

        <div className="toolbar">
          <select
            className="select-lang"
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              setCode(localStorage.getItem(`code-${lang}`) || languages[lang].starter);
            }}
          >
            {Object.entries(languages).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>

          <button onClick={runCode} className="btn run" disabled={loading}>
            {loading ? "Running..." : "Run Code"}
          </button>
          <button onClick={reset} className="btn reset" disabled={loading}>Reset</button>
          <button onClick={downloadPDF} className="btn pdf" disabled={loading}>
            Export as PDF
          </button>
        </div>

        <CodeEditor language={language} code={code} setCode={setCode} theme={theme} />

        <textarea
          className="input-box"
          rows={3}
          placeholder="Enter input values (for input()) here"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        ></textarea>

        <pre className="output-box">{output}</pre>
      </div>
    </div>
  );
};

export default MainEditor;