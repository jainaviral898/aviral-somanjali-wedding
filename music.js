// Soft looping instrumental, synthesised live in the browser (no audio files, nothing copyrighted):
// a tanpura-style drone with santoor-like plucks wandering through raga Bhupali (Sa Re Ga Pa Dha).
// Pages call WeddingMusic.autoplay() on load (browsers may hold sound until the first tap)
// and WeddingMusic.toggle() from a button.
const WeddingMusic = (() => {
  const SA = 196; // G3
  const STEPS = [0, 2, 4, 7, 9]; // Bhupali
  const BEAT = 0.46; // seconds
  const VOLUME = 0.85;

  let ctx, master, bus, timer, next = 0, beat = 0, deg = 7;

  const freqOf = (d) => SA * Math.pow(2, Math.floor(d / 5) + STEPS[((d % 5) + 5) % 5] / 12);

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // A soft hall reverb from a decaying noise impulse
    const len = ctx.sampleRate * 3;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const verb = ctx.createConvolver();
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    const dry = ctx.createGain();
    dry.gain.value = 0.75;
    bus = ctx.createGain();
    bus.connect(dry).connect(master);
    bus.connect(wet).connect(verb).connect(master);
  }

  // Santoor-like pluck: a few sine partials with a sharp attack and long fade
  function pluck(f, t, amp, dur) {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(amp, t + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    env.connect(bus);
    for (const [mult, a] of [[1, 1], [2, 0.38], [3, 0.16], [4.2, 0.07]]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f * mult;
      g.gain.value = a;
      o.connect(g).connect(env);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  // Tanpura-style string: a filtered sawtooth that swells and fades slowly
  function drone(f, t) {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.03, t + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, t + BEAT * 7);
    o.connect(lp).connect(env).connect(bus);
    o.start(t);
    o.stop(t + BEAT * 7.1);
  }

  function schedule() {
    while (next < ctx.currentTime + 0.7) {
      const t = next;
      // Tanpura cycle Pa · Sa' · Sa' · Sa, one string every two beats
      if (beat % 2 === 0) {
        const cycle = [(SA * Math.pow(2, 7 / 12)) / 2, SA, SA, SA / 2];
        drone(cycle[(beat / 2) % 4], t);
      }
      // Melody in 16-beat phrases that come home to Sa and breathe
      const pos = beat % 16;
      if (pos === 13) {
        deg = 5;
        pluck(freqOf(deg), t, 0.15, 3.2);
      } else if (pos < 13 && Math.random() < 0.72) {
        const moves = [-2, -1, -1, 1, 1, 2];
        deg = Math.max(3, Math.min(12, deg + moves[Math.floor(Math.random() * moves.length)]));
        pluck(freqOf(deg), t, 0.11, 2);
        if (Math.random() < 0.22) pluck(freqOf(deg + (Math.random() < 0.5 ? 1 : -1)), t + BEAT / 2, 0.07, 1.5);
      }
      next += BEAT;
      beat++;
    }
  }

  function start() {
    if (!ctx) setup();
    ctx.resume();
    next = ctx.currentTime + 0.1;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.8);
    schedule();
    timer = setInterval(schedule, 120);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  }

  // Go quiet when the tab is hidden, pick up again when it comes back
  let resumeOnShow = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && timer) { resumeOnShow = true; stop(); }
    else if (!document.hidden && resumeOnShow) { resumeOnShow = false; start(); }
  });

  // Remember a visitor who switched the music off, so it doesn't start again on their next visit
  const PREF = "wedding-music";
  const savePref = (on) => { try { on ? localStorage.removeItem(PREF) : localStorage.setItem(PREF, "off"); } catch {} };
  const wantsQuiet = () => { try { return localStorage.getItem(PREF) === "off"; } catch { return false; } };

  // Start right away if the browser allows it; otherwise on the first tap or key press anywhere
  // (except on the music button itself, which toggles on its own).
  function autoplay(onChange, button) {
    if (wantsQuiet()) return;
    if (!ctx) setup();
    const firstGesture = (e) => {
      if (button && button.contains(e.target)) return;
      remove();
      if (!timer) { start(); onChange(true); }
    };
    const events = ["click", "touchend", "keydown"];
    const remove = () => events.forEach((t) => document.removeEventListener(t, firstGesture, true));
    events.forEach((t) => document.addEventListener(t, firstGesture, true));
    ctx.resume().catch(() => {});
    setTimeout(() => {
      if (ctx.state === "running" && !timer) { remove(); start(); onChange(true); }
    }, 250);
    // A press on the music button before any other tap also counts as the first gesture
    if (button) button.addEventListener("click", remove, { once: true });
  }

  return {
    get playing() { return !!timer; },
    toggle() { (timer ? stop : start)(); savePref(!!timer); return !!timer; },
    autoplay,
  };
})();
