// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
    }
});

// Membership Plan Selection
document.querySelectorAll('.membership-card .btn').forEach(button => {
    button.addEventListener('click', function() {
        const planName = this.closest('.membership-card').querySelector('h3').textContent;
        alert(`Thank you for selecting the ${planName} plan! Our team will contact you soon.`);
    });
});

// Contact Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: this.querySelector('input[placeholder="Your Name"]').value,
            email: this.querySelector('input[placeholder="Your Email"]').value,
            subject: this.querySelector('input[placeholder="Subject"]').value,
            message: this.querySelector('textarea').value
        };
        
        // Send to backend
        sendContactForm(formData);
    });
}

// Send contact form data to backend
function sendContactForm(formData) {
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you! Your message has been sent successfully.');
            contactForm.reset();
        } else {
            alert('Error sending message. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error sending message. Please try again.');
    });
}

// Gallery Lightbox functionality
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', function() {
        const imgSrc = this.querySelector('img').src;
        const title = this.querySelector('.gallery-overlay h3').textContent;
        openLightbox(imgSrc, title);
    });
});

function openLightbox(imgSrc, title) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="close">&times;</span>
            <img src="${imgSrc}" alt="${title}">
            <p>${title}</p>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Add lightbox styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            display: flex;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }

        .lightbox-content img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
        }

        .lightbox-content p {
            color: white;
            text-align: center;
            margin-top: 20px;
            font-size: 20px;
        }

        .close {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease;
        }

        .close:hover {
            color: #ff6b35;
        }
    `;
    document.head.appendChild(style);
    
    lightbox.querySelector('.close').addEventListener('click', function() {
        lightbox.remove();
    });
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.remove();
        }
    });
}

// Scroll Animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe service cards and membership cards
document.querySelectorAll('.service-card, .membership-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Dynamic section heading animation
const sectionHeadings = document.querySelectorAll('section > .container > h2');
sectionHeadings.forEach(heading => {
    heading.style.opacity = '0';
    heading.style.transform = 'translateY(20px)';
    heading.style.transition = 'all 0.6s ease';
    observer.observe(heading);
});

// Count up animation for stats (optional)
function animateCountUp(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Add more interactivity
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.background = 'white';
    });
});

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Enhanced form validation on input
const contactInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
contactInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#ff6b35';
        } else if (this.type === 'email' && !validateEmail(this.value)) {
            this.style.borderColor = '#ff6b35';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary-color)';
    });
});

// Mobile menu close on scroll
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > lastScrollTop + 100) {
        navMenu.classList.remove('active');
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// Add parallax effect to hero section
const hero = document.querySelector('.hero');
window.addEventListener('scroll', function() {
    if (window.scrollY < hero.offsetHeight) {
        hero.style.backgroundPosition = `center ${window.scrollY * 0.5}px`;
    }
});

// Initialize tooltips for info cards
document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.borderTop = '4px solid var(--primary-color)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.borderTop = 'none';
    });
});

console.log('GYM Management System Loaded Successfully!');

// FAQ Toggle Function
function toggleFAQ(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('i');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-content').forEach(item => {
        if (item !== content) {
            item.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.faq-header i').forEach(i => {
        if (i !== icon) {
            i.style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current item
    content.classList.toggle('active');
    icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
}
