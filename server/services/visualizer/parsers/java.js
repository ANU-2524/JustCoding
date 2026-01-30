/**
 * Java Parser for Code Visualization
 */
import BaseParser from './baseParser.js';

class JavaParser extends BaseParser {
  constructor() {
    super('java');
  }

  parse(code) {
    const lines = code.split('\n');
    
    this.addStep('start', {
      description: 'Java program execution begins',
      line: 1
    });

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      const lineNum = index + 1;

      // Class declaration
      if (trimmed.match(/^(public\s+)?class\s+\w+/)) {
        this.parseClassDeclaration(trimmed, lineNum);
      }
      // Method declaration
      else if (trimmed.match(/^(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\(/)) {
        this.parseMethodDeclaration(trimmed, lineNum);
      }
      // Variable declaration
      else if (trimmed.match(/^(int|String|double|float|boolean|char|long|short|byte|var)\s+\w+/)) {
        this.parseVariableDeclaration(trimmed, lineNum);
      }
      // Object instantiation
      else if (trimmed.includes('new ')) {
        this.parseObjectInstantiation(trimmed, lineNum);
      }
      // System.out.println
      else if (trimmed.match(/System\.out\.(print|println)/)) {
        this.parseSystemOut(trimmed, lineNum);
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
    });

    this.addStep('end', {
      description: 'Java program execution complete',
      line: lines.length
    });

    return this.getResult();
  }

  parseClassDeclaration(line, lineNum) {
    const match = line.match(/^(public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+(.+))?/);
    if (match) {
      const [, , name, parent, interfaces] = match;
      this.addStep('class_declaration', {
        description: `Class '${name}' declared`,
        line: lineNum,
        className: name,
        parent: parent || null,
        interfaces: interfaces ? interfaces.split(',').map(i => i.trim()) : []
      });
    }
  }

  parseMethodDeclaration(line, lineNum) {
    const match = line.match(/^(public|private|protected)?\s*(static)?\s*(\w+)\s+(\w+)\s*\((.*)\)/);
    if (match) {
      const [, access, isStatic, returnType, name, params] = match;
      this.pushCallStack(name);
      
      this.addStep('method_declaration', {
        description: `Method '${name}' declared (${returnType})`,
        line: lineNum,
        methodName: name,
        returnType,
        accessModifier: access || 'package-private',
        isStatic: !!isStatic,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean)
      });
    }
  }

  parseVariableDeclaration(line, lineNum) {
    const match = line.match(/^(int|String|double|float|boolean|char|long|short|byte|var)\s+(\w+)(?:\s*=\s*(.+))?;?/);
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

  parseObjectInstantiation(line, lineNum) {
    const match = line.match(/(\w+)\s+(\w+)\s*=\s*new\s+(\w+)\s*\((.*)\)/);
    if (match) {
      const [, type, name, className, args] = match;
      
      const varInfo = this.trackVariable(name, `new ${className}()`, 'object');
      this.trackHeapAllocation(name, `${className} instance`, 'object');
      
      this.addStep('object_instantiation', {
        description: `${type} ${name} = new ${className}(${args})`,
        line: lineNum,
        variable: varInfo,
        className,
        arguments: args,
        memoryOperation: 'heap_allocation'
      });
    }
  }

  parseSystemOut(line, lineNum) {
    const match = line.match(/System\.out\.(print|println)\s*\((.*)\)/);
    if (match) {
      const [, method, content] = match;
      this.addStep('print_output', {
        description: `System.out.${method}(${content})`,
        line: lineNum,
        method: `System.out.${method}`,
        output: content
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

  getDefaultValue(type) {
    const defaults = {
      'int': 0, 'long': 0, 'short': 0, 'byte': 0,
      'double': 0.0, 'float': 0.0,
      'boolean': false,
      'char': "''",
      'String': 'null'
    };
    return defaults[type] ?? 'null';
  }
}

export default JavaParser;
