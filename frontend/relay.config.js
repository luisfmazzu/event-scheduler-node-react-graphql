module.exports = {
  // Configuration options for Relay compiler
  src: './src',
  language: 'typescript',
  schema: './schema/schema.graphql',
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
  artifactDirectory: './src/__generated__',
}; 