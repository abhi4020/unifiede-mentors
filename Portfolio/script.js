const menuIcon = document.querySelector('#menu-icon');
const navLinks = document.querySelector('.nav-links');

menuIcon.onclick = () => {
navLinks.classList.toggle('active');
}

// Theme toggle (dark / light) with persistence and aria announcement
const themeToggleBtn = document.querySelector('#theme-toggle');
let themeAnnouncer = null;
function applyTheme(theme){
	if(theme === 'dark'){
		document.documentElement.setAttribute('data-theme','dark');
		if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
		if(themeAnnouncer) themeAnnouncer.textContent = 'Dark mode enabled';
	} else {
		document.documentElement.removeAttribute('data-theme');
		if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
		if(themeAnnouncer) themeAnnouncer.textContent = 'Light mode enabled';
	}
}

// initialize theme on load and prepare announcer
document.addEventListener('DOMContentLoaded', () => {
	try{
		// create or find aria-live announcer
		themeAnnouncer = document.querySelector('#theme-announcer');
		if(!themeAnnouncer){
			themeAnnouncer = document.createElement('div');
			themeAnnouncer.id = 'theme-announcer';
			themeAnnouncer.className = 'visually-hidden';
			themeAnnouncer.setAttribute('aria-live','polite');
			document.body.appendChild(themeAnnouncer);
		}

		const stored = localStorage.getItem('theme');
		if(stored) applyTheme(stored);
		else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
			applyTheme('dark');
		} else {
			applyTheme('light');
		}

		if(themeToggleBtn){
			themeToggleBtn.addEventListener('click', () => {
				const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
				const next = current === 'dark' ? 'light' : 'dark';
				applyTheme(next);
				localStorage.setItem('theme', next);
			});
		}
	}catch(e){
		console.error('Theme init error', e);
	}
});