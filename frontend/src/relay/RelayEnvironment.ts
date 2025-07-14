import {
  Environment,
  Network,
  RecordSource,
  Store,
  RequestParameters,
  Variables,
} from 'relay-runtime';

// Define the GraphQL endpoint (will be updated when backend is ready)
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

// Function to fetch GraphQL queries
async function fetchGraphQL(params: RequestParameters, variables: Variables) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add authorization header when authentication is implemented
      // 'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  const json = await response.json();

  // Handle GraphQL errors
  if (Array.isArray(json.errors)) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(
      `GraphQL error: ${json.errors.map((error: { message: string }) => error.message).join(', ')}`
    );
  }

  return json;
}

// Create a network layer from the fetch function
const network = Network.create(fetchGraphQL);

// Create the Relay environment
const environment = new Environment({
  network,
  store: new Store(new RecordSource()),
  // Enable for development debugging
  isServer: typeof window === 'undefined',
});

export default environment; 