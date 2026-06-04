/* UI controls: toggles, sliders, inline value editing */

let looping = false;
let vibOn   = true;
let sndOn   = true;
let vol     = 0.7;
let speed   = 1.0;

const VOL_DEF = 70;
const SPD_DEF = 100;

function toggleVib() {
  vibOn = !vibOn;
  document.getElementById('vtog').className = 'tog' + (vibOn ? ' on' : '');
  document.getElementById('vlbl').textContent = vibOn ? 'on' : 'off';
  checkChanged();
}

function toggleSnd() {
  sndOn = !sndOn;
  document.getElementById('stog').className = 'tog' + (sndOn ? ' on' : '');
  document.getElementById('slbl').textContent = sndOn ? 'on' : 'off';
  checkChanged();
}

function checkChanged() {
  const vc = parseInt(document.getElementById('vsldr').value) !== VOL_DEF;
  const sc = parseInt(document.getElementById('ssldr').value) !== SPD_DEF;
  const any = vc || sc || !vibOn || !sndOn || looping;
  document.getElementById('rst-all').className = 'btn breset-all' + (any ? ' changed' : '');
}

/* Volume */
function onVol(v) {
  vol = v / 100;
  document.getElementById('vvaltxt').textContent = v + '%';
  document.getElementById('vrst').className = 'sreset-btn' + (parseInt(v) !== VOL_DEF ? ' vis' : '');
  checkChanged();
}

/* Speed */
function onSpd(v) {
  speed = v / 100;
  const disp = speed % 1 === 0 ? speed : parseFloat(speed.toFixed(2));
  document.getElementById('svaltxt').textContent = disp + '×';
  document.getElementById('srst').className = 'sreset-btn' + (parseInt(v) !== SPD_DEF ? ' vis' : '');
  checkChanged();
}

/* Inline editing */
function startEdit(which) {
  if (which === 'vol') {
    const v = document.getElementById('vsldr').value;
    document.getElementById('vvaltxt').style.display = 'none';
    const inp = document.getElementById('vinput');
    inp.style.display = 'inline-block';
    inp.value = v;
    inp.focus();
    inp.select();
  } else {
    document.getElementById('svaltxt').style.display = 'none';
    const inp = document.getElementById('sinput');
    inp.style.display = 'inline-block';
    inp.value = speed % 1 === 0 ? speed : parseFloat(speed.toFixed(2));
    inp.focus();
    inp.select();
  }
}

function commitEdit(which) {
  if (which === 'vol') {
    let v = Math.max(0, Math.min(100, parseInt(document.getElementById('vinput').value) || 0));
    document.getElementById('vsldr').value = v;
    onVol(v);
    document.getElementById('vinput').style.display = 'none';
    document.getElementById('vvaltxt').style.display = '';
  } else {
    let v = Math.max(.25, Math.min(4, parseFloat(document.getElementById('sinput').value) || 1));
    const pct = Math.round(v * 100);
    document.getElementById('ssldr').value = pct;
    onSpd(pct);
    document.getElementById('sinput').style.display = 'none';
    document.getElementById('svaltxt').style.display = '';
  }
}

function editKey(e, which) {
  if (e.key === 'Enter')  commitEdit(which);
  if (e.key === 'Escape') {
    if (which === 'vol') {
      document.getElementById('vinput').style.display = 'none';
      document.getElementById('vvaltxt').style.display = '';
    } else {
      document.getElementById('sinput').style.display = 'none';
      document.getElementById('svaltxt').style.display = '';
    }
  }
}

/* Reset */
function resetCtrl(which) {
  if (which === 'vol') {
    document.getElementById('vsldr').value = VOL_DEF;
    onVol(VOL_DEF);
    document.getElementById('vinput').style.display = 'none';
    document.getElementById('vvaltxt').style.display = '';
  } else {
    document.getElementById('ssldr').value = SPD_DEF;
    onSpd(SPD_DEF);
    document.getElementById('sinput').style.display = 'none';
    document.getElementById('svaltxt').style.display = '';
  }
}

function resetAll() {
  resetCtrl('vol');
  resetCtrl('spd');
  if (!vibOn) toggleVib();
  if (!sndOn) toggleSnd();
  if (looping) toggleLoop();
  checkChanged();
}
