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

// Contact form behavior: mailto fallback + optional EmailJS integration
document.addEventListener('DOMContentLoaded', () => {
	// Attempt to load optional `emailjs-config.js` if the developer added it.
	// This file should set `window.emailjsConfig = { serviceId, templateId, publicKey, toEmail }`.
	(function tryLoadEmailJSConfig(){
		const s = document.createElement('script');
		s.src = 'emailjs-config.js';
		s.async = true;
		s.onload = () => { console.info('emailjs-config.js loaded'); enableEmailJSTestButton(); };
		s.onerror = () => { /* no config present - continue without EmailJS */ };
		document.head.appendChild(s);
	})();

	// Update EmailJS status after trying to load config
	setTimeout(() => {
		const statusEl = document.getElementById('emailjs-status');
		if(window.emailjsConfig && window.emailjsConfig.serviceId){
			if(statusEl) statusEl.textContent = 'EmailJS configured — direct send enabled.';
		} else {
			if(statusEl) statusEl.textContent = 'EmailJS not configured. See EMAIL_SETUP.md and add `emailjs-config.js` to enable direct sends.';
			console.info('EmailJS not configured (no emailjs-config.js found or config missing).');
		}
	}, 350);

	const contactForm = document.querySelector('#contact-form');
	const copyBtn = document.querySelector('#copy-email');
	const visibleEmail = document.querySelector('#visible-email');
	const spinner = document.getElementById('spinner');
	const feedback = document.getElementById('contact-feedback');
	const sendMailtoBtn = document.getElementById('send-mailto');

	function showSpinner(v){ if(spinner) spinner.style.display = v ? 'inline-block' : 'none'; }
	function setFeedback(msg, color='green'){ if(feedback){ feedback.style.color = color; feedback.textContent = msg; } }

	if(copyBtn && visibleEmail){
		copyBtn.addEventListener('click', async () => {
			const email = visibleEmail.getAttribute('href').replace('mailto:','');
			try{ await navigator.clipboard.writeText(email); setFeedback('Email copied to clipboard', 'green'); }
			catch(e){ setFeedback('Copy failed — please copy manually', 'red'); }
		});
	}

	if(sendMailtoBtn){
		sendMailtoBtn.addEventListener('click', () => {
			const name = document.querySelector('#contact-name')?.value.trim() || '';
			const email = document.querySelector('#contact-email')?.value.trim() || '';
			const message = document.querySelector('#contact-message')?.value.trim() || '';
			const recipient = visibleEmail ? visibleEmail.getAttribute('href').replace('mailto:','') : 'your-email@example.com';
			const subject = encodeURIComponent(name ? `Message from ${name}` : 'Message from website');
			const body = encodeURIComponent((email ? `Reply to: ${email}\n\n` : '') + message);
			// Try to open mail client and show fallback modal if it didn't open
			const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
			openMailToWithFallback(mailto, decodeURIComponent(`Subject: ${subject}\n\n${body}`));
		});
	}

	if(!contactForm) return;

	contactForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		setFeedback('');

		const name = document.querySelector('#contact-name').value.trim();
		const email = document.querySelector('#contact-email').value.trim();
		const message = document.querySelector('#contact-message').value.trim();

		if(!name || !email || !message){ setFeedback('Please fill all fields.', 'red'); return; }

		// If EmailJS config is present, use it to send messages directly from the site.
		// To enable: set `window.emailjsConfig = { serviceId: 'your_service_id', templateId: 'your_template_id', publicKey: 'your_public_key' }`.
		const cfg = window.emailjsConfig;
		if(cfg && cfg.serviceId && cfg.templateId && cfg.publicKey){
			try{
				showSpinner(true);
				// load EmailJS SDK if not present
				if(!window.emailjs){
					await new Promise((resolve,reject)=>{
						const s = document.createElement('script');
						s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
						s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
					});
				}
				if(window.emailjs && !window.emailjs.__initialized){
					window.emailjs.init(cfg.publicKey);
					window.emailjs.__initialized = true;
				}

				const templateParams = { from_name: name, from_email: email, message: message };
				const resp = await window.emailjs.send(cfg.serviceId, cfg.templateId, templateParams);
				showSpinner(false);
				setFeedback('Message sent — thank you!', 'green');
				contactForm.reset();
			}catch(err){
				console.error('EmailJS error', err);
				showSpinner(false);
				setFeedback('Sending failed. Opening your email client as fallback.', 'orange');
				// fallback: open mail client
				const recipient = visibleEmail ? visibleEmail.getAttribute('href').replace('mailto:','') : 'your-email@example.com';
				const subject = encodeURIComponent(`Message from ${name}`);
				const body = encodeURIComponent(`Reply to: ${email}\n\n${message}`);
				const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
				openMailToWithFallback(mailto, decodeURIComponent(`Subject: ${subject}\n\n${body}`));
			}
		} else {
			// No EmailJS configured — fallback to mailto (opens user's mail client)
			const recipient = visibleEmail ? visibleEmail.getAttribute('href').replace('mailto:','') : 'your-email@example.com';
			const subject = encodeURIComponent(`Message from ${name}`);
			const body = encodeURIComponent(`Reply to: ${email}\n\n${message}`);
			const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
			openMailToWithFallback(mailto, decodeURIComponent(`Subject: ${subject}\n\n${body}`));
			setFeedback('Attempting to open your email client...', 'green');
			contactForm.reset();
		}
	});

	// Show test button if emailjsConfig is available
	function enableEmailJSTestButton(){
		const testBtn = document.getElementById('emailjs-test');
		if(window.emailjsConfig && testBtn){
			testBtn.style.display = 'inline-block';
			testBtn.addEventListener('click', async () => {
				setFeedback('Sending test message...', 'green');
				showSpinner(true);
				try{
					// ensure SDK loaded and initialized (same flow as form submit)
					if(!window.emailjs){
						await new Promise((resolve,reject)=>{
							const s = document.createElement('script');
							s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
							s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
						});
					}
					if(window.emailjs && !window.emailjs.__initialized){
						window.emailjs.init(window.emailjsConfig.publicKey);
						window.emailjs.__initialized = true;
					}
					const params = { from_name: 'Test', from_email: (window.emailjsConfig.toEmail || 'noreply@example.com'), message: 'This is a test message from the site.' };
					await window.emailjs.send(window.emailjsConfig.serviceId, window.emailjsConfig.templateId, params);
					setFeedback('Test message sent — check your inbox.', 'green');
				}catch(err){
					console.error('EmailJS test send failed', err);
					setFeedback('Test failed — check console and your EmailJS config.', 'red');
				}finally{ showSpinner(false); }
			});
		}
	}

	// Force fallback test button (helps debugging mailto fallback + modal)
	const forceFallbackBtn = document.getElementById('force-fallback-test');
	if(forceFallbackBtn){
		forceFallbackBtn.addEventListener('click', () => {
			const recipient = visibleEmail ? visibleEmail.getAttribute('href').replace('mailto:','') : 'your-email@example.com';
			const subject = encodeURIComponent('Fallback test');
			const body = encodeURIComponent('This is a test to verify the mailto fallback and modal behavior.');
			openMailToWithFallback(`mailto:${recipient}?subject=${subject}&body=${body}`, decodeURIComponent(`Subject: ${subject}\n\n${body}`));
		});
	}


	// Modal and mailto fallback helpers
	const mailModal = document.getElementById('mailto-modal');
	const modalMessage = document.getElementById('mailto-modal-message');
	const modalOpenBtn = document.getElementById('modal-open-mail');
	const modalCopyBtn = document.getElementById('modal-copy-message');
	const modalCloseBtn = document.getElementById('modal-close');
	let _pendingMailto = '';
	let _pendingMessage = '';

	function openModal(message, mailto){
		_pendingMailto = mailto || '';
		_pendingMessage = message || '';
		if(modalMessage) modalMessage.textContent = message || '';
		if(mailModal){ mailModal.setAttribute('aria-hidden','false'); }
	}

	function closeModal(){
		_pendingMailto = '';
		_pendingMessage = '';
		if(mailModal) mailModal.setAttribute('aria-hidden','true');
	}

	if(modalOpenBtn){ modalOpenBtn.addEventListener('click', () => { if(_pendingMailto) window.location.href = _pendingMailto; }); }
	if(modalCopyBtn){ modalCopyBtn.addEventListener('click', async () => { try{ await navigator.clipboard.writeText(_pendingMessage || ''); setFeedback('Message copied to clipboard', 'green'); }catch(e){ setFeedback('Copy failed — please copy manually', 'red'); }}); }
	if(modalCloseBtn){ modalCloseBtn.addEventListener('click', closeModal); }

	// Attempt to open mail client; if page doesn't become hidden within timeout, open modal
	function openMailToWithFallback(mailtoHref, plainMessage, timeout=900){
		let opened = false;
		function onVisibility(){ opened = true; cleanup(); }
		function cleanup(){ document.removeEventListener('visibilitychange', onVisibility); clearTimeout(timer); }
		document.addEventListener('visibilitychange', onVisibility);
		// Try to open mail client
		window.location.href = mailtoHref;
		const timer = setTimeout(() => {
			if(!opened){
				openModal(plainMessage, mailtoHref);
			}
			cleanup();
		}, timeout);
	}
});