/* Timeline canvas & draggable handles */

function isLightTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

function drawTL(segs, activeIdx = -1) {
  const wrap   = document.getElementById('tlwrap');
  const canvas = document.getElementById('tlc');
  const W = wrap.offsetWidth || 300;
  const H = wrap.offsetHeight || 72;

  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const total = segs.reduce((a, s) => a + s.duration + s.pause, 0) || 1;
  let x = 0;
  const light = isLightTheme();

  segs.forEach((seg, idx) => {
    if (seg.duration > 0) {
      const w     = Math.max(2, (seg.duration / total) * W);
      const alpha = 0.3 + 0.7 * (seg.power / 255);
      const act   = idx === activeIdx;

      ctx.fillStyle = act
        ? (light ? `rgba(60,120,240,${alpha})` : `rgba(100,160,255,${alpha})`)
        : (light ? `rgba(40,100,220,${alpha})` : `rgba(79,124,255,${alpha})`);
      const bh = Math.max(8, Math.round((seg.power / 255) * (H - 16)));
      const y  = H - bh - 4;
      ctx.beginPath();
      ctx.roundRect(x + 1, y, w - 2, bh, 3);
      ctx.fill();

      if (w > 28) {
        ctx.fillStyle = act
          ? (light ? 'rgba(255,255,255,.95)' : 'rgba(220,235,255,.9)')
          : (light ? 'rgba(255,255,255,.9)' : 'rgba(160,190,255,.75)');
        ctx.font = '10px JetBrains Mono,monospace';
        ctx.textAlign = 'center';
        ctx.fillText(seg.duration + 'ms', x + w / 2, y + bh / 2 + 4);
      }
      x += w;
    }

    if (seg.pause > 0) {
      const pw = Math.max(1, (seg.pause / total) * W);
      ctx.fillStyle = light ? 'rgba(160,170,200,.4)' : 'rgba(42,48,80,.5)';
      ctx.beginPath();
      ctx.roundRect(x + 1, H - 10, pw - 2, 4, 2);
      ctx.fill();

      if (pw > 22) {
        ctx.fillStyle = light ? 'rgba(100,110,140,.8)' : 'rgba(74,84,112,.8)';
        ctx.font = '9px JetBrains Mono,monospace';
        ctx.textAlign = 'center';
        ctx.fillText(seg.pause + 'ms', x + pw / 2, H - 2);
      }
      x += pw;
    }
  });
}

function buildHandles(segs) {
  const wrap = document.getElementById('tlwrap');
  const hc   = document.getElementById('handles');
  hc.innerHTML = '';

  const W = wrap.offsetWidth || 300;
  const H = wrap.offsetHeight || 72;
  const total = segs.reduce((a, s) => a + s.duration + s.pause, 0) || 1;
  let x = 0;

  segs.forEach((seg, idx) => {
    const segStartX = x;
    const vibW  = seg.duration > 0 ? (seg.duration / total) * W : 0;
    const pauseW = seg.pause > 0 ? (seg.pause / total) * W : 0;

    if (seg.duration > 0) {
      const center = document.createElement('div');
      center.className = 'seg-drag';
      center.style.cssText = `left:${segStartX}px;width:${Math.max(8, vibW)}px;height:${H}px`;
      makeCenterDraggable(center, idx, segs, W, total, H);
      hc.appendChild(center);
    }

    if (seg.pause > 0) {
      const ph = document.createElement('div');
      ph.className = 'pause-drag';
      ph.style.cssText = `left:${segStartX + vibW}px;width:${Math.max(8, pauseW)}px;height:${H}px`;
      makePauseDraggable(ph, idx, segs, W, total);
      hc.appendChild(ph);
    }

    x += vibW + pauseW;
  });
}

function makeDraggable(el, side, idx, segs, W, total) {
  let startX, startDur, startPause, startPrevPause;

  const onDown = e => {
    e.preventDefault();
    el.classList.add('dg');
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startDur  = segs[idx].duration;
    startPause = segs[idx].pause;
    startPrevPause = idx > 0 ? segs[idx - 1].pause : 0;

    const onMove = ev => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const dx = cx - startX;
      const msPx = total / W;

      if (side === 'right') {
        segs[idx].duration = Math.max(10, Math.round(startDur + dx * msPx));
      } else {
        const newDur = Math.max(10, Math.round(startDur - dx * msPx));
        const diff = newDur - startDur;
        segs[idx].duration = newDur;
        if (idx > 0) {
          segs[idx - 1].pause = Math.max(0, Math.round(startPrevPause - diff));
        }
      }

      segments = segs;
      syncTA(segs);
      drawTL(segs);
      buildHandles(segs);

      const nt = segs.reduce((a, s) => a + s.duration + s.pause, 0);
      document.getElementById('dbtotal').textContent = nt + 'ms';
      document.getElementById('tlend').textContent   = nt + 'ms';
      document.getElementById('tlmid').textContent   = Math.round(nt / 2) + 'ms';
      document.getElementById('tdlbl').textContent   = '· ' + nt + 'ms total';
      updateCodePreview();
    };

    const onUp = () => {
      el.classList.remove('dg');
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

  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
}

/* Center drag: horizontal = time, vertical = power */
function makeCenterDraggable(el, idx, segs, W, total, H) {
  let startX, startY, startDur, startPower, mode = null;

  const onDown = e => {
    e.preventDefault();
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startDur = segs[idx].duration;
    startPower = segs[idx].power;
    mode = null;

    const onMove = ev => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const dx = cx - startX;
      const dy = cy - startY;

      if (!mode) {
        if (Math.abs(dx) > 3 && Math.abs(dx) > Math.abs(dy)) mode = 'time';
        else if (Math.abs(dy) > 3 && Math.abs(dy) > Math.abs(dx)) mode = 'power';
        else return;
      }

      if (mode === 'time') {
        const msPx = total / W;
        segs[idx].duration = Math.max(10, Math.round(startDur + dx * msPx));
      } else if (mode === 'power') {
        const powerDelta = Math.round(dy * (255 / H));
        segs[idx].power = Math.max(0, Math.min(255, Math.round(startPower - powerDelta)));
      }

      segments = segs;
      syncTA(segs);
      drawTL(segs);
      if (mode === 'time') buildHandles(segs);

      const nt = segs.reduce((a, s) => a + s.duration + s.pause, 0);
      document.getElementById('dbtotal').textContent = nt + 'ms';
      document.getElementById('tlend').textContent = nt + 'ms';
      document.getElementById('tlmid').textContent = Math.round(nt / 2) + 'ms';
      document.getElementById('tdlbl').textContent = '· ' + nt + 'ms total';
      updateCodePreview();
    };

    const onUp = () => {
      mode = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      buildHandles(segs);
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
}

/* Pause drag: horizontal only */
function makePauseDraggable(el, idx, segs, W, total) {
  let startX, startPause;

  const onDown = e => {
    e.preventDefault();
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startPause = segs[idx].pause;

    const onMove = ev => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const dx = cx - startX;
      const msPx = total / W;
      segs[idx].pause = Math.max(0, Math.round(startPause + dx * msPx));

      segments = segs;
      syncTA(segs);
      drawTL(segs);

      const nt = segs.reduce((a, s) => a + s.duration + s.pause, 0);
      document.getElementById('dbtotal').textContent = nt + 'ms';
      document.getElementById('tlend').textContent = nt + 'ms';
      document.getElementById('tlmid').textContent = Math.round(nt / 2) + 'ms';
      document.getElementById('tdlbl').textContent = '· ' + nt + 'ms total';
      updateCodePreview();
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      buildHandles(segs);
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
}
