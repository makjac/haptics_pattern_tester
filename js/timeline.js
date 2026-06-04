/* Timeline canvas & draggable handles */

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

  segs.forEach((seg, idx) => {
    if (seg.duration > 0) {
      const w     = Math.max(2, (seg.duration / total) * W);
      const alpha = 0.3 + 0.7 * (seg.power / 255);
      const act   = idx === activeIdx;

      ctx.fillStyle = act ? `rgba(100,160,255,${alpha})` : `rgba(79,124,255,${alpha})`;
      const bh = Math.max(8, Math.round((seg.power / 255) * (H - 16)));
      const y  = H - bh - 4;
      ctx.beginPath();
      ctx.roundRect(x + 1, y, w - 2, bh, 3);
      ctx.fill();

      if (w > 28) {
        ctx.fillStyle = act ? 'rgba(220,235,255,.9)' : 'rgba(160,190,255,.75)';
        ctx.font = '10px JetBrains Mono,monospace';
        ctx.textAlign = 'center';
        ctx.fillText(seg.duration + 'ms', x + w / 2, y + bh / 2 + 4);
      }
      x += w;
    }

    if (seg.pause > 0) {
      const pw = Math.max(1, (seg.pause / total) * W);
      ctx.fillStyle = 'rgba(42,48,80,.5)';
      ctx.beginPath();
      ctx.roundRect(x + 1, H - 10, pw - 2, 4, 2);
      ctx.fill();

      if (pw > 22) {
        ctx.fillStyle = 'rgba(74,84,112,.8)';
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
      const lh = document.createElement('div');
      lh.className = 'drag-handle left-h';
      lh.style.cssText = `left:${segStartX - 4}px;width:10px;height:${H}px`;
      const li = document.createElement('div');
      li.className = 'dh-line';
      lh.appendChild(li);
      makeDraggable(lh, 'left', idx, segs, W, total);
      hc.appendChild(lh);

      const rh = document.createElement('div');
      rh.className = 'drag-handle right-h';
      rh.style.cssText = `left:${segStartX + vibW - 4}px;width:10px;height:${H}px`;
      const ri = document.createElement('div');
      ri.className = 'dh-line';
      rh.appendChild(ri);
      makeDraggable(rh, 'right', idx, segs, W, total);
      hc.appendChild(rh);
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
