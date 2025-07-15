/**
 * Test Advanced GraphQL Features
 * 
 * Tests DataLoader optimization, custom scalars, and complex queries
 */

const { execSync } = require('child_process');

// Test queries
const testQueries = [
  {
    name: 'Test DataLoader with Event and Organizer',
    query: `
      query TestDataLoader {
        events {
          id
          title
          date
          organizer {
            id
            name
            email
          }
          attendeeCount
          attendees {
            id
            name
            email
          }
        }
      }
    `
  },
  {
    name: 'Test Custom Scalars',
    query: `
      query TestCustomScalars {
        events {
          id
          title
          date
          createdAt
          organizer {
            email
          }
        }
      }
    `
  },
  {
    name: 'Test Complex Nested Query',
    query: `
      query TestComplexQuery {
        events {
          id
          title
          organizer {
            id
            name
            organizedEvents {
              id
              title
              attendeeCount
            }
          }
        }
      }
    `
  }
];

// Test mutations with custom scalars
const testMutations = [
  {
    name: 'Test Event Creation with Custom Scalars',
    query: `
      mutation TestCreateEvent {
        createEvent(input: {
          title: "Test Event with Custom Scalars"
          description: "Testing DateTime and PositiveInt scalars"
          date: "2024-12-31T18:00:00Z"
          location: "Test Location"
          maxAttendees: 50
        }) {
          event {
            id
            title
            date
            maxAttendees
          }
          errors {
            message
            field
          }
        }
      }
    `
  }
];

// Function to run GraphQL query
function runGraphQLQuery(query) {
  const curlCommand = `curl -X POST http://localhost:4000/graphql ` +
    `-H "Content-Type: application/json" ` +
    `-d '${JSON.stringify({ query })}'`;
  
  try {
    const result = execSync(curlCommand, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error running query:', error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing Advanced GraphQL Features\n');
  
  // Test queries
  console.log('📊 Testing Queries with DataLoader...\n');
  for (const test of testQueries) {
    console.log(`Testing: ${test.name}`);
    const result = runGraphQLQuery(test.query);
    
    if (result && result.data) {
      console.log('✅ Query successful');
      console.log('📋 Sample data:', JSON.stringify(result.data, null, 2).substring(0, 200) + '...\n');
    } else {
      console.log('❌ Query failed');
      console.log('Error:', result?.errors || 'Unknown error\n');
    }
  }
  
  // Test mutations
  console.log('🔄 Testing Mutations with Custom Scalars...\n');
  for (const test of testMutations) {
    console.log(`Testing: ${test.name}`);
    const result = runGraphQLQuery(test.query);
    
    if (result && result.data) {
      console.log('✅ Mutation successful');
      console.log('📋 Result:', JSON.stringify(result.data, null, 2) + '\n');
    } else {
      console.log('❌ Mutation failed');
      console.log('Error:', result?.errors || 'Unknown error\n');
    }
  }
  
  console.log('🎯 Advanced Features Test Complete');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
} 