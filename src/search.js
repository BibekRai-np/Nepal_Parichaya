/**
 * नेपाल परिचय — Client-side Full Text Search
 * Uses FlexSearch for fast Devanagari text search
 */

let searchIndex = null;
let chaptersData = [];
let chapterContents = {};

async function initSearch() {
  try {
    // Load FlexSearch
    if (typeof FlexSearch === 'undefined') return;
    
    // Load chapters metadata
    const resp = await fetch('../src/chapters_meta.json').catch(() => fetch('src/chapters_meta.json'));
    if (!resp.ok) return;
    chaptersData = await resp.json();
    
    // Build index
    searchIndex = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['title', 'short_title', 'preview', 'content'],
        store: ['title', 'short_title', 'icon', 'number', 'preview']
      },
      tokenize: 'forward',
      encode: false,
      cache: true
    });
    
    // Index each chapter
    for (const ch of chaptersData) {
      searchIndex.add({
        id: ch.id,
        title: ch.title,
        short_title: ch.short_title,
        icon: ch.icon,
        number: ch.number,
        preview: ch.preview,
        content: ch.preview
      });
    }
    
    console.log('Search initialized with', chaptersData.length, 'chapters');
  } catch(e) {
    console.warn('Search init error:', e);
  }
}

function searchQuery(query) {
  if (!query || query.length < 2) return [];
  if (!searchIndex) {
    // Simple fallback search
    const q = query.toLowerCase();
    return chaptersData.filter(ch => 
      ch.title.includes(query) || 
      ch.short_title.includes(query) || 
      ch.preview.includes(query)
    ).slice(0, 5).map(ch => ({...ch, snippet: getSnippet(ch.preview, query)}));
  }
  
  try {
    const results = searchIndex.search(query, { limit: 8, suggest: true });
    const ids = new Set();
    results.forEach(r => r.result.forEach(id => ids.add(id)));
    
    return Array.from(ids).map(id => {
      const ch = chaptersData.find(c => c.id === id);
      if (!ch) return null;
      return { ...ch, snippet: getSnippet(ch.preview, query) };
    }).filter(Boolean);
  } catch(e) {
    return [];
  }
}

function getSnippet(text, query) {
  const pos = text.toLowerCase().indexOf(query.toLowerCase());
  if (pos === -1) return text.slice(0, 120) + '...';
  
  const start = Math.max(0, pos - 40);
  const end = Math.min(text.length, pos + 100);
  let snippet = (start > 0 ? '...' : '') + text.slice(start, end) + '...';
  
  // Highlight
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  snippet = snippet.replace(re, m => `<mark>${m}</mark>`);
  return snippet;
}

function getChapterLink(chId, fromChapter) {
  // Determine relative path
  const inChapter = window.location.pathname.includes('/chapters/');
  if (inChapter) {
    return `${chId}.html`;
  }
  return `chapters/${chId}.html`;
}

// UI Search Handler
function setupSearchUI(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;
  
  let debounceTimer;
  
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = input.value.trim();
      if (q.length < 2) {
        dropdown.classList.remove('show');
        return;
      }
      
      const results = searchQuery(q);
      if (!results.length) {
        dropdown.innerHTML = '<div class="search-result-item"><div class="sri-title" style="color:#6B5440">कोही नतिजा फेला परेन</div></div>';
        dropdown.classList.add('show');
        return;
      }
      
      dropdown.innerHTML = results.map(r => `
        <a class="search-result-item" href="${getChapterLink(r.id)}">
          <div class="sri-label">परिच्छेद ${r.number} · ${r.icon}</div>
          <div class="sri-title">${r.title}</div>
          <div class="sri-snippet">${r.snippet || ''}</div>
        </a>
      `).join('');
      dropdown.classList.add('show');
    }, 200);
  });
  
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('show');
      input.value = '';
    }
  });
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  setupSearchUI('search-input', 'search-dropdown');
});
