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
      throw error;
    }
  }

  /**
   * Get list of available migration files
   */
  getAvailableMigrations() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();
      return files;
    } catch (error) {
      console.error('❌ Failed to read migration files:', error);
      throw error;
    }
  }

  /**
   * Calculate checksum for migration file content
   */
  calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
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
        // Split content by semicolon and execute each statement
        const statements = content
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        statements.forEach(statement => {
          if (statement.trim()) {
            db.exec(statement);
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
      // Connect to database if not already connected
      if (!dbManager.isConnected) {
        // This is a sync method, so we need to handle connection differently
        // For now, return error status if not connected
        return {
          error: 'Database not connected. Run migrations first.',
          applied: [],
          available: this.getAvailableMigrations(),
          pending: this.getAvailableMigrations(),
          total: this.getAvailableMigrations().length,
          appliedCount: 0,
          pendingCount: this.getAvailableMigrations().length
        };
      }
      
      const appliedMigrations = this.getAppliedMigrations();
      const availableMigrations = this.getAvailableMigrations();
      const pendingMigrations = availableMigrations.filter(
        migration => !appliedMigrations.includes(migration)
      );
      
      return {
        applied: appliedMigrations,
        available: availableMigrations,
        pending: pendingMigrations,
        total: availableMigrations.length,
        appliedCount: appliedMigrations.length,
        pendingCount: pendingMigrations.length
      };
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      return {
        error: error.message,
        applied: [],
        available: [],
        pending: [],
        total: 0,
        appliedCount: 0,
        pendingCount: 0
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

module.exports = new MigrationRunner(); 