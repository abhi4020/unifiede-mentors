document.addEventListener('DOMContentLoaded', function(){
  // convert all elements with data-time to local string
  document.querySelectorAll('[data-time]').forEach(el => {
    try {
      const t = el.getAttribute('data-time');
      const dt = new Date(t);
      if (!isNaN(dt)) {
        el.textContent = dt.toLocaleString();
      }
    } catch(e){}
  });

  // show modal if present
  const modal = document.getElementById('booking-confirmation-modal');
  if (modal) {
    // show modal and manage focus for accessibility
    modal.style.display = 'flex';
    const dialog = modal.querySelector('.modal-dialog');
    const close = modal.querySelector('.close-modal');
    const previouslyFocused = document.activeElement;
    if (close) {
      close.addEventListener('click', () => {
        modal.style.display = 'none';
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
      });
      close.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close.click(); } });
    }
    // close on Escape
    document.addEventListener('keydown', function escHandler(e){ if(e.key === 'Escape'){ modal.style.display = 'none'; if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus(); document.removeEventListener('keydown', escHandler); }});
    // focus the dialog's close button
    if (close && close.focus) close.focus();
  }
  
  // mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('active');
      
      // Update toggle button icon for accessibility
      const toggleIcon = navToggle.querySelector('svg');
      if (isExpanded) {
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
      } else {
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />';
      }
    });

    // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (siteNav.classList.contains('active')) {
      if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) {
        siteNav.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        const toggleIcon = navToggle.querySelector('svg');
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
      }
        }
    });

      // Prevent clicks inside the menu from closing it
      siteNav.addEventListener('click', (e) => {
        e.stopPropagation();
      });
  }
  
  // theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  function applyTheme(t){
    if(t==='light') document.body.classList.add('light'); else document.body.classList.remove('light');
    localStorage.setItem('theme', t);
  }

  // --- Teacher search & filter (index page) ---
  const teacherSearch = document.getElementById('teacher-search');
  const subjectFilter = document.getElementById('subject-filter');
  const cardsContainer = document.querySelector('.cards');
  const noResults = document.getElementById('no-results');

  if (cardsContainer && (teacherSearch || subjectFilter)) {
    const teacherCards = Array.from(cardsContainer.querySelectorAll('.teacher-card'));

    function filterTeachers() {
      const q = teacherSearch ? teacherSearch.value.trim().toLowerCase() : '';
      const subj = subjectFilter ? subjectFilter.value : '';
      let visible = 0;
      teacherCards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const subject = (card.dataset.subject || '');
        const matchesQuery = q === '' || name.indexOf(q) !== -1 || subject.toLowerCase().indexOf(q) !== -1;
        const matchesSubject = subj === '' || subject === subj;
        if (matchesQuery && matchesSubject) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });
      if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
    }

    let debounceTimer = null;
    if (teacherSearch) teacherSearch.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(filterTeachers, 150); });
    if (subjectFilter) subjectFilter.addEventListener('change', filterTeachers);
  }
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
  if(themeToggle){
    // keep aria-pressed in sync for assistive tech
    themeToggle.setAttribute('aria-pressed', document.body.classList.contains('light'));
    themeToggle.addEventListener('click', ()=>{
      const cur = document.body.classList.contains('light') ? 'light' : 'dark';
      const next = cur==='light' ? 'dark' : 'light';
      applyTheme(next);
      themeToggle.setAttribute('aria-pressed', next === 'light');
    });
  }
});
