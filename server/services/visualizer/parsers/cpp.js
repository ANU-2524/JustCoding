/**
 * C++ Parser for Code Visualization
 */
import BaseParser from './baseParser.js';

class CppParser extends BaseParser {
  constructor() {
    super('cpp');
  }

  parse(code) {
    const lines = code.split('\n');
    
    this.addStep('start', {
      description: 'C++ program execution begins',
      line: 1
    });

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      const lineNum = index + 1;

      // Include directive
      if (trimmed.startsWith('#include')) {
        this.parseInclude(trimmed, lineNum);
      }
      // Using namespace
      else if (trimmed.startsWith('using namespace')) {
        this.parseUsingNamespace(trimmed, lineNum);
      }
      // Function declaration
      else if (trimmed.match(/^(int|void|double|float|char|bool|string|auto)\s+\w+\s*\(/)) {
        this.parseFunctionDeclaration(trimmed, lineNum);
      }
      // Variable declaration
      else if (trimmed.match(/^(int|double|float|char|bool|string|auto|long|short)\s+\w+/)) {
        this.parseVariableDeclaration(trimmed, lineNum);
      }
      // Pointer declaration
      else if (trimmed.match(/^(int|double|float|char|bool|string)\s*\*\s*\w+/)) {
        this.parsePointerDeclaration(trimmed, lineNum);
      }
      // new allocation
      else if (trimmed.includes('new ')) {
        this.parseNewAllocation(trimmed, lineNum);
      }
      // delete
      else if (trimmed.startsWith('delete')) {
        this.parseDelete(trimmed, lineNum);
      }
      // cout
      else if (trimmed.match(/cout\s*<</)) {
        this.parseCout(trimmed, lineNum);
      }
      // For loop
      else if (trimmed.startsWith('for ') || trimmed.startsWith('for(')) {
        this.parseForLoop(trimmed, lineNum);
      }
      // While loop
      else if (trimmed.startsWith('while ') || trimmed.startsWith('while(')) {
        this.parseWhileLoop(trimmed, lineNum);
      }
      // If statement
      else if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
        this.parseIf(trimmed, lineNum);
      }
      // Return statement
      else if (trimmed.startsWith('return ')) {
        this.parseReturn(trimmed, lineNum);
      }
      // Class declaration
      else if (trimmed.startsWith('class ')) {
        this.parseClassDeclaration(trimmed, lineNum);
      }
      // Struct declaration
      else if (trimmed.startsWith('struct ')) {
        this.parseStructDeclaration(trimmed, lineNum);
      }
    });

    this.addStep('end', {
      description: 'C++ program execution complete',
      line: lines.length
    });

    return this.getResult();
  }

  parseInclude(line, lineNum) {
    const match = line.match(/#include\s*[<"](.+)[>"]/);
    if (match) {
      this.addStep('include', {
        description: `Include: ${match[1]}`,
        line: lineNum,
        header: match[1]
      });
    }
  }

  parseUsingNamespace(line, lineNum) {
    const match = line.match(/using namespace\s+(\w+)/);
    if (match) {
      this.addStep('using_namespace', {
        description: `Using namespace: ${match[1]}`,
        line: lineNum,
        namespace: match[1]
      });
    }
  }

  parseFunctionDeclaration(line, lineNum) {
    const match = line.match(/^(int|void|double|float|char|bool|string|auto)\s+(\w+)\s*\((.*)\)/);
    if (match) {
      const [, returnType, name, params] = match;
      this.pushCallStack(name);
      
      this.addStep('function_declaration', {
        description: `Function '${name}' declared (${returnType})`,
        line: lineNum,
        functionName: name,
        returnType,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean)
      });
    }
  }

  parseVariableDeclaration(line, lineNum) {
    const match = line.match(/^(int|double|float|char|bool|string|auto|long|short)\s+(\w+)(?:\s*=\s*(.+))?;?/);
    if (match) {
      const [, type, name, valueStr] = match;
      const value = valueStr || this.getDefaultValue(type);
      
      const varInfo = this.trackVariable(name, value, type);
      
      this.addStep('variable_declaration', {
        description: `${type} ${name}${valueStr ? ` = ${valueStr}` : ''}`,
        line: lineNum,
        variable: varInfo,
        memoryOperation: 'stack_push'
      });
    }
  }

  parsePointerDeclaration(line, lineNum) {
    const match = line.match(/^(int|double|float|char|bool|string)\s*\*\s*(\w+)(?:\s*=\s*(.+))?;?/);
    if (match) {
      const [, type, name, valueStr] = match;
      
      const varInfo = this.trackVariable(name, valueStr || 'nullptr', 'pointer');
      
      this.addStep('pointer_declaration', {
        description: `${type}* ${name}${valueStr ? ` = ${valueStr}` : ''}`,
        line: lineNum,
        variable: varInfo,
        pointedType: type,
        memoryOperation: 'stack_push'
      });
    }
  }

  parseNewAllocation(line, lineNum) {
    const match = line.match(/(\w+)\s*=\s*new\s+(\w+)(?:\[(\d+)\])?/);
    if (match) {
      const [, name, type, size] = match;
      
      this.trackHeapAllocation(name, `new ${type}${size ? `[${size}]` : ''}`, type);
      
      this.addStep('heap_allocation', {
        description: `${name} = new ${type}${size ? `[${size}]` : ''}`,
        line: lineNum,
        variable: name,
        allocationType: type,
        arraySize: size ? parseInt(size) : null,
        memoryOperation: 'heap_allocation'
      });
    }
  }

  parseDelete(line, lineNum) {
    const arrayMatch = line.match(/delete\[\]\s+(\w+)/);
    const singleMatch = line.match(/delete\s+(\w+)/);
    
    if (arrayMatch) {
      this.addStep('heap_deallocation', {
        description: `delete[] ${arrayMatch[1]}`,
        line: lineNum,
        variable: arrayMatch[1],
        isArray: true,
        memoryOperation: 'heap_deallocation'
      });
    } else if (singleMatch) {
      this.addStep('heap_deallocation', {
        description: `delete ${singleMatch[1]}`,
        line: lineNum,
        variable: singleMatch[1],
        isArray: false,
        memoryOperation: 'heap_deallocation'
      });
    }
  }

  parseCout(line, lineNum) {
    const match = line.match(/cout\s*<<\s*(.+?)(?:;|$)/);
    if (match) {
      this.addStep('print_output', {
        description: `cout << ${match[1]}`,
        line: lineNum,
        output: match[1]
      });
    }
  }

  parseForLoop(line, lineNum) {
    const match = line.match(/for\s*\(\s*(.+);\s*(.+);\s*(.+)\s*\)/);
    if (match) {
      this.addStep('for_loop', {
        description: `For loop: init=${match[1]}, condition=${match[2]}, update=${match[3]}`,
        line: lineNum,
        init: match[1],
        condition: match[2],
        update: match[3]
      });
    }
  }

  parseWhileLoop(line, lineNum) {
    const match = line.match(/while\s*\(\s*(.+)\s*\)/);
    if (match) {
      this.addStep('while_loop', {
        description: `While loop: ${match[1]}`,
        line: lineNum,
        condition: match[1]
      });
    }
  }

  parseIf(line, lineNum) {
    const match = line.match(/if\s*\(\s*(.+)\s*\)/);
    if (match) {
      this.addStep('conditional', {
        description: `If condition: ${match[1]}`,
        line: lineNum,
        condition: match[1]
      });
    }
  }

  parseReturn(line, lineNum) {
    const match = line.match(/return\s+(.+);/);
    if (match) {
      this.popCallStack();
      this.addStep('return_statement', {
        description: `Return: ${match[1]}`,
        line: lineNum,
        returnValue: match[1]
      });
    }
  }

  parseClassDeclaration(line, lineNum) {
    const match = line.match(/class\s+(\w+)/);
    if (match) {
      this.addStep('class_declaration', {
        description: `Class '${match[1]}' declared`,
        line: lineNum,
        className: match[1]
      });
    }
  }

  parseStructDeclaration(line, lineNum) {
    const match = line.match(/struct\s+(\w+)/);
    if (match) {
      this.addStep('struct_declaration', {
        description: `Struct '${match[1]}' declared`,
        line: lineNum,
        structName: match[1]
      });
    }
  }

  getDefaultValue(type) {
    const defaults = {
      'int': 0, 'long': 0, 'short': 0,
      'double': 0.0, 'float': 0.0,
      'bool': false,
      'char': "''",
      'string': '""'
    };
    return defaults[type] ?? 0;
  }
}

export default CppParser;
