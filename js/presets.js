/* Presets */
const PRESETS = {
  message:    [0, 80, 60, 100],
  error:      [0, 50, 30, 50, 30, 50, 30, 200],
  call:       [0, 200, 100, 200, 100, 200, 100, 400, 100, 200, 100, 200, 100, 400],
  success:    [0, 30, 40, 100, 40, 200],
  doubleTap:  [0, 60, 80, 60],
  heartbeat:  [0, 60, 80, 180, 80, 350, 80, 60, 80, 180]
};

function loadP(name) {
  const p = PRESETS[name];
  if (!p) return;
  document.getElementById('ta').value = JSON.stringify(p);
  updateDisplay();
}
