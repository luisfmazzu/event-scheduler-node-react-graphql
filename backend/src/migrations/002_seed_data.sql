-- Event Scheduler Seed Data
-- Sample data for development and testing
-- Migration: 002_seed_data.sql

-- Sample users
INSERT INTO users (name, email, created_at) VALUES
('John Doe', 'john.doe@example.com', '2025-01-01 10:00:00'),
('Jane Smith', 'jane.smith@example.com', '2025-01-02 11:00:00'),
('Mike Johnson', 'mike.johnson@example.com', '2025-01-03 12:00:00'),
('Sarah Williams', 'sarah.williams@example.com', '2025-01-04 13:00:00'),
('David Brown', 'david.brown@example.com', '2025-01-05 14:00:00'),
('Lisa Davis', 'lisa.davis@example.com', '2025-01-06 15:00:00'),
('Chris Wilson', 'chris.wilson@example.com', '2025-01-07 16:00:00'),
('Emma Taylor', 'emma.taylor@example.com', '2025-01-08 17:00:00');

-- Sample events
INSERT INTO events (title, description, date, location, max_attendees, organizer_id, created_at) VALUES
(
  'Tech Meetup: React and GraphQL',
  'Join us for an exciting evening discussing the latest in React and GraphQL development. We''ll cover best practices, new features, and real-world applications.',
  '2025-02-15 18:00:00',
  'Tech Hub Downtown, 123 Main Street',
  50,
  1,
  '2025-01-10 09:00:00'
),
(
  'Community Garden Workshop',
  'Learn about sustainable gardening practices and help plant seeds for the upcoming season. All skill levels welcome!',
  '2025-02-20 10:00:00',
  'Central Park Community Center',
  25,
  2,
  '2025-01-11 10:00:00'
),
(
  'Startup Pitch Night',
  'Local entrepreneurs present their innovative ideas to investors and the community. Great networking opportunities!',
  '2025-02-25 19:00:00',
  'Innovation Center, 456 Business Ave',
  100,
  3,
  '2025-01-12 11:00:00'
),
(
  'Photography Walk',
  'Explore the city through your lens with fellow photography enthusiasts. Tips and techniques shared throughout the walk.',
  '2025-03-01 14:00:00',
  'City Art District',
  20,
  4,
  '2025-01-13 12:00:00'
),
(
  'Cooking Class: Italian Cuisine',
  'Master the art of authentic Italian cooking with Chef Maria. Learn to make pasta, sauces, and traditional desserts.',
  '2025-03-05 17:00:00',
  'Culinary Institute Kitchen',
  15,
  5,
  '2025-01-14 13:00:00'
),
(
  'Book Club: Sci-Fi Classics',
  'Monthly discussion of classic science fiction literature. This month: Isaac Asimov''s Foundation series.',
  '2025-03-10 15:00:00',
  'Downtown Library Meeting Room',
  30,
  6,
  '2025-01-15 14:00:00'
),
(
  'Yoga in the Park',
  'Join us for a relaxing outdoor yoga session. Bring your own mat and enjoy the fresh air and peaceful surroundings.',
  '2025-03-12 08:00:00',
  'Riverside Park Pavilion',
  40,
  7,
  '2025-01-16 15:00:00'
),
(
  'Career Development Workshop',
  'Professional development session focusing on resume writing, interview skills, and networking strategies.',
  '2025-03-18 18:30:00',
  'Business Development Center',
  60,
  8,
  '2025-01-17 16:00:00'
);

-- Sample RSVPs
INSERT INTO rsvps (user_id, event_id, rsvp_date) VALUES
-- Tech Meetup RSVPs
(2, 1, '2025-01-15 10:00:00'),
(3, 1, '2025-01-16 11:00:00'),
(4, 1, '2025-01-17 12:00:00'),
(5, 1, '2025-01-18 13:00:00'),
(6, 1, '2025-01-19 14:00:00'),

-- Community Garden RSVPs
(1, 2, '2025-01-16 09:00:00'),
(3, 2, '2025-01-17 10:00:00'),
(7, 2, '2025-01-18 11:00:00'),
(8, 2, '2025-01-19 12:00:00'),

-- Startup Pitch Night RSVPs
(1, 3, '2025-01-17 08:00:00'),
(2, 3, '2025-01-18 09:00:00'),
(4, 3, '2025-01-19 10:00:00'),
(5, 3, '2025-01-20 11:00:00'),
(6, 3, '2025-01-21 12:00:00'),
(7, 3, '2025-01-22 13:00:00'),
(8, 3, '2025-01-23 14:00:00'),

-- Photography Walk RSVPs
(1, 4, '2025-01-18 07:00:00'),
(2, 4, '2025-01-19 08:00:00'),
(3, 4, '2025-01-20 09:00:00'),

-- Cooking Class RSVPs
(1, 5, '2025-01-19 06:00:00'),
(2, 5, '2025-01-20 07:00:00'),
(3, 5, '2025-01-21 08:00:00'),
(4, 5, '2025-01-22 09:00:00'),
(6, 5, '2025-01-23 10:00:00'),
(7, 5, '2025-01-24 11:00:00'),

-- Book Club RSVPs
(1, 6, '2025-01-20 05:00:00'),
(3, 6, '2025-01-21 06:00:00'),
(5, 6, '2025-01-22 07:00:00'),
(8, 6, '2025-01-23 08:00:00'),

-- Yoga in the Park RSVPs
(2, 7, '2025-01-21 04:00:00'),
(4, 7, '2025-01-22 05:00:00'),
(6, 7, '2025-01-23 06:00:00'),
(8, 7, '2025-01-24 07:00:00'),

-- Career Development RSVPs
(1, 8, '2025-01-22 03:00:00'),
(3, 8, '2025-01-23 04:00:00'),
(5, 8, '2025-01-24 05:00:00'),
(7, 8, '2025-01-25 06:00:00'); 