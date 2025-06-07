const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.resolve(__dirname, "data.db"), (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      displayName TEXT,
      about TEXT,
      profileImageUrl TEXT,
      headerImageUrl TEXT,
      isOnline INTEGER DEFAULT 0
    )
  `);

  // Create conversations table
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      name TEXT,
      isGroup INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create participants table
  db.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId TEXT,
      userId TEXT,
      FOREIGN KEY (conversationId) REFERENCES conversations(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT,
      senderId TEXT,
      content TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      type TEXT DEFAULT 'text',
      FOREIGN KEY (conversationId) REFERENCES conversations(id),
      FOREIGN KEY (senderId) REFERENCES users(id)
    )
  `);

  // Create calls table
  db.run(`
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      conversationId TEXT,
      hostId TEXT,
      isGroup INTEGER DEFAULT 0,
      startedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      endedAt TEXT,
      FOREIGN KEY (conversationId) REFERENCES conversations(id),
      FOREIGN KEY (hostId) REFERENCES users(id)
    )
  `);

  // Create call_participants table
  db.run(`
    CREATE TABLE IF NOT EXISTS call_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      callId TEXT,
      userId TEXT,
      joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      leftAt TEXT,
      FOREIGN KEY (callId) REFERENCES calls(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
});

module.exports = db;