import axios from 'axios';
import redis from 'redis';
import { logger } from './logger.js';

// Initialize Redis client for distributed locks
let redisClient = null;
let isRedisAvailable = false;

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.warn('Redis unavailable for execution queue, using in-memory fallback');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      // Suppress error logs for Redis - it's optional
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected for execution queue');
      isRedisAvailable = true;
    });

    await redisClient.connect();
  } catch (error) {
    // Suppress error - Redis is optional fallback
    isRedisAvailable = false;
  }
};

// Initialize Redis on module load
initRedis();

// In-memory fallback for locks when Redis is unavailable
const memoryLocks = new Map();
const executionQueues = new Map(); // roomId -> array of pending executions

// Language map for Piston API
const languageMap = {
  javascript: { ext: 'js', version: '18.15.0' },
  python: { ext: 'py', version: '3.10.0' },
  java: { ext: 'java', version: '15.0.2' },
  cpp: { ext: 'cpp', version: '10.2.0' },
  c: { ext: 'c', version: '10.2.0' },
  go: { ext: 'go', version: '1.16.2' },
  ruby: { ext: 'rb', version: '3.0.1' },
  php: { ext: 'php', version: '8.2.3' },
  swift: { ext: 'swift', version: '5.3.3' },
  rust: { ext: 'rs', version: '1.68.2' },
};

class ExecutionQueueService {
  /**
   * Acquire distributed lock for a room to prevent concurrent executions
   */
  static async acquireLock(roomId, timeout = 30000) {
    const lockKey = `execution:lock:${roomId}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    const startTime = Date.now();

    // Try Redis first
    if (isRedisAvailable && redisClient) {
      try {
        // Set lock with expiry (30 seconds)
        const acquired = await redisClient.set(lockKey, lockValue, {
          NX: true, // Only set if not exists
          PX: 30000 // Expire after 30 seconds
        });

        if (acquired) {
          logger.debug('Lock acquired (Redis)', { roomId, lockValue });
          return lockValue;
        }

        // Wait for lock with timeout
        while (Date.now() - startTime < timeout) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const acquired = await redisClient.set(lockKey, lockValue, {
            NX: true,
            PX: 30000
          });

          if (acquired) {
            logger.debug('Lock acquired after waiting (Redis)', { roomId, lockValue });
            return lockValue;
          }
        }

        logger.warn('Lock acquisition timeout (Redis)', { roomId, timeout });
        return null;
      } catch (error) {
        logger.error('Redis lock error, falling back to memory', { error: error.message, roomId });
        isRedisAvailable = false;
      }
    }

    // Fallback to in-memory locks
    while (Date.now() - startTime < timeout) {
      if (!memoryLocks.has(roomId)) {
        memoryLocks.set(roomId, { lockValue, timestamp: Date.now() });
        logger.debug('Lock acquired (Memory)', { roomId, lockValue });
        
        // Auto-release after 30 seconds
        setTimeout(() => {
          const currentLock = memoryLocks.get(roomId);
          if (currentLock && currentLock.lockValue === lockValue) {
            memoryLocks.delete(roomId);
            logger.debug('Lock auto-released (Memory)', { roomId });
          }
        }, 30000);
        
        return lockValue;
      }

      // Check for stale locks (older than 30 seconds)
      const existingLock = memoryLocks.get(roomId);
      if (existingLock && Date.now() - existingLock.timestamp > 30000) {
        memoryLocks.delete(roomId);
        logger.warn('Removed stale lock (Memory)', { roomId });
        continue;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.warn('Lock acquisition timeout (Memory)', { roomId, timeout });
    return null;
  }

  /**
   * Release distributed lock
   */
  static async releaseLock(roomId, lockValue) {
    const lockKey = `execution:lock:${roomId}`;

    // Try Redis first
    if (isRedisAvailable && redisClient) {
      try {
        const currentValue = await redisClient.get(lockKey);
        if (currentValue === lockValue) {
          await redisClient.del(lockKey);
          logger.debug('Lock released (Redis)', { roomId, lockValue });
          return true;
        }
      } catch (error) {
        logger.error('Redis unlock error', { error: error.message, roomId });
      }
    }

    // Fallback to in-memory
    const currentLock = memoryLocks.get(roomId);
    if (currentLock && currentLock.lockValue === lockValue) {
      memoryLocks.delete(roomId);
      logger.debug('Lock released (Memory)', { roomId, lockValue });
      return true;
    }

    return false;
  }

  /**
   * Execute code with queueing and locking mechanism
   */
  static async executeCode(options) {
    const {
      roomId,
      userId,
      username,
      code,
      language,
      stdin = '',
      correlationId,
      priority = 0, // Higher priority executes first
      timeout = 10000
    } = options;

    // Validate inputs
    if (!code || !language) {
      throw new Error('Missing required fields: code and language');
    }

    if (code.length > 10000) {
      throw new Error('Code too long. Maximum 10,000 characters allowed.');
    }

    if (stdin && stdin.length > 1000) {
      throw new Error('Input too long. Maximum 1,000 characters allowed.');
    }

    const langInfo = languageMap[language];
    if (!langInfo) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const executionId = correlationId || `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    logger.info('Execution request', {
      executionId,
      roomId,
      userId,
      language,
      codeLength: code.length,
      priority
    });

    // Acquire lock for this room
    const lockValue = await this.acquireLock(roomId, 5000);
    if (!lockValue) {
      throw new Error('Could not acquire execution lock. Room is busy with another execution.');
    }

    try {
      // Execute code via Piston API
      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        {
          language,
          version: langInfo.version,
          stdin: stdin || '',
          files: [{ name: `main.${langInfo.ext}`, content: code }],
        },
        {
          timeout: timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).catch(err => {
        if (err.code === 'ECONNABORTED') {
          throw new Error('Execution timeout. Code took too long to execute.');
        }
        if (err.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before executing again.');
        }
        throw new Error('Code execution service unavailable. Please try again.');
      });

      const output = response.data.run.stdout || response.data.run.stderr || "No output";
      const executionTime = Date.now() - startTime;

      const result = {
        success: true,
        executionId,
        userId,
        username,
        roomId,
        output: output.substring(0, 5000), // Limit output size
        language,
        executionTime,
        timestamp: new Date().toISOString(),
        correlationId
      };

      logger.info('Execution successful', {
        executionId,
        roomId,
        userId,
        executionTime,
        outputLength: output.length
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      logger.error('Execution failed', {
        executionId,
        roomId,
        userId,
        error: error.message,
        executionTime
      });

      return {
        success: false,
        executionId,
        userId,
        username,
        roomId,
        error: error.message,
        language,
        executionTime,
        timestamp: new Date().toISOString(),
        correlationId
      };
    } finally {
      // Always release the lock
      await this.releaseLock(roomId, lockValue);
    }
  }

  /**
   * Add execution to queue (for future Bull integration)
   */
  static async addToQueue(roomId, executionData) {
    if (!executionQueues.has(roomId)) {
      executionQueues.set(roomId, []);
    }

    const queue = executionQueues.get(roomId);
    queue.push({
      ...executionData,
      queuedAt: Date.now()
    });

    // Sort by priority (higher first)
    queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    logger.debug('Added to execution queue', {
      roomId,
      queueLength: queue.length,
      userId: executionData.userId
    });

    return queue.length;
  }

  /**
   * Process queued executions for a room
   */
  static async processQueue(roomId) {
    const queue = executionQueues.get(roomId);
    if (!queue || queue.length === 0) {
      return [];
    }

    const results = [];
    
    while (queue.length > 0) {
      const executionData = queue.shift();
      
      // Check if execution has expired (older than 30 seconds)
      if (Date.now() - executionData.queuedAt > 30000) {
        logger.warn('Skipping expired execution', {
          roomId,
          userId: executionData.userId,
          age: Date.now() - executionData.queuedAt
        });
        continue;
      }

      try {
        const result = await this.executeCode(executionData);
        results.push(result);
      } catch (error) {
        logger.error('Queue processing error', {
          roomId,
          userId: executionData.userId,
          error: error.message
        });
        results.push({
          success: false,
          error: error.message,
          ...executionData
        });
      }
    }

    // Clean up empty queue
    if (queue.length === 0) {
      executionQueues.delete(roomId);
    }

    return results;
  }

  /**
   * Get queue statistics
   */
  static getQueueStats(roomId) {
    if (!roomId) {
      // Return all queues stats
      const stats = {};
      for (const [rid, queue] of executionQueues.entries()) {
        stats[rid] = {
          length: queue.length,
          oldestAge: queue.length > 0 ? Date.now() - queue[queue.length - 1].queuedAt : 0
        };
      }
      return stats;
    }

    const queue = executionQueues.get(roomId);
    if (!queue || queue.length === 0) {
      return { length: 0, oldestAge: 0 };
    }

    return {
      length: queue.length,
      oldestAge: Date.now() - queue[queue.length - 1].queuedAt
    };
  }

  /**
   * Cleanup - close Redis connection
   */
  static async cleanup() {
    if (redisClient && isRedisAvailable) {
      try {
        await redisClient.quit();
        logger.info('Redis connection closed (ExecutionQueue)');
      } catch (error) {
        logger.error('Error closing Redis connection', { error: error.message });
      }
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await ExecutionQueueService.cleanup();
});

process.on('SIGTERM', async () => {
  await ExecutionQueueService.cleanup();
});

export default ExecutionQueueService;
