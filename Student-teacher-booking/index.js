const express = require('express');
const path = require('path');
const db = require('./db');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// serve project-level images placed in /img (so views can reference /img/filename)
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(session({ secret: 'change-me-in-prod', resave: false, saveUninitialized: false }));
// passport initialization (will attach req.user on successful OAuth)
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Helper to create or find a user from OAuth profile
async function findOrCreateOAuthUser({ username, name, role = 'student' }) {
  let user = await db.findUserByUsername(username);
  if (user) return user;
  // create a random password and hash it so DB constraint satisfied
  const rand = require('crypto').randomBytes(16).toString('hex');
  const hashed = await bcrypt.hash(rand, 10);
  await db.createUser({ username, password: hashed, name: name || username, role });
  return await db.findUserByUsername(username);
}

// Configure Google strategy if env vars are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      const username = email || `google_${profile.id}`;
      const user = await findOrCreateOAuthUser({ username, name: profile.displayName });
      done(null, user);
    } catch (err) { done(err); }
  }));
}

// Configure GitHub strategy if env vars are present
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // GitHub may provide email in profile.emails
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
      const username = email || `github_${profile.id}`;
      const user = await findOrCreateOAuthUser({ username, name: profile.displayName || profile.username });
      done(null, user);
    } catch (err) { done(err); }
  }));
}

// expose user to templates
app.use(async (req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.currentUser = await db.findUserById(req.session.userId);
  } else {
    res.locals.currentUser = null;
  }
  next();
});

function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) return res.redirect('/login');
  return next();
}

function requireRole(role) {
  return async (req, res, next) => {
    if (!req.session || !req.session.userId) return res.redirect('/login');
    const user = await db.findUserById(req.session.userId);
    if (!user || user.role !== role) return res.status(403).send('Forbidden');
    next();
  };
}

app.get('/', async (req, res) => {
  const teachers = await db.getAllTeachers();
  res.render('index', { teachers });
});

// About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact', { success: null });
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).send('Missing fields');
  try {
    // Save the message to the database
    await db.createContactMessage({ name, email, message });
    console.log('Contact message saved:', { name, email, message });
    res.render('contact', { success: 'Your message has been received. We will get back to you shortly.' });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).send('Error submitting form');
  }
});

// auth
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) return res.status(400).send('Missing fields');
  const hashed = await bcrypt.hash(password, 10);
  try {
    await db.createUser({ username, password: hashed, name, role });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

app.get('/login', (req, res) => res.render('login'));
// forgot / reset password
app.get('/forgot', (req, res) => res.render('forgot', { error: null, message: null, resetLink: null }));
app.post('/forgot', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.render('forgot', { error: 'Enter your account email', message: null, resetLink: null });
  const user = await db.findUserByUsername(username);
  if (!user) {
    // Don't reveal existence; show success message
    return res.render('forgot', { error: null, message: 'If an account exists we sent a reset link (check console in dev).', resetLink: null });
  }
  const crypto = require('crypto');
  const token = crypto.randomBytes(20).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour
  await db.setPasswordResetToken(user.id, token, expires);
  const resetLink = `${req.protocol}://${req.get('host')}/reset/${token}`;
  console.log('Password reset link (dev):', resetLink);
  // For dev simplicity show the link on the confirmation page; in production email it.
  return res.render('forgot', { error: null, message: 'Reset link generated. In production this would be emailed.', resetLink });
});

app.get('/reset/:token', async (req, res) => {
  const token = req.params.token;
  const user = await db.findUserByResetToken(token);
  if (!user) return res.send('Invalid or expired token');
  res.render('reset', { token, error: null, success: null });
});

app.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password, password_confirm } = req.body;
  if (!password || !password_confirm) return res.render('reset', { token, error: 'Enter and confirm your new password', success: null });
  if (password !== password_confirm) return res.render('reset', { token, error: 'Passwords do not match', success: null });
  const user = await db.findUserByResetToken(token);
  if (!user) return res.send('Invalid or expired token');
  const hashed = await bcrypt.hash(password, 10);
  await db.updateUserPasswordById(user.id, hashed);
  await db.clearResetToken(user.id);
  res.render('reset', { token: null, error: null, success: 'Password updated. You may now log in.' });
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.findUserByUsername(username);
  if (!user) return res.status(400).send('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).send('Invalid credentials');
  req.session.userId = user.id;
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect(req.get('Referrer') || '/'));
});

// OAuth routes
app.get('/auth/google', (req, res, next) => {
  if (!passport._strategy('google')) return res.status(500).send('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
app.get('/auth/google/callback', (req, res, next) => {
  if (!passport._strategy('google')) return res.status(500).send('Google OAuth not configured.');
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    // log in via existing session management
    req.session.userId = user.id;
    res.redirect('/');
  })(req, res, next);
});

app.get('/auth/github', (req, res, next) => {
  if (!passport._strategy('github')) return res.status(500).send('GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.');
  passport.authenticate('github')(req, res, next);
});
app.get('/auth/github/callback', (req, res, next) => {
  if (!passport._strategy('github')) return res.status(500).send('GitHub OAuth not configured.');
  passport.authenticate('github', { failureRedirect: '/login' }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.session.userId = user.id;
    res.redirect('/');
  })(req, res, next);
});

app.get('/teacher/:id', async (req, res) => {
  const id = Number(req.params.id);
  const teacher = await db.getTeacherById(id);
  if (!teacher) return res.status(404).send('Teacher not found');
  // if teacher user logs in, show bookings with student user names and statuses
  const bookings = await db.getBookingsForTeacherWithStatus(id);
  res.render('teacher', { teacher, bookings });
});

app.post('/book', requireRole('student'), async (req, res) => {
  const { teacher_id, time, duration_minutes } = req.body;
  if (!teacher_id || !time) return res.status(400).send('Missing fields');
  try {
    // convert datetime-local (YYYY-MM-DDTHH:mm) to UTC ISO
    let whenLocal = time; // e.g., 2025-10-28T14:30
    if (!whenLocal) return res.status(400).send('Missing time');
    // parse using Luxon for robust timezone handling
    const { DateTime } = require('luxon');
    const dtLocal = DateTime.fromISO(whenLocal);
    if (!dtLocal.isValid) return res.status(400).send('Invalid time');
    const whenUTC = dtLocal.toUTC().toISO();
    const duration = Number(duration_minutes) || 60;
    const endUTC = dtLocal.plus({ minutes: duration }).toUTC().toISO();

    // overlap check using UTC strings
    const overlap = await db.getBookingOverlap(Number(teacher_id), whenUTC, endUTC);
    const teacher = await db.getTeacherById(Number(teacher_id));
    const bookings = await db.getBookingsForTeacherWithStatus(Number(teacher_id));
    if (overlap) {
      return res.render('teacher', { teacher, bookings, error: 'That time is already booked. Choose another time.' });
    }

    const user = await db.findUserById(req.session.userId);
  await db.createBookingWithUser({ teacher_id: Number(teacher_id), student_id: user.id, student_name: user.name, student_email: user.username, time: whenUTC, duration_minutes: duration });

    const booking = await db.getBookingByDetails(Number(teacher_id), user.id, whenUTC);
    // render teacher page with confirmation modal data
    bookings.unshift(booking);
    return res.render('teacher', { teacher, bookings, confirmation: booking });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error creating booking');
  }
});

// teacher actions: accept/reject booking
app.post('/booking/:id/accept', requireRole('teacher'), async (req, res) => {
  const id = Number(req.params.id);
  await db.setBookingStatus(id, 'accepted');
  res.redirect(req.get('Referrer') || '/');
});

app.post('/booking/:id/reject', requireRole('teacher'), async (req, res) => {
  const id = Number(req.params.id);
  await db.setBookingStatus(id, 'rejected');
  res.redirect(req.get('Referrer') || '/');
});

app.get('/bookings', async (req, res) => {
  const bookings = await db.getAllBookings();
  res.render('bookings', { bookings });
});

// Admin page (simple password protection)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this in production!

app.get('/admin', (req, res) => {
  // Check if already authenticated via session
  if (req.session && req.session.adminAuth) {
    return res.render('admin', { messages: [] });
  }
  // Otherwise show login form
  res.render('admin-login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.adminAuth = true;
    return res.redirect('/admin');
  }
  res.render('admin-login', { error: 'Invalid password' });
});

app.get('/admin/data', async (req, res) => {
  if (!req.session || !req.session.adminAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const messages = await db.getAllContactMessages();
  const stats = await db.getContactMessageStats();
  res.json({ messages, stats });
});

app.post('/admin/message/:id/delete', async (req, res) => {
  if (!req.session || !req.session.adminAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid message id' });
  try {
    await db.deleteContactMessage(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.adminAuth = false;
  res.redirect('/admin');
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.init();
    await db.seedIfEmpty();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
