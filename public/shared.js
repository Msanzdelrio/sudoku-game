/* shared.js — Auth helpers & nav bar for all pages */

const API = '';

function getToken() { return localStorage.getItem('token'); }
function isLoggedIn() { return !!getToken(); }
function logout() { localStorage.removeItem('token'); window.location.href = '/login.html'; }

async function fetchWithAuth(url, opts = {}) {
  const token = getToken();
  if (token) {
    opts.headers = { ...opts.headers, Authorization: `Bearer ${token}` };
  }
  return fetch(API + url, opts);
}

async function apiPost(url, body) {
  return fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function getCurrentUser() {
  if (!isLoggedIn()) return null;
  try {
    const res = await fetchWithAuth('/api/auth/me');
    if (!res.ok) { logout(); return null; }
    return res.json();
  } catch { return null; }
}

function injectNav() {
  const loggedIn = isLoggedIn();
  const nav = document.createElement('nav');
  nav.className = 'top-nav';
  nav.innerHTML = `
    <a href="/">🏠 Home</a>
    <a href="/sudoku.html">🧩 Sudoku</a>
    <a href="/minesweeper.html">💣 Minesweeper</a>
    ${loggedIn
      ? `<a href="/profile.html">👤 Profile</a><a href="#" onclick="logout();return false;">Logout</a>`
      : `<a href="/login.html">🔑 Login</a>`
    }
  `;
  document.body.prepend(nav);

  // Inject nav styles
  if (!document.getElementById('nav-styles')) {
    const style = document.createElement('style');
    style.id = 'nav-styles';
    style.textContent = `
      .top-nav {
        position: fixed; top: 0; left: 0; right: 0; z-index: 200;
        display: flex; justify-content: center; gap: 24px;
        padding: 12px 20px;
        background: rgba(15, 15, 30, 0.95); backdrop-filter: blur(8px);
        border-bottom: 2px solid #e94560;
      }
      .top-nav a {
        color: #aaa; text-decoration: none; font-weight: 600; font-size: 14px;
        transition: color 0.2s;
      }
      .top-nav a:hover { color: #e94560; }
      body { padding-top: 52px; }
    `;
    document.head.appendChild(style);
  }
}

function formatTime(s) {
  if (s == null) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

document.addEventListener('DOMContentLoaded', injectNav);
