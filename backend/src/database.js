/**
 * Database Connection Module
 * 
 * Handles SQLite database connection, initialization, and connection management
 * for the Event Scheduler application.
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database/events.db');
  }

  /**
   * Initialize database connection
   * Creates database file if it doesn't exist
   */
  async connect() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Created database directory: ${dbDir}`);
      }

      // Create database connection
      this.db = new Database(this.dbPath);
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      
      // Set journal mode for better performance
      this.db.pragma('journal_mode = WAL');
      
      // Set synchronous mode for better performance
      this.db.pragma('synchronous = NORMAL');
      
      this.isConnected = true;
      
      console.log(`🗄️  Database connected: ${this.dbPath}`);
      console.log(`📊 Database info:`, {
        readonly: this.db.readonly,
        inTransaction: this.db.inTransaction,
        pragma: {
          foreign_keys: this.db.pragma('foreign_keys'),
          journal_mode: this.db.pragma('journal_mode'),
          synchronous: this.db.pragma('synchronous')
        }
      });
      
      return this.db;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Get database connection
   * @returns {Database} SQLite database instance
   */
  getConnection() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Execute a query with parameters
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object} Query result
   */
  query(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.all(params);
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute a single row query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object} Single row result
   */
  queryOne(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.get(params);
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute an insert/update/delete query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object} Run result with changes info
   */
  run(query, params = []) {
    try {
      const stmt = this.db.prepare(query);
      return stmt.run(params);
    } catch (error) {
      console.error('❌ Database run failed:', error);
      throw new Error(`Database run failed: ${error.message}`);
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Function containing queries
   * @returns {*} Transaction result
   */
  transaction(callback) {
    try {
      return this.db.transaction(callback)();
    } catch (error) {
      console.error('❌ Database transaction failed:', error);
      throw new Error(`Database transaction failed: ${error.message}`);
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean} Connection status
   */
  isConnectionHealthy() {
    try {
      if (!this.isConnected || !this.db) {
        return false;
      }
      // Simple health check query
      this.db.prepare('SELECT 1').get();
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   * @returns {Object} Database statistics
   */
  getStats() {
    try {
      const stats = {
        path: this.dbPath,
        connected: this.isConnected,
        readonly: this.db?.readonly || false,
        inTransaction: this.db?.inTransaction || false,
        size: fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath).size : 0
      };
      
      if (this.isConnected) {
        // Get table count
        const tables = this.query(`
          SELECT COUNT(*) as count 
          FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `);
        stats.tableCount = tables[0]?.count || 0;
      }
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Close database connection
   */
  async close() {
    try {
      if (this.db) {
        this.db.close();
        this.isConnected = false;
        console.log('🗄️  Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager; 