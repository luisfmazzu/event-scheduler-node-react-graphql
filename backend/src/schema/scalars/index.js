/**
 * Custom GraphQL Scalar Types
 * 
 * Implements custom scalar types for enhanced type safety
 * Includes DateTime and Email validation
 */

const { GraphQLScalarType, GraphQLError } = require('graphql');
const { Kind } = require('graphql/language');

// DateTime scalar type
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date and time string in ISO 8601 format',
  
  serialize(value) {
    // Convert from internal representation to JSON
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Invalid DateTime value: ${value}`);
      }
      return date.toISOString();
    }
    throw new GraphQLError(`Invalid DateTime value: ${value}`);
  },
  
  parseValue(value) {
    // Convert from JSON input to internal representation
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Invalid DateTime value: ${value}`);
      }
      return date;
    }
    throw new GraphQLError(`Invalid DateTime value: ${value}`);
  },
  
  parseLiteral(ast) {
    // Convert from GraphQL literal to internal representation
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Invalid DateTime value: ${ast.value}`);
      }
      return date;
    }
    throw new GraphQLError(`Invalid DateTime literal: ${ast.kind}`);
  }
});

// Email scalar type
const Email = new GraphQLScalarType({
  name: 'Email',
  description: 'Email address string with validation',
  
  serialize(value) {
    // Convert from internal representation to JSON
    if (typeof value === 'string') {
      if (!isValidEmail(value)) {
        throw new GraphQLError(`Invalid email format: ${value}`);
      }
      return value;
    }
    throw new GraphQLError(`Invalid email value: ${value}`);
  },
  
  parseValue(value) {
    // Convert from JSON input to internal representation
    if (typeof value === 'string') {
      if (!isValidEmail(value)) {
        throw new GraphQLError(`Invalid email format: ${value}`);
      }
      return value;
    }
    throw new GraphQLError(`Invalid email value: ${value}`);
  },
  
  parseLiteral(ast) {
    // Convert from GraphQL literal to internal representation
    if (ast.kind === Kind.STRING) {
      if (!isValidEmail(ast.value)) {
        throw new GraphQLError(`Invalid email format: ${ast.value}`);
      }
      return ast.value;
    }
    throw new GraphQLError(`Invalid email literal: ${ast.kind}`);
  }
});

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL scalar type
const URL = new GraphQLScalarType({
  name: 'URL',
  description: 'URL string with validation',
  
  serialize(value) {
    if (typeof value === 'string') {
      if (!isValidURL(value)) {
        throw new GraphQLError(`Invalid URL format: ${value}`);
      }
      return value;
    }
    throw new GraphQLError(`Invalid URL value: ${value}`);
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      if (!isValidURL(value)) {
        throw new GraphQLError(`Invalid URL format: ${value}`);
      }
      return value;
    }
    throw new GraphQLError(`Invalid URL value: ${value}`);
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      if (!isValidURL(ast.value)) {
        throw new GraphQLError(`Invalid URL format: ${ast.value}`);
      }
      return ast.value;
    }
    throw new GraphQLError(`Invalid URL literal: ${ast.kind}`);
  }
});

// URL validation helper function
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// PositiveInt scalar type
const PositiveInt = new GraphQLScalarType({
  name: 'PositiveInt',
  description: 'Positive integer value (greater than 0)',
  
  serialize(value) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new GraphQLError(`Invalid PositiveInt value: ${value}`);
    }
    return num;
  },
  
  parseValue(value) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new GraphQLError(`Invalid PositiveInt value: ${value}`);
    }
    return num;
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      const num = parseInt(ast.value, 10);
      if (isNaN(num) || num <= 0) {
        throw new GraphQLError(`Invalid PositiveInt value: ${ast.value}`);
      }
      return num;
    }
    throw new GraphQLError(`Invalid PositiveInt literal: ${ast.kind}`);
  }
});

module.exports = {
  DateTime,
  Email,
  URL,
  PositiveInt
}; 