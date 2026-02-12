import React, { useEffect, useRef, useCallback, memo, useMemo } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
// import '../Style/CodeEditor.css';

const CodeEditor = memo(({ language, code, setCode, theme, editorSettings }) => {
  const monaco = useMonaco();
  const editorRef = useRef(null);

  // Calculate if file is large (over 1MB) - cheap boolean check
  const isLargeFile = code && code.length > 1000000;

  // Memoize options to prevent recreation on every render/keystroke
  const options = useMemo(() => ({
    fontSize: 14,
    fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
    fontLigatures: true,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    minimap: {
      enabled: !isLargeFile // Disable minimap for large files
    },
    wordWrap: isLargeFile ? 'off' : 'on', // Disable word wrap for large files
    wrappingIndent: 'indent',

    // IntelliSense configurations
    suggestOnTriggerCharacters: editorSettings.suggestOnTriggerCharacters,
    wordBasedSuggestions: editorSettings.wordBasedSuggestions,
    suggestSelection: 'first',
    tabCompletion: 'on',

    // Auto-completion settings
    quickSuggestions: editorSettings.intellisense && !isLargeFile ? { // Disable for large files
      other: true,
      comments: true,
      strings: true
    } : false,

    // Auto-closing settings
    autoClosingBrackets: editorSettings.autoClosing ? 'always' : 'never',
    autoClosingQuotes: editorSettings.autoClosing ? 'always' : 'never',
    autoClosingOvertype: editorSettings.autoClosing ? 'always' : 'never',
    autoClosingDelete: editorSettings.autoClosing ? 'always' : 'never',

    // Formatting settings
    formatOnType: editorSettings.formatOnType && !isLargeFile, // Disable for large files
    formatOnPaste: !isLargeFile, // Disable for large files

    // Parameter hints
    parameterHints: {
      enabled: !isLargeFile // Disable for large files
    },

    // Code Lens
    codeLens: !isLargeFile, // Disable for large files

    // Bracket pair colorization
    bracketPairColorization: {
      enabled: !isLargeFile // Disable for large files
    },

    // Guides
    guides: {
      bracketPairs: !isLargeFile,
      bracketPairsHorizontal: !isLargeFile
    }
  }), [editorSettings, isLargeFile]);

  useEffect(() => {
    if (monaco) {
      // Configure IntelliSense settings
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        lib: ["es2020"],
      });
    }
  }, [monaco]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions(options);
    }
  }, [options]);

  const setupLanguageSpecificSuggestions = useCallback((monaco, lang) => {
    // Common suggestions for all languages
    const commonSuggestions = [
      { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print($1)' },
      { label: 'log', kind: monaco.languages.CompletionItemKind.Function, insertText: 'console.log($1)' },
      { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for (let i = 0; i < ${1:length}; i++) {\n\t$2\n}' },
      { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ($1) {\n\t$2\n}' },
      { label: 'function', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'function ${1:name}($2) {\n\t$3\n}' },
      { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ($1) {\n\t$2\n}' },
      { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return $1' },
      { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import $1' },
      { label: 'export', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'export $1' },
    ];

    // Language-specific suggestions for ALL supported languages
    const languageSuggestions = {
      javascript: [
        // Variables & Types
        { label: 'let', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'let ${1:variable} = $2' },
        { label: 'const', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'const ${1:variable} = $2' },
        { label: 'var', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'var ${1:variable} = $2' },

        // Functions
        { label: 'function', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'function ${1:name}($2) {\n\t$3\n}' },
        { label: 'arrow function', kind: monaco.languages.CompletionItemKind.Function, insertText: '($1) => {\n\t$2\n}' },
        { label: 'async function', kind: monaco.languages.CompletionItemKind.Function, insertText: 'async function ${1:name}($2) {\n\t$3\n}' },

        // Console methods
        { label: 'console.log', kind: monaco.languages.CompletionItemKind.Function, insertText: 'console.log($1)' },
        { label: 'console.error', kind: monaco.languages.CompletionItemKind.Function, insertText: 'console.error($1)' },
        { label: 'console.warn', kind: monaco.languages.CompletionItemKind.Function, insertText: 'console.warn($1)' },
        { label: 'console.info', kind: monaco.languages.CompletionItemKind.Function, insertText: 'console.info($1)' },

        // Built-in objects
        { label: 'Array', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Array' },
        { label: 'Object', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Object' },
        { label: 'String', kind: monaco.languages.CompletionItemKind.Class, insertText: 'String' },
        { label: 'Number', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Number' },
        { label: 'Boolean', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Boolean' },
        { label: 'Date', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Date' },
        { label: 'Math', kind: monaco.languages.CompletionItemKind.Module, insertText: 'Math' },
        { label: 'JSON', kind: monaco.languages.CompletionItemKind.Module, insertText: 'JSON' },
        { label: 'Promise', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Promise' },

        // Array methods
        { label: 'map', kind: monaco.languages.CompletionItemKind.Method, insertText: 'map((${1:item}) => $2)' },
        { label: 'filter', kind: monaco.languages.CompletionItemKind.Method, insertText: 'filter((${1:item}) => $2)' },
        { label: 'reduce', kind: monaco.languages.CompletionItemKind.Method, insertText: 'reduce((${1:acc}, ${2:curr}) => $3, ${4:initial})' },
        { label: 'forEach', kind: monaco.languages.CompletionItemKind.Method, insertText: 'forEach((${1:item}) => $2)' },

        // String methods
        { label: 'toLowerCase', kind: monaco.languages.CompletionItemKind.Method, insertText: 'toLowerCase()' },
        { label: 'toUpperCase', kind: monaco.languages.CompletionItemKind.Method, insertText: 'toUpperCase()' },
        { label: 'trim', kind: monaco.languages.CompletionItemKind.Method, insertText: 'trim()' },
        { label: 'split', kind: monaco.languages.CompletionItemKind.Method, insertText: 'split(${1:separator})' },
        { label: 'slice', kind: monaco.languages.CompletionItemKind.Method, insertText: 'slice(${1:start}, ${2:end})' },

        // Loops
        { label: 'for...of', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for (const ${1:item} of ${2:iterable}) {\n\t$3\n}' },
        { label: 'for...in', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for (const ${1:key} in ${2:object}) {\n\t$3\n}' },

        // Conditionals
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if ($1) {\n\t$2\n}' },
        { label: 'switch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'switch ($1) {\n\tcase ${2:value}:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$4\n}' },

        // Error handling
        { label: 'try...catch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try {\n\t$1\n} catch (${2:error}) {\n\t$3\n}' },
        { label: 'throw', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'throw new Error($1)' },
      ],

      typescript: [
        // TypeScript specific
        { label: 'interface', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'interface ${1:Name} {\n\t$2\n}' },
        { label: 'type', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'type ${1:Name} = $2' },
        { label: 'enum', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'enum ${1:Name} {\n\t$2\n}' },
        { label: 'any', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'any' },
        { label: 'string', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'string' },
        { label: 'number', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'number' },
        { label: 'boolean', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'boolean' },
        { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'void' },
        { label: 'null', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'null' },
        { label: 'undefined', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'undefined' },
        { label: 'Array<Type>', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Array<${1:T}>' },
        { label: 'Promise<Type>', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Promise<${1:T}>' },

        // Generics
        { label: 'generic function', kind: monaco.languages.CompletionItemKind.Function, insertText: 'function ${1:name}<T>($2): T {\n\t$3\n}' },

        // Type assertions
        { label: 'as', kind: monaco.languages.CompletionItemKind.Keyword, insertText: ' as ${1:type}' },
      ],

      python: [
        // Python basics
        { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print($1)' },
        { label: 'def', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'def ${1:name}($2):\n\t$3' },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:Name}:\n\t$2' },

        // Variables
        { label: 'self', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'self' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if $1:\n\t$2' },
        { label: 'elif', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'elif $1:\n\t$2' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else:\n\t$1' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:iterable}:\n\t$3' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while $1:\n\t$2' },
        { label: 'range', kind: monaco.languages.CompletionItemKind.Function, insertText: 'range($1)' },

        // Imports
        { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import $1' },
        { label: 'from', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'from $1 import $2' },

        // Built-in functions
        { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len($1)' },
        { label: 'str', kind: monaco.languages.CompletionItemKind.Function, insertText: 'str($1)' },
        { label: 'int', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int($1)' },
        { label: 'float', kind: monaco.languages.CompletionItemKind.Function, insertText: 'float($1)' },
        { label: 'list', kind: monaco.languages.CompletionItemKind.Function, insertText: 'list($1)' },
        { label: 'dict', kind: monaco.languages.CompletionItemKind.Function, insertText: 'dict($1)' },
        { label: 'tuple', kind: monaco.languages.CompletionItemKind.Function, insertText: 'tuple($1)' },
        { label: 'set', kind: monaco.languages.CompletionItemKind.Function, insertText: 'set($1)' },

        // List methods
        { label: 'append', kind: monaco.languages.CompletionItemKind.Method, insertText: 'append($1)' },
        { label: 'pop', kind: monaco.languages.CompletionItemKind.Method, insertText: 'pop()' },
        { label: 'remove', kind: monaco.languages.CompletionItemKind.Method, insertText: 'remove($1)' },

        // String methods
        { label: 'split', kind: monaco.languages.CompletionItemKind.Method, insertText: 'split($1)' },
        { label: 'join', kind: monaco.languages.CompletionItemKind.Method, insertText: 'join($1)' },
        { label: 'strip', kind: monaco.languages.CompletionItemKind.Method, insertText: 'strip()' },

        // Error handling
        { label: 'try', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try:\n\t$1\nexcept ${2:Exception}:\n\t$3' },
        { label: 'raise', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'raise ${1:Exception}' },

        // Comprehensions
        { label: 'list comprehension', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '[${1:expression} for ${2:item} in ${3:iterable}]' },
        { label: 'dict comprehension', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}' },
      ],

      java: [
        // Java basics
        { label: 'public', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'public ' },
        { label: 'private', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'private ' },
        { label: 'protected', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'protected ' },
        { label: 'static', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'static ' },
        { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'void ' },
        { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int ' },
        { label: 'String', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'String ' },
        { label: 'boolean', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'boolean ' },
        { label: 'double', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'double ' },
        { label: 'float', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'float ' },
        { label: 'char', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'char ' },

        // Class structure
        { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:Name} {\n\t$2\n}' },
        { label: 'interface', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'interface ${1:Name} {\n\t$2\n}' },

        // Main method
        { label: 'main', kind: monaco.languages.CompletionItemKind.Method, insertText: 'public static void main(String[] args) {\n\t$1\n}' },

        // Print statements
        { label: 'System.out.println', kind: monaco.languages.CompletionItemKind.Method, insertText: 'System.out.println($1);' },
        { label: 'System.out.print', kind: monaco.languages.CompletionItemKind.Method, insertText: 'System.out.print($1);' },

        // Scanner
        { label: 'Scanner', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Scanner ${1:sc} = new Scanner(System.in);' },
        { label: 'nextInt', kind: monaco.languages.CompletionItemKind.Method, insertText: 'nextInt()' },
        { label: 'nextLine', kind: monaco.languages.CompletionItemKind.Method, insertText: 'nextLine()' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ($1) {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if ($1) {\n\t$2\n}' },
        { label: 'switch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'switch ($1) {\n\tcase ${2:value}:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$4\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for (int ${1:i} = 0; $1 < ${2:length}; $1++) {\n\t$3\n}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ($1) {\n\t$2\n}' },
        { label: 'do...while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'do {\n\t$1\n} while ($2);' },

        // Arrays
        { label: 'new int[]', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'new int[${1:size}]' },
        { label: 'new String[]', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'new String[${1:size}]' },

        // Methods
        { label: 'public void', kind: monaco.languages.CompletionItemKind.Method, insertText: 'public void ${1:name}($2) {\n\t$3\n}' },
        { label: 'public int', kind: monaco.languages.CompletionItemKind.Method, insertText: 'public int ${1:name}($2) {\n\t$3\n\treturn $4;\n}' },

        // Exception handling
        { label: 'try', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try {\n\t$1\n} catch (${2:Exception} e) {\n\t$3\n}' },
        { label: 'throw', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'throw new ${1:Exception}($2);' },
      ],

      cpp: [
        // C++ basics
        { label: '#include', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '#include <$1>' },
        { label: 'using namespace', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'using namespace ${1:std};' },
        { label: 'int main', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int main() {\n\t$1\n\treturn 0;\n}' },

        // I/O
        { label: 'cout', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'cout << $1 << endl;' },
        { label: 'cin', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'cin >> $1;' },
        { label: 'endl', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'endl' },

        // Data types
        { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int ' },
        { label: 'float', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'float ' },
        { label: 'double', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'double ' },
        { label: 'char', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'char ' },
        { label: 'bool', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'bool ' },
        { label: 'string', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'string ' },
        { label: 'auto', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'auto ' },

        // Functions
        { label: 'void function', kind: monaco.languages.CompletionItemKind.Function, insertText: 'void ${1:name}($2) {\n\t$3\n}' },
        { label: 'int function', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int ${1:name}($2) {\n\t$3\n\treturn $4;\n}' },

        // Classes
        { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:Name} {\npublic:\n\t$2\nprivate:\n\t$3\n};' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ($1) {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if ($1) {\n\t$2\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for (int ${1:i} = 0; $1 < ${2:length}; $1++) {\n\t$3\n}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ($1) {\n\t$2\n}' },
        { label: 'do...while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'do {\n\t$1\n} while ($2);' },

        // Arrays
        { label: 'int array', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int ${1:arr}[${2:size}];' },
        { label: 'vector', kind: monaco.languages.CompletionItemKind.Class, insertText: 'vector<${1:int}> ${2:vec};' },

        // Pointers
        { label: 'pointer', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:int}* ${2:ptr};' },
        { label: 'reference', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:int}& ${2:ref};' },

        // STL containers
        { label: 'vector', kind: monaco.languages.CompletionItemKind.Class, insertText: 'vector<${1:T}>' },
        { label: 'map', kind: monaco.languages.CompletionItemKind.Class, insertText: 'map<${1:K}, ${2:V}>' },
        { label: 'set', kind: monaco.languages.CompletionItemKind.Class, insertText: 'set<${1:T}>' },
        { label: 'pair', kind: monaco.languages.CompletionItemKind.Class, insertText: 'pair<${1:T1}, ${2:T2}>' },
      ],

      c: [
        // C basics
        { label: '#include', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '#include <$1>' },
        { label: '#define', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '#define ${1:NAME} ${2:value}' },
        { label: 'int main', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int main() {\n\t$1\n\treturn 0;\n}' },

        // I/O
        { label: 'printf', kind: monaco.languages.CompletionItemKind.Function, insertText: 'printf("${1:%s}\\n", $2);' },
        { label: 'scanf', kind: monaco.languages.CompletionItemKind.Function, insertText: 'scanf("${1:%s}", $2);' },
        { label: 'puts', kind: monaco.languages.CompletionItemKind.Function, insertText: 'puts($1);' },

        // Data types
        { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int ' },
        { label: 'float', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'float ' },
        { label: 'double', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'double ' },
        { label: 'char', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'char ' },
        { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'void ' },

        // Functions
        { label: 'void function', kind: monaco.languages.CompletionItemKind.Function, insertText: 'void ${1:name}($2) {\n\t$3\n}' },
        { label: 'int function', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int ${1:name}($2) {\n\t$3\n\treturn $4;\n}' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ($1) {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if ($1) {\n\t$2\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for (int ${1:i} = 0; $1 < ${2:length}; $1++) {\n\t$3\n}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ($1) {\n\t$2\n}' },
        { label: 'do...while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'do {\n\t$1\n} while ($2);' },

        // Arrays
        { label: 'int array', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int ${1:arr}[${2:size}];' },
        { label: 'char array', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'char ${1:str}[${2:size}];' },

        // Pointers
        { label: 'pointer', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:int}* ${2:ptr};' },
        { label: 'malloc', kind: monaco.languages.CompletionItemKind.Function, insertText: 'malloc(${1:size} * sizeof(${2:type}))' },
        { label: 'free', kind: monaco.languages.CompletionItemKind.Function, insertText: 'free($1);' },

        // String functions
        { label: 'strlen', kind: monaco.languages.CompletionItemKind.Function, insertText: 'strlen($1)' },
        { label: 'strcpy', kind: monaco.languages.CompletionItemKind.Function, insertText: 'strcpy(${1:dest}, ${2:src})' },
        { label: 'strcat', kind: monaco.languages.CompletionItemKind.Function, insertText: 'strcat(${1:dest}, ${2:src})' },
        { label: 'strcmp', kind: monaco.languages.CompletionItemKind.Function, insertText: 'strcmp(${1:str1}, ${2:str2})' },
      ],

      go: [
        // Go basics
        { label: 'package main', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'package main' },
        { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import "$1"' },
        { label: 'func main', kind: monaco.languages.CompletionItemKind.Function, insertText: 'func main() {\n\t$1\n}' },

        // Functions
        { label: 'func', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'func ${1:name}($2) $3 {\n\t$4\n}' },

        // Variables
        { label: 'var', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'var ${1:name} $2' },
        { label: ':=', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:name} := $2' },
        { label: 'const', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'const ${1:name} = $2' },

        // Data types
        { label: 'string', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'string' },
        { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int' },
        { label: 'float64', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'float64' },
        { label: 'bool', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'bool' },
        { label: 'error', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'error' },

        // Print statements
        { label: 'fmt.Println', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fmt.Println($1)' },
        { label: 'fmt.Printf', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fmt.Printf("${1:%s}\\n", $2)' },
        { label: 'fmt.Print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fmt.Print($1)' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if $1 {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if $1 {\n\t$2\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:i} := 0; $1 < ${2:length}; $1++ {\n\t$3\n}' },
        { label: 'range', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:key}, ${2:value} := range ${3:iterable} {\n\t$4\n}' },
        { label: 'while loop', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for $1 {\n\t$2\n}' },

        // Arrays & Slices
        { label: 'make slice', kind: monaco.languages.CompletionItemKind.Function, insertText: 'make([]${1:T}, ${2:length})' },
        { label: 'append', kind: monaco.languages.CompletionItemKind.Function, insertText: 'append(${1:slice}, ${2:element})' },
        { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len($1)' },
        { label: 'cap', kind: monaco.languages.CompletionItemKind.Function, insertText: 'cap($1)' },

        // Maps
        { label: 'make map', kind: monaco.languages.CompletionItemKind.Function, insertText: 'make(map[${1:K}]${2:V})' },

        // Error handling
        { label: 'error check', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if err != nil {\n\treturn err\n}' },

        // Goroutines
        { label: 'go', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'go ${1:function}()' },
        { label: 'chan', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'chan ${1:T}' },
      ],

      ruby: [
        // Ruby basics
        { label: 'puts', kind: monaco.languages.CompletionItemKind.Function, insertText: 'puts $1' },
        { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print $1' },
        { label: 'def', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'def ${1:name}\n\t$2\nend' },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:Name}\n\t$2\nend' },
        { label: 'module', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'module ${1:Name}\n\t$2\nend' },

        // Variables
        { label: '@instance', kind: monaco.languages.CompletionItemKind.Variable, insertText: '@${1:name}' },
        { label: '@@class', kind: monaco.languages.CompletionItemKind.Variable, insertText: '@@${1:name}' },
        { label: '$global', kind: monaco.languages.CompletionItemKind.Variable, insertText: '$${1:name}' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if $1\n\t$2\nend' },
        { label: 'unless', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'unless $1\n\t$2\nend' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else\n\t$1\nend' },
        { label: 'elsif', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'elsif $1\n\t$2\nend' },
        { label: 'case', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'case $1\nwhen ${2:value}\n\t$3\nelse\n\t$4\nend' },

        // Loops
        { label: 'each', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:array}.each do |${2:item}|\n\t$3\nend' },
        { label: 'times', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:5}.times do |${2:i}|\n\t$3\nend' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while $1\n\t$2\nend' },
        { label: 'until', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'until $1\n\t$2\nend' },
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:array}\n\t$3\nend' },

        // Blocks
        { label: 'do...end', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'do |${1:arg}|\n\t$2\nend' },
        { label: 'yield', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'yield($1)' },

        // String interpolation
        { label: 'string interpolation', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '"#{${1:variable}}"' },

        // Array methods
        { label: 'map', kind: monaco.languages.CompletionItemKind.Method, insertText: 'map { |${1:item}| $2 }' },
        { label: 'select', kind: monaco.languages.CompletionItemKind.Method, insertText: 'select { |${1:item}| $2 }' },
        { label: 'reject', kind: monaco.languages.CompletionItemKind.Method, insertText: 'reject { |${1:item}| $2 }' },
        { label: 'reduce', kind: monaco.languages.CompletionItemKind.Method, insertText: 'reduce(${1:0}) { |${2:sum}, ${3:item}| $4 }' },

        // Hash
        { label: 'hash', kind: monaco.languages.CompletionItemKind.Struct, insertText: '{ ${1:key} => ${2:value} }' },
        { label: 'symbol hash', kind: monaco.languages.CompletionItemKind.Struct, insertText: '{ ${1:key}: ${2:value} }' },

        // Error handling
        { label: 'begin...rescue', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'begin\n\t$1\nrescue ${2:Exception} => ${3:e}\n\t$4\nend' },
        { label: 'raise', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'raise ${1:Error}' },
      ],

      php: [
        // PHP basics
        { label: '<?php', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '<?php\n$1' },
        { label: 'echo', kind: monaco.languages.CompletionItemKind.Function, insertText: 'echo $1;' },
        { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print $1;' },
        { label: 'function', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'function ${1:name}($2) {\n\t$3\n}' },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:Name} {\n\t$2\n}' },

        // Variables
        { label: '$variable', kind: monaco.languages.CompletionItemKind.Variable, insertText: '$${1:name}' },
        { label: '$_GET', kind: monaco.languages.CompletionItemKind.Variable, insertText: '$_GET' },
        { label: '$_POST', kind: monaco.languages.CompletionItemKind.Variable, insertText: '$_POST' },
        { label: '$_SESSION', kind: monaco.languages.CompletionItemKind.Variable, insertText: '$_SESSION' },
        { label: '$_COOKIE', kind: monaco.languages.CompletionItemKind.Variable, insertText: '$_COOKIE' },

        // Conditionals
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if ($1) {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'elseif', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'elseif ($1) {\n\t$2\n}' },
        { label: 'switch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'switch ($1) {\n\tcase ${2:value}:\n\t\t$3\n\t\tbreak;\n\tdefault:\n\t\t$4\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ($${1:i} = 0; $1 < ${2:length}; $1++) {\n\t$3\n}' },
        { label: 'foreach', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'foreach ($${1:array} as $${2:key} => $${3:value}) {\n\t$4\n}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while ($1) {\n\t$2\n}' },
        { label: 'do...while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'do {\n\t$1\n} while ($2);' },

        // Arrays
        { label: 'array()', kind: monaco.languages.CompletionItemKind.Function, insertText: 'array($1)' },
        { label: '[]', kind: monaco.languages.CompletionItemKind.Struct, insertText: '[$1]' },
        { label: 'count', kind: monaco.languages.CompletionItemKind.Function, insertText: 'count($1)' },
        { label: 'array_push', kind: monaco.languages.CompletionItemKind.Function, insertText: 'array_push(${1:array}, ${2:value})' },
        { label: 'array_pop', kind: monaco.languages.CompletionItemKind.Function, insertText: 'array_pop($1)' },

        // String functions
        { label: 'strlen', kind: monaco.languages.CompletionItemKind.Function, insertText: 'strlen($1)' },
        { label: 'str_replace', kind: monaco.languages.CompletionItemKind.Function, insertText: 'str_replace(${1:search}, ${2:replace}, ${3:subject})' },
        { label: 'substr', kind: monaco.languages.CompletionItemKind.Function, insertText: 'substr(${1:string}, ${2:start}, ${3:length})' },
        { label: 'trim', kind: monaco.languages.CompletionItemKind.Function, insertText: 'trim($1)' },

        // Database
        { label: 'mysqli_connect', kind: monaco.languages.CompletionItemKind.Function, insertText: 'mysqli_connect(${1:host}, ${2:username}, ${3:password}, ${4:database})' },
        { label: 'mysqli_query', kind: monaco.languages.CompletionItemKind.Function, insertText: 'mysqli_query(${1:connection}, ${2:query})' },
        { label: 'mysqli_fetch_assoc', kind: monaco.languages.CompletionItemKind.Function, insertText: 'mysqli_fetch_assoc($1)' },

        // Error handling
        { label: 'try...catch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'try {\n\t$1\n} catch (${2:Exception} $e) {\n\t$3\n}' },
        { label: 'throw', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'throw new ${1:Exception}($2);' },
      ],

      swift: [
        // Swift basics
        { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print($1)' },
        { label: 'func', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'func ${1:name}($2) {\n\t$3\n}' },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'class ${1:Name} {\n\t$2\n}' },
        { label: 'struct', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'struct ${1:Name} {\n\t$2\n}' },
        { label: 'enum', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'enum ${1:Name} {\n\t$2\n}' },
        { label: 'protocol', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'protocol ${1:Name} {\n\t$2\n}' },

        // Variables
        { label: 'var', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'var ${1:name} = $2' },
        { label: 'let', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'let ${1:name} = $2' },
        { label: 'lazy var', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'lazy var ${1:name} = $2' },

        // Data types
        { label: 'String', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'String' },
        { label: 'Int', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Int' },
        { label: 'Double', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Double' },
        { label: 'Float', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Float' },
        { label: 'Bool', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Bool' },
        { label: 'Array', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Array' },
        { label: 'Dictionary', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Dictionary' },
        { label: 'Set', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Set' },
        { label: 'Optional', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Optional' },

        // Control flow
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if $1 {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if $1 {\n\t$2\n}' },
        { label: 'guard', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'guard $1 else {\n\treturn\n}' },
        { label: 'switch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'switch $1 {\ncase ${2:value}:\n\t$3\ndefault:\n\t$4\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:collection} {\n\t$3\n}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while $1 {\n\t$2\n}' },
        { label: 'repeat...while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'repeat {\n\t$1\n} while $2' },

        // Optionals
        { label: 'if let', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if let ${1:value} = $2 {\n\t$3\n}' },
        { label: 'guard let', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'guard let ${1:value} = $2 else {\n\treturn\n}' },
        { label: '??', kind: monaco.languages.CompletionItemKind.Operator, insertText: '?? ${1:default}' },

        // Closures
        { label: 'closure', kind: monaco.languages.CompletionItemKind.Function, insertText: '{ (${1:parameters}) -> ${2:ReturnType} in\n\t$3\n}' },
        { label: 'trailing closure', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '{\n\t$1\n}' },

        // Error handling
        { label: 'do...try...catch', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'do {\n\t$1\n} catch {\n\t$2\n}' },
        { label: 'throw', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'throw ${1:Error}' },
        { label: 'throws', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'throws' },

        // Collections
        { label: 'Array methods', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '${1:array}.map { $0.$2 }' },
        { label: 'filter', kind: monaco.languages.CompletionItemKind.Method, insertText: 'filter { $0.$1 }' },
        { label: 'reduce', kind: monaco.languages.CompletionItemKind.Method, insertText: 'reduce(${1:0}) { $0 + $1 }' },
        { label: 'sorted', kind: monaco.languages.CompletionItemKind.Method, insertText: 'sorted(by: { $0 < $1 })' },
      ],

      rust: [
        // Rust basics
        { label: 'fn main', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fn main() {\n\t$1\n}' },
        { label: 'println!', kind: monaco.languages.CompletionItemKind.Function, insertText: 'println!("{}", $1);' },
        { label: 'fn', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'fn ${1:name}($2) -> ${3:ReturnType} {\n\t$4\n}' },

        // Variables
        { label: 'let', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'let ${1:name} = $2;' },
        { label: 'let mut', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'let mut ${1:name} = $2;' },
        { label: 'const', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'const ${1:NAME}: ${2:Type} = $3;' },
        { label: 'static', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'static ${1:NAME}: ${2:Type} = $3;' },

        // Data types
        { label: 'i32', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'i32' },
        { label: 'u32', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'u32' },
        { label: 'f64', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'f64' },
        { label: 'bool', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'bool' },
        { label: 'char', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'char' },
        { label: 'String', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'String' },
        { label: '&str', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '&str' },
        { label: 'Vec', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Vec' },
        { label: 'Option', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Option' },
        { label: 'Result', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'Result' },

        // Control flow
        { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'if $1 {\n\t$2\n}' },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else {\n\t$1\n}' },
        { label: 'else if', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'else if $1 {\n\t$2\n}' },
        { label: 'match', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'match $1 {\n\t${2:pattern} => $3,\n\t_ => $4\n}' },

        // Loops
        { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:iterable} {\n\t$3\n}' },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'while $1 {\n\t$2\n}' },
        { label: 'loop', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'loop {\n\t$1\n}' },

        // Structs and Enums
        { label: 'struct', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'struct ${1:Name} {\n\t$2\n}' },
        { label: 'impl', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'impl ${1:Name} {\n\t$2\n}' },
        { label: 'enum', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'enum ${1:Name} {\n\t$2\n}' },

        // Traits
        { label: 'trait', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'trait ${1:Name} {\n\t$2\n}' },

        // Error handling
        { label: 'Result', kind: monaco.languages.CompletionItemKind.Struct, insertText: 'Result<${1:T}, ${2:E}>' },
        { label: 'unwrap', kind: monaco.languages.CompletionItemKind.Method, insertText: 'unwrap()' },
        { label: 'expect', kind: monaco.languages.CompletionItemKind.Method, insertText: 'expect("$1")' },
        { label: '?', kind: monaco.languages.CompletionItemKind.Operator, insertText: '?' },

        // Collections
        { label: 'Vec::new', kind: monaco.languages.CompletionItemKind.Function, insertText: 'Vec::new()' },
        { label: 'vec!', kind: monaco.languages.CompletionItemKind.Function, insertText: 'vec![$1]' },
        { label: 'HashMap', kind: monaco.languages.CompletionItemKind.Class, insertText: 'HashMap::new()' },

        // Iterators
        { label: 'iter', kind: monaco.languages.CompletionItemKind.Method, insertText: 'iter()' },
        { label: 'iter_mut', kind: monaco.languages.CompletionItemKind.Method, insertText: 'iter_mut()' },
        { label: 'into_iter', kind: monaco.languages.CompletionItemKind.Method, insertText: 'into_iter()' },
        { label: 'map', kind: monaco.languages.CompletionItemKind.Method, insertText: 'map(|${1:x}| $2)' },
        { label: 'filter', kind: monaco.languages.CompletionItemKind.Method, insertText: 'filter(|${1:x}| $2)' },
        { label: 'collect', kind: monaco.languages.CompletionItemKind.Method, insertText: 'collect::<Vec<_>>()' },

        // Ownership
        { label: '&', kind: monaco.languages.CompletionItemKind.Operator, insertText: '&' },
        { label: '&mut', kind: monaco.languages.CompletionItemKind.Operator, insertText: '&mut' },
        { label: '*', kind: monaco.languages.CompletionItemKind.Operator, insertText: '*' },
      ],
    };

    const suggestions = [...commonSuggestions, ...(languageSuggestions[lang] || [])];

    // Register completion item provider
    monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['.', ' ', ':', '<', '"', "'", '/', '@', '#', '(', '{', '[', '$'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: suggestions.map(suggestion => ({
            ...suggestion,
            range: range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          }))
        };
      }
    });
  }, []);

  const handleEditorDidMount = useCallback((editor, monacoInstance) => {
    editorRef.current = editor;

    // Add custom suggestions based on language
    if (editorSettings.intellisense) {
      setupLanguageSpecificSuggestions(monacoInstance, language);
    }

    // Add keyboard shortcut for triggering suggestions (Ctrl+Space)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Space, function () {
      editor.trigger('', 'editor.action.triggerSuggest', {});
    });

    // Add keyboard shortcut for format document (Shift+Alt+F)
    editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyF, function () {
      editor.getAction('editor.action.formatDocument').run();
    });
  }, [language, editorSettings.intellisense, setupLanguageSpecificSuggestions]);

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme={theme}
      onChange={(value) => setCode(value || '')}
      onMount={handleEditorDidMount}
      options={options}
    />
  );
});

export default CodeEditor;
