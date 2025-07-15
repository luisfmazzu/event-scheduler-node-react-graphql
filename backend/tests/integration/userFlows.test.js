/**
 * User Flow Integration Tests
 * 
 * Tests complete user workflows from authentication through event management
 */

const GraphQLTestHelper = require('../helpers/graphqlTestHelper');

describe('User Flow Integration Tests', () => {
  let testHelper;

  beforeEach(async () => {
    testHelper = new GraphQLTestHelper();
    await testHelper.setup();
  });

  afterEach(async () => {
    await testHelper.teardown();
  });

  describe('Complete Event Creation Flow', () => {
    it('should allow user to login and create an event', async () => {
      // Step 1: Login
      const loginMutation = `
        mutation($email: String!, $name: String!) {
          login(email: $email, name: $name) {
            user {
              id
              name
              email
            }
            token
          }
        }
      `;

      const loginData = await testHelper.expectMutationSuccess(loginMutation, {
        email: 'organizer@example.com',
        name: 'Event Organizer'
      });

      expect(loginData.login.user).toBeDefined();
      expect(loginData.login.token).toBeDefined();

      // Step 2: Set authenticated user
      testHelper.setAuthenticatedUser(loginData.login.user);

      // Step 3: Create event
      const createEventMutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
              title
              description
              date
              location
              maxAttendees
              organizer {
                id
                name
              }
              attendeeCount
              availableSpots
            }
          }
        }
      `;

      const eventInput = {
        title: 'Integration Test Event',
        description: 'A test event created during integration testing',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Conference Center',
        maxAttendees: 100
      };

      const createData = await testHelper.expectMutationSuccess(createEventMutation, {
        input: eventInput
      });

      expect(createData.createEvent.event.title).toBe(eventInput.title);
      expect(createData.createEvent.event.organizer.id).toBe(loginData.login.user.id);
      expect(createData.createEvent.event.attendeeCount).toBe(0);
      expect(createData.createEvent.event.availableSpots).toBe(100);

      // Step 4: Verify event appears in organizer's events
      const userQuery = `
        query($id: ID!) {
          user(id: $id) {
            id
            organizedEvents {
              id
              title
            }
          }
        }
      `;

      const userData = await testHelper.expectQuerySuccess(userQuery, {
        id: loginData.login.user.id
      });

      const createdEvent = userData.user.organizedEvents.find(
        e => e.title === eventInput.title
      );
      expect(createdEvent).toBeDefined();
    });
  });

  describe('Complete RSVP Flow', () => {
    it('should allow user to discover and RSVP to events', async () => {
      // Step 1: User logs in
      const loginMutation = `
        mutation($email: String!, $name: String!) {
          login(email: $email, name: $name) {
            user {
              id
              name
              email
            }
            token
          }
        }
      `;

      const loginData = await testHelper.expectMutationSuccess(loginMutation, {
        email: 'attendee@example.com',
        name: 'Event Attendee'
      });

      testHelper.setAuthenticatedUser(loginData.login.user);

      // Step 2: Browse available events
      const eventsQuery = `
        query {
          upcomingEvents {
            id
            title
            date
            location
            maxAttendees
            attendeeCount
            availableSpots
            isUserAttending(userId: "${loginData.login.user.id}")
          }
        }
      `;

      const eventsData = await testHelper.expectQuerySuccess(eventsQuery);
      expect(eventsData.upcomingEvents.length).toBeGreaterThan(0);

      // Find an event the user is not attending
      const availableEvent = eventsData.upcomingEvents.find(
        e => !e.isUserAttending && e.availableSpots > 0
      );
      expect(availableEvent).toBeDefined();

      // Step 3: RSVP to event
      const rsvpMutation = `
        mutation($eventId: ID!) {
          rsvpToEvent(eventId: $eventId) {
            event {
              id
              attendeeCount
              isUserAttending(userId: "${loginData.login.user.id}")
              attendees {
                id
                name
              }
            }
            user {
              id
              name
            }
          }
        }
      `;

      const rsvpData = await testHelper.expectMutationSuccess(rsvpMutation, {
        eventId: availableEvent.id
      });

      expect(rsvpData.rsvpToEvent.event.isUserAttending).toBe(true);
      expect(rsvpData.rsvpToEvent.event.attendeeCount).toBe(
        availableEvent.attendeeCount + 1
      );
      expect(rsvpData.rsvpToEvent.user.id).toBe(loginData.login.user.id);

      // Step 4: Verify user appears in event attendees
      const attendeeFound = rsvpData.rsvpToEvent.event.attendees.find(
        a => a.id === loginData.login.user.id
      );
      expect(attendeeFound).toBeDefined();
      expect(attendeeFound.name).toBe(loginData.login.user.name);

      // Step 5: Verify event appears in user's attending events
      const userQuery = `
        query($id: ID!) {
          user(id: $id) {
            id
            attendingEvents {
              id
              title
            }
          }
        }
      `;

      const userData = await testHelper.expectQuerySuccess(userQuery, {
        id: loginData.login.user.id
      });

      const attendingEvent = userData.user.attendingEvents.find(
        e => e.id === availableEvent.id
      );
      expect(attendingEvent).toBeDefined();
    });

    it('should allow user to cancel RSVP', async () => {
      // Setup: User with existing RSVP (User 2 attending Event 1)
      testHelper.setAuthenticatedUser({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com'
      });

      // Step 1: Verify current RSVP status
      const eventQuery = `
        query {
          event(id: "1") {
            id
            title
            attendeeCount
            isUserAttending(userId: "2")
            attendees {
              id
              name
            }
          }
        }
      `;

      const initialData = await testHelper.expectQuerySuccess(eventQuery);
      expect(initialData.event.isUserAttending).toBe(true);
      const initialCount = initialData.event.attendeeCount;

      // Step 2: Cancel RSVP
      const cancelMutation = `
        mutation($eventId: ID!) {
          cancelRsvp(eventId: $eventId) {
            event {
              id
              attendeeCount
              isUserAttending(userId: "2")
              attendees {
                id
                name
              }
            }
            user {
              id
              name
            }
          }
        }
      `;

      const cancelData = await testHelper.expectMutationSuccess(cancelMutation, {
        eventId: '1'
      });

      expect(cancelData.cancelRsvp.event.isUserAttending).toBe(false);
      expect(cancelData.cancelRsvp.event.attendeeCount).toBe(initialCount - 1);

      // Step 3: Verify user no longer in attendee list
      const userNotInList = cancelData.cancelRsvp.event.attendees.find(
        a => a.id === '2'
      );
      expect(userNotInList).toBeUndefined();

      // Step 4: Verify event no longer in user's attending events
      const userQuery = `
        query {
          user(id: "2") {
            id
            attendingEvents {
              id
              title
            }
          }
        }
      `;

      const userData = await testHelper.expectQuerySuccess(userQuery);
      const stillAttending = userData.user.attendingEvents.find(e => e.id === '1');
      expect(stillAttending).toBeUndefined();
    });
  });

  describe('Event Management Flow', () => {
    it('should allow organizer to create, update, and delete events', async () => {
      // Setup organizer
      testHelper.setAuthenticatedUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Step 1: Create event
      const createMutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
              title
              description
              location
            }
          }
        }
      `;

      const eventInput = {
        title: 'Management Test Event',
        description: 'Initial description',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Initial Location'
      };

      const createData = await testHelper.expectMutationSuccess(createMutation, {
        input: eventInput
      });

      const eventId = createData.createEvent.event.id;
      expect(createData.createEvent.event.title).toBe(eventInput.title);

      // Step 2: Update event
      const updateMutation = `
        mutation($id: ID!, $input: UpdateEventInput!) {
          updateEvent(id: $id, input: $input) {
            event {
              id
              title
              description
              location
            }
          }
        }
      `;

      const updateInput = {
        title: 'Updated Management Test Event',
        description: 'Updated description',
        location: 'Updated Location'
      };

      const updateData = await testHelper.expectMutationSuccess(updateMutation, {
        id: eventId,
        input: updateInput
      });

      expect(updateData.updateEvent.event.title).toBe(updateInput.title);
      expect(updateData.updateEvent.event.description).toBe(updateInput.description);
      expect(updateData.updateEvent.event.location).toBe(updateInput.location);

      // Step 3: Verify update in database
      const eventQuery = `
        query($id: ID!) {
          event(id: $id) {
            id
            title
            description
            location
          }
        }
      `;

      const verifyData = await testHelper.expectQuerySuccess(eventQuery, {
        id: eventId
      });

      expect(verifyData.event.title).toBe(updateInput.title);

      // Step 4: Delete event
      const deleteMutation = `
        mutation($id: ID!) {
          deleteEvent(id: $id) {
            deletedEventId
          }
        }
      `;

      const deleteData = await testHelper.expectMutationSuccess(deleteMutation, {
        id: eventId
      });

      expect(deleteData.deleteEvent.deletedEventId).toBe(eventId);

      // Step 5: Verify deletion
      const deletedEventData = await testHelper.expectQuerySuccess(eventQuery, {
        id: eventId
      });

      expect(deletedEventData.event).toBeNull();
    });
  });

  describe('Multi-user Event Interaction Flow', () => {
    it('should handle multiple users interacting with same event', async () => {
      // Step 1: Organizer creates event
      testHelper.setAuthenticatedUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });

      const createMutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
              title
              maxAttendees
              attendeeCount
            }
          }
        }
      `;

      const eventData = await testHelper.expectMutationSuccess(createMutation, {
        input: {
          title: 'Multi-User Test Event',
          description: 'Testing multiple user interactions',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Collaboration Space',
          maxAttendees: 3
        }
      });

      const eventId = eventData.createEvent.event.id;

      // Step 2: First user RSVPs
      testHelper.setAuthenticatedUser({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com'
      });

      const rsvpMutation = `
        mutation($eventId: ID!) {
          rsvpToEvent(eventId: $eventId) {
            event {
              id
              attendeeCount
              availableSpots
            }
          }
        }
      `;

      let rsvpData = await testHelper.expectMutationSuccess(rsvpMutation, {
        eventId
      });

      expect(rsvpData.rsvpToEvent.event.attendeeCount).toBe(1);
      expect(rsvpData.rsvpToEvent.event.availableSpots).toBe(2);

      // Step 3: Second user RSVPs
      testHelper.setAuthenticatedUser({
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@example.com'
      });

      rsvpData = await testHelper.expectMutationSuccess(rsvpMutation, {
        eventId
      });

      expect(rsvpData.rsvpToEvent.event.attendeeCount).toBe(2);
      expect(rsvpData.rsvpToEvent.event.availableSpots).toBe(1);

      // Step 4: Create third user and attempt RSVP
      const loginMutation = `
        mutation($email: String!, $name: String!) {
          login(email: $email, name: $name) {
            user {
              id
              name
            }
          }
        }
      `;

      const newUserData = await testHelper.expectMutationSuccess(loginMutation, {
        email: 'charlie@example.com',
        name: 'Charlie Brown'
      });

      testHelper.setAuthenticatedUser(newUserData.login.user);

      rsvpData = await testHelper.expectMutationSuccess(rsvpMutation, {
        eventId
      });

      expect(rsvpData.rsvpToEvent.event.attendeeCount).toBe(3);
      expect(rsvpData.rsvpToEvent.event.availableSpots).toBe(0);

      // Step 5: Fourth user should fail to RSVP (event full)
      const fourthUserData = await testHelper.expectMutationSuccess(loginMutation, {
        email: 'diana@example.com',
        name: 'Diana Prince'
      });

      testHelper.setAuthenticatedUser(fourthUserData.login.user);

      const errors = await testHelper.expectMutationError(rsvpMutation, {
        eventId
      });

      expect(errors[0].message).toContain('Event is full');

      // Step 6: Verify final event state
      const eventQuery = `
        query($id: ID!) {
          event(id: $id) {
            id
            title
            attendeeCount
            availableSpots
            attendees {
              id
              name
            }
          }
        }
      `;

      const finalEventData = await testHelper.expectQuerySuccess(eventQuery, {
        id: eventId
      });

      expect(finalEventData.event.attendeeCount).toBe(3);
      expect(finalEventData.event.availableSpots).toBe(0);
      expect(finalEventData.event.attendees.length).toBe(3);

      const attendeeNames = finalEventData.event.attendees.map(a => a.name).sort();
      expect(attendeeNames).toEqual(['Bob Wilson', 'Charlie Brown', 'Jane Smith']);
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle authentication errors gracefully', async () => {
      // Step 1: Attempt to create event without authentication
      testHelper.setUnauthenticated();

      const createMutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
            }
          }
        }
      `;

      const errors = await testHelper.expectMutationError(createMutation, {
        input: {
          title: 'Unauthorized Event',
          description: 'This should fail',
          date: new Date().toISOString(),
          location: 'Nowhere'
        }
      });

      expect(errors[0].message).toContain('Authentication required');

      // Step 2: Login and retry
      testHelper.setAuthenticatedUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });

      const successData = await testHelper.expectMutationSuccess(createMutation, {
        input: {
          title: 'Authorized Event',
          description: 'This should succeed',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Valid Venue'
        }
      });

      expect(successData.createEvent.event).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      testHelper.setAuthenticatedUser({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Step 1: Attempt to create event with past date
      const createMutation = `
        mutation($input: CreateEventInput!) {
          createEvent(input: $input) {
            event {
              id
            }
          }
        }
      `;

      const pastDateErrors = await testHelper.expectMutationError(createMutation, {
        input: {
          title: 'Past Event',
          description: 'Invalid date',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Time Machine'
        }
      });

      expect(pastDateErrors[0].message).toContain('Event date must be in the future');

      // Step 2: Create valid event
      const validData = await testHelper.expectMutationSuccess(createMutation, {
        input: {
          title: 'Future Event',
          description: 'Valid date',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Future Venue'
        }
      });

      expect(validData.createEvent.event).toBeDefined();
    });
  });
}); 