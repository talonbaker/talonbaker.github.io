// Body generator app — showcases full-body pixel art character
const { useState, useEffect, useRef, useCallback } = React;

const TIERS = {
  common:    { label: "COMMON",    color: "#9ca3af", glow: "rgba(156,163,175,0.0)", weight: "Vanilla" },
  uncommon:  { label: "UNCOMMON",  color: "#31FF31", glow: "rgba(49,255,49,0.55)",  weight: "Fused" },
  rare:      { label: "RARE",      color: "#3a9eff", glow: "rgba(58,158,255,0.7)",  weight: "Suffixed" },
  epic:      { label: "EPIC",      color: "#c77dff", glow: "rgba(199,125,255,0.85)",weight: "Hyphenated" },
  legendary: { label: "LEGENDARY", color: "#FFB347", glow: "rgba(255,140,0,1)",     weight: "Mythic" },
  ultra:     { label: "MYTHIC",    color: "#ff2a2a", glow: "rgba(255,42,42,1)",     weight: "Mythic" },
};

// ── Audio ─────────────────────────────────────────────────────────────────
let _audioCtx = null;
const getAudio = () => {
  if (!_audioCtx) { try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return null; } }
  return _audioCtx;
};
function playTick(freq=600, dur=0.04, vol=0.05) {
  const ctx = getAudio(); if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square'; o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
}
function playRevealChord(tier) {
  const ctx = getAudio(); if (!ctx) return;
  const chords = { common:[220], uncommon:[261.6,329.6], rare:[261.6,329.6,392], epic:[261.6,329.6,392,523.25], legendary:[261.6,329.6,392,523.25,659.25,783.99] };
  if (tier === 'ultra') { playUltraSound(ctx); return; }
  const notes = chords[tier] || [220];
  notes.forEach((f, i) => {
    setTimeout(() => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tier === 'legendary' ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      const vol = tier === 'legendary' ? 0.10 : 0.07;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1.3);
    }, i * 90);
  });
  if (tier === 'legendary') {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 60;
    g.gain.setValueAtTime(0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.8);
  }
}
function playUltraSound(ctx) {
  const now = ctx.currentTime;
  const master = ctx.createGain(); master.gain.value = 1.0; master.connect(ctx.destination);
  const o1 = ctx.createOscillator(), g1 = ctx.createGain();
  o1.type = 'sine'; o1.frequency.setValueAtTime(120, now); o1.frequency.exponentialRampToValueAtTime(35, now+0.6);
  g1.gain.setValueAtTime(0.7, now); g1.gain.exponentialRampToValueAtTime(0.0001, now+1.2);
  o1.connect(g1).connect(master); o1.start(now); o1.stop(now+1.3);
  [110,196.7,311.3,437.5,622.6].forEach((f,i) => {
    const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(0.14/(i+1),now+0.05); g.gain.exponentialRampToValueAtTime(0.0001,now+2.8);
    o.connect(g).connect(master); o.start(now+0.05); o.stop(now+3);
  });
  const arp = [523.25,659.25,783.99,987.77,1174.66,1396.91,1760,2093];
  arp.forEach((f,i) => {
    const t0=0.6+i*0.08, o=ctx.createOscillator(),g=ctx.createGain();
    o.type='triangle'; o.frequency.value=f;
    g.gain.setValueAtTime(0,now+t0); g.gain.linearRampToValueAtTime(0.08,now+t0+0.01); g.gain.exponentialRampToValueAtTime(0.0001,now+t0+0.7);
    o.connect(g).connect(master); o.start(now+t0); o.stop(now+t0+0.75);
  });
}

// ── Particles ──────────────────────────────────────────────────────────────
function ParticleBurst({ tier, trigger }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    const cfg = {
      ultra:     { count:280, colors:['#ff2a2a','#ff5555','#ff8080','#ffffff','#cc0000'], life:3200, gravity:-0.05 },
      legendary: { count:120, colors:['#FFD700','#FFB347','#FF8000','#fff5cc'],          life:2000, gravity:-0.04 },
      epic:      { count: 45, colors:['#c77dff','#A335EE','#e0aaff'],                    life:1100, gravity:-0.02 },
      rare:      { count: 22, colors:['#3a9eff','#0070DD'],                              life: 800, gravity:0 },
      uncommon:  { count: 10, colors:['#31FF31','#7fff7f'],                              life: 600, gravity:0 },
      common:    { count:  0, colors:[],                                                 life:   0, gravity:0 },
    };
    const c = cfg[tier] || cfg.common; if (!c.count) return;
    const particles = [];
    for (let i = 0; i < c.count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 1 + Math.random() * 4;
      particles.push({ x:w/2, y:h/2, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-(tier==='legendary'?1:0),
        size:tier==='legendary'?2+Math.random()*3:1.5+Math.random()*2, color:c.colors[Math.floor(Math.random()*c.colors.length)],
        life:c.life*(0.6+Math.random()*0.6), maxLife:c.life, born:performance.now() });
    }
    let raf;
    const tick = now => {
      ctx.clearRect(0,0,w,h); let alive=0;
      for (const p of particles) {
        const age=now-p.born; if(age>p.life) continue; alive++;
        p.x+=p.vx; p.y+=p.vy; p.vy+=c.gravity; p.vx*=0.99;
        const a=1-age/p.life; ctx.globalAlpha=a; ctx.fillStyle=p.color;
        ctx.shadowBlur=tier==='legendary'?10:5; ctx.shadowColor=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1; ctx.shadowBlur=0;
      if (alive > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, tier]);
  return <canvas ref={canvasRef} className="particle-canvas" />;
}

function GoldDust({ active, className="gold-dust-canvas" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth, h = canvas.height = canvas.offsetHeight;
    const colors = ['#FFD700','#FFB347','#fff5cc','#FFA500'];
    const particles = []; let raf, lastSpawn = 0;
    const tick = now => {
      ctx.clearRect(0,0,w,h);
      if (now - lastSpawn > 30) {
        lastSpawn = now;
        for (let i=0;i<3;i++) particles.push({ x:Math.random()*w, y:h-5, vx:(Math.random()-0.5)*0.3, vy:-0.4-Math.random()*0.8, size:0.8+Math.random()*1.4, color:colors[Math.floor(Math.random()*colors.length)], life:1400+Math.random()*1400, born:now });
      }
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i], age=now-p.born;
        if(age>p.life||p.y<-10){particles.splice(i,1);continue;}
        p.x+=p.vx; p.y+=p.vy; p.vx+=(Math.random()-0.5)*0.05;
        const a=(1-age/p.life)*0.9; ctx.globalAlpha=a; ctx.fillStyle=p.color;
        ctx.shadowBlur=8; ctx.shadowColor=p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1; ctx.shadowBlur=0; raf=requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return <canvas ref={canvasRef} className={className} />;
}

// ── Body canvas component ──────────────────────────────────────────────────
function BodyCanvas({ genome, displayWidth, className="" }) {
  const ref = useRef(null);
  const valid = genome && genome.skin && genome.hairColor && genome.bgTint;
  useEffect(() => {
    if (!ref.current || !valid) return;
    window.renderBody(ref.current, genome);
  }, [genome, valid]);
  if (!valid) return null;
  const { W, H } = window.BODY_DIMS;
  const dw = displayWidth || 320;
  const dh = Math.round(dw * (H / W));
  return (
    <canvas ref={ref} width={W} height={H} className={`body-canvas ${className}`}
      style={{ width: dw, height: dh }} />
  );
}

// ── Scrambling name display ────────────────────────────────────────────────
function RollingName({ rolling, finalName, tier, onSettle }) {
  const [display, setDisplay] = useState("— — —");
  const timerRef = useRef(null);
  useEffect(() => {
    if (!rolling) return;
    const D = window.NAME_DATA;
    const pickRand = arr => arr[Math.floor(Math.random()*arr.length)];
    const scramble = () => {
      if (Math.random()<0.5) return pickRand(D.static_last_names);
      return pickRand(D.fusion_prefixes)+pickRand(D.fusion_suffixes);
    };
    const allFirsts = [...D.first_names.male, ...D.first_names.female, ...D.first_names.neutral];
    const start = performance.now(), total = 1800;
    const step = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / total);
      setDisplay(`${pickRand(allFirsts)} ${scramble()}`);
      playTick(700 - t*300, 0.025, 0.03);
      if (elapsed < total) timerRef.current = setTimeout(step, 40 + t*t*360);
      else { setDisplay(finalName); onSettle && onSettle(); }
    };
    step();
    return () => clearTimeout(timerRef.current);
  }, [rolling]);
  useEffect(() => { if (!rolling && finalName) setDisplay(finalName); }, [finalName, rolling]);
  const t = TIERS[tier] || TIERS.common;
  return (
    <div className={`name-strip-name tier-${tier} ${rolling ? 'rolling' : ''}`}
         style={{ '--tier-color': t.color }}>
      {display}
    </div>
  );
}

// ── History item ───────────────────────────────────────────────────────────
function HistoryItem({ entry, onClick }) {
  const t = TIERS[entry.tier] || TIERS.common;
  const { W, H } = window.BODY_DIMS;
  const thumbW = 20, thumbH = Math.round(thumbW * (H / W));
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !entry.body) return;
    window.renderBody(ref.current, entry.body);
  }, [entry]);
  return (
    <button className={`history-item history-${entry.tier}`} onClick={() => onClick(entry)}
            style={{ '--tier-color': t.color }}>
      {entry.body && (
        <canvas ref={ref} width={W} height={H} className="history-body-canvas"
          style={{ width: thumbW, height: thumbH }} />
      )}
      <span className="history-tier-pip" />
      <span className="history-name">{entry.displayName}</span>
      <span className="history-tier-label">{t.label}</span>
    </button>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────
function StatsBar({ totalRolls, tierCounts }) {
  return (
    <div className="stats-block">
      <div className="stats-total">
        <span className="stats-num">{totalRolls}</span>
        <span className="stats-label">ROLLS</span>
      </div>
      <div className="stats-tiers">
        {Object.keys(tierCounts).filter(k => TIERS[k]).map(k => (
          <div key={k} className={`stat-tier stat-${k}`} style={{ '--tier-color': TIERS[k].color }}>
            <span className="stat-tier-label">{TIERS[k].label}</span>
            <span className="stat-tier-count">{tierCounts[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dev panel ─────────────────────────────────────────────────────────────
function DevPanel({ onForce, disabled }) {
  const [open, setOpen] = useState(false);
  const tiers = ['common','uncommon','rare','epic','legendary','ultra'];
  return (
    <div className={`dev-panel ${open?'dev-panel-open':''}`}>
      <button className="dev-toggle" onClick={()=>setOpen(o=>!o)} title="Dev: force tier">{open?'×':'⚙'}</button>
      {open && (
        <div className="dev-tiers">
          <div className="dev-title">FORCE TIER</div>
          {tiers.map(t => (
            <button key={t} className={`dev-tier-btn dev-tier-${t}`} onClick={()=>onForce(t)} disabled={disabled} style={{ '--tier-color': TIERS[t].color }}>
              <span className="dev-tier-pip" />{TIERS[t].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
function App() {
  const [gender, setGender] = useState('any');
  const [current, setCurrent] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const [tierCounts, setTierCounts] = useState({ common:0, uncommon:0, rare:0, epic:0, legendary:0, ultra:0 });
  const [legendaryOverlay, setLegendaryOverlay] = useState(false);
  const [shake, setShake] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const canvasRef = useRef(null);

  // Persist
  useEffect(() => {
    const valid = ['common','uncommon','rare','epic','legendary','ultra'];
    const saved = localStorage.getItem('bodygen_history');
    if (saved) { try { const p=JSON.parse(saved); if(Array.isArray(p)) setHistory(p.filter(e=>e&&valid.includes(e.tier))); } catch(e){} }
    const nt = localStorage.getItem('bodygen_total');
    if (nt) { const n=parseInt(nt,10); if(!isNaN(n)) setTotalRolls(n); }
    const nc = localStorage.getItem('bodygen_counts');
    if (nc) { try { const p=JSON.parse(nc); const clean={common:0,uncommon:0,rare:0,epic:0,legendary:0,ultra:0}; for(const k of valid){if(typeof p?.[k]==='number')clean[k]=p[k];} setTierCounts(clean); } catch(e){} }
  }, []);
  useEffect(() => { localStorage.setItem('bodygen_history', JSON.stringify(history.slice(0,100))); }, [history]);
  useEffect(() => { localStorage.setItem('bodygen_total', String(totalRolls)); }, [totalRolls]);
  useEffect(() => { localStorage.setItem('bodygen_counts', JSON.stringify(tierCounts)); }, [tierCounts]);

  const doRoll = useCallback((forcedTier) => {
    if (rolling) return;
    const ctx = getAudio();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const g = gender === 'any' ? null : gender;
    const nameResult = window.generateName(g, forcedTier);
    const body = window.generateBody(nameResult.tier, nameResult.gender);
    const entry = { ...nameResult, body };
    setCurrent(entry);
    setRolling(true);
    setRevealed(false);
    setLegendaryOverlay(false);
  }, [rolling, gender]);

  const handleSettle = useCallback(() => {
    if (!current) return;
    setRolling(false);
    setRevealed(true);
    playRevealChord(current.tier);
    setBurstKey(k => k+1);
    setHistory(prev => [{ ...current, ts: Date.now() }, ...prev].slice(0, 100));
    setTotalRolls(n => n+1);
    setTierCounts(prev => ({ ...prev, [current.tier]: (prev[current.tier]||0)+1 }));
    const shakeAmt = { common:0, uncommon:2, rare:4, epic:8, legendary:18, ultra:30 }[current.tier];
    if (shakeAmt > 0) { setShake(shakeAmt); setTimeout(()=>setShake(0), 600); }
    if (current.tier === 'legendary' || current.tier === 'ultra') setTimeout(()=>setLegendaryOverlay(true), 100);
  }, [current]);

  // Render body to canvas whenever current changes and is revealed
  useEffect(() => {
    if (!canvasRef.current || !current?.body || !revealed) return;
    window.renderBody(canvasRef.current, current.body);
  }, [current, revealed]);

  useEffect(() => {
    const onKey = e => { if (e.code === 'Space' && !rolling) { e.preventDefault(); doRoll(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rolling, doRoll]);

  const handleShare = useCallback(() => {
    if (!canvasRef.current || !current) return;
    window.shareOrDownload(canvasRef.current, current.displayName || 'character', 8);
  }, [current]);

  const tier = (current?.tier && TIERS[current.tier]) ? current.tier : 'common';
  const tierData = TIERS[tier];
  const isLegendary = revealed && (tier === 'legendary' || tier === 'ultra');
  const isUltra = revealed && tier === 'ultra';

  const { W, H } = window.BODY_DIMS;
  // Compute display size — fill the available vertical space
  const bodyDisplayW = 240;
  const bodyDisplayH = Math.round(bodyDisplayW * (H / W));

  return (
    <div className="app-root" style={{ '--shake': `${shake}px` }}>
      <div className="grain-overlay" />
      <div className={`app-stage ${shake ? 'shaking' : ''}`}>

        <header className="app-header">
          <div className="logo-mark">
            <span className="logo-dot" />
            <span className="logo-text">BODY.GEN</span>
            <span className="logo-meta">v1.0 // CHARACTER GENERATOR</span>
          </div>
          <div className="header-right">
            <a className="nav-link" href="../name-face-gen/index.html">← CAST.GEN</a>
            <div className="gender-picker">
              {['any','male','female','neutral'].map(g => (
                <button key={g} className={`gender-btn ${gender===g?'active':''}`} onClick={()=>setGender(g)}>
                  {g.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="main-layout">

          {/* ── CENTER: body display ── */}
          <div className="body-stage-col">
            <div className={`reveal-frame tier-frame-${tier} ${revealed?'revealed':''} ${rolling?'rolling':''}`}>
              <div className="frame-corner tl"/><div className="frame-corner tr"/>
              <div className="frame-corner bl"/><div className="frame-corner br"/>

              <div className="frame-inner">
                <div className="reveal-meta">
                  <span className={`tier-badge ${revealed?'show':''}`} style={{ '--tier-color': tierData.color }}>
                    {revealed ? tierData.label : '—'}
                  </span>
                  <span className="reveal-id">#{String(totalRolls + (rolling?1:0)).padStart(4,'0')}</span>
                </div>

                {/* Body canvas — always mounted, rendered on reveal */}
                <div className={`body-canvas-wrap tier-${tier}`} style={{ display: revealed ? 'block' : 'none' }}>
                  <canvas
                    ref={canvasRef}
                    width={W} height={H}
                    className="body-canvas"
                    style={{ width: bodyDisplayW, height: bodyDisplayH }}
                  />
                </div>

                {!revealed && !rolling && (
                  <div style={{ color: 'var(--text-faint)', fontSize: 12, letterSpacing: '0.2em' }}>
                    PRESS ROLL
                  </div>
                )}
                {rolling && (
                  <div style={{ color: 'var(--text-dim)', fontSize: 12, letterSpacing: '0.25em', animation: 'jitter 0.05s infinite' }}>
                    GENERATING…
                  </div>
                )}

                {/* Name strip */}
                <div className="name-strip" style={{ position: 'static', paddingTop: 8 }}>
                  <RollingName
                    rolling={rolling}
                    finalName={current?.displayName || ''}
                    tier={tier}
                    onSettle={handleSettle}
                  />
                  {revealed && current?.tier && (
                    <div className="name-strip-title">
                      {tierData.label} · {current.gender?.toUpperCase()}
                    </div>
                  )}
                </div>

                <ParticleBurst key={burstKey} tier={tier} trigger={revealed ? burstKey : 0} />
                {isLegendary && <GoldDust active={true} />}
              </div>
            </div>

            {/* Controls */}
            <div className="controls-row">
              <button className={`share-btn`} onClick={handleShare} disabled={!revealed}>
                <span>SHARE</span>
                <span className="share-btn-sub">SAVE IMAGE</span>
              </button>
              <button className={`roll-btn ${rolling?'disabled':''}`} onClick={()=>doRoll()} disabled={rolling}>
                <span className="roll-btn-text">{rolling ? 'ROLLING…' : 'ROLL'}</span>
                <span className="roll-btn-hint">SPACE</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT: stats + history ── */}
          <aside className="side-panel">
            <StatsBar totalRolls={totalRolls} tierCounts={tierCounts} />
            <div className="panel-title">
              ROLL LOG
              {history.length > 0 && (
                <button className="clear-btn" onClick={() => {
                  if (confirm('Clear history and reset?')) {
                    setHistory([]); setTotalRolls(0);
                    setTierCounts({ common:0, uncommon:0, rare:0, epic:0, legendary:0, ultra:0 });
                  }
                }}>CLEAR</button>
              )}
            </div>
            <div className="history-list">
              {history.length === 0 && <div className="history-empty">No rolls yet.<br/>Press ROLL.</div>}
              {history.map((h, i) => (
                <HistoryItem key={h.ts+'-'+i} entry={h} onClick={e => { setCurrent(e); setRevealed(true); }} />
              ))}
            </div>
          </aside>
        </div>

        <footer className="app-footer">
          <span>COMMON 50% · UNCOMMON 30% · RARE 10% · EPIC 5% · LEGENDARY 4% · MYTHIC 0.?%</span>
          <span>SPACE TO ROLL · {totalRolls} ROLLS · {history.length} IN LOG</span>
        </footer>

        <DevPanel onForce={t => doRoll(t)} disabled={rolling} />
      </div>

      {/* Legendary overlay */}
      {legendaryOverlay && (
        <div className={`legendary-overlay ${isUltra?'ultra-overlay':''}`} onClick={()=>setLegendaryOverlay(false)}>
          <div className="legendary-rays" />
          <div className="legendary-content">
            <div className="legendary-banner">
              <span className="legendary-banner-text">{isUltra ? '✦ MYTHIC ✦' : 'LEGENDARY DROP'}</span>
            </div>
            {current?.body && (
              <div className="legendary-body-stage">
                <BodyCanvas genome={current.body} displayWidth={280} className="body-canvas-legendary" />
              </div>
            )}
            <div className={`legendary-name-big`}>{current?.displayName}</div>
            <div className="legendary-sub">
              {isUltra ? 'A 1-IN-100000 ROLL · TAP TO CONTINUE' : 'A 1-IN-100 ROLL · TAP TO CONTINUE'}
            </div>
            <GoldDust active={true} className="gold-dust-canvas-ov" />
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) return (
      <div style={{padding:40,fontFamily:'monospace',color:'#e8e8ec',textAlign:'center'}}>
        <h2>Render error.</h2>
        <p style={{color:'#8b8b95',margin:'12px 0'}}>{String(this.state.err)}</p>
        <button onClick={()=>{localStorage.clear();location.reload();}}
          style={{padding:'10px 20px',border:'1px solid #3a3a44',background:'#1a1a1f',color:'#e8e8ec',cursor:'pointer',letterSpacing:'0.2em',fontSize:11}}>
          CLEAR &amp; RELOAD
        </button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
