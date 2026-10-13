(function () {
  const rad = Math.PI / 180;

  function toRad(deg) {
    return deg * rad;
  }

  function toDeg(r) {
    return r / rad;
  }

  function padDay(date) {
    const start = Date.UTC(date.getFullYear(), 0, 1);
    return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000) + 1;
  }

  function sunTime(date, latitude, longitude, isSunset) {
    const n = padDay(date);
    const lngHour = longitude / 15;
    const t = n + ((isSunset ? 18 : 6) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(toRad(M)) + 0.02 * Math.sin(toRad(2 * M)) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = toDeg(Math.atan(0.91764 * Math.tan(toRad(L))));
    RA = ((RA % 360) + 360) % 360;
    RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
    RA /= 15;
    const sinDec = 0.39782 * Math.sin(toRad(L));
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos(toRad(90.833)) - sinDec * Math.sin(toRad(latitude))) /
      (cosDec * Math.cos(toRad(latitude)));

    if (cosH > 1) {
      return isSunset ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    }
    if (cosH < -1) {
      return isSunset ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59) : null;
    }

    let H = toDeg(Math.acos(cosH));
    if (!isSunset) {
      H = 360 - H;
    }
    H /= 15;
    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;

    const localHours = ((UT - date.getTimezoneOffset() / 60) % 24 + 24) % 24;
    const out = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    out.setMinutes(Math.round(localHours * 60));
    return out;
  }

  function guessCoords() {
    const offsetHours = -new Date().getTimezoneOffset() / 60;
    return {
      latitude: 20,
      longitude: offsetHours * 15,
    };
  }

  function isNightAt(date, latitude, longitude) {
    const sunrise = sunTime(date, latitude, longitude, false);
    const sunset = sunTime(date, latitude, longitude, true);
    if (!sunrise || !sunset) {
      const hour = date.getHours();
      return hour >= 19 || hour < 6;
    }
    return date >= sunset || date < sunrise;
  }

  function nextFlip(date, latitude, longitude) {
    const sunrise = sunTime(date, latitude, longitude, false);
    const sunset = sunTime(date, latitude, longitude, true);
    if (!sunrise || !sunset) {
      const next = new Date(date);
      next.setHours(date.getHours() < 6 ? 6 : 19, 0, 0, 0);
      if (next <= date) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }
    if (date < sunrise) {
      return sunrise;
    }
    if (date < sunset) {
      return sunset;
    }
    const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return sunTime(tomorrow, latitude, longitude, false) || tomorrow;
  }

  function applySky(night) {
    const root = document.documentElement;
    const next = night ? "night" : "day";
    if (root.dataset.sky === next) {
      swapImages(night);
      return;
    }
    root.dataset.sky = next;
    swapImages(night);
    root.dispatchEvent(new CustomEvent("skychange", { detail: { sky: next } }));
  }

  function swapImages(night) {
    document.querySelectorAll("img[data-night-src]").forEach((img) => {
      if (!img.dataset.daySrc) {
        img.dataset.daySrc = img.getAttribute("src");
      }
      const target = night ? img.getAttribute("data-night-src") : img.dataset.daySrc;
      if (target && img.getAttribute("src") !== target) {
        img.setAttribute("src", target);
      }
    });
  }

  function preloadNight() {
    document.querySelectorAll("img[data-night-src]").forEach((img) => {
      const src = img.getAttribute("data-night-src");
      if (!src) {
        return;
      }
      const preload = new Image();
      preload.src = src;
    });
  }

  function run(latitude, longitude) {
    const now = new Date();
    applySky(isNightAt(now, latitude, longitude));

    const flip = nextFlip(now, latitude, longitude);
    const wait = Math.max(1000, flip.getTime() - now.getTime() + 250);
    window.setTimeout(() => run(latitude, longitude), Math.min(wait, 60 * 60 * 1000));
  }

  preloadNight();

  const guessed = guessCoords();
  run(guessed.latitude, guessed.longitude);
})();
