/**
 * Base Parser - Abstract class for language-specific parsers
 * Provides common functionality for code visualization
 */
class BaseParser {
  constructor(language) {
    this.language = language;
    this.steps = [];
    this.variables = new Map();
    this.callStack = [];
    this.memory = {
      stack: [],
      heap: []
    };
    this.stepCounter = 0;
  }

  /**
   * Parse code and generate visualization steps
   * @param {string} code - Source code to parse
   * @returns {Object} Visualization result
   */
  parse(code) {
    throw new Error('parse() must be implemented by subclass');
  }

  /**
   * Add a visualization step
   */
  addStep(type, data) {
    this.stepCounter++;
    this.steps.push({
      step: this.stepCounter,
      type,
      timestamp: Date.now(),
      ...data
    });
  }

  /**
   * Track variable declaration/assignment
   */
  trackVariable(name, value, type, scope = 'local') {
    const varInfo = {
      name,
      value,
      type,
      scope,
      address: this.generateAddress()
    };
    this.variables.set(name, varInfo);
    
    // Add to stack memory
    this.memory.stack.push({
      name,
      value,
      type,
      size: this.estimateSize(value, type)
    });
    
    return varInfo;
  }

  /**
   * Track heap allocation (objects, arrays)
   */
  trackHeapAllocation(name, value, type) {
    const heapItem = {
      id: `heap_${this.memory.heap.length}`,
      name,
      value,
      type,
      size: this.estimateSize(value, type),
      address: this.generateHeapAddress()
    };
    this.memory.heap.push(heapItem);
    return heapItem;
  }

  /**
   * Push function to call stack
   */
  pushCallStack(funcName, args = []) {
    this.callStack.push({
      name: funcName,
      arguments: args,
      localVariables: [],
      returnAddress: this.stepCounter
    });
  }

  /**
   * Pop function from call stack
   */
  popCallStack() {
    return this.callStack.pop();
  }

  /**
   * Generate mock memory address
   */
  generateAddress() {
    return `0x${(Math.floor(Math.random() * 0xFFFF) + 0x1000).toString(16)}`;
  }

  generateHeapAddress() {
    return `0x${(Math.floor(Math.random() * 0xFFFF) + 0x8000).toString(16)}`;
  }

  /**
   * Estimate memory size of a value
   */
  estimateSize(value, type) {
    const sizes = {
      'int': 4,
      'integer': 4,
      'float': 8,
      'double': 8,
      'boolean': 1,
      'bool': 1,
      'char': 1,
      'string': value ? String(value).length * 2 : 0,
      'array': 24,
      'object': 32,
      'pointer': 8
    };
    return sizes[type?.toLowerCase()] || 8;
  }

  /**
   * Get final visualization result
   */
  getResult() {
    // Convert steps to execution format expected by frontend
    const execution = this.steps.map((step, index) => ({
      stepId: index,
      lineNumber: step.line || 1,
      code: step.description || '',
      type: step.type,
      variables: Object.fromEntries(
        Array.from(this.variables.entries()).map(([name, info]) => [
          name,
          { value: info.value, type: info.type, memory: info.address }
        ])
      ),
      callStack: this.callStack.map(f => f.name),
      output: step.output || null
    }));

    return {
      success: true,
      language: this.language,
      execution: execution,
      totalSteps: this.stepCounter,
      memory: this.memory
    };
  }
}

module.exports = BaseParser;
