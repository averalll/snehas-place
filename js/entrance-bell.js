const entrance = document.querySelector(".entrance");
const image = document.querySelector(".entrance-image");
const spot = document.querySelector(".doorbell-spot");
const bell = document.querySelector(".doorbell");
const go = document.querySelector(".doorbell-enter");

if (entrance && image && spot && bell && go) {
  const BELL_DESK = { x: 0.413, y: 0.515, w: 0.06, h: 0.16 };
  const BELL_MOBILE = { x: 0.178, y: 0.51, w: 0.17, h: 0.19 };
  const mobileEntrance = window.matchMedia("(max-width: 760px)");

  function parsePos(value) {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n / 100 : 0.5;
  }

  function placeBell() {
    const nw = image.naturalWidth || 1024;
    const nh = image.naturalHeight || 745;
    const cw = image.clientWidth;
    const ch = image.clientHeight;
    if (!cw || !ch) {
      return;
    }

    const scale = Math.max(cw / nw, ch / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    const parts = getComputedStyle(image).objectPosition.split(/\s+/);
    const ox = parsePos(parts[0]);
    const oy = parsePos(parts[1] || parts[0]);
    const offsetX = (cw - dw) * ox;
    const offsetY = (ch - dh) * oy;

    const bell = mobileEntrance.matches ? BELL_MOBILE : BELL_DESK;
    const width = Math.max(44, bell.w * nw * scale);
    const height = Math.max(44, bell.h * nh * scale);
    const left = offsetX + bell.x * nw * scale - width / 2;
    const top = offsetY + bell.y * nh * scale - height / 2;

    spot.style.left = `${left}px`;
    spot.style.top = `${top}px`;
    spot.style.width = `${width}px`;
    spot.style.height = `${height}px`;
  }

  function ding() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    function chime(freq, start, duration, peak) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    }

    chime(830.61, now, 0.5, 0.22);
    chime(659.25, now + 0.28, 0.7, 0.18);
  }

  function unlock() {
    if (entrance.classList.contains("is-open")) {
      return;
    }

    ding();
    entrance.classList.add("is-open");
    go.focus({ preventScroll: true });
  }

  bell.addEventListener("click", unlock);

  image.addEventListener("load", placeBell);
  if (image.complete) {
    placeBell();
  }

  window.addEventListener("resize", placeBell);
  mobileEntrance.addEventListener("change", placeBell);
}
