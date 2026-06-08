/* Main app: global state, display updates, init */

let segments = [];

function setStatus(msg, type) {
  document.getElementById('smsg').textContent = msg;
  const d = document.getElementById('sdot');
  d.className = 'sdot' + (type === 'play' ? ' play' : type === 'err' ? ' err2' : '');
}

function updateDisplay() {
  const ta = document.getElementById('ta');
  const { segs, err } = parsePat(ta.value);

  if (err) {
    ta.className = ta.value.trim() ? 'err' : '';
    if (ta.value.trim()) setStatus('Błąd: ' + err, 'err');
    else setStatus('Ready — wklej pattern lub wybierz preset', '');

    segments = [];
    drawTL([]);
    buildHandles([]);
    ['dbsegs', 'dbtotal', 'tlend', 'tlmid', 'tdlbl'].forEach(id => document.getElementById(id).textContent = '—');
    document.getElementById('tlmid').textContent = '';
    document.getElementById('tdlbl').textContent = '';
    return;
  }

  ta.className = 'ok2';
  segments = segs;
  const total = segs.reduce((a, s) => a + s.duration + s.pause, 0);
  const segCount = segs.filter(s => s.duration > 0).length;

  document.getElementById('dbstep').textContent = '0 / ' + segCount;
  document.getElementById('dbstep').className = 'dval';
  document.getElementById('dbsegs').textContent = segCount;
  document.getElementById('dbtotal').textContent = total + 'ms';
  document.getElementById('tlend').textContent = total + 'ms';
  document.getElementById('tlmid').textContent = Math.round(total / 2) + 'ms';
  document.getElementById('tdlbl').textContent = '· ' + total + 'ms total';

  setStatus('OK — ' + segs.filter(s => s.duration > 0).length + ' segmenty, ' + total + 'ms', '');
  drawTL(segs);
  buildHandles(segs);
  updateCodePreview();
}

function init() {
  const ta = document.getElementById('ta');
  ta.addEventListener('input', updateDisplay);
  ta.value = JSON.stringify(PRESETS.message);
  updateDisplay();

  window.addEventListener('resize', () => {
    drawTL(segments);
    buildHandles(segments);
  });

  /* Audio check */
  try {
    const t = new (window.AudioContext || window.webkitAudioContext)();
    t.close();
  } catch (e) {
    const b = document.getElementById('astat');
    b.textContent = 'NO AUDIO';
    b.className = 'bdg bdg-r';
  }

  /* Deep link */
  const p = new URLSearchParams(location.search);
  if (p.get('p')) {
    ta.value = decodeURIComponent(p.get('p'));
    updateDisplay();
  }

  checkChanged();
  initTotalScaler();
  initTheme();

  /* Close about dialog on backdrop click */
  const aboutDlg = document.getElementById('about-dialog');
  if (aboutDlg) {
    aboutDlg.addEventListener('click', e => {
      if (e.target === aboutDlg) aboutDlg.close();
    });
  }
}

function initTotalScaler() {
  const card = document.getElementById('dbtotal-card');
  if (!card) return;

  let startX, startTotal, startSegs;

  const onDown = e => {
    e.preventDefault();
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startSegs = segments.map(s => ({ ...s }));
    startTotal = startSegs.reduce((a, s) => a + s.duration + s.pause, 0) || 1;

    const onMove = ev => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const dx = cx - startX;
      const ratio = Math.max(0.1, (startTotal + dx * 2) / startTotal);

      segments = startSegs.map(s => ({
        duration: Math.max(10, Math.round(s.duration * ratio)),
        pause: Math.max(0, Math.round(s.pause * ratio)),
        power: s.power !== undefined ? s.power : 255
      }));

      syncTA(segments);
      updateDisplay();
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  card.addEventListener('mousedown', onDown);
  card.addEventListener('touchstart', onDown, { passive: false });
}

/* Theme toggle */
const THEME_KEY = 'hpt-theme';
let currentTheme = 'system';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  if (resolved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  if (typeof drawTL === 'function') drawTL(segments);
}

function cycleTheme() {
  const order = ['light', 'dark'];
  const idx = order.indexOf(currentTheme);
  currentTheme = order[(idx + 1) % order.length];
  try { localStorage.setItem(THEME_KEY, currentTheme); } catch (e) { }
  applyTheme(currentTheme);
}

function initTheme() {
  let saved;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { }
  currentTheme = saved || 'system';
  applyTheme(currentTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') applyTheme('system');
  });
}

/* About dialog */
function openAbout() {
  const d = document.getElementById('about-dialog');
  if (d) d.showModal();
}

function closeAbout() {
  const d = document.getElementById('about-dialog');
  if (d) d.close();
}

setTimeout(init, 60);
