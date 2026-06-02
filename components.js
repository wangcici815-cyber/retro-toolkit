/* components.js — shared header, footer, and utility injection */

const SITE_NAME = 'RETRO<span class="text-amber">TOOLKIT</span>';

const NAV_LINKS = [
  { href: '/',     label: 'Home',   },
  { href: '/tools',     label: 'Tools',  badge: 'FREE' },
  { href: '/blog',      label: 'Blog',   },
  { href: '/guides',    label: 'Guides', },
  { href: '/about',     label: 'About',  },
];

function buildHeader(activePage) {
  const links = NAV_LINKS.map(l => {
    const active = l.href === activePage ? 'active' : '';
    const badge = l.badge ? `<span class="nav-badge">${l.badge}</span>` : '';
    return `<a href="${l.href}" class="${active}">${l.label}${badge}</a>`;
  }).join('');

  return `
<header class="site-header">
  <div class="container nav-inner">
    <a href="/" class="nav-logo">
      <span class="logo-icon">📼</span>
      ${SITE_NAME}
    </a>
    <nav class="nav-links" id="nav-links">${links}</nav>
    <div class="hamburger" id="hamburger" aria-label="Menu" role="button" tabindex="0">
      <span></span><span></span><span></span>
    </div>
  </div>
</header>`;
}

function buildFooter() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-logo">📼 RETROTOOLKIT</div>
        <p class="footer-desc">The most immersive free retro audio & VHS video toolkit on the internet. Built for musicians, creators, and nostalgia lovers.</p>
        <div class="mt-16 terminal" style="font-size:0.68rem;padding:12px 16px;">
          <span class="prompt">&gt; </span>ALL_TOOLS: FREE<br>
          <span class="prompt">&gt; </span>NO_ACCOUNT_REQUIRED<br>
          <span class="prompt">&gt; </span>LOCAL_PROCESSING: ENABLED<br>
          <span class="prompt">&gt; </span>STATUS: <span style="color:var(--green)">ONLINE ■</span>
        </div>
      </div>
      <div class="footer-col">
        <h4>Tools</h4>
        <ul>
          <li><a href="/tool-tape">Tape Noise Simulator</a></li>
          <li><a href="/tool-8bit">8-Bit Audio Converter</a></li>
          <li><a href="/tool-vhs">VHS Effect Generator</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="/blog">Retro Culture Blog</a></li>
          <li><a href="/guides">Beginner's Guides</a></li>
          <li><a href="/about">About This Site</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2025 RetroToolkit · Free Tools, No Ads That Suck · Built with ♥ for the retro community</span>
      <span class="footer-status"><span class="status-dot"></span>ALL SYSTEMS NOMINAL</span>
    </div>
  </div>
</footer>`;
}

function initComponents(activePage) {
  document.body.insertAdjacentHTML('afterbegin', buildHeader(activePage));
  document.body.insertAdjacentHTML('beforeend', buildFooter());

  // Hamburger toggle
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('nav-links');
  if (ham && nav) {
    ham.addEventListener('click', () => nav.classList.toggle('open'));
    ham.addEventListener('keypress', e => { if (e.key === 'Enter') nav.classList.toggle('open'); });
  }
}

// Slider value display helper
function bindSlider(sliderId, displayId, suffix = '') {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  if (!slider || !display) return;
  display.textContent = slider.value + suffix;
  slider.addEventListener('input', () => { display.textContent = slider.value + suffix; });
}

// Checkbox helper
function initCheckboxes() {
  document.querySelectorAll('.checkbox-item').forEach(item => {
    const input = item.querySelector('input[type=checkbox]');
    const box = item.querySelector('.checkbox-box');
    if (!input || !box) return;
    box.textContent = input.checked ? '✓' : '';
    input.addEventListener('change', () => { box.textContent = input.checked ? '✓' : ''; });
  });
}

// File drop highlight
function initFileDrop(dropZoneId) {
  const zone = document.getElementById(dropZoneId);
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); });
}
