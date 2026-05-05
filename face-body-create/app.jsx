// Face/Body manual editor — cycle through traits, sliders for proportions,
// re-renders the body canvas live as the genome changes.
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ─── Trait pools ─────────────────────────────────────────────────────────
// Limited to keys actually drawn by body.js so every cycle visibly changes the canvas.
const HAIR_STYLES = {
  female:  ['long-flow','long-shiny','long-side','bob','ponytail','low-bun','messy-bun','braid','pixie','short-shag','tucked',
            'pompadour','afro','beehive','top-knot','space-buns','dreadlocks','crew-cut'],
  male:    ['short-mop','buzz','side-part','messy','slicked-back','bowl','tucked','side-swept','long-pull','mullet','spike','bald',
            'pompadour','afro','mohawk','crew-cut','top-knot','dreadlocks','man-bun'],
  neutral: ['shaggy','messy','undercut','long-flow','spike','side-swept','tucked','ponytail',
            'pompadour','afro','mohawk','crew-cut','top-knot','space-buns','dreadlocks','man-bun','beehive'],
};
const HEAD_SHAPES = {
  female:  ['round','oval','heart','diamond','pear-face','long-oval','cushion'],
  male:    ['square','oblong','rectangle','angular-round','triangle','chiseled','tapered'],
  neutral: ['oval','round','angular-round','diamond','oblong','square','inverted-triangle',
            'chiseled','pear-face','long-oval','cushion','tapered'],
};
const BODY_TYPES = {
  female:  ['slender','petite','average','curved','hourglass','pear','athletic','lanky','chubby'],
  male:    ['broad','average','lean','stout','athletic','muscular','lanky','chubby'],
  neutral: ['lean','average','slender','broad','athletic','muscular','hourglass','pear','lanky','chubby'],
};
const EYE_TYPES = [
  'bead-black','bead-brown','bead-hazel','bead-amber',
  'glow-blue','glow-green','glow-violet','glow-cyan',
  'scar-eye','burning-gold','burning-white','burning-red','void-eye',
];
const MOUTHS = ['line','neutral','small-line','frown','smirk','tiny-smile'];
const BREAST_SIZES = ['none','small','medium','large'];
const GENDERS = ['female','male','neutral'];

// Flatten all colors across tiers from FACE_CONFIG.
const C = window.FACE_CONFIG;
const uniq = arr => [...new Set(arr)];
const HAIR_COLORS = uniq(Object.values(C.hair_colors).flatMap(o => Object.keys(o)));
const SKIN_TONES  = uniq(Object.values(C.skin_tones ).flatMap(o => Object.keys(o)));
const GARB_COLORS = uniq(Object.values(C.garb_colors).flatMap(o => Object.keys(o)));
const BG_TINTS    = uniq(Object.values(C.bg_tints));

// ─── Default genome ──────────────────────────────────────────────────────
function defaultGenome() {
  return {
    tier: 'common', // disables tier accessory rendering
    gender: 'female',
    skin: '#d4a181',
    hairColor: '#3d2a1c',
    hairStyle: 'long-flow',
    headShape: 'oval',
    bodyType: 'slender',
    eye: 'bead-brown',
    mouth: 'line',
    garb: '#5a5a4a',
    freckles: false,
    cheekBlush: false,
    eyeBags: false,
    bgTint: '#2a2a2e',
    seed: 0,
    torsoLen: 1.0,
    legLen: 1.0,
    armLen: 1.0,
    footSize: 1.0,
    breastSize: 'medium',
  };
}

// ─── UI primitives ───────────────────────────────────────────────────────

function Cycler({ label, value, options, onChange, format }) {
  const idx = options.indexOf(value);
  const safe = idx < 0 ? 0 : idx;
  const prev = () => onChange(options[(safe - 1 + options.length) % options.length]);
  const next = () => onChange(options[(safe + 1) % options.length]);
  const display = format ? format(value) : String(value).replace(/-/g, ' ');
  return (
    <div className="cycler">
      <div className="cycler-head">
        <span className="cycler-label">{label}</span>
        <span className="cycler-pos">{safe + 1}/{options.length}</span>
      </div>
      <div className="cycler-row">
        <button className="cycler-btn" onClick={prev} aria-label="Previous">◀</button>
        <div className="cycler-value">{display}</div>
        <button className="cycler-btn" onClick={next} aria-label="Next">▶</button>
      </div>
    </div>
  );
}

function ColorCycler({ label, value, options, onChange }) {
  const idx = options.indexOf(value);
  const safe = idx < 0 ? 0 : idx;
  const prev = () => onChange(options[(safe - 1 + options.length) % options.length]);
  const next = () => onChange(options[(safe + 1) % options.length]);
  return (
    <div className="cycler">
      <div className="cycler-head">
        <span className="cycler-label">{label}</span>
        <span className="cycler-pos">{safe + 1}/{options.length}</span>
      </div>
      <div className="cycler-row">
        <button className="cycler-btn" onClick={prev} aria-label="Previous">◀</button>
        <div className="cycler-color">
          <span className="cycler-swatch" style={{ background: value }} />
          <span className="cycler-hex">{value}</span>
        </div>
        <button className="cycler-btn" onClick={next} aria-label="Next">▶</button>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, displayPct }) {
  const display = displayPct
    ? `${Math.round(value * 100)}%`
    : value.toFixed(2);
  return (
    <div className="slider">
      <div className="slider-head">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <button className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <span className="toggle-pip" />
      <span className="toggle-label">{label}</span>
      <span className="toggle-state">{value ? 'ON' : 'OFF'}</span>
    </button>
  );
}

// ─── Share / download ────────────────────────────────────────────────────
function downloadCanvas(canvas, name, scale = 8) {
  const off = document.createElement('canvas');
  off.width = canvas.width * scale;
  off.height = canvas.height * scale;
  const ctx = off.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, off.width, off.height);
  off.toBlob(blob => {
    const filename = (name || 'character').replace(/[^a-z0-9_\-]/gi, '_') + '.png';
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(() => _dl(blob, filename));
    } else {
      _dl(blob, filename);
    }
  });
}
function _dl(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Persistence ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'fbcreate_genome_v1';
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.skin && parsed.hairColor && parsed.bgTint) return parsed;
  } catch (e) {}
  return null;
}

// ─── Main App ────────────────────────────────────────────────────────────
function App() {
  const [genome, setGenome] = useState(() => loadSaved() || defaultGenome());
  const canvasRef = useRef(null);

  const update = (k, v) => setGenome(g => ({ ...g, [k]: v }));

  // Re-render whenever genome changes
  useEffect(() => {
    if (canvasRef.current) window.renderBody(canvasRef.current, genome);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(genome));
  }, [genome]);

  // When gender changes, repair invalid hairStyle / headShape / bodyType / breastSize
  useEffect(() => {
    setGenome(g => {
      const patch = {};
      if (!HAIR_STYLES[g.gender].includes(g.hairStyle)) patch.hairStyle = HAIR_STYLES[g.gender][0];
      if (!HEAD_SHAPES[g.gender].includes(g.headShape)) patch.headShape = HEAD_SHAPES[g.gender][0];
      if (!BODY_TYPES[g.gender].includes(g.bodyType))   patch.bodyType  = BODY_TYPES[g.gender][0];
      if (g.gender !== 'female' && g.breastSize !== 'none') patch.breastSize = 'none';
      if (g.gender === 'female' && g.breastSize === 'none') patch.breastSize = 'medium';
      return Object.keys(patch).length ? { ...g, ...patch } : g;
    });
  }, [genome.gender]);

  const handleSave = useCallback(() => {
    if (canvasRef.current) downloadCanvas(canvasRef.current, 'character', 8);
  }, []);

  const handleRandomize = useCallback(() => {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const rand = (lo, hi) => lo + Math.random() * (hi - lo);
    const gender = pick(GENDERS);
    setGenome({
      tier: 'common',
      gender,
      skin: pick(SKIN_TONES),
      hairColor: pick(HAIR_COLORS),
      hairStyle: pick(HAIR_STYLES[gender]),
      headShape: pick(HEAD_SHAPES[gender]),
      bodyType:  pick(BODY_TYPES[gender]),
      eye: pick(EYE_TYPES),
      mouth: pick(MOUTHS),
      garb: pick(GARB_COLORS),
      freckles:   Math.random() < 0.3,
      cheekBlush: Math.random() < 0.4,
      eyeBags:    Math.random() < 0.15,
      bgTint: pick(BG_TINTS),
      seed: Math.floor(Math.random() * 1e9),
      torsoLen: rand(0.85, 1.15),
      legLen:   rand(0.80, 1.20),
      armLen:   rand(0.85, 1.15),
      footSize: rand(0.85, 1.15),
      breastSize: gender === 'female' ? pick(['small','medium','large']) : 'none',
    });
  }, []);

  const handleReset = useCallback(() => setGenome(defaultGenome()), []);

  const handleCopyJson = useCallback(() => {
    const json = JSON.stringify(genome, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(
        () => alert('Genome JSON copied to clipboard.'),
        () => prompt('Copy genome JSON:', json)
      );
    } else {
      prompt('Copy genome JSON:', json);
    }
  }, [genome]);

  const { W, H } = window.BODY_DIMS;
  const displayW = 320;
  const displayH = Math.round(displayW * (H / W));

  const hairStyles = HAIR_STYLES[genome.gender];
  const headShapes = HEAD_SHAPES[genome.gender];
  const bodyTypes  = BODY_TYPES[genome.gender];

  return (
    <div className="app-root">
      <div className="grain-overlay" />
      <div className="app-stage">

        <header className="app-header">
          <div className="logo-mark">
            <span className="logo-dot" />
            <span className="logo-text">FACE.BODY.CREATE</span>
            <span className="logo-meta">v1.0 // CHARACTER EDITOR</span>
          </div>
          <div className="header-right">
            <a className="nav-link" href="../body-gen/index.html">← BODY.GEN</a>
            <a className="nav-link" href="../name-face-gen/index.html">CAST.GEN</a>
          </div>
        </header>

        <div className="main-layout">

          {/* Preview */}
          <div className="preview-col">
            <div className="preview-frame">
              <div className="frame-corner tl" />
              <div className="frame-corner tr" />
              <div className="frame-corner bl" />
              <div className="frame-corner br" />
              <canvas
                ref={canvasRef}
                width={W} height={H}
                className="body-canvas"
                style={{ width: displayW, height: displayH }}
              />
            </div>
            <div className="preview-meta">
              <span>{genome.gender.toUpperCase()}</span>
              <span className="meta-dot">·</span>
              <span>{genome.headShape.replace(/-/g, ' ').toUpperCase()}</span>
              <span className="meta-dot">·</span>
              <span>{genome.bodyType.toUpperCase()}</span>
            </div>
            <div className="preview-actions">
              <button className="action-btn" onClick={handleRandomize}>RANDOMIZE</button>
              <button className="action-btn" onClick={handleReset}>RESET</button>
              <button className="action-btn action-primary" onClick={handleSave}>SAVE PNG</button>
            </div>
            <button className="json-btn" onClick={handleCopyJson}>COPY GENOME JSON</button>
          </div>

          {/* Controls */}
          <div className="controls-col">
            <div className="control-group">
              <div className="group-title">IDENTITY</div>
              <Cycler label="GENDER" value={genome.gender} options={GENDERS}
                onChange={v => update('gender', v)} format={s => s.toUpperCase()} />
              <Cycler label="HEAD SHAPE" value={genome.headShape} options={headShapes}
                onChange={v => update('headShape', v)} />
              <Cycler label="BODY TYPE" value={genome.bodyType} options={bodyTypes}
                onChange={v => update('bodyType', v)} />
            </div>

            <div className="control-group">
              <div className="group-title">HAIR</div>
              <Cycler label="STYLE" value={genome.hairStyle} options={hairStyles}
                onChange={v => update('hairStyle', v)} />
              <ColorCycler label="COLOR" value={genome.hairColor} options={HAIR_COLORS}
                onChange={v => update('hairColor', v)} />
            </div>

            <div className="control-group">
              <div className="group-title">FACE</div>
              <Cycler label="EYES" value={genome.eye} options={EYE_TYPES}
                onChange={v => update('eye', v)} />
              <Cycler label="MOUTH" value={genome.mouth} options={MOUTHS}
                onChange={v => update('mouth', v)} />
              <ColorCycler label="SKIN TONE" value={genome.skin} options={SKIN_TONES}
                onChange={v => update('skin', v)} />
              <div className="toggle-row">
                <Toggle label="FRECKLES"   value={genome.freckles}   onChange={v => update('freckles', v)} />
                <Toggle label="BLUSH"      value={genome.cheekBlush} onChange={v => update('cheekBlush', v)} />
                <Toggle label="EYE BAGS"   value={genome.eyeBags}    onChange={v => update('eyeBags', v)} />
              </div>
            </div>

            <div className="control-group">
              <div className="group-title">ATTIRE</div>
              <ColorCycler label="GARB" value={genome.garb} options={GARB_COLORS}
                onChange={v => update('garb', v)} />
              <ColorCycler label="BACKDROP" value={genome.bgTint} options={BG_TINTS}
                onChange={v => update('bgTint', v)} />
            </div>

            <div className="control-group">
              <div className="group-title">PROPORTIONS</div>
              <Slider label="TORSO LENGTH" value={genome.torsoLen} min={0.75} max={1.25} step={0.01}
                onChange={v => update('torsoLen', v)} displayPct />
              <Slider label="LEG LENGTH" value={genome.legLen} min={0.70} max={1.30} step={0.01}
                onChange={v => update('legLen', v)} displayPct />
              <Slider label="ARM LENGTH" value={genome.armLen} min={0.75} max={1.25} step={0.01}
                onChange={v => update('armLen', v)} displayPct />
              <Slider label="FOOT SIZE" value={genome.footSize} min={0.75} max={1.25} step={0.01}
                onChange={v => update('footSize', v)} displayPct />
              {genome.gender === 'female' && (
                <Cycler label="BUST" value={genome.breastSize} options={BREAST_SIZES}
                  onChange={v => update('breastSize', v)} format={s => s.toUpperCase()} />
              )}
            </div>
          </div>

        </div>

        <footer className="app-footer">
          <span>CHANGES SAVE AUTOMATICALLY</span>
          <span>FACE.BODY.CREATE · TALONBAKER</span>
        </footer>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) return (
      <div style={{padding:40,fontFamily:'monospace',color:'#e8e8ec',textAlign:'center'}}>
        <h2>Editor error.</h2>
        <p style={{color:'#8b8b95',margin:'12px 0'}}>{String(this.state.err)}</p>
        <button onClick={()=>{localStorage.removeItem(STORAGE_KEY);location.reload();}}
          style={{padding:'10px 20px',border:'1px solid #3a3a44',background:'#1a1a1f',color:'#e8e8ec',cursor:'pointer',letterSpacing:'0.2em',fontSize:11}}>
          RESET &amp; RELOAD
        </button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
