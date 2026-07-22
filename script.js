const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu');

/* Mobile menu toggle */
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

/* Highlight the current page in the nav (multi-page site, no scroll-based detection needed) */
const currentPage = document.body.dataset.page;
document.querySelectorAll('.nav [data-page]').forEach(link => {
  link.classList.toggle('active', link.dataset.page === currentPage);
});

/* ==========================================================================
   ACCOUNT / "AUTH" SIMULATION
   There's no backend yet, so we fake a logged-in session with localStorage.
   This whole block is a placeholder: once this gets rebuilt in Next.js +
   Node.js, swap getUser/setUser/clearUser for real session/cookie/API
   calls - the markup IDs (#signinLink, #navAccount, #avatarBtn, etc.) and
   the refreshNavAccount() call sites can stay exactly the same.
   ========================================================================== */
const AUTH_KEY = 'suriUser';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch { return null; }
}
function setUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(AUTH_KEY);
}
function initials(name) {
  return (name || 'U').trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function refreshNavAccount() {
  const user = getUser();
  const signinLink = document.querySelector('#signinLink');
  const navAccount = document.querySelector('#navAccount');
  const avatarBtn = document.querySelector('#avatarBtn');
  if (!signinLink || !navAccount) return;

  if (user) {
    signinLink.hidden = true;
    navAccount.hidden = false;
    if (avatarBtn) avatarBtn.textContent = initials(user.name);
  } else {
    signinLink.hidden = false;
    navAccount.hidden = true;
  }
}
refreshNavAccount();

/* Avatar dropdown toggle */
const avatarBtn = document.querySelector('#avatarBtn');
const accountMenu = document.querySelector('#accountMenu');
if (avatarBtn && accountMenu) {
  avatarBtn.addEventListener('click', event => {
    event.stopPropagation();
    const open = accountMenu.classList.toggle('open');
    avatarBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', () => accountMenu.classList.remove('open'));
}

/* Log out */
const logoutBtn = document.querySelector('#logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearUser();
    window.location.href = 'index.html';
  });
}

/* Dashboard page guard + greeting */
if (currentPage === 'dashboard') {
  const user = getUser();
  if (!user) {
    window.location.href = 'signin.html';
  } else {
    const nameEl = document.querySelector('#userName');
    if (nameEl) nameEl.textContent = user.name || 'there';
  }
}

/* ==========================================================================
   PAGE-SPECIFIC FORM HANDLERS
   ========================================================================== */

/* News/search page - calls the local backend (server/server.js) which
   proxies the request to the Anthropic API. Update FACT_CHECK_API_URL if
   you deploy the backend somewhere other than localhost. */
const FACT_CHECK_API_URL = 'http://localhost:3001/api/fact-check';

const searchForm = document.querySelector('#searchForm');
if (searchForm) {
  const resultCard = document.querySelector('#resultCard');
  const verdictBadge = document.querySelector('#verdictBadge');
  const confidenceText = document.querySelector('#confidenceText');
  const confidenceFill = document.querySelector('#confidenceFill');
  const resultExplanation = document.querySelector('#resultExplanation');
  const resultMeta = document.querySelector('#resultMeta');

  searchForm.addEventListener('submit', async event => {
    event.preventDefault();
    const input = document.querySelector('#searchInput');
    const status = document.querySelector('#searchStatus');
    const claim = input.value.trim();
    if (!claim) { input.focus(); return; }

    resultCard.hidden = true;
    status.textContent = 'Checking article…';
    status.classList.remove('verdict-real', 'verdict-false');

    try {
      const response = await fetch(FACT_CHECK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim })
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        status.textContent = data.error || 'Something went wrong. Is the server running?';
        return;
      }

      status.textContent = '';

      const verdictLabel = data.verdict === 'real' ? 'Likely Real'
        : data.verdict === 'false' ? 'Likely False'
        : 'Uncertain';

      verdictBadge.textContent = verdictLabel;
      verdictBadge.className = 'verdict-badge ' + (data.verdict === 'real' ? 'real' : data.verdict === 'false' ? 'false' : '');

      const confidence = Number(data.confidence) || 0;
      confidenceText.textContent = `${confidence}% confidence`;
      confidenceFill.style.width = confidence + '%';

      resultExplanation.textContent = data.explanation || '';
      resultMeta.textContent = 'Checked just now · Suri.AI cross-checking engine';

      resultCard.hidden = false;
    } catch (err) {
      console.error(err);
      status.textContent = 'Could not reach the fact-check server. Make sure it is running (see server/README).';
    }
  });
}

/* Contact page */
const contactForm = document.querySelector('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    document.querySelector('#contactStatus').textContent = 'Message ready to send.';
  });
}

/* Register page -> goes to Sign In on submit */
const registerForm = document.querySelector('#registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', event => {
    event.preventDefault();
    window.location.href = 'signin.html';
  });
}

/* Sign in page -> creates the fake session and goes to Dashboard */
const signinForm = document.querySelector('#signinForm');
if (signinForm) {
  signinForm.addEventListener('submit', event => {
    event.preventDefault();
    const idField = signinForm.querySelector('input');
    const rawValue = idField ? idField.value.trim() : '';
    setUser({ name: rawValue || 'User' });
    window.location.href = 'dashboard.html';
  });
}
