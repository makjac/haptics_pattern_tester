/* Code export & syntax highlight */

let lastExport = 'flutter';

function hl(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(Vibration|HapticPattern|HapticSegment|vibrate)\b/g, '<span class="fn">$1</span>')
    .replace(/\b(pattern|duration|power|from)\b/g, '<span class="nm">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
    .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');
}

function updateCodePreview() {
  doExport(lastExport, true);
}

function doExport(type, silent) {
  lastExport = type;
  ['efl', 'eex', 'esh'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(type === 'flutter' ? 'efl' : type === 'extended' ? 'eex' : 'esh').classList.add('active');

  const { segs, err } = parsePat(document.getElementById('ta').value);
  const prev = document.getElementById('cprev');

  if (err) {
    prev.innerHTML = '<span style="color:var(--t3)">— brak poprawnego patternu —</span>';
    return;
  }

  let code = '';
  if (type === 'flutter') {
    const arr = [0];
    segs.forEach(s => {
      if (s.duration > 0) {
        arr.push(s.duration);
        if (s.pause > 0) arr.push(s.pause);
      }
    });
    code = `// Flutter – Vibration package\nVibration.vibrate(\n  pattern: ${JSON.stringify(arr)},\n);`;
  } else if (type === 'extended') {
    const ext = [];
    segs.forEach(s => {
      if (s.duration > 0) ext.push({ d: s.duration, p: s.power });
      if (s.pause > 0)    ext.push({ d: s.pause, p: 0 });
    });
    code = `// Extended format (d=duration ms, p=power 0-255)\n${JSON.stringify(ext, null, 2)}`;
  } else {
    const raw = document.getElementById('ta').value.trim();
    code = `// Share link (URL encoded pattern)\n${location.href.split('?')[0]}?p=${encodeURIComponent(raw)}`;
  }

  prev.innerHTML = hl(code);

  if (!silent) {
    navigator.clipboard.writeText(code.replace(/<[^>]+>/g, '')).catch(() => {});
    const msg = document.getElementById('emsg');
    msg.textContent = 'Copied!';
    msg.style.opacity = '1';
    setTimeout(() => msg.style.opacity = '0', 1800);
  }
}
