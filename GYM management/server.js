const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Database file for storing data (simple JSON storage)
const DATA_DIR = path.join(__dirname, 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const TRAINERS_FILE = path.join(DATA_DIR, 'trainers.json');
const CLASS_REGISTRATIONS_FILE = path.join(DATA_DIR, 'classRegistrations.json');
const TRAINER_BOOKINGS_FILE = path.join(DATA_DIR, 'trainerBookings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Initialize data directory
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize JSON files if they don't exist
function initializeDataFiles() {
    if (!fs.existsSync(CONTACTS_FILE)) {
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(MEMBERS_FILE)) {
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify([], null, 2));
        if (!fs.existsSync(CLASS_REGISTRATIONS_FILE)) {
            fs.writeFileSync(CLASS_REGISTRATIONS_FILE, JSON.stringify([], null, 2));
        }
        if (!fs.existsSync(TRAINER_BOOKINGS_FILE)) {
            fs.writeFileSync(TRAINER_BOOKINGS_FILE, JSON.stringify([], null, 2));
        }
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
}

initializeDataFiles();

// JWT secret (set via env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// Email configuration (configure with your email service)
// Only configure transporter when real credentials are provided to avoid runtime errors during development
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
let transporter = null;
function canSendEmail() {
    return EMAIL_USER && EMAIL_PASS && EMAIL_USER !== 'your-email@gmail.com' && EMAIL_PASS !== 'your-app-password';
}
if (canSendEmail()) {
    transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
} else {
    console.log('Email not configured - skipping SMTP setup. Set EMAIL_USER and EMAIL_PASSWORD to enable emails.');
}

// Simple SSE (Server-Sent Events) clients list for real-time admin updates
const sseClients = [];

function sendSseEvent(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(res => res.write(payload));
}

// SSE endpoint for admin to listen for updates
app.get('/api/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });

    res.write('\n');
    sseClients.push(res);

    req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
    });
});

// Routes

// GET - Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST - Contact form submission
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate input
        if (!name || !email || !subject || !message) {
            return res.json({ success: false, error: 'All fields are required' });
        }

        // Create contact object
        const contact = {
            id: Date.now(),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };

        // Save to JSON file
        let contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        contacts.push(contact);
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));

        // Send email notification (optional)
        sendContactEmail(contact);

        // Notify SSE clients (admin UI) about new contact
        try {
            sendSseEvent('new-contact', contact);
        } catch (e) {
            console.error('SSE notify error:', e);
        }

        res.json({ success: true, message: 'Contact form submitted successfully' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.json({ success: false, error: error.message });
    }
});

// POST - Membership registration
app.post('/api/membership', (req, res) => {
    try {
        const { name, email, phone, plan } = req.body;

        // Validate input
        if (!name || !email || !phone || !plan) {
            return res.json({ success: false, error: 'All fields are required' });
        }

        // Create membership object
        const member = {
            id: Date.now(),
            name,
            email,
            phone,
            plan,
            status: 'pending',
            registeredDate: new Date().toISOString()
        };

        // Save to JSON file
        let members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
        members.push(member);
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));

        // Send confirmation email
        sendMembershipEmail(member);

        res.json({ success: true, message: 'Membership registered successfully', member });
    } catch (error) {
        console.error('Membership registration error:', error);
        res.json({ success: false, error: error.message });
    }
});

// GET - All contacts (admin only)
app.get('/api/contacts', (req, res) => {
    try {
        const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// GET - All members (admin only)
app.get('/api/members', (req, res) => {
    try {
        const members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
        res.json({ success: true, data: members });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// GET - Single contact
app.get('/api/contact/:id', (req, res) => {
    try {
        const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        const contact = contacts.find(c => c.id == req.params.id);
        
        if (!contact) {
            return res.json({ success: false, error: 'Contact not found' });
        }
        
        res.json({ success: true, data: contact });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// DELETE - Delete contact
app.delete('/api/contact/:id', (req, res) => {
    try {
        let contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        contacts = contacts.filter(c => c.id != req.params.id);
        fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
        
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// DELETE - Delete member
app.delete('/api/member/:id', (req, res) => {
    try {
        let members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
        members = members.filter(m => m.id != req.params.id);
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));
        
        res.json({ success: true, message: 'Member deleted successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Helper function to send contact email
function sendContactEmail(contact) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@fitzone.com',
        to: 'admin@fitzone.com', // Admin email
        subject: `New Contact Form: ${contact.subject}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Subject:</strong> ${contact.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${contact.message}</p>
            <p><strong>Submitted:</strong> ${new Date(contact.timestamp).toLocaleString()}</p>
        `
    };

    if (!canSendEmail() || !transporter) {
        console.log('Skipping contact email - SMTP not configured');
        return;
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Helper function to send membership confirmation email
function sendMembershipEmail(member) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@fitzone.com',
        to: member.email,
        subject: 'Welcome to FitZone - Membership Confirmation',
        html: `
            <h2>Welcome to FitZone!</h2>
            <p>Dear ${member.name},</p>
            <p>Thank you for registering with us. We're excited to have you join our fitness community!</p>
            <p><strong>Membership Details:</strong></p>
            <ul>
                <li>Plan: ${member.plan}</li>
                <li>Email: ${member.email}</li>
                <li>Phone: ${member.phone}</li>
                <li>Status: ${member.status}</li>
            </ul>
            <p>We will contact you shortly to complete your registration and answer any questions you may have.</p>
            <p>Best regards,<br>FitZone Team</p>
        `
    };

    if (!canSendEmail() || !transporter) {
        console.log('Skipping membership email - SMTP not configured');
        return;
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email error:', error);
        } else {
            console.log('Membership confirmation email sent:', info.response);
        }
    });
}

// ------------------
// User auth helpers
// ------------------

function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, user) {
    if (!user || !user.password || !user.password.salt) return false;
    const hash = crypto.pbkdf2Sync(password, user.password.salt, 100000, 64, 'sha512').toString('hex');
    return hash === user.password.hash;
}

// POST - Register user
app.post('/api/register', (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.json({ success: false, error: 'All fields are required' });
        }

        const users = readUsers();
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return res.json({ success: false, error: 'Email already registered' });
        }

        const pwd = hashPassword(password);
        const user = {
            id: Date.now(),
            name,
            email: email.toLowerCase(),
            phone,
            password: pwd,
            registeredDate: new Date().toISOString(),
            status: 'active'
        };

        users.push(user);
        writeUsers(users);

        res.json({ success: true, message: 'Registered successfully', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Register error:', error);
        res.json({ success: false, error: error.message });
    }
});

// POST - Login user
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, error: 'Email and password are required' });
        }

        const users = readUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return res.json({ success: false, error: 'Invalid credentials' });

        const ok = verifyPassword(password, user);
        if (!ok) return res.json({ success: false, error: 'Invalid credentials' });

        // Issue JWT and set as HttpOnly cookie
        try {
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            // Set cookie (httpOnly)
            res.cookie('fz_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'Lax' });
            res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
        } catch (e) {
            console.error('JWT error:', e);
            res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, error: error.message });
    }
});
// Helper to extract token from Authorization header or cookie
function getTokenFromReq(req) {
    const auth = req.headers && req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
    const cookie = req.headers && req.headers.cookie;
    if (!cookie) return null;
    const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('fz_token='));
    if (!match) return null;
    return decodeURIComponent(match.split('=')[1]);
}

// Auth middleware
function authenticate(req, res, next) {
    try {
        const token = getTokenFromReq(req);
        if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
        const payload = jwt.verify(token, JWT_SECRET);
        const users = readUsers();
        const user = users.find(u => u.id == payload.id);
        if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
        req.user = user;
        next();
    } catch (e) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

// Logout endpoint - clears cookie
app.post('/api/logout', (req, res) => {
    res.cookie('fz_token', '', { httpOnly: true, expires: new Date(0), sameSite: 'Lax' });
    res.json({ success: true, message: 'Logged out' });
});

// GET - Profile (protected)
app.get('/api/profile', authenticate, (req, res) => {
    const user = req.user;
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
});

// PUT - Update profile (protected)
app.put('/api/profile', authenticate, (req, res) => {
    try {
        const { name, phone } = req.body;
        const users = readUsers();
        const idx = users.findIndex(u => u.id == req.user.id);
        if (idx === -1) return res.json({ success: false, error: 'User not found' });
        if (name) users[idx].name = name;
        if (phone) users[idx].phone = phone;
        writeUsers(users);
        const { password, ...safe } = users[idx];
        res.json({ success: true, data: safe });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// Statistics endpoint
app.get('/api/statistics', (req, res) => {
    try {
        const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
        const members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
        
        const stats = {
            totalContacts: contacts.length,
            totalMembers: members.length,
            membersByPlan: {
                basic: members.filter(m => m.plan === 'Basic').length,
                premium: members.filter(m => m.plan === 'Premium').length,
                elite: members.filter(m => m.plan === 'Elite').length
            }
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Update member status
app.put('/api/member/:id', (req, res) => {
    try {
        const { status } = req.body;
        let members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
        
        const memberIndex = members.findIndex(m => m.id == req.params.id);
        if (memberIndex === -1) {
            return res.json({ success: false, error: 'Member not found' });
        }
        
        members[memberIndex].status = status;
        fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));
        
        res.json({ success: true, message: 'Member updated successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// POST - Class registration
app.post('/api/class-registration', (req, res) => {
    try {
        const { classId, name, email } = req.body;

        if (!classId || !name || !email) {
            return res.json({ success: false, error: 'All fields are required' });
        }

        const registration = {
            id: Date.now(),
            classId,
            name,
            email,
            registeredDate: new Date().toISOString()
        };

        let registrations = JSON.parse(fs.readFileSync(CLASS_REGISTRATIONS_FILE, 'utf8'));
        registrations.push(registration);
        fs.writeFileSync(CLASS_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));

        res.json({ success: true, message: 'Successfully registered for class', data: registration });
    } catch (error) {
        console.error('Class registration error:', error);
        res.json({ success: false, error: error.message });
    }
});

// GET - All class registrations
app.get('/api/class-registrations', (req, res) => {
    try {
        const registrations = JSON.parse(fs.readFileSync(CLASS_REGISTRATIONS_FILE, 'utf8'));
        res.json({ success: true, data: registrations });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// POST - Trainer booking
app.post('/api/trainer-booking', (req, res) => {
    try {
        const { trainerId, name, email, phone, date, time, sessionType } = req.body;

        if (!trainerId || !name || !email || !phone || !date || !time || !sessionType) {
            return res.json({ success: false, error: 'All fields are required' });
        }

        const booking = {
            id: Date.now(),
            trainerId,
            name,
            email,
            phone,
            date,
            time,
            sessionType,
            status: 'pending',
            bookedDate: new Date().toISOString()
        };

        let bookings = JSON.parse(fs.readFileSync(TRAINER_BOOKINGS_FILE, 'utf8'));
        bookings.push(booking);
        fs.writeFileSync(TRAINER_BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

        res.json({ success: true, message: 'Successfully booked trainer session', data: booking });
    } catch (error) {
        console.error('Trainer booking error:', error);
        res.json({ success: false, error: error.message });
    }
});

// GET - All trainer bookings
app.get('/api/trainer-bookings', (req, res) => {
    try {
        const bookings = JSON.parse(fs.readFileSync(TRAINER_BOOKINGS_FILE, 'utf8'));
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`FitZone Gym Management Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
