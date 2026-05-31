/**
 * नेपाल परिचय — Main App JavaScript
 */

// ── Sidebar Toggle ──
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (!toggle || !sidebar) return;
  
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ── Active Nav Item ──
function setActiveNav() {
  const path = window.location.pathname;
  const filename = path.split('/').pop();
  
  document.querySelectorAll('.nav-chapter-header').forEach(el => {
    const href = el.getAttribute('href');
    if (href && (href === filename || href.includes(filename))) {
      el.classList.add('active');
      el.closest('.nav-chapter')?.classList.add('open');
    }
  });
  
  // Expand chapter containing current page
  document.querySelectorAll('.nav-sub-item').forEach(el => {
    const href = el.getAttribute('href') || '';
    if (href === filename || window.location.hash && el.getAttribute('href') === window.location.hash) {
      el.style.color = 'var(--gold-light)';
    }
  });
}

// ── Chapter TOC Toggle ──
function initChapterNav() {
  document.querySelectorAll('.nav-chapter-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const chapter = header.closest('.nav-chapter');
      const href = header.getAttribute('href');
      
      // If it has sub-items, toggle
      if (chapter.querySelector('.nav-sub-list')) {
        chapter.classList.toggle('open');
      }
    });
  });
}

// ── Reading Progress Bar ──
function initReadingProgress() {
  const bar = document.querySelector('.reading-progress-bar');
  if (!bar) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Lightbox ──
function openLightbox(img) {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  
  const lbImg = overlay.querySelector('.lightbox-img');
  const lbCaption = overlay.querySelector('.lightbox-caption');
  
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = img.alt || '';
  
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

function initLightbox() {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

// ── Scroll-spy for chapter TOC ──
function initScrollSpy() {
  const tocLinks = document.querySelectorAll('.toc-link[href]');
  if (!tocLinks.length) return;
  
  const headings = [];
  tocLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const el = document.getElementById(id);
    if (el) headings.push({ el, link });
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const found = headings.find(h => h.el === entry.target);
        if (found) found.link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -75% 0px' });
  
  headings.forEach(h => observer.observe(h.el));
}

// ── Auto-add IDs to headings ──
function addHeadingIds() {
  const content = document.querySelector('.book-content');
  if (!content) return;
  
  const seen = {};
  content.querySelectorAll('h1, h2, h3, h4').forEach(h => {
    if (!h.id) {
      let id = h.textContent.trim()
        .replace(/[^\u0900-\u097F\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 50);
      
      if (seen[id]) { id = id + '-' + (++seen[id]); }
      else { seen[id] = 1; }
      
      h.id = id;
    }
  });
}

// ── Theme: font size controls ──
function initFontSize() {
  const stored = localStorage.getItem('np_fontsize');
  if (stored) applyFontSize(parseInt(stored));
  
  document.querySelectorAll('[data-fontsize]').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = parseInt(btn.dataset.fontsize);
      applyFontSize(size);
      localStorage.setItem('np_fontsize', size);
    });
  });
}

function applyFontSize(size) {
  const content = document.querySelector('.book-content');
  if (!content) return;
  const sizes = { 1: '15px', 2: '17px', 3: '19px', 4: '21px' };
  content.style.fontSize = sizes[size] || '17px';
}

// ── Init all ──
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  setActiveNav();
  initChapterNav();
  initReadingProgress();
  initLightbox();
  addHeadingIds();
  initScrollSpy();
  initFontSize();
  
  // Lazy load all images
  if ('IntersectionObserver' in window) {
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    // Browser handles this natively with loading="lazy"
  }
});
