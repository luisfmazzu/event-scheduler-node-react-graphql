/**
 * Database Migration Runner
 * 
 * Handles database schema migrations and tracks migration history
 * for the Event Scheduler application.
 */

const fs = require('fs');
const path = require('path');
const dbManager = require('../database');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname);
    this.migrationTableName = 'migrations';
  }

  /**
   * Initialize migrations table to track applied migrations
   */
  async initMigrationsTable() {
    try {
      const db = dbManager.getConnection();
      
      // Create migrations table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename VARCHAR(255) NOT NULL UNIQUE,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(64)
        )
      `;
      
      db.exec(createTableQuery);
      console.log(`📋 Migration tracking table initialized`);
    } catch (error) {
      console.error('❌ Failed to initialize migrations table:', error);
      throw error;
    }
  }

  /**
   * Calculate checksum for migration content
   */
  calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Get list of applied migrations
   */
  getAppliedMigrations() {
    try {
      const db = dbManager.getConnection();
      const query = `SELECT filename FROM ${this.migrationTableName} ORDER BY applied_at`;
      const results = db.prepare(query).all();
      return results.map(row => row.filename);
    } catch (error) {
      console.error('❌ Failed to get applied migrations:', error);
      return [];
    }
  }

  /**
   * Get list of available migration files
   */
  getAvailableMigrations() {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort();
    } catch (error) {
      console.error('❌ Failed to get available migrations:', error);
      return [];
    }
  }

  /**
   * Parse SQL content into executable statements
   * Handles complex statements like triggers with nested semicolons
   */
  parseSQL(content) {
    const statements = [];
    let currentStatement = '';
    let inTrigger = false;
    let triggerDepth = 0;
    
    // Split by lines first to handle comments and complex statements
    const lines = content.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('--')) {
        continue;
      }
      
      // Check if we're starting a trigger
      if (line.toUpperCase().includes('CREATE TRIGGER')) {
        inTrigger = true;
        triggerDepth = 0;
      }
      
      // Add line to current statement
      if (currentStatement) {
        currentStatement += ' ' + line;
      } else {
        currentStatement = line;
      }
      
      // Handle trigger depth
      if (inTrigger) {
        if (line.toUpperCase().includes('BEGIN')) {
          triggerDepth++;
        }
        if (line.toUpperCase().includes('END')) {
          triggerDepth--;
        }
      }
      
      // Check if statement is complete
      if (line.endsWith(';')) {
        if (inTrigger && triggerDepth > 0) {
          // Inside trigger, don't split yet
          continue;
        } else {
          // Statement is complete
          statements.push(currentStatement.slice(0, -1)); // Remove semicolon
          currentStatement = '';
          inTrigger = false;
        }
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement);
    }
    
    return statements.filter(s => s.trim().length > 0);
  }

  /**
   * Execute a single migration file
   */
  async executeMigration(filename) {
    try {
      const filePath = path.join(this.migrationsPath, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const checksum = this.calculateChecksum(content);
      
      const db = dbManager.getConnection();
      
      // Execute migration in transaction
      const transaction = db.transaction(() => {
        // Parse SQL content into statements
        const statements = this.parseSQL(content);
        
        console.log(`📋 Executing ${statements.length} statements for ${filename}`);
        
        statements.forEach((statement, index) => {
          if (statement.trim()) {
            try {
              db.exec(statement);
              console.log(`  ✅ Statement ${index + 1} executed`);
            } catch (error) {
              console.error(`  ❌ Statement ${index + 1} failed:`, statement.substring(0, 100) + '...');
              throw error;
            }
          }
        });
        
        // Record migration as applied
        const insertQuery = `
          INSERT INTO ${this.migrationTableName} (filename, checksum)
          VALUES (?, ?)
        `;
        db.prepare(insertQuery).run(filename, checksum);
      });
      
      transaction();
      
      console.log(`✅ Migration applied: ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to execute migration ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations() {
    try {
      console.log('🔄 Starting database migrations...');
      
      // Connect to database if not already connected
      if (!dbManager.isConnected) {
        await dbManager.connect();
      }
      
      // Initialize migrations table
      await this.initMigrationsTable();
      
      // Get applied and available migrations
      const appliedMigrations = this.getAppliedMigrations();
      const availableMigrations = this.getAvailableMigrations();
      
      // Find pending migrations
      const pendingMigrations = availableMigrations.filter(
        migration => !appliedMigrations.includes(migration)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found');
        return;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(migration => {
        console.log(`  - ${migration}`);
      });
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log(`🎉 Successfully applied ${pendingMigrations.length} migrations`);
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  getMigrationStatus() {
    try {
      const applied = this.getAppliedMigrations();
      const available = this.getAvailableMigrations();
      const pending = available.filter(migration => !applied.includes(migration));
      
      return {
        applied,
        available,
        pending,
        total: available.length,
        appliedCount: applied.length,
        pendingCount: pending.length,
        error: null
      };
    } catch (error) {
      return {
        applied: [],
        available: [],
        pending: [],
        total: 0,
        appliedCount: 0,
        pendingCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Reset database by dropping all tables and rerunning migrations
   * WARNING: This will delete all data!
   */
  async resetDatabase() {
    try {
      console.log('⚠️  Resetting database - this will delete all data!');
      
      const db = dbManager.getConnection();
      
      // Get all tables
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();
      
      // Drop all tables
      const transaction = db.transaction(() => {
        tables.forEach(table => {
          db.exec(`DROP TABLE IF EXISTS ${table.name}`);
          console.log(`🗑️  Dropped table: ${table.name}`);
        });
      });
      
      transaction();
      
      // Run migrations from scratch
      await this.runMigrations();
      
      console.log('🎉 Database reset complete');
      
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const migrationRunner = new MigrationRunner();

module.exports = migrationRunner; 