/**
 * Python Parser for Code Visualization
 */
import BaseParser from './baseParser.js';

class PythonParser extends BaseParser {
  constructor() {
    super('python');
    this.indentStack = [0];
  }

  parse(code) {
    const lines = code.split('\n');
    
    this.addStep('start', {
      description: 'Python program execution begins',
      line: 1
    });

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const lineNum = index + 1;
      const indent = line.search(/\S/);

      // Variable assignment
      if (trimmed.match(/^\w+\s*=\s*.+/) && !trimmed.includes('def ') && !trimmed.includes('==')) {
        this.parseVariableAssignment(trimmed, lineNum);
      }
      // Function definition
      else if (trimmed.startsWith('def ')) {
        this.parseFunctionDef(trimmed, lineNum);
      }
      // Class definition
      else if (trimmed.startsWith('class ')) {
        this.parseClassDef(trimmed, lineNum);
      }
      // Print statement
      else if (trimmed.match(/^print\s*\(/)) {
        this.parsePrint(trimmed, lineNum);
      }
      // For loop
      else if (trimmed.startsWith('for ')) {
        this.parseForLoop(trimmed, lineNum);
      }
      // While loop
      else if (trimmed.startsWith('while ')) {
        this.parseWhileLoop(trimmed, lineNum);
      }
      // If statement
      else if (trimmed.startsWith('if ')) {
        this.parseIf(trimmed, lineNum);
      }
      // Return statement
      else if (trimmed.startsWith('return ')) {
        this.parseReturn(trimmed, lineNum);
      }
      // Import statement
      else if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        this.parseImport(trimmed, lineNum);
      }
    });

    this.addStep('end', {
      description: 'Python program execution complete',
      line: lines.length
    });

    return this.getResult();
  }

  parseVariableAssignment(line, lineNum) {
    const match = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (match) {
      const [, name, valueStr] = match;
      const { value, type } = this.evaluateValue(valueStr);
      
      const varInfo = this.trackVariable(name, value, type);
      
      if (type === 'list' || type === 'dict' || type === 'object') {
        this.trackHeapAllocation(name, value, type);
      }

      this.addStep('variable_assignment', {
        description: `${name} = ${valueStr}`,
        line: lineNum,
        variable: varInfo,
        memoryOperation: ['list', 'dict', 'object'].includes(type) ? 'heap_allocation' : 'stack_push'
      });
    }
  }

  parseFunctionDef(line, lineNum) {
    const match = line.match(/^def\s+(\w+)\s*\((.*)\):/);
    if (match) {
      const [, name, params] = match;
      this.pushCallStack(name);
      
      this.addStep('function_definition', {
        description: `Function '${name}' defined with params: ${params || 'none'}`,
        line: lineNum,
        functionName: name,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean)
      });
    }
  }

  parseClassDef(line, lineNum) {
    const match = line.match(/^class\s+(\w+)(?:\((.*)\))?:/);
    if (match) {
      const [, name, parent] = match;
      this.addStep('class_definition', {
        description: `Class '${name}' defined${parent ? ` (inherits from ${parent})` : ''}`,
        line: lineNum,
        className: name,
        parent: parent || null
      });
    }
  }

  parsePrint(line, lineNum) {
    const match = line.match(/^print\s*\((.*)\)/);
    if (match) {
      this.addStep('print_output', {
        description: `print(${match[1]})`,
        line: lineNum,
        output: match[1]
      });
    }
  }

  parseForLoop(line, lineNum) {
    const match = line.match(/^for\s+(\w+)\s+in\s+(.+):/);
    if (match) {
      const [, variable, iterable] = match;
      this.addStep('for_loop', {
        description: `For loop: ${variable} in ${iterable}`,
        line: lineNum,
        loopVariable: variable,
        iterable: iterable
      });
    }
  }

  parseWhileLoop(line, lineNum) {
    const match = line.match(/^while\s+(.+):/);
    if (match) {
      this.addStep('while_loop', {
        description: `While loop: ${match[1]}`,
        line: lineNum,
        condition: match[1]
      });
    }
  }

  parseIf(line, lineNum) {
    const match = line.match(/^if\s+(.+):/);
    if (match) {
      this.addStep('conditional', {
        description: `If condition: ${match[1]}`,
        line: lineNum,
        condition: match[1]
      });
    }
  }

  parseReturn(line, lineNum) {
    const match = line.match(/^return\s*(.*)$/);
    if (match) {
      this.popCallStack();
      this.addStep('return_statement', {
        description: `Return: ${match[1] || 'None'}`,
        line: lineNum,
        returnValue: match[1] || 'None'
      });
    }
  }

  parseImport(line, lineNum) {
    this.addStep('import', {
      description: line,
      line: lineNum,
      module: line
    });
  }

  evaluateValue(valueStr) {
    const trimmed = valueStr.trim();
    
    if (trimmed.startsWith('[')) {
      return { value: trimmed, type: 'list' };
    }
    if (trimmed.startsWith('{')) {
      return { value: trimmed, type: 'dict' };
    }
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
      return { value: trimmed.slice(1, -1), type: 'str' };
    }
    if (!isNaN(trimmed)) {
      return { value: Number(trimmed), type: trimmed.includes('.') ? 'float' : 'int' };
    }
    if (trimmed === 'True' || trimmed === 'False') {
      return { value: trimmed === 'True', type: 'bool' };
    }
    if (trimmed === 'None') {
      return { value: null, type: 'NoneType' };
    }
    return { value: trimmed, type: 'unknown' };
  }
}

export default PythonParser;
