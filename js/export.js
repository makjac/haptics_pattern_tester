/* Code export & syntax highlight */

let lastExport = 'flutter';

function copyExport() {
  const prev = document.getElementById('cprev');
  const text = prev.innerText || prev.textContent || '';
  if (!text || text === '—') return;
  navigator.clipboard.writeText(text).catch(() => { });
  const msg = document.getElementById('emsg');
  msg.textContent = 'Copied!';
  msg.style.opacity = '1';
  setTimeout(() => msg.style.opacity = '0', 1800);
}

function hl(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(Vibration|HapticPattern|HapticSegment|vibrate|val|var|let|guard|import|try|catch|fun|as|class|return|if|else|func|guard|let|var|return|try|catch|import|class|init|self|throws|throw)\b/g, '<span class="fn">$1</span>')
    .replace(/\b(pattern|duration|power|from|timings|amplitudes|effect|intensity|sharpness|events|engine|player|relativeTime|eventType|parameters|parameterID|hapticIntensity|hapticSharpness|hapticContinuous|supportsHaptics|makePlayer|start|createWaveform|VibrationEffect|CHHapticEngine|CHHapticEvent|CHHapticEventParameter|CHHapticPattern|TimeInterval|Vibrator|Context|Float|TimeInterval)\b/g, '<span class="nm">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>')
    .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');
}

function updateCodePreview() {
  doExport(lastExport, true);
}

function doExport(type, silent) {
  lastExport = type;
  ['efl', 'eand', 'eios', 'eex', 'esh'].forEach(id => document.getElementById(id).classList.remove('active'));
  const activeId =
    type === 'flutter' ? 'efl' :
      type === 'android' ? 'eand' :
        type === 'ios' ? 'eios' :
          type === 'extended' ? 'eex' : 'esh';
  document.getElementById(activeId).classList.add('active');

  const { segs, err } = parsePat(document.getElementById('ta').value);
  const prev = document.getElementById('cprev');

  if (err) {
    prev.innerHTML = '<span style="color:var(--t3)">— brak poprawnego patternu —</span>';
    return;
  }

  let code = '';
  if (type === 'flutter') {
    const arr = [0];
    const ints = [0];
    let hasCustomInt = false;
    segs.forEach(s => {
      if (s.duration > 0) {
        arr.push(s.duration);
        ints.push(s.power);
        if (s.power !== 255) hasCustomInt = true;
        if (s.pause > 0) {
          arr.push(s.pause);
          ints.push(0);
        }
      }
    });
    code = `// Flutter – Vibration package\nVibration.vibrate(\n  pattern: ${JSON.stringify(arr)},`;
    if (hasCustomInt) {
      code += `\n  intensities: ${JSON.stringify(ints)},`;
    }
    code += `\n);`;
  } else if (type === 'android') {
    const timings = [0];
    const amplitudes = [0];
    segs.forEach(s => {
      if (s.duration > 0) {
        timings.push(s.duration);
        amplitudes.push(s.power);
      }
      if (s.pause > 0) {
        timings.push(s.pause);
        amplitudes.push(0);
      }
    });
    code = `// Android (Kotlin) – VibrationEffect API 26+\nval vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator\nval timings = longArrayOf(${timings.map(t => t + 'L').join(', ')})\nval amplitudes = intArrayOf(${amplitudes.join(', ')})\nval effect = VibrationEffect.createWaveform(timings, amplitudes, -1)\nvibrator.vibrate(effect)`;
  } else if (type === 'ios') {
    let ev = '';
    let t = 0.0;
    segs.forEach(s => {
      if (s.duration > 0) {
        const intensityVal = (s.power / 255).toFixed(2);
        const durSec = (s.duration / 1000).toFixed(3);
        ev += `let i${Math.round(t * 1000)} = CHHapticEventParameter(parameterID: .hapticIntensity, value: ${intensityVal})\n`;
        ev += `let s${Math.round(t * 1000)} = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)\n`;
        ev += `events.append(CHHapticEvent(eventType: .hapticContinuous, parameters: [i${Math.round(t * 1000)}, s${Math.round(t * 1000)}], relativeTime: ${t.toFixed(3)}, duration: ${durSec}))\n`;
        t += s.duration / 1000;
      }
      if (s.pause > 0) {
        t += s.pause / 1000;
      }
    });
    code = `// iOS (Swift) – Core Haptics\nimport CoreHaptics\n\nlet engine = try! CHHapticEngine()\ntry! engine.start()\n\nvar events = [CHHapticEvent]()\n${ev}\nlet pattern = try! CHHapticPattern(events: events, parameters: [])\nlet player = try! engine.makePlayer(with: pattern)\ntry! player.start(atTime: 0)`;
  } else if (type === 'extended') {
    const ext = [];
    segs.forEach(s => {
      if (s.duration > 0) ext.push({ d: s.duration, p: s.power });
      if (s.pause > 0) ext.push({ d: s.pause, p: 0 });
    });
    code = `// Extended format (d=duration ms, p=power 0-255)\n${JSON.stringify(ext, null, 2)}`;
  } else {
    const raw = document.getElementById('ta').value.trim();
    code = `${location.href.split('?')[0]}?p=${encodeURIComponent(raw)}`;
  }

  prev.innerHTML = hl(code);

  if (!silent) {
    navigator.clipboard.writeText(code.replace(/<[^>]+>/g, '')).catch(() => { });
    const msg = document.getElementById('emsg');
    msg.textContent = 'Copied!';
    msg.style.opacity = '1';
    setTimeout(() => msg.style.opacity = '0', 1800);
  }
}
