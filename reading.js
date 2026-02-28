/**
 * reading.js — fetch Goodreads RSS feeds and render book cards
 * Uses corsproxy.io as a CORS proxy since Goodreads doesn't allow
 * direct cross-origin requests.
 */

(function () {
  const GOODREADS_ID = '120449140';
  const PROXY = 'https://corsproxy.io/?';

  const currentUrl = `https://www.goodreads.com/review/list_rss/${GOODREADS_ID}?shelf=currently-reading`;
  const recentUrl  = `https://www.goodreads.com/review/list_rss/${GOODREADS_ID}?shelf=read`;

  const container = document.getElementById('reading-feed');
  if (!container) return;

  function parseBooks(xmlText, limit) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, limit);
    return items.map(item => {
      const title = item.querySelector('title')?.textContent?.trim() || 'Unknown title';
      const link  = item.querySelector('link')?.textContent?.trim() || '#';
      const desc  = item.querySelector('description')?.textContent || '';

      // Parse the HTML description fragment for author and cover
      const tmp = document.createElement('div');
      tmp.innerHTML = desc;

      const imgEl  = tmp.querySelector('img');
      const cover  = imgEl?.src || '';
      // Author is in a <a> tag following "author:" text
      let author = '';
      const authorMatch = desc.match(/author:\s*([^<\n]+)/i);
      if (authorMatch) {
        const tmp2 = document.createElement('div');
        tmp2.innerHTML = authorMatch[1];
        author = tmp2.textContent.trim();
      }

      return { title, link, cover, author };
    });
  }

  async function fetchFeed(url, limit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const proxyUrl = PROXY + encodeURIComponent(url);
    try {
      const resp = await fetch(proxyUrl, { signal: controller.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      return parseBooks(text, limit);
    } finally {
      clearTimeout(timer);
    }
  }

  function renderCard(book, shelfLabel) {
    const card = document.createElement('div');
    card.className = 'reading-card';

    const coverHtml = book.cover
      ? `<img class="reading-cover" src="${book.cover}" alt="Cover: ${book.title}" loading="lazy" />`
      : `<div class="reading-cover-placeholder"></div>`;

    card.innerHTML = `
      ${coverHtml}
      <div class="reading-info">
        <span class="reading-shelf">${shelfLabel}</span>
        <a class="reading-title" href="${book.link}" target="_blank" rel="noopener">${book.title}</a>
        ${book.author ? `<span class="reading-author">by ${book.author}</span>` : ''}
      </div>
    `;
    return card;
  }

  async function init() {
    try {
      const [current, recent] = await Promise.all([
        fetchFeed(currentUrl, 1).catch(() => []),
        fetchFeed(recentUrl, 3).catch(() => []),
      ]);

      container.innerHTML = '';

      if (current.length === 0 && recent.length === 0) {
        container.innerHTML = '<p class="reading-loading">No books found right now.</p>';
        return;
      }

      current.forEach(book => container.appendChild(renderCard(book, 'Currently reading')));
      recent.forEach(book  => container.appendChild(renderCard(book, 'Recently read')));

    } catch (err) {
      // Fail silently — section just stays hidden
      container.closest('#reading').style.display = 'none';
    }
  }

  init();
})();
