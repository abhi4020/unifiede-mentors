# FitZone - Gym Management System

A modern, fully-featured Gym Management System built with HTML, CSS, JavaScript, Node.js, and Express. No Firebase required - uses local JSON file storage.

## Features

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Attractive CSS**: Gradient backgrounds, smooth animations, and modern color schemes
- **Professional Layout**: Well-organized sections with proper spacing and typography

### 📱 User Features
- **Navigation Menu**: Smooth, responsive navigation bar with hamburger menu
- **Hero Section**: Eye-catching landing section with call-to-action buttons
- **About Section**: Information about the gym with benefits list
- **Services**: 6 different service cards showcasing gym offerings
- **Gallery**: Beautiful image gallery with lightbox functionality showing gym facilities
- **Membership Plans**: Three membership tiers (Basic, Premium, Elite) with detailed features
- **Contact Form**: Professional contact form with validation
- **Footer**: Comprehensive footer with links and social media

### 🎯 Backend Features
- **Express.js Server**: RESTful API for managing gym data
- **JSON Storage**: Simple file-based data storage (no database setup needed)
- **Contact Management**: Store and retrieve contact form submissions
- **Member Registration**: Accept gym membership registrations
- **Email Notifications**: Send confirmation emails to members and admins
- **Admin API**: Statistics and data management endpoints
- **CORS Support**: Cross-origin requests support

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- A text editor or IDE

### Setup Steps

1. **Navigate to the project directory**
```bash
cd "c:\Users\admin\Desktop\Unified mentor projects\GYM management"
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the example env file
copy .env.example .env

# Edit .env and add your email configuration
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password
# PORT=5000
```

4. **Start the development server**
```bash
npm start
```

Or for automatic restart on file changes:
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5000` in your web browser

## Project Structure

```
GYM management/
├── index.html           # Main HTML file
├── styles.css          # All CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Backend Express server
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
└── data/
    ├── contacts.json   # Contact form submissions
    └── members.json    # Member registrations
```

## API Endpoints

### Contact Management
- **POST** `/api/contact` - Submit contact form
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Message content"
  }
  ```

- **GET** `/api/contacts` - Get all contacts (admin)
- **GET** `/api/contact/:id` - Get specific contact
- **DELETE** `/api/contact/:id` - Delete contact

### Member Management
- **POST** `/api/membership` - Register for membership
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "plan": "Premium"
  }
  ```

- **GET** `/api/members` - Get all members (admin)
- **PUT** `/api/member/:id` - Update member status
- **GET** `/api/statistics` - Get gym statistics

## Frontend Features

### Sections

1. **Navigation** - Sticky header with smooth scrolling
2. **Hero** - Large banner with call-to-action
3. **About** - Gym description with benefits
4. **Services** - 6 service cards with icons
5. **Gallery** - 6 facility images with lightbox
6. **Membership** - 3 pricing tiers
7. **Contact** - Contact form and info cards
8. **Footer** - Links and social media

### Interactive Features
- Smooth scroll navigation
- Mobile hamburger menu
- Hover animations and effects
- Lightbox image gallery
- Form validation
- Scroll animations
- Parallax effects

## CSS Features

- **Modern Color Scheme**: Primary orange (#ff6b35), Secondary blue (#004e89)
- **Responsive Grid Layouts**: Auto-fit and repeat grid patterns
- **Smooth Animations**: Keyframe animations and CSS transitions
- **Flexible Typography**: Responsive font sizes
- **Shadow and Depth**: Professional box shadows
- **Gradient Backgrounds**: Modern gradient overlays

## JavaScript Features

- **DOM Manipulation**: Dynamic content and styling
- **Event Handling**: Click, scroll, and form events
- **Intersection Observer**: Lazy loading animations
- **Lightbox Gallery**: Image viewing functionality
- **Form Validation**: Email and field validation
- **Smooth Scrolling**: Anchor link navigation
- **Mobile Menu**: Hamburger menu toggle

## Customization

### Change Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #ff6b35;      /* Change orange */
    --secondary-color: #004e89;    /* Change blue */
    --accent-color: #1b9cfc;       /* Change accent */
}
```

### Update Content
Edit the HTML in `index.html` to add:
- Different gym name and description
- Real contact information
- Updated social media links
- Your gym's actual images

### Configure Email
1. Enable "Less secure app access" in Gmail settings (or use App Password)
2. Update `.env` file with your email credentials
3. Change the admin email in `server.js` line ~75

## Data Storage

All data is stored in JSON files:
- **contacts.json**: Contact form submissions
- **members.json**: Member registrations

Data persists between server restarts.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: No heavy frameworks
- Fast Loading: Optimized images and CSS
- Smooth Animations: GPU-accelerated transitions
- Mobile Optimized: Responsive design

## Security Notes

- Use HTTPS in production
- Implement authentication for admin endpoints
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting on form endpoints

## Deployment

### Deploy to Heroku
```bash
heroku create your-app-name
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASSWORD=your-password
git push heroku main
```

### Deploy to Vercel
- Not recommended (Vercel doesn't support Node.js file system)
- Use Heroku, Railway, or similar platforms

### Deploy to Railway
```bash
npm install -g railway
railway login
railway up
```

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file or kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Email Not Sending
- Check email credentials in `.env`
- Ensure "Less secure app access" is enabled for Gmail
- Use App Password for Gmail instead of regular password

### CSS Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check if `styles.css` is in the same directory
- Restart the server

## Future Enhancements

- User authentication and login system
- Booking system for classes
- Payment integration (Stripe, PayPal)
- Admin dashboard
- Class scheduling
- Trainer profiles
- Workout plans
- Mobile app
- Database integration (MongoDB, PostgreSQL)

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, contact: support@fitzone.com

## Credits

Built with:
- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js
- Express.js
- Nodemailer

Images sourced from Unsplash.
