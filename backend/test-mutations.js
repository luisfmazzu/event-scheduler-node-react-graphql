/**
 * Test script for RSVP mutations
 * 
 * Tests the rsvpToEvent and cancelRsvp mutations
 */

const fetch = require('node-fetch');

const GRAPHQL_URL = 'http://localhost:4000/graphql';

// Test RSVP to event mutation
async function testRsvpToEvent() {
  console.log('Testing RSVP to Event mutation...');
  
  const mutation = `
    mutation {
      rsvpToEvent(eventId: "1", userId: "1") {
        success
        message
        event {
          id
          title
          attendeeCount
        }
        user {
          id
          name
        }
        errors
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();
    console.log('RSVP Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing RSVP:', error);
  }
}

// Test cancel RSVP mutation
async function testCancelRsvp() {
  console.log('\nTesting Cancel RSVP mutation...');
  
  const mutation = `
    mutation {
      cancelRsvp(eventId: "1", userId: "1") {
        success
        message
        event {
          id
          title
          attendeeCount
        }
        user {
          id
          name
        }
        errors
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();
    console.log('Cancel RSVP Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing cancel RSVP:', error);
  }
}

// Test duplicate RSVP (should fail)
async function testDuplicateRsvp() {
  console.log('\nTesting duplicate RSVP (should fail)...');
  
  const mutation = `
    mutation {
      rsvpToEvent(eventId: "1", userId: "1") {
        success
        message
        errors
      }
    }
  `;

  try {
    // First RSVP
    await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation }),
    });
    
    // Duplicate RSVP (should fail)
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();
    console.log('Duplicate RSVP Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing duplicate RSVP:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting RSVP mutation tests...\n');
  
  await testRsvpToEvent();
  await testCancelRsvp();
  await testDuplicateRsvp();
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(console.error); 