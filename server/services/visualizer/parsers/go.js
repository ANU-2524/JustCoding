/**
 * Go Parser for Code Visualization
 */
import BaseParser from './baseParser.js';

class GoParser extends BaseParser {
  constructor() {
    super('go');
  }

  parse(code) {
    const lines = code.split('\n');
    
    this.addStep('start', {
      description: 'Go program execution begins',
      line: 1
    });

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      const lineNum = index + 1;

      // Package declaration
      if (trimmed.startsWith('package ')) {
        this.parsePackage(trimmed, lineNum);
      }
      // Import statement
      else if (trimmed.startsWith('import ')) {
        this.parseImport(trimmed, lineNum);
      }
      // Function declaration
      else if (trimmed.startsWith('func ')) {
        this.parseFuncDeclaration(trimmed, lineNum);
      }
      // Variable declaration with var
      else if (trimmed.startsWith('var ')) {
        this.parseVarDeclaration(trimmed, lineNum);
      }
      // Short variable declaration :=
      else if (trimmed.match(/^\w+\s*:=/)) {
        this.parseShortDeclaration(trimmed, lineNum);
      }
      // fmt.Println
      else if (trimmed.match(/fmt\.(Print|Println|Printf)/)) {
        this.parseFmtPrint(trimmed, lineNum);
      }
      // For loop
      else if (trimmed.startsWith('for ')) {
        this.parseForLoop(trimmed, lineNum);
      }
      // If statement
      else if (trimmed.startsWith('if ')) {
        this.parseIf(trimmed, lineNum);
      }
      // Return statement
      else if (trimmed.startsWith('return ')) {
        this.parseReturn(trimmed, lineNum);
      }
      // Struct definition
      else if (trimmed.match(/^type\s+\w+\s+struct/)) {
        this.parseStruct(trimmed, lineNum);
      }
      // Make (slice, map, channel)
      else if (trimmed.includes('make(')) {
        this.parseMake(trimmed, lineNum);
      }
    });

    this.addStep('end', {
      description: 'Go program execution complete',
      line: lines.length
    });

    return this.getResult();
  }

  parsePackage(line, lineNum) {
    const match = line.match(/^package\s+(\w+)/);
    if (match) {
      this.addStep('package_declaration', {
        description: `Package: ${match[1]}`,
        line: lineNum,
        packageName: match[1]
      });
    }
  }

  parseImport(line, lineNum) {
    const match = line.match(/^import\s+"(.+)"/);
    if (match) {
      this.addStep('import', {
        description: `Import: ${match[1]}`,
        line: lineNum,
        module: match[1]
      });
    }
  }

  parseFuncDeclaration(line, lineNum) {
    const match = line.match(/^func\s+(\w+)\s*\((.*)\)(?:\s*(\w+|\(.*\)))?/);
    if (match) {
      const [, name, params, returnType] = match;
      this.pushCallStack(name);
      
      this.addStep('function_declaration', {
        description: `Function '${name}' declared${returnType ? ` returning ${returnType}` : ''}`,
        line: lineNum,
        functionName: name,
        parameters: params.split(',').map(p => p.trim()).filter(Boolean),
        returnType: returnType || 'void'
      });
    }
  }

  parseVarDeclaration(line, lineNum) {
    const match = line.match(/^var\s+(\w+)\s+(\w+)(?:\s*=\s*(.+))?/);
    if (match) {
      const [, name, type, valueStr] = match;
      const value = valueStr || this.getDefaultValue(type);
      
      const varInfo = this.trackVariable(name, value, type);
      
      this.addStep('variable_declaration', {
        description: `var ${name} ${type}${valueStr ? ` = ${valueStr}` : ''}`,
        line: lineNum,
        variable: varInfo,
        memoryOperation: 'stack_push'
      });
    }
  }

  parseShortDeclaration(line, lineNum) {
    const match = line.match(/^(\w+)\s*:=\s*(.+)$/);
    if (match) {
      const [, name, valueStr] = match;
      const { value, type } = this.evaluateValue(valueStr);
      
      const varInfo = this.trackVariable(name, value, type);
      
      if (['slice', 'map', 'pointer'].includes(type)) {
        this.trackHeapAllocation(name, value, type);
      }

      this.addStep('short_declaration', {
        description: `${name} := ${valueStr}`,
        line: lineNum,
        variable: varInfo,
        memoryOperation: ['slice', 'map', 'pointer'].includes(type) ? 'heap_allocation' : 'stack_push'
      });
    }
  }

  parseFmtPrint(line, lineNum) {
    const match = line.match(/fmt\.(Print|Println|Printf)\s*\((.*)\)/);
    if (match) {
      const [, method, content] = match;
      this.addStep('print_output', {
        description: `fmt.${method}(${content})`,
        line: lineNum,
        method: `fmt.${method}`,
        output: content
      });
    }
  }

  parseForLoop(line, lineNum) {
    // Standard for loop
    const standardMatch = line.match(/^for\s+(.+);\s*(.+);\s*(.+)\s*{/);
    if (standardMatch) {
      this.addStep('for_loop', {
        description: `For loop: init=${standardMatch[1]}, condition=${standardMatch[2]}, post=${standardMatch[3]}`,
        line: lineNum,
        loopType: 'standard',
        init: standardMatch[1],
        condition: standardMatch[2],
        post: standardMatch[3]
      });
      return;
    }
    
    // Range loop
    const rangeMatch = line.match(/^for\s+(\w+)(?:,\s*(\w+))?\s*:=\s*range\s+(.+)\s*{/);
    if (rangeMatch) {
      this.addStep('for_range', {
        description: `Range loop over ${rangeMatch[3]}`,
        line: lineNum,
        loopType: 'range',
        index: rangeMatch[1],
        value: rangeMatch[2],
        iterable: rangeMatch[3]
      });
      return;
    }

    // While-style loop
    const whileMatch = line.match(/^for\s+(.+)\s*{/);
    if (whileMatch) {
      this.addStep('for_loop', {
        description: `For loop: ${whileMatch[1]}`,
        line: lineNum,
        loopType: 'while-style',
        condition: whileMatch[1]
      });
    }
  }

  parseIf(line, lineNum) {
    const match = line.match(/^if\s+(.+)\s*{/);
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
        description: `Return: ${match[1] || 'void'}`,
        line: lineNum,
        returnValue: match[1] || null
      });
    }
  }

  parseStruct(line, lineNum) {
    const match = line.match(/^type\s+(\w+)\s+struct/);
    if (match) {
      this.addStep('struct_definition', {
        description: `Struct '${match[1]}' defined`,
        line: lineNum,
        structName: match[1]
      });
    }
  }

  parseMake(line, lineNum) {
    const match = line.match(/(\w+)\s*:?=\s*make\((\w+),?\s*(\d+)?\)/);
    if (match) {
      const [, name, type, size] = match;
      this.trackHeapAllocation(name, `make(${type})`, type);
      
      this.addStep('make_allocation', {
        description: `${name} = make(${type}${size ? `, ${size}` : ''})`,
        line: lineNum,
        variable: name,
        allocationType: type,
        size: size ? parseInt(size) : null,
        memoryOperation: 'heap_allocation'
      });
    }
  }

  getDefaultValue(type) {
    const defaults = {
      'int': 0, 'int8': 0, 'int16': 0, 'int32': 0, 'int64': 0,
      'uint': 0, 'uint8': 0, 'uint16': 0, 'uint32': 0, 'uint64': 0,
      'float32': 0.0, 'float64': 0.0,
      'string': '""',
      'bool': false,
      'byte': 0,
      'rune': 0
    };
    return defaults[type] ?? 'nil';
  }

  evaluateValue(valueStr) {
    const trimmed = valueStr.trim();
    
    if (trimmed.startsWith('[]') || trimmed.startsWith('make([]')) {
      return { value: trimmed, type: 'slice' };
    }
    if (trimmed.startsWith('map[') || trimmed.startsWith('make(map')) {
      return { value: trimmed, type: 'map' };
    }
    if (trimmed.startsWith('&')) {
      return { value: trimmed, type: 'pointer' };
    }
    if (trimmed.startsWith('"') || trimmed.startsWith('`')) {
      return { value: trimmed.slice(1, -1), type: 'string' };
    }
    if (!isNaN(trimmed)) {
      return { value: Number(trimmed), type: trimmed.includes('.') ? 'float64' : 'int' };
    }
    if (trimmed === 'true' || trimmed === 'false') {
      return { value: trimmed === 'true', type: 'bool' };
    }
    return { value: trimmed, type: 'unknown' };
  }
}

export default GoParser;
