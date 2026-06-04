/* Audio context, sound generation & playback engine */

let aCtx = null;
let playing = false;
let playStart = 0;
let playTotal = 0;
let timers = [];
let raf = null;

function ga() {
  if (!aCtx) aCtx = new (window.AudioContext || window.webkitAudioContext)();
  return aCtx;
}

function playSound(power, duration) {
  if (!sndOn || power === 0) return;
  const ac = ga();
  const freq = 80 + (power / 255) * 720;
  const gv = (power / 255) * vol;
  const o = ac.createOscillator();
  const g = ac.createGain();

  o.type = 'sine';
  o.frequency.setValueAtTime(freq, ac.currentTime);

  const dur = Math.min(duration / 1000, .3);
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(gv, ac.currentTime + .008);
  g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur * .6 + .01);

  o.connect(g);
  g.connect(ac.destination);
  o.start(ac.currentTime);
  o.stop(ac.currentTime + dur + .05);
}

function clearTimers() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
  if (raf) { cancelAnimationFrame(raf); raf = null; }
}

function runPb() {
  const segs = segments;
  if (!segs || !segs.length) return;

  playing = true;
  playStart = performance.now();
  const total = segs.reduce((a, s) => a + s.duration + s.pause, 0);
  playTotal = total;

  const vp = [];
  segs.forEach(s => {
    if (s.duration > 0) vp.push(s.duration);
    if (s.pause > 0) vp.push(s.pause);
  });
  if (vibOn && navigator.vibrate) navigator.vibrate(vp);

  let t = 0;
  segs.forEach((seg, idx) => {
    if (seg.duration > 0) {
      timers.push(setTimeout(() => {
        drawTL(segs, idx);
        playSound(seg.power, seg.duration);
        document.getElementById('dbstep').textContent = (idx + 1) + '/' + segs.length;
        document.getElementById('dbstep').className = 'dval act';
      }, t / speed));
      t += seg.duration;
    }
    if (seg.pause > 0) t += seg.pause;
  });

  timers.push(setTimeout(() => {
    drawTL(segs, -1);
    document.getElementById('dbstep').className = 'dval';
    document.getElementById('dbrem').textContent = '0ms';
    setStatus('Gotowe', '');
    if (looping) {
      runPb();
    } else {
      playing = false;
      updPBtn();
    }
  }, t / speed + 50));

  const tick = () => {
    const el = (performance.now() - playStart) * speed;
    const pct = Math.min(el / total, 1);
    const cur = document.getElementById('tlcur');
    const wrap = document.getElementById('tlwrap');

    cur.className = 'tl-cursor vis';
    cur.style.left = Math.round(pct * wrap.offsetWidth) + 'px';
    document.getElementById('dbrem').textContent = Math.max(0, Math.round(total - el)) + 'ms';

    if (playing) {
      raf = requestAnimationFrame(tick);
    } else {
      cur.className = 'tl-cursor';
      document.getElementById('dbrem').textContent = '—';
    }
  };

  raf = requestAnimationFrame(tick);

  document.getElementById('pbtn').className = 'btn bplay playing';
  document.getElementById('pico').className = 'ti ti-player-pause';
  document.getElementById('plbl').textContent = 'Playing';
  setStatus('Playing… ' + total + 'ms', 'play');
}

function togglePlay() {
  ga();
  const { segs, err } = parsePat(document.getElementById('ta').value);
  if (err) { setStatus('Błąd: ' + err, 'err'); return; }
  segments = segs;
  if (playing) { stopPb(); return; }
  runPb();
}

function stopPb() {
  clearTimers();
  playing = false;
  if (navigator.vibrate) navigator.vibrate(0);
  drawTL(segments, -1);
  document.getElementById('tlcur').className = 'tl-cursor';
  document.getElementById('dbstep').textContent = '—';
  document.getElementById('dbstep').className = 'dval';
  document.getElementById('dbrem').textContent = '—';
  updPBtn();
  setStatus('Stopped', '');
}

function updPBtn() {
  document.getElementById('pbtn').className = 'btn bplay';
  document.getElementById('pico').className = 'ti ti-player-play';
  document.getElementById('plbl').textContent = 'Play';
}

function toggleLoop() {
  looping = !looping;
  document.getElementById('lbtn').className = 'btn bloop' + (looping ? ' on' : '');
}
