const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

const DB_PATH = path.join(__dirname, 'data.sqlite');

let db;
async function getDb() {
  if (db) return db;
  db = new sqlite3.Database(DB_PATH);
  // Promisify useful methods
  db.runAsync = promisify(db.run.bind(db));
  db.getAsync = promisify(db.get.bind(db));
  db.allAsync = promisify(db.all.bind(db));
  db.execAsync = promisify(db.exec.bind(db));
  db.prepareAsync = function(sql) {
    const stmt = db.prepare(sql);
    stmt.runAsync = promisify(stmt.run.bind(stmt));
    stmt.finalizeAsync = promisify(stmt.finalize.bind(stmt));
    return stmt;
  };
  return db;
}

async function init() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT,
      bio TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      student_id INTEGER,
      student_name TEXT,
      student_email TEXT,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student','teacher'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // migrate existing bookings table if columns are missing
  await ensureBookingsColumns();
}

async function ensureBookingsColumns() {
  const db = await getDb();
  const cols = await db.allAsync("PRAGMA table_info('bookings')");
  const names = cols.map(c => c.name);
  // Add columns if they don't exist (SQLite supports ADD COLUMN)
  if (!names.includes('student_id')) {
    await db.runAsync('ALTER TABLE bookings ADD COLUMN student_id INTEGER');
  }
  if (!names.includes('student_name')) {
    await db.runAsync("ALTER TABLE bookings ADD COLUMN student_name TEXT");
  }
  if (!names.includes('student_email')) {
    await db.runAsync("ALTER TABLE bookings ADD COLUMN student_email TEXT");
  }
  if (!names.includes('status')) {
    await db.runAsync("ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'pending'");
  }
  if (!names.includes('duration_minutes')) {
    await db.runAsync('ALTER TABLE bookings ADD COLUMN duration_minutes INTEGER DEFAULT 60');
  }
  // check users table separately for reset columns
  const userCols = await db.allAsync("PRAGMA table_info('users')");
  const userNames = userCols.map(c => c.name);
  if (!userNames.includes('reset_token')) {
    await db.runAsync("ALTER TABLE users ADD COLUMN reset_token TEXT");
  }
  if (!userNames.includes('reset_expires')) {
    await db.runAsync("ALTER TABLE users ADD COLUMN reset_expires INTEGER");
  }
}

async function seedIfEmpty() {
  const db = await getDb();
  const row = await db.getAsync('SELECT COUNT(*) as cnt FROM teachers');
  if (!row || row.cnt === 0) {
    const teachers = [
      { name: 'Alice Johnson', subject: 'Mathematics', bio: 'Experienced math teacher for high school.' },
      { name: 'Bob Smith', subject: 'English', bio: 'Focused on literature and writing skills.' },
      { name: 'Clara Lee', subject: 'Physics', bio: 'Physics tutor with lab experience.' }
    ];
  const insert = db.prepareAsync('INSERT INTO teachers (name, subject, bio) VALUES (?, ?, ?)');
    try {
      for (const t of teachers) {
        await insert.runAsync(t.name, t.subject, t.bio);
      }
    } finally {
      await insert.finalizeAsync();
    }
  }
}

async function createUser({ username, password, name, role }) {
  const db = await getDb();
  return db.runAsync('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', username, password, name, role);
}

async function setPasswordResetToken(userId, token, expiresEpochMs) {
  const db = await getDb();
  return db.runAsync('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', token, expiresEpochMs, userId);
}

async function findUserByResetToken(token) {
  const db = await getDb();
  return db.getAsync('SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?', token, Date.now());
}

async function clearResetToken(userId) {
  const db = await getDb();
  return db.runAsync('UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = ?', userId);
}

async function updateUserPasswordById(userId, hashedPassword) {
  const db = await getDb();
  return db.runAsync('UPDATE users SET password = ? WHERE id = ?', hashedPassword, userId);
}

async function findUserByUsername(username) {
  const db = await getDb();
  return db.getAsync('SELECT * FROM users WHERE username = ?', username);
}

async function findUserById(id) {
  const db = await getDb();
  return db.getAsync('SELECT * FROM users WHERE id = ?', id);
}

async function createBookingWithUser({ teacher_id, student_id, student_name, student_email, time, duration_minutes = 60 }) {
  const db = await getDb();
  return db.runAsync('INSERT INTO bookings (teacher_id, student_id, student_name, student_email, time, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)', teacher_id, student_id, student_name, student_email, time, duration_minutes);
}

async function getBookingAtTime(teacher_id, time) {
  const db = await getDb();
  return db.getAsync('SELECT * FROM bookings WHERE teacher_id = ? AND time = ? AND status != ?', teacher_id, time, 'rejected');
}

// check overlapping bookings for a teacher between start (inclusive) and end (exclusive)
async function getBookingOverlap(teacher_id, startISO, endISO) {
  const db = await getDb();
  // bookings with start < endISO AND (start + duration) > startISO -> overlap
  return db.getAsync(`SELECT * FROM bookings WHERE teacher_id = ? AND status != 'rejected' AND (datetime(time) < datetime(?) AND datetime(time, '+' || COALESCE(duration_minutes,60) || ' minutes') > datetime(?)) LIMIT 1`, teacher_id, endISO, startISO);
}

async function getBookingByDetails(teacher_id, student_id, time) {
  const db = await getDb();
  return db.getAsync('SELECT b.*, t.name as teacher_name FROM bookings b JOIN teachers t ON b.teacher_id = t.id WHERE b.teacher_id = ? AND b.student_id = ? AND b.time = ? ORDER BY b.created_at DESC LIMIT 1', teacher_id, student_id, time);
}

async function setBookingStatus(bookingId, status) {
  const db = await getDb();
  return db.runAsync('UPDATE bookings SET status = ? WHERE id = ?', status, bookingId);
}

async function createContactMessage({ name, email, message }) {
  const db = await getDb();
  return db.runAsync('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', name, email, message);
}

async function getAllContactMessages() {
  const db = await getDb();
  return db.allAsync('SELECT * FROM contact_messages ORDER BY created_at DESC');
}

async function deleteContactMessage(id) {
  const db = await getDb();
  return db.runAsync('DELETE FROM contact_messages WHERE id = ?', id);
}

// Analytics: total message count
async function getContactMessageStats() {
  const db = await getDb();
  const total = await db.getAsync('SELECT COUNT(*) as count FROM contact_messages');
  
  // Messages today
  const today = await db.getAsync(`
    SELECT COUNT(*) as count FROM contact_messages 
    WHERE DATE(created_at) = DATE('now')
  `);
  
  // Messages this week
  const week = await db.getAsync(`
    SELECT COUNT(*) as count FROM contact_messages 
    WHERE created_at >= datetime('now', '-7 days')
  `);
  
  // Most recent message date
  const recent = await db.getAsync(`
    SELECT created_at FROM contact_messages 
    ORDER BY created_at DESC LIMIT 1
  `);

  return {
    total: total?.count || 0,
    today: today?.count || 0,
    thisWeek: week?.count || 0,
    lastMessageDate: recent?.created_at || null
  };
}

async function getBookingsForTeacherWithStatus(teacher_id) {
  const db = await getDb();
  return db.allAsync('SELECT b.*, u.name as student_user_name FROM bookings b LEFT JOIN users u ON b.student_id = u.id WHERE b.teacher_id = ? ORDER BY time', teacher_id);
}

async function getAllTeachers() {
  const db = await getDb();
  return db.allAsync('SELECT * FROM teachers ORDER BY name');
}

async function getTeacherById(id) {
  const db = await getDb();
  return db.getAsync('SELECT * FROM teachers WHERE id = ?', id);
}

async function createBooking({ teacher_id, student_name, student_email, time, duration_minutes = 60 }) {
  const db = await getDb();
  return db.runAsync('INSERT INTO bookings (teacher_id, student_name, student_email, time, duration_minutes) VALUES (?, ?, ?, ?, ?)', teacher_id, student_name, student_email, time, duration_minutes);
}

async function getBookingsForTeacher(teacher_id) {
  const db = await getDb();
  return db.allAsync('SELECT * FROM bookings WHERE teacher_id = ? ORDER BY time', teacher_id);
}

async function getAllBookings() {
  const db = await getDb();
  return db.allAsync(`SELECT b.*, t.name as teacher_name, t.subject as teacher_subject FROM bookings b JOIN teachers t ON b.teacher_id = t.id ORDER BY b.time DESC`);
}

module.exports = {
  getDb,
  init,
  seedIfEmpty,
  getAllTeachers,
  getTeacherById,
  createBooking,
  createBookingWithUser,
  getBookingAtTime,
  getBookingOverlap,
  getBookingByDetails,
  getBookingsForTeacher,
  getBookingsForTeacherWithStatus,
  getAllBookings,
  createUser,
  findUserByUsername,
  findUserById,
  setPasswordResetToken,
  findUserByResetToken,
  clearResetToken,
  updateUserPasswordById,
  setBookingStatus,
  createContactMessage,
  getAllContactMessages,
  deleteContactMessage,
  getContactMessageStats
};
