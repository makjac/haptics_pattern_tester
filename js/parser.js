/* Pattern parser & textarea sync */

function parsePat(raw) {
  raw = (raw || '').trim();
  if (!raw) return { segs: [], err: 'empty' };

  let p;
  try {
    p = JSON.parse(raw);
  } catch (e) {
    return { segs: [], err: 'JSON: ' + e.message };
  }

  if (!Array.isArray(p)) return { segs: [], err: 'Musi być array' };
  if (!p.length)          return { segs: [], err: 'Pusty array' };

  if (typeof p[0] === 'object' && p[0] !== null) {
    const s = [];
    for (let i = 0; i < p.length; i++) {
      const x = p[i];
      if (typeof x.d !== 'number') return { segs: [], err: 'Brak "d" w segmencie ' + i };
      const pw = typeof x.p === 'number' ? x.p : 255;
      if (pw === 0) {
        if (s.length) s[s.length - 1].pause = (s[s.length - 1].pause || 0) + x.d;
      } else {
        s.push({ duration: x.d, power: pw, pause: 0 });
      }
    }
    return { segs: s, err: null };
  }

  for (let i = 0; i < p.length; i++) {
    if (typeof p[i] !== 'number') return { segs: [], err: 'Wartość ' + i + ' nie jest liczbą' };
  }

  const s = [];
  const delay = p[0] || 0;
  if (delay > 0) s.push({ duration: 0, power: 0, pause: delay });

  for (let i = 1; i + 1 < p.length; i += 2) {
    s.push({ duration: p[i], power: 255, pause: p[i + 1] || 0 });
  }

  if (p.length > 1 && p.length % 2 === 0) {
    s.push({ duration: p[p.length - 1], power: 255, pause: 0 });
  }

  return { segs: s, err: null };
}

function syncTA(segs) {
  const arr = [0];
  segs.forEach(s => {
    if (s.duration > 0) {
      arr.push(s.duration);
      if (s.pause > 0) arr.push(s.pause);
    }
  });
  const ta = document.getElementById('ta');
  ta.value = JSON.stringify(arr);
  ta.className = 'ok2';
}

function addSegment() {
  const { segs } = parsePat(document.getElementById('ta').value);
  const base = segs.length ? segs : [];

  if (!base.length) {
    base.push({ duration: 100, power: 255, pause: 0 });
  } else {
    const last = base[base.length - 1];
    if (last.pause === 0) {
      last.pause = 100;
    } else {
      base.push({ duration: 100, power: 255, pause: 0 });
    }
  }

  segments = base;
  syncTA(base);
  updateDisplay();
}

function removeLastSegment() {
  const { segs } = parsePat(document.getElementById('ta').value);
  const base = segs.length ? [...segs] : [];
  if (!base.length) return;

  const last = base[base.length - 1];
  if (last.pause > 0) {
    last.pause = 0;
  } else {
    base.pop();
  }

  segments = base;
  syncTA(base);
  updateDisplay();
}
