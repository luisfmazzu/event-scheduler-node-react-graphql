/**
 * GraphQL API Test Script
 * 
 * Tests the implemented GraphQL queries to verify Phase 1.3 completion
 */

const { promisify } = require('util');
const { exec } = require('child_process');
const execPromise = promisify(exec);

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

// Test queries to verify implementation
const testQueries = [
  {
    name: 'Hello Query',
    query: '{ hello }',
    expected: 'Hello from Event Scheduler GraphQL API!'
  },
  {
    name: 'System Status',
    query: '{ status { message version timestamp } }',
    expected: 'Event Scheduler GraphQL API is running'
  },
  {
    name: 'Database Status',
    query: '{ dbStatus { connected healthy path } }',
    expected: true
  },
  {
    name: 'Events List',
    query: '{ events { id title date location } }',
    expected: 'array'
  },
  {
    name: 'Events with Organizer',
    query: '{ events { id title organizer { name email } } }',
    expected: 'nested'
  },
  {
    name: 'Users List',
    query: '{ users { id name email } }',
    expected: 'array'
  },
  {
    name: 'Specific Event',
    query: '{ event(id: "1") { id title description organizer { name } attendees { name } } }',
    expected: 'object'
  },
  {
    name: 'Upcoming Events',
    query: '{ upcomingEvents { id title date } }',
    expected: 'array'
  },
  {
    name: 'Event with Computed Fields',
    query: '{ events { id title attendeeCount availableSpots maxAttendees } }',
    expected: 'computed'
  },
  {
    name: 'User with Relationships',
    query: '{ user(id: "1") { id name organizedEvents { title } attendingEvents { title } } }',
    expected: 'relationships'
  }
];

async function testGraphQLQuery(query, testName) {
  try {
    // Use -s flag to suppress progress information
    const curlCommand = `curl -s -X POST ${GRAPHQL_ENDPOINT} -H "Content-Type: application/json" -d "{\\"query\\": \\"${query}\\"}"`;
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.error(`❌ ${testName} - Error:`, stderr);
      return false;
    }
    
    let response;
    try {
      response = JSON.parse(stdout);
    } catch (parseError) {
      console.error(`❌ ${testName} - JSON Parse Error:`, parseError.message);
      console.error(`   Raw response:`, stdout);
      return false;
    }
    
    if (response.errors) {
      console.error(`❌ ${testName} - GraphQL Errors:`, response.errors);
      return false;
    }
    
    if (response.data) {
      console.log(`✅ ${testName} - Success`);
      console.log(`   Response:`, JSON.stringify(response.data, null, 2).slice(0, 200) + '...');
      return true;
    }
    
    console.error(`❌ ${testName} - No data returned`);
    return false;
  } catch (error) {
    console.error(`❌ ${testName} - Test failed:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing GraphQL API Implementation - Phase 1.3');
  console.log('=' .repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testQueries) {
    const success = await testGraphQLQuery(test.query, test.name);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    console.log(); // Empty line for readability
  }
  
  console.log('=' .repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Phase 1.3 implementation is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the server and database status.');
  }
}

// Run the tests
runTests().catch(console.error); 