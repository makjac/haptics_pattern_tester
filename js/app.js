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
    else                 setStatus('Ready — wklej pattern lub wybierz preset', '');

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

  document.getElementById('dbsegs').textContent   = segs.filter(s => s.duration > 0).length;
  document.getElementById('dbtotal').textContent  = total + 'ms';
  document.getElementById('tlend').textContent    = total + 'ms';
  document.getElementById('tlmid').textContent    = Math.round(total / 2) + 'ms';
  document.getElementById('tdlbl').textContent    = '· ' + total + 'ms total';

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
}

setTimeout(init, 60);
