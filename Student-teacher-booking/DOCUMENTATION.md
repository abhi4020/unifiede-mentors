# Student-Teacher Booking Platform - Documentation

## Overview

The **Student-Teacher Booking Platform** is a modern web application that enables students to discover, search, and book sessions with teachers. Teachers can manage their availability and accept/reject booking requests. The application features a responsive design, accessibility-first approach, and supports both dark and light themes.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Running the Application](#running-the-application)
6. [Key Features & Usage](#key-features--usage)
7. [Admin Panel](#admin-panel)
8. [File Descriptions](#file-descriptions)
9. [Styling & Theme System](#styling--theme-system)
10. [Accessibility](#accessibility)
11. [Database](#database)
12. [API Routes](#api-routes)
13. [Recent UI Improvements](#recent-ui-improvements)
14. [Troubleshooting](#troubleshooting)

---

## Features

✅ **User Authentication**
- Student and Teacher registration/login
- Role-based access control
- Session management

✅ **Teacher Discovery**
- Browse all teachers with avatars and subject badges
- Search teachers by name or subject (real-time filtering)
- Filter by subject dropdown
- Teacher ratings and detailed profiles

✅ **Booking Management**
- Students can book sessions with teachers
- Specify booking time, duration (30/60/90 min), and notes
- Teachers can accept/reject bookings
- View booking history with status tracking

✅ **Responsive Design**
- Mobile-first approach
- Hamburger navigation on small screens
- Touch-friendly interface
- Tested at multiple breakpoints

✅ **Dark & Light Themes**
- Toggle between dark and light modes
- Theme preference saved in browser
- Properly styled in both modes

✅ **Accessibility**
- WCAG 2.1 compliant
- Keyboard navigation support
- ARIA labels and semantic HTML
- Screen reader friendly
- Focus-visible outlines for keyboard users

✅ **Contact Form**
- Contact page with email form
- Messages saved to database
- Admin panel to view all submissions

✅ **Admin Dashboard**
- View all contact messages
- Delete messages with confirmation
- Real-time analytics:
  - Total message count
  - Messages received today
  - Messages this week
  - Last message timestamp

---

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: EJS (templating), HTML, CSS, Vanilla JavaScript
- **Database**: SQLite
- **Styling**: CSS3 with CSS custom properties (variables)
- **Icons**: SVG
- **Fonts**: Google Fonts (Inter)

---

## Project Structure

```
Student-teacher-booking/
├── index.js                 # Main Express server
├── db.js                    # Database initialization & queries
├── package.json             # Project dependencies
├── data.sqlite              # SQLite database file
│
├── public/                  # Static files
│   ├── styles.css           # Main stylesheet with dark/light theme
│   └── app.js               # Client-side JavaScript
│
├── views/                  # EJS templates
│   ├── index.ejs            # Homepage (teacher listing)
│   ├── teacher.ejs          # Teacher detail & booking form
│   ├── bookings.ejs         # User's bookings list
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   ├── about.ejs            # About page
│   ├── contact.ejs          # Contact form page
│   ├── admin.ejs            # Admin dashboard (message management)
│   ├── admin-login.ejs      # Admin login page
│   └── partials/
│       ├── header.ejs       # Navigation header (all pages)
│       └── footer.ejs       # Footer (all pages)
│
└── img/                     # Images
    ├── login.png
    └── register.svg
```

---

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm

### Steps

1. **Clone or navigate to the project folder**:
   ```powershell
   cd c:\Users\admin\Desktop\Student-teacher-booking
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Database setup** (automatic on first run):
   - The database is initialized automatically when the server starts
   - Seeds with default teachers if the database is empty

---

## Running the Application

### Development
```powershell
npm start
```

The server will start at: **http://localhost:3000**

You'll see output like:
```
Server running on http://localhost:3000
Password reset link (dev): http://localhost:3000/reset/...
```

### Test Users (if seeded)
- **Teacher**: Any user registered with role "teacher"
- **Student**: Any user registered with role "student"

---

## Key Features & Usage

### 1. **Homepage** (`/`)
- Displays all teachers in a responsive grid
- **Search bar**: Type to filter teachers by name or subject (real-time)
- **Subject dropdown**: Filter by specific subject
- **Teacher cards** show:
  - Avatar (initials)
  - Name & subject badge
  - Rating (placeholder)
  - Bio (truncated to 3 lines)
  - "View & Book" and "Message" buttons

### 2. **Teacher Detail** (`/teacher/:id`)
- Teacher profile with avatar, name, subject, and bio
- **Left section**: List of existing bookings
  - Shows student name, booking time, and status (pending/accepted/rejected)
  - Color-coded status pills
- **Right section**: Booking form (for logged-in students)
  - Select time (datetime-local)
  - Choose duration (30/60/90 minutes)
  - Add optional notes
  - Submit to create booking
- **Teachers** can accept/reject bookings

### 3. **Bookings** (`/bookings`)
- View all your bookings (as student or teacher)
- Shows booking details and current status
- Quick reference for upcoming sessions

### 4. **Authentication**
- **Login** (`/login`): Sign in with email and password
- **Register** (`/register`): Create account as student or teacher

### 5. **Contact Page** (`/contact`)
- Contact form to submit inquiries
- Fields: Name, Email, Message
- Submissions saved to database
- Confirmation message displayed to user

### 6. **About Page** (`/about`)
- Information about the platform
- Mission and contact details
- Link in header and footer

---

## Admin Panel

### Access
- **URL**: `http://localhost:3000/admin`
- **Password**: `admin123` (default)
- **Change password**: Set environment variable `ADMIN_PASSWORD=your_password` before running the server

### Features

#### 📊 Analytics Dashboard
View real-time statistics:
- **Total Messages**: All contact form submissions
- **Today**: Messages received in the current day
- **This Week**: Messages from the last 7 days
- **Last Message**: Timestamp of the most recent submission

#### 📧 Message Management
- **View all contact messages** in a sortable table
- **Columns**: Name, Email, Message (preview), Received Date
- **Delete messages** with confirmation prompt
- **Email links**: Click email to send a reply directly

#### 🔐 Session Management
- Simple password authentication
- Session persists during your browsing
- **Logout** button to exit the admin panel

### Usage Example
1. Open `http://localhost:3000/admin`
2. Enter password: `admin123`
3. View all messages and statistics
4. Click **Delete** on any message to remove it
5. Click **Logout** to exit

### Database Interaction
Contact messages are stored in the `contact_messages` table:
```sql
id (INTEGER PRIMARY KEY)
name (TEXT)
email (TEXT)
message (TEXT)
created_at (DATETIME)
```

---

### Backend

| File | Purpose |
|------|---------|
| `index.js` | Express server, route handlers, session setup |
| `db.js` | SQLite database initialization, queries, seed data |
| `package.json` | Dependencies: express, sqlite, uuid, body-parser, express-session |

### Frontend - Styles

| File | Purpose |
|------|---------|
| `public/styles.css` | All styling; dark/light theme variables; responsive breakpoints |

### Frontend - JavaScript

| File | Purpose |
|------|---------|
| `public/app.js` | Teacher search/filter, mobile menu toggle, theme toggle, modal management, date formatting |

### Templates

| File | Purpose |
|------|---------|
| `views/index.ejs` | Homepage with teacher grid, search, and filter controls |
| `views/teacher.ejs` | Teacher detail page with bookings list and booking form |
| `views/bookings.ejs` | Bookings history page |
| `views/login.ejs` | Login form |
| `views/register.ejs` | Registration form |
| `views/partials/header.ejs` | Responsive navigation, theme toggle, user menu |
| `views/partials/footer.ejs` | Footer with copyright |

---

## Styling & Theme System

### CSS Variables (Dark Mode)
```css
--text-default: #ffffff        /* Main text */
--text-muted: #d1d7e0         /* Muted text */
--bg: #071126                  /* Page background */
--card: #0b1326                /* Card background */
--accent: #7c3aed              /* Primary color (purple) */
--accent-2: #06b6d4            /* Secondary color (cyan) */
```

### Light Mode Override
When `body.light` is active, all text colors automatically switch to light-mode safe values (#0b1220 for main text, light backgrounds for cards).

### Responsive Breakpoints
- **768px**: Mobile navigation switches to hamburger menu
- **820px**: Card grid adjusts column count
- **960px**: Two-column layouts (teacher + form) stack vertically

---

## Accessibility

### Features Implemented
- ✅ **ARIA labels** on interactive elements (buttons, inputs, nav)
- ✅ **Semantic HTML** (nav, main, aside, article)
- ✅ **Skip to content link** for keyboard users
- ✅ **Focus-visible styles** for keyboard navigation
- ✅ **Screen reader support** (aria-pressed, aria-expanded, aria-modal)
- ✅ **Keyboard shortcuts** (Escape to close modal, Tab navigation)
- ✅ **Color contrast** meets WCAG AA standards in both themes
- ✅ **Focus management** in modals (focus trap, restore focus on close)

### Testing Tips
1. Press **Tab** to navigate with keyboard
2. Use **Escape** to close modals
3. Toggle **theme** to verify contrast in both modes
4. Test with browser DevTools screen reader simulation

---

## Database

### Tables

#### `users`
```sql
id (INTEGER PRIMARY KEY)
name (TEXT)
username (TEXT UNIQUE)
password (TEXT)
role (TEXT: 'student' | 'teacher')
created_at (DATETIME)
```

#### `teachers`
```sql
id (INTEGER PRIMARY KEY)
name (TEXT)
subject (TEXT)
bio (TEXT)
```

#### `bookings`
```sql
id (INTEGER PRIMARY KEY)
teacher_id (INTEGER)
student_id (INTEGER)
time (DATETIME)
duration_minutes (INTEGER: 30, 60, 90)
notes (TEXT)
status (TEXT: 'pending' | 'accepted' | 'rejected')
created_at (DATETIME)
```

#### `contact_messages` (NEW)
```sql
id (INTEGER PRIMARY KEY)
name (TEXT)
email (TEXT)
message (TEXT)
created_at (DATETIME)
```

### Sample Queries
All database interactions are in `db.js`. Key functions:
- `getAllTeachers()` - Fetch all teachers
- `getTeacher(id)` - Fetch single teacher
- `getBookingsForTeacher(id)` - Get teacher's bookings
- `getBookingsForStudent(id)` - Get student's bookings
- `createBooking(data)` - Insert new booking
- `updateBookingStatus(id, status)` - Accept/reject booking

---

## API Routes

### Public Routes
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | Homepage (teacher listing) |
| GET | `/teacher/:id` | Teacher detail page |
| GET | `/login` | Login form |
| POST | `/login` | Process login |
| GET | `/register` | Registration form |
| POST | `/register` | Process registration |
| POST | `/logout` | Logout user |
| GET | `/about` | About page |
| GET | `/contact` | Contact form page |
| POST | `/contact` | Submit contact message |

### Admin Routes
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/admin` | Admin login or dashboard |
| POST | `/admin/login` | Authenticate admin |
| GET | `/admin/data` | Get all messages + stats (JSON) |
| POST | `/admin/message/:id/delete` | Delete a message |
| POST | `/admin/logout` | Logout from admin |

### Protected Routes (Authenticated Users)
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/bookings` | View user's bookings |
| POST | `/book` | Create booking (students only) |
| POST | `/booking/:id/accept` | Accept booking (teachers only) |
| POST | `/booking/:id/reject` | Reject booking (teachers only) |

---

## Recent UI Improvements

### v2.0 - Complete Redesign
✨ **Navigation**
- Responsive hamburger menu for mobile
- Fixed header with gradient background
- Theme toggle button in nav

✨ **Homepage**
- Teacher cards in a responsive grid
- Real-time search bar (filters by name/subject)
- Subject dropdown filter
- Star ratings placeholder

✨ **Teacher Detail**
- Hero section with teacher info and quick-book button
- Booking list with color-coded status pills
- Improved booking form styling
- Enhanced confirmation modal

✨ **Accessibility**
- Skip to content link
- ARIA attributes throughout
- Keyboard focus outlines
- Screen reader friendly

✨ **Themes**
- Dark mode with white text (#ffffff)
- Light mode with dark text (#0b1220)
- Consistent contrast across both themes
- Dropdown options styled for visibility

### v2.1 - Admin Features
✨ **Admin Panel** (`/admin`)
- Password-protected dashboard
- View all contact form submissions
- Real-time analytics (total, today, this week)
- Delete messages with confirmation
- Session management

✨ **Contact Form** (`/contact`)
- Professional contact page
- Form validation
- Database persistence
- User confirmation message

✨ **About Page** (`/about`)
- Information about the platform
- Contact details
- Links in header/footer

---

## Troubleshooting

### Issue: Server won't start
**Solution**: Ensure Node.js and npm are installed. Check for port 3000 conflicts.
```powershell
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Database errors
**Solution**: Delete `data.sqlite` and restart server to reinitialize the database.
```powershell
Remove-Item data.sqlite
npm start
```

### Issue: Search/filter not working
**Solution**: Ensure JavaScript is enabled. Check browser console for errors (F12 → Console tab).

### Issue: Theme toggle not persisting
**Solution**: Check browser localStorage is enabled. Clear cache and refresh.

### Issue: Dropdown options not visible
**Solution**: This is a browser limitation on native `<select>`. The styling in CSS applies where possible. Try a different browser or use developer tools to inspect styles.

### Issue: Admin panel password not working
**Solution**: The default password is `admin123`. To change it, set the environment variable before starting:
```powershell
$env:ADMIN_PASSWORD="your_new_password"
npm start
```

### Issue: Contact messages not appearing in admin
**Solution**: Ensure JavaScript is enabled in your browser. Messages are saved to the database when the form is submitted successfully. Check the server console for any errors.

### Issue: Delete message button not working
**Solution**: Ensure you're logged into the admin panel with the correct password. The delete button requires admin authentication.

---

## Future Enhancements

- 📅 Calendar view for bookings
- ⭐ Real ratings system
- 💬 Messaging between students and teachers
- 🔔 Email notifications for contact form submissions
- 📧 Email notifications for booking updates
- 📱 Mobile app (React Native)
- 🎨 Customizable color themes
- 🌍 Internationalization (i18n)
- 📊 Advanced admin analytics (charts, graphs)
- 🔑 Two-factor authentication

---

## Support & Questions

For issues or questions, refer to the inline code comments or review the route handlers in `index.js` and database functions in `db.js`.

---

**Last Updated**: November 15, 2025
**Version**: 2.1 (Admin Dashboard & Contact Features)
