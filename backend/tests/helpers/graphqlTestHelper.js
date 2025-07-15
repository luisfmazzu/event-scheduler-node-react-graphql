/**
 * GraphQL Test Helper
 * 
 * Provides utilities for testing GraphQL queries and mutations
 */

const { graphql } = require('graphql');
const schema = require('../../src/schema');
const TestDatabase = require('./testDb');

class GraphQLTestHelper {
  constructor() {
    this.testDb = new TestDatabase();
    this.contextValue = {};
  }

  /**
   * Sets up the test environment
   */
  async setup() {
    const db = await this.testDb.setup();
    await this.testDb.seedData();
    
    // Set up context with database and loaders
    this.contextValue = {
      db,
      // Mock authenticated user for tests
      user: { id: 1, name: 'John Doe', email: 'john@example.com' },
      // DataLoader setup would go here if needed
    };
  }

  /**
   * Executes a GraphQL query/mutation
   */
  async executeGraphQL(source, variableValues = {}, contextValue = null) {
    const result = await graphql({
      schema,
      source,
      variableValues,
      contextValue: contextValue || this.contextValue,
    });

    return result;
  }

  /**
   * Executes a query and expects it to succeed
   */
  async expectQuerySuccess(source, variableValues = {}) {
    const result = await this.executeGraphQL(source, variableValues);
    
    if (result.errors) {
      throw new Error(`Query failed with errors: ${JSON.stringify(result.errors, null, 2)}`);
    }
    
    return result.data;
  }

  /**
   * Executes a query and expects it to fail
   */
  async expectQueryError(source, variableValues = {}) {
    const result = await this.executeGraphQL(source, variableValues);
    
    if (!result.errors || result.errors.length === 0) {
      throw new Error('Expected query to fail but it succeeded');
    }
    
    return result.errors;
  }

  /**
   * Executes a mutation and expects it to succeed
   */
  async expectMutationSuccess(source, variableValues = {}) {
    return this.expectQuerySuccess(source, variableValues);
  }

  /**
   * Executes a mutation and expects it to fail
   */
  async expectMutationError(source, variableValues = {}) {
    return this.expectQueryError(source, variableValues);
  }

  /**
   * Sets the authenticated user context
   */
  setAuthenticatedUser(user) {
    this.contextValue.user = user;
  }

  /**
   * Removes authentication (unauthenticated context)
   */
  setUnauthenticated() {
    this.contextValue.user = null;
  }

  /**
   * Gets direct database access for assertions
   */
  getDb() {
    return this.testDb.getDb();
  }

  /**
   * Clears test data
   */
  async clearData() {
    await this.testDb.clearData();
    await this.testDb.seedData();
  }

  /**
   * Cleans up the test environment
   */
  async teardown() {
    await this.testDb.teardown();
  }
}

module.exports = GraphQLTestHelper; 