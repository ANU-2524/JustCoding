/**
 * Operational Transformation (OT) Engine
 * Implements conflict-free collaborative editing
 */

class Operation {
  constructor(type, position, data, userId, timestamp) {
    this.type = type; // 'insert', 'delete', 'retain'
    this.position = position;
    this.data = data;
    this.userId = userId;
    this.timestamp = timestamp || Date.now();
    this.id = `${userId}-${this.timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static insert(position, text, userId) {
    return new Operation('insert', position, text, userId);
  }

  static delete(position, length, userId) {
    return new Operation('delete', position, length, userId);
  }
}

class OperationalTransform {
  constructor() {
    this.documents = new Map(); // documentId -> { content, version, operations }
  }

  /**
   * Initialize a new document
   */
  initDocument(documentId, initialContent = '') {
    this.documents.set(documentId, {
      content: initialContent,
      version: 0,
      operations: [],
      cursors: new Map()
    });
    return this.getDocument(documentId);
  }

  /**
   * Get document state
   */
  getDocument(documentId) {
    return this.documents.get(documentId);
  }

  /**
   * Transform operation against another operation
   * Core OT algorithm for conflict resolution
   */
  transform(op1, op2) {
    // If same user, no transform needed
    if (op1.userId === op2.userId) return op1;

    const transformed = { ...op1 };

    if (op1.type === 'insert' && op2.type === 'insert') {
      // Both inserting
      if (op2.position <= op1.position) {
        transformed.position += op2.data.length;
      }
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      // op1 inserts, op2 deletes
      if (op2.position < op1.position) {
        transformed.position = Math.max(op2.position, op1.position - op2.data);
      }
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      // op1 deletes, op2 inserts
      if (op2.position <= op1.position) {
        transformed.position += op2.data.length;
      }
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      // Both deleting
      if (op2.position < op1.position) {
        transformed.position = Math.max(0, op1.position - op2.data);
      } else if (op2.position < op1.position + op1.data) {
        // Overlapping deletes
        const overlap = Math.min(op1.position + op1.data, op2.position + op2.data) - 
                       Math.max(op1.position, op2.position);
        transformed.data = Math.max(0, op1.data - overlap);
      }
    }

    return new Operation(
      transformed.type,
      transformed.position,
      transformed.data,
      transformed.userId,
      transformed.timestamp
    );
  }

  /**
   * Apply operation to document
   */
  applyOperation(documentId, operation, clientVersion) {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error('Document not found');

    // Transform against concurrent operations
    let transformedOp = operation;
    const concurrentOps = doc.operations.slice(clientVersion);
    
    for (const serverOp of concurrentOps) {
      transformedOp = this.transform(transformedOp, serverOp);
    }

    // Apply the transformed operation
    let newContent = doc.content;
    
    if (transformedOp.type === 'insert') {
      newContent = 
        doc.content.slice(0, transformedOp.position) + 
        transformedOp.data + 
        doc.content.slice(transformedOp.position);
    } else if (transformedOp.type === 'delete') {
      newContent = 
        doc.content.slice(0, transformedOp.position) + 
        doc.content.slice(transformedOp.position + transformedOp.data);
    }

    // Update document state
    doc.content = newContent;
    doc.version++;
    doc.operations.push(transformedOp);

    // Limit operation history
    if (doc.operations.length > 1000) {
      doc.operations = doc.operations.slice(-500);
    }

    return {
      operation: transformedOp,
      version: doc.version,
      content: doc.content
    };
  }

  /**
   * Update cursor position for a user
   */
  updateCursor(documentId, userId, position, selection = null) {
    const doc = this.documents.get(documentId);
    if (!doc) return null;

    doc.cursors.set(userId, {
      position,
      selection,
      timestamp: Date.now()
    });

    return {
      userId,
      position,
      selection,
      cursors: Object.fromEntries(doc.cursors)
    };
  }

  /**
   * Get all cursors for a document
   */
  getCursors(documentId) {
    const doc = this.documents.get(documentId);
    if (!doc) return {};
    return Object.fromEntries(doc.cursors);
  }

  /**
   * Remove user cursor
   */
  removeCursor(documentId, userId) {
    const doc = this.documents.get(documentId);
    if (doc) {
      doc.cursors.delete(userId);
    }
  }

  /**
   * Clean up document
   */
  deleteDocument(documentId) {
    this.documents.delete(documentId);
  }
}

module.exports = { OperationalTransform, Operation };
