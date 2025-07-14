/**
 * Relay Compiler Configuration
 * 
 * This configuration defines how the Relay compiler processes GraphQL
 * queries, mutations, and fragments in the Event Scheduler application.
 * 
 * @see https://relay.dev/docs/guides/compiler/
 */
module.exports = {
  // Source directory containing GraphQL operations
  src: './src',
  
  // Target language for generated artifacts
  language: 'typescript',
  
  // Path to the GraphQL schema file
  schema: './schema/schema.graphql',
  
  // Directories and files to exclude from compilation
  exclude: [
    '**/node_modules/**',
    '**/__mocks__/**', 
    '**/__generated__/**'
  ],
  
  // Directory where generated artifacts will be placed
  artifactDirectory: './src/__generated__'
}; 