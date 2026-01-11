/**
 * JavaScript Parser for Code Visualization
 */
const BaseParser = require('./baseParser');

class JavaScriptParser extends BaseParser {
  constructor() {
    super('javascript');
  }

  parse(code) {
    const lines = code.split('\n');
    
    this.addStep('start', {
      description: 'Program execution begins',
      line: 1
    });

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      const lineNum = index + 1;

      // Variable declarations
      if (trimmed.match(/^(let|const|var)\s+/)) {
        this.parseVariableDeclaration(trimmed, lineNum);
      }
      // Function declarations
      else if (trimmed.match(/^function\s+\w+/)) {
        this.parseFunctionDeclaration(trimmed, lineNum);
      }
      // Arrow functions
      else if (trimmed.match(/^const\s+\w+\s*=\s*\(.*\)\s*=>/)) {
        this.parseArrowFunction(trimmed, lineNum);
      }
      // Function calls
      else if (trimmed.match(/^\w+\s*\(/)) {
        this.parseFunctionCall(trimmed, lineNum);
      }
      // Console.log
      else if (trimmed.match(/console\.(log|warn|error)/)) {
        this.parseConsoleLog(trimmed, lineNum);
      }
      // Loops
      else if (trimmed.match(/^(for|while)\s*\(/)) {
        this.parseLoop(trimmed, lineNum);
      }
      // Conditionals
      else if (trimmed.match(/^if\s*\(/)) {
        this.parseConditional(trimmed, lineNum);
      }
    });

    this.addStep('end', {
      description: 'Program execution complete',
      line: lines.length
    });

    return this.getResult();
  }

  parseVariableDeclaration(line, lineNum) {
    const match = line.match(/^(let|const|var)\s+(\w+)\s*=\s*(.+?);?$/);
    if (match) {
      const [, keyword, name, valueStr] = match;
      const { value, type } = this.evaluateValue(valueStr);
      
      const varInfo = this.trackVariable(name, value, type, keyword === 'const' ? 'constant' : 'local');
      
      if (type === 'array' || type === 'object') {
        this.trackHeapAllocation(name, value, type);
      }

      this.addStep('variable_declaration', {
        description: `Declared ${keyword} ${name} = ${JSON.stringify(value)}`,
        line: lineNum,
        variable: varInfo,
        memoryOperation: type === 'array' || type === 'object' ? 'heap_allocation' : 'stack_push'
      });
    }
  }

  parseFunctionDeclaration(line, lineNum) {
    const match = line.match(/^function\s+(\w+)\s*\((.*)\)/);
    if (match) {
      const [, name, params] = match;
      this.addStep('function_declaration', {
        description: `Function '${name}' declared with params: ${params || 'none'}`,
        line: lineNum,
        functionName: name,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean)
      });
    }
  }

  parseArrowFunction(line, lineNum) {
    const match = line.match(/^const\s+(\w+)\s*=\s*\((.*)\)\s*=>/);
    if (match) {
      const [, name, params] = match;
      this.addStep('arrow_function', {
        description: `Arrow function '${name}' declared`,
        line: lineNum,
        functionName: name,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean)
      });
    }
  }

  parseFunctionCall(line, lineNum) {
    const match = line.match(/^(\w+)\s*\((.*)\)/);
    if (match) {
      const [, name, args] = match;
      this.pushCallStack(name, args.split(',').map(a => a.trim()));
      
      this.addStep('function_call', {
        description: `Calling function '${name}'`,
        line: lineNum,
        functionName: name,
        arguments: args,
        callStack: [...this.callStack]
      });
    }
  }

  parseConsoleLog(line, lineNum) {
    const match = line.match(/console\.(log|warn|error)\s*\((.*)\)/);
    if (match) {
      const [, method, content] = match;
      this.addStep('console_output', {
        description: `console.${method}: ${content}`,
        line: lineNum,
        method,
        output: content
      });
    }
  }

  parseLoop(line, lineNum) {
    const forMatch = line.match(/^for\s*\((.*);(.*);(.*)\)/);
    if (forMatch) {
      this.addStep('loop_start', {
        description: `For loop: init=${forMatch[1]}, condition=${forMatch[2]}, update=${forMatch[3]}`,
        line: lineNum,
        loopType: 'for',
        init: forMatch[1],
        condition: forMatch[2],
        update: forMatch[3]
      });
    }
  }

  parseConditional(line, lineNum) {
    const match = line.match(/^if\s*\((.*)\)/);
    if (match) {
      this.addStep('conditional', {
        description: `If condition: ${match[1]}`,
        line: lineNum,
        condition: match[1]
      });
    }
  }

  evaluateValue(valueStr) {
    const trimmed = valueStr.trim();
    
    if (trimmed.startsWith('[')) {
      return { value: trimmed, type: 'array' };
    }
    if (trimmed.startsWith('{')) {
      return { value: trimmed, type: 'object' };
    }
    if (trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed.startsWith('`')) {
      return { value: trimmed.slice(1, -1), type: 'string' };
    }
    if (!isNaN(trimmed)) {
      return { value: Number(trimmed), type: trimmed.includes('.') ? 'float' : 'int' };
    }
    if (trimmed === 'true' || trimmed === 'false') {
      return { value: trimmed === 'true', type: 'boolean' };
    }
    return { value: trimmed, type: 'unknown' };
  }
}

module.exports = JavaScriptParser;
