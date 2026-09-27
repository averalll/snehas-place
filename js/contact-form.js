const form = document.querySelector(".contact-form");
const success = document.querySelector(".contact-success");

function doorbell() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  const ctx = new AudioContext();
  const now = ctx.currentTime;

  function chime(freq, start, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  chime(830.61, now, 0.42);
  chime(659.25, now + 0.26, 0.55);
}

if (form && success) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const subject = encodeURIComponent(data.get("subject") || "");
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
    );
    const mail = document.createElement("a");
    mail.href = `mailto:hello@snehasplace.com?subject=${subject}&body=${body}`;
    mail.click();

    doorbell();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
}
