// Main app — name roll machine
const { useState, useEffect, useRef, useCallback } = React;

// Tier configuration
const TIERS = {
  common: {
    label: "COMMON",
    color: "#9ca3af",
    glow: "rgba(156, 163, 175, 0.0)",
    weight: "Vanilla",
  },
  uncommon: {
    label: "UNCOMMON",
    color: "#31FF31",
    glow: "rgba(49, 255, 49, 0.55)",
    weight: "Fused",
  },
  rare: {
    label: "RARE",
    color: "#3a9eff",
    glow: "rgba(58, 158, 255, 0.7)",
    weight: "Suffixed",
  },
  epic: {
    label: "EPIC",
    color: "#c77dff",
    glow: "rgba(199, 125, 255, 0.85)",
    weight: "Hyphenated",
  },
  legendary: {
    label: "LEGENDARY",
    color: "#FFB347",
    glow: "rgba(255, 140, 0, 1)",
    weight: "Mythic",
  },
  ultra: {
    label: "MYTHIC",
    color: "#ff2a2a",
    glow: "rgba(255, 42, 42, 1)",
    weight: "Mythic",
  },
};

// ---------- Audio (synthesized) ----------
let _audioCtx = null;
const getAudio = () => {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  return _audioCtx;
};

function playTick(freq = 600, dur = 0.04, vol = 0.06) {
  const ctx = getAudio(); if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "square"; o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + dur);
}

function playRevealChord(tier) {
  const ctx = getAudio(); if (!ctx) return;
  const chords = {
    common: [220],
    uncommon: [261.6, 329.6],
    rare: [261.6, 329.6, 392],
    epic: [261.6, 329.6, 392, 523.25],
    legendary: [261.6, 329.6, 392, 523.25, 659.25, 783.99],
    ultra: [130.8, 196, 261.6, 329.6, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5],
  };
  const notes = chords[tier] || [220];
  notes.forEach((f, i) => {
    setTimeout(() => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tier === "legendary" ? "sawtooth" : "triangle";
      o.frequency.value = f;
      const vol = tier === "legendary" ? 0.12 : 0.08;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 1.3);
    }, i * 90);
  });
  if (tier === "legendary") {
    // boom
    setTimeout(() => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 60;
      g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      o.connect(g).connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.8);
    }, 0);
  }
}

// ---------- Particles ----------
function ParticleBurst({ tier, trigger }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    const config = {
      ultra: { count: 320, colors: ["#ff2a2a", "#ff5555", "#ff8080", "#ffffff", "#cc0000", "#ff0033"], life: 3400, gravity: -0.05 },
    legendary: { count: 140, colors: ["#FFD700", "#FFB347", "#FF8000", "#fff5cc"], life: 2200, gravity: -0.04 },
      epic: { count: 50, colors: ["#c77dff", "#A335EE", "#e0aaff"], life: 1200, gravity: -0.02 },
      rare: { count: 25, colors: ["#3a9eff", "#0070DD"], life: 900, gravity: 0 },
      uncommon: { count: 12, colors: ["#31FF31", "#7fff7f"], life: 700, gravity: 0 },
      common: { count: 0, colors: [], life: 0, gravity: 0 },
    };
    const c = config[tier] || config.common;
    if (c.count === 0) return;

    const particles = [];
    for (let i = 0; i < c.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particles.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (tier === "legendary" ? 1 : 0),
        size: tier === "legendary" ? 2 + Math.random() * 4 : 1.5 + Math.random() * 2.5,
        color: c.colors[Math.floor(Math.random() * c.colors.length)],
        life: c.life * (0.6 + Math.random() * 0.6),
        maxLife: c.life,
        born: performance.now(),
      });
    }

    let raf;
    const tick = (now) => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of particles) {
        const age = now - p.born;
        if (age > p.life) continue;
        alive++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += c.gravity;
        p.vx *= 0.99;
        const a = 1 - age / p.life;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = tier === "legendary" ? 12 : 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (alive > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, tier]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

// ---------- Legendary gold dust (continuous, attached to name) ----------
function GoldDust({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    const colors = ["#FFD700", "#FFB347", "#fff5cc", "#FFA500"];
    const particles = [];
    let raf;
    let lastSpawn = 0;

    const tick = (now) => {
      ctx.clearRect(0, 0, w, h);
      if (now - lastSpawn > 30) {
        lastSpawn = now;
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: Math.random() * w,
            y: h - 5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -0.4 - Math.random() * 0.8,
            size: 0.8 + Math.random() * 1.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1500 + Math.random() * 1500,
            born: now,
          });
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.born;
        if (age > p.life || p.y < -10) { particles.splice(i, 1); continue; }
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.05;
        const a = (1 - age / p.life) * 0.9;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={canvasRef} className="gold-dust-canvas" />;
}

// ---------- Slot reel ----------
function SlotName({ rolling, finalName, tier, onSettle }) {
  const [display, setDisplay] = useState("— — —");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!rolling) return;
    // Generate random scramble names during roll
    const D = window.NAME_DATA;
    const pickRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const scrambleSurname = () => {
      if (Math.random() < 0.5) return pickRand(D.static_last_names);
      return pickRand(D.fusion_prefixes) + pickRand(D.fusion_suffixes);
    };
    const allFirsts = [...D.first_names.male, ...D.first_names.female, ...D.first_names.neutral];

    let i = 0;
    const start = performance.now();
    const total = 1800;
    const step = () => {
      const elapsed = performance.now() - start;
      // Decelerate
      const t = Math.min(1, elapsed / total);
      const interval = 40 + t * t * 360;
      setDisplay(`${pickRand(allFirsts)} ${scrambleSurname()}`);
      playTick(700 - t * 300, 0.025, 0.04);
      if (elapsed < total) {
        intervalRef.current = setTimeout(step, interval);
      } else {
        setDisplay(finalName);
        onSettle && onSettle();
      }
    };
    step();
    return () => clearTimeout(intervalRef.current);
  }, [rolling]);

  useEffect(() => {
    if (!rolling && finalName) setDisplay(finalName);
  }, [finalName, rolling]);

  const t = TIERS[tier] || TIERS.common;
  const className = `slot-name tier-${tier} ${rolling ? "rolling" : "settled"}`;
  return (
    <div className={className} style={{ "--tier-color": t.color, "--tier-glow": t.glow }}>
      <span className="slot-name-text" data-text={display}>{display}</span>
    </div>
  );
}

// ---------- Roll history ----------
function HistoryItem({ entry, onClick }) {
  const t = TIERS[entry.tier];
  return (
    <button className={`history-item history-${entry.tier}`} onClick={() => onClick(entry)} style={{ "--tier-color": t.color }}>
      <span className="history-tier-pip" />
      <span className="history-name">{entry.displayName}</span>
      <span className="history-tier-label">{t.label}</span>
    </button>
  );
}

// ---------- Stats ----------
function StatsBar({ totalRolls, tierCounts }) {
  return (
    <div className="stats-bar">
      <div className="stats-total">
        <span className="stats-num">{totalRolls}</span>
        <span className="stats-label">ROLLS</span>
      </div>
      <div className="stats-tiers">
        {Object.keys(tierCounts).map(k => (
          <div key={k} className={`stat-tier stat-${k}`} style={{ "--tier-color": TIERS[k].color }}>
            <span className="stat-tier-label">{TIERS[k].label}</span>
            <span className="stat-tier-count">{tierCounts[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Main App ----------
function App() {
  const [gender, setGender] = useState("any");
  const [current, setCurrent] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const [tierCounts, setTierCounts] = useState({ common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, ultra: 0 });
  const [legendaryOverlay, setLegendaryOverlay] = useState(false);
  const [shake, setShake] = useState(0);
  const [burstKey, setBurstKey] = useState(0);

  // Persist history
  useEffect(() => {
    const saved = localStorage.getItem("nameroll_history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
    const savedTotal = localStorage.getItem("nameroll_total");
    if (savedTotal) {
      const n = parseInt(savedTotal, 10);
      if (!isNaN(n)) setTotalRolls(n);
    }
    const savedCounts = localStorage.getItem("nameroll_tier_counts");
    if (savedCounts) {
      try { setTierCounts(JSON.parse(savedCounts)); } catch (e) {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("nameroll_history", JSON.stringify(history.slice(0, 100)));
  }, [history]);
  useEffect(() => {
    localStorage.setItem("nameroll_total", String(totalRolls));
  }, [totalRolls]);
  useEffect(() => {
    localStorage.setItem("nameroll_tier_counts", JSON.stringify(tierCounts));
  }, [tierCounts]);

  const doRoll = useCallback(() => {
    if (rolling) return;
    // unlock audio
    const ctx = getAudio();
    if (ctx && ctx.state === "suspended") ctx.resume();

    const g = gender === "any" ? null : gender;
    const result = window.generateName(g);
    setCurrent(result);
    setRolling(true);
    setRevealed(false);
    setLegendaryOverlay(false);
  }, [rolling, gender]);

  const handleSettle = useCallback(() => {
    if (!current) return;
    setRolling(false);
    setRevealed(true);
    playRevealChord(current.tier);
    setBurstKey(k => k + 1);
    setHistory(prev => [{ ...current, ts: Date.now() }, ...prev].slice(0, 100));
    setTotalRolls(n => n + 1);
    setTierCounts(prev => ({ ...prev, [current.tier]: (prev[current.tier] || 0) + 1 }));

    // Screen shake based on tier
    const shakeAmount = { common: 0, uncommon: 2, rare: 4, epic: 8, legendary: 18, ultra: 32 }[current.tier];
    if (shakeAmount > 0) {
      setShake(shakeAmount);
      setTimeout(() => setShake(0), 600);
    }
    // Legendary / Ultra: full overlay flash
    if (current.tier === "legendary" || current.tier === "ultra") {
      setTimeout(() => setLegendaryOverlay(true), 100);
    }
  }, [current]);

  // Keyboard: space to roll
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && !rolling) {
        e.preventDefault();
        doRoll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rolling, doRoll]);

  const tier = current?.tier || "common";
  const tierData = TIERS[tier];
  const isLegendary = revealed && (tier === "legendary" || tier === "ultra");
  const isUltra = revealed && tier === "ultra";

  return (
    <div className="app-root" style={{ "--shake": `${shake}px` }}>
      <div className="grain-overlay" />
      <div className={`app-stage ${shake ? "shaking" : ""}`}>

        <header className="app-header">
          <div className="logo-mark">
            <span className="logo-dot" />
            <span className="logo-text">CAST.GEN</span>
            <span className="logo-meta">v1.0 // ROSTER GENERATOR</span>
          </div>
          <div className="header-right">
            <div className="gender-picker">
              {["any", "male", "female", "neutral"].map(g => (
                <button key={g} className={`gender-btn ${gender === g ? "active" : ""}`} onClick={() => setGender(g)}>
                  {g.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="main-grid">
          {/* LEFT: stats / history */}
          <aside className="side-panel">
            <StatsBar totalRolls={totalRolls} tierCounts={tierCounts} />
            <div className="rarity-key">
              <div className="panel-title">DROP RATES</div>
              {Object.keys(TIERS).map(k => {
                const rates = { common: "50%", uncommon: "30%", rare: "14%", epic: "4.9%", legendary: "1%", ultra: "0.?%" };
                return (
                  <div key={k} className="rate-row" style={{ "--tier-color": TIERS[k].color }}>
                    <span className="rate-pip" />
                    <span className="rate-label">{TIERS[k].label}</span>
                    <span className="rate-pct">{rates[k]}</span>
                  </div>
                );              })}
            </div>
          </aside>

          {/* CENTER: the machine */}
          <section className="machine-panel">
            <div className={`reveal-frame tier-frame-${tier} ${revealed ? "revealed" : ""} ${rolling ? "rolling" : ""}`}>
              <div className="frame-corner tl" />
              <div className="frame-corner tr" />
              <div className="frame-corner bl" />
              <div className="frame-corner br" />

              <div className="frame-inner">
                <div className="reveal-meta">
                  <span className={`tier-badge tier-badge-${tier} ${revealed ? "show" : ""}`} style={{ "--tier-color": tierData.color }}>
                    {revealed ? tierData.label : "—"}
                  </span>
                  <span className="reveal-id">#{String(totalRolls + (rolling ? 1 : 0)).padStart(4, "0")}</span>
                </div>

                <SlotName rolling={rolling} finalName={current?.displayName || "PRESS ROLL"} tier={tier} onSettle={handleSettle} />

                {revealed && (
                  <div className="reveal-sub">
                    <span className="sub-divider">◆</span>
                    <span className="sub-text">{tierData.weight} ROLL</span>
                    <span className="sub-divider">◆</span>
                  </div>
                )}

                <ParticleBurst key={burstKey} tier={tier} trigger={revealed ? burstKey : 0} />
                {isLegendary && <GoldDust active={true} />}
              </div>
            </div>

            <div className="roll-row">
              <button className={`roll-btn ${rolling ? "disabled" : ""}`} onClick={doRoll} disabled={rolling}>
                <span className="roll-btn-bg" />
                <span className="roll-btn-text">{rolling ? "ROLLING…" : "ROLL"}</span>
                <span className="roll-btn-hint">SPACE</span>
              </button>
            </div>
          </section>

          {/* RIGHT: log */}
          <aside className="side-panel side-panel-right">
            <div className="panel-title">
              ROLL LOG
              {(history.length > 0 || totalRolls > 0) && (
                <button className="clear-btn" onClick={() => { if (confirm("Clear history and reset counter?")) { setHistory([]); setTotalRolls(0); setTierCounts({ common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, ultra: 0 }); } }}>CLEAR</button>
              )}
            </div>
            <div className="history-list">
              {history.length === 0 && <div className="history-empty">No rolls yet.<br/>Press ROLL to start.</div>}
              {history.map((h, i) => (
                <HistoryItem key={h.ts + "-" + i} entry={h} onClick={(e) => setCurrent(e) && setRevealed(true)} />
              ))}
            </div>
          </aside>
        </main>

        <footer className="app-footer">
          <span>↑ COMMON 50% · UNCOMMON 30% · RARE 14% · EPIC 4.9% · LEGENDARY 1% · MYTHIC 0.?%</span>
          <span>HOLD SPACE TO ROLL · {totalRolls} TOTAL ROLLS · {history.length} IN LOG</span>
        </footer>

      </div>

      {/* Legendary screen takeover */}
      {legendaryOverlay && (
        <div className={`legendary-overlay ${isUltra ? "ultra-overlay" : ""}`} onClick={() => setLegendaryOverlay(false)}>
          <div className="legendary-vignette" />
          <div className="legendary-rays" />
          <div className="legendary-content">
            <div className={`legendary-banner ${isUltra ? "ultra-banner" : ""}`}>
              <span className="legendary-banner-text">{isUltra ? "✦ MYTHIC ✦" : "LEGENDARY DROP"}</span>
            </div>
            <div className={`legendary-name-big ${isUltra ? "ultra-name-big" : ""}`} data-text={current?.displayName}>
              {current?.displayName}
            </div>
            <div className="legendary-sub">{isUltra ? "A 1-IN-1000 ROLL · TAP ANYWHERE TO CONTINUE" : "A 1-IN-100 ROLL · TAP ANYWHERE TO CONTINUE"}</div>
            <GoldDust active={true} />
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
