import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

export default function PrismHighlight({ code, language = "javascript" }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <pre className={`prism-highlight language-${language}`}> 
      <code ref={ref} className={`language-${language}`}>{code}</code>
    </pre>
  );
}
