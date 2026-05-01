// Procedural pixel-art face generator
// Inspired by Superbrothers: Sword & Sworcery EP — chunky pixels, muted earth tones,
// silhouettes built from blocks, tiny bead eyes, simple mouth lines.
// Canvas grid: 32 wide × 36 tall — gives room for varied head shapes & body types.

window.FACE_DATA = {
  // Skin tones — most common are earthy/warm, rare = pale/deep, mythic = obsidian/glowing
  skin_tones: {
    common: ["#d4a181", "#c89072", "#b8825f", "#a37254", "#8a5d44", "#7d4e38", "#e0c2a8", "#caa384"],
    rare:    ["#e8cdb0", "#5a3a2a", "#9a6a4a"],
    epic:    ["#3d2818", "#a89080"],            // ashen / charcoal
    legendary: ["#2e2e2e"],                     // obsidian
    mythic:    ["#3a1010", "#1a0606"],          // blood-marked / void
  },

  hair_colors: {
    common: ["#1a1410", "#2c1f15", "#3d2a1c", "#4a3220", "#6b4426", "#8a5a32", "#a87340", "#c88848"],
    uncommon: ["#d96a3a", "#b8421f", "#dca860"],
    rare:    ["#5a6f8a", "#3a5a7a", "#7a6a5a"],
    epic:    ["#c8c8d0", "#9a98a8", "#5a3a8a"],
    legendary: ["#d4a020", "#e8c040", "#8a2828"],
    mythic:    ["#1a0a1a", "#3a0a3a"],
  },

  eye_types: {
    common:   ["bead-black", "bead-brown"],
    uncommon: ["bead-black", "bead-brown", "bead-hazel"],
    rare:     ["glow-blue", "glow-green", "bead-amber"],
    epic:     ["glow-violet", "glow-cyan", "scar-eye"],
    legendary:["burning-gold", "burning-white"],
    mythic:   ["burning-red", "void-eye"],
  },

  // Hair styles — each has a "back" pass and a "front" pass.
  // Back pass renders BEFORE the head (long hair flowing behind silhouette).
  // Front pass renders AFTER the head (bangs, fringe, front-locks).
  hair_styles: {
    male:    ["short-mop", "buzz", "bowl", "side-part", "messy", "mullet", "long-pull", "bald", "slicked-back", "tucked", "side-swept"],
    female:  ["long-flow", "long-shiny", "bob", "braid", "long-side", "pixie", "messy-bun", "ponytail", "low-bun", "short-shag", "tucked"],
    neutral: ["shaggy", "messy", "undercut", "long-flow", "spike", "side-swept", "tucked", "ponytail"],
  },

  // Head shapes — proportions of the cranium silhouette
  // Pulled from the classic face-shape chart: heart, oval, oblong, round, angular-round,
  // inverted-triangle, diamond, rectangle, square, triangle.
  // Pools split by gender — female faces tend toward soft/rounded, male toward angular.
  head_shapes: {
    female: ["round", "oval", "heart", "diamond", "oval", "round"],         // softer, rounder; oval/round weighted higher
    male:   ["square", "oblong", "rectangle", "angular-round", "triangle"], // angular, hard jaws
    neutral:["oval", "round", "angular-round", "diamond", "oblong", "square"],
  },

  // Body types — shoulder width, neck length, frame
  body_types: {
    male:    ["broad", "broad", "average", "lean", "stout"],
    female:  ["slender", "slender", "petite", "average", "curved"],
    neutral: ["lean", "average", "slender", "broad"],
  },

  mouths: ["line", "line", "line", "frown", "smirk", "tiny-smile", "neutral", "small-line"],

  bg_tints: {
    common: "#2a2a2e",
    uncommon: "#1f2e1f",
    rare: "#1f2838",
    epic: "#2a1f3a",
    legendary: "#3a2a18",
    mythic: "#2a1010",
  },

  garb_colors: {
    common: ["#5a5a4a", "#4a4438", "#3d3a32", "#5a4a3a", "#6a5e4a"],
    uncommon: ["#7a6a4a", "#5a6a4a", "#4a5a6a"],
    rare: ["#3a4a6a", "#5a3a3a", "#3a5a5a"],
    epic: ["#5a3a6a", "#3a3a5a", "#6a3a3a"],
    legendary: ["#8a6818", "#a08038", "#6a3818"],
    mythic: ["#5a1018", "#3a0a18", "#1a0a1a"],
  },
};

// ---------- Generation ----------
const fpick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const froll = () => Math.random();

// Pick a key from a {key: weight} object proportional to weight.
// Keys with weight 0 (or missing) are skipped.
function weightedPick(weights) {
  if (!weights) return null;
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  if (!entries.length) return null;
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function generateFace(tier, gender) {
  const C = window.FACE_CONFIG;
  const CS = window.ColorSampler;

  tier = tier || "common";
  const tierKey = tier === "ultra" ? "mythic" : tier;
  gender = gender || fpick(["male", "female", "neutral"]);

  // Sample colors from perlin texture — no hardcoded color palettes
  let skinTones = CS.sampleAndDerive();
  const hairTones = CS.sampleAndDerive();
  const eyeTones = CS.sampleAndDerive();
  const garbTones = CS.sampleAndDerive();

  // TIER-SPECIFIC OVERRIDES: Keep special legendary/mythic effects
  // These are unique, rare, and define the tier visually
  if (tierKey === "legendary") {
    // Legendary: blood-marked obsidian skin
    skinTones = CS.deriveTones({ r: 46, g: 46, b: 46 }); // #2e2e2e obsidian
  } else if (tierKey === "mythic") {
    // Mythic: void-black or blood-marked
    const mythicChoice = froll() < 0.5;
    skinTones = CS.deriveTones(
      mythicChoice
        ? { r: 26, g: 6, b: 6 }    // blood-marked #1a0606
        : { r: 58, g: 16, b: 16 }  // deeper blood #3a1010
    );
  }

  // Eye types still tied to tier for special effects (glow, burning, void)
  const eyePool = C.eye_types[tierKey] || C.eye_types.common;

  const dc = C.detail_chances || {};
  const frecklesBase =
    tier === "common"   ? (dc.freckles_common   ?? 0.25) :
    tier === "uncommon" ? (dc.freckles_uncommon ?? 0.25) : 0;

  return {
    tier,
    gender,
    // Skin tones (4-tone system)
    skinTones,
    // Hair tones (4-tone system)
    hairTones,
    // Eye tones (4-tone system, modified by eye type)
    eyeTones,
    // Garb/clothing tones (4-tone system)
    garbTones,
    // Structural variety (no hardcoded limits, just distribution)
    hairStyle: weightedPick(C.hair_styles[gender] || C.hair_styles.neutral),
    headShape: weightedPick(C.head_shapes[gender] || C.head_shapes.neutral),
    bodyType:  weightedPick(C.body_types[gender]  || C.body_types.neutral),
    eye:    weightedPick(eyePool),
    mouth:  weightedPick(C.mouths),
    freckles:   froll() < frecklesBase,
    cheekBlush: froll() < (dc.cheek_blush ?? 0.4),
    eyeBags:    froll() < (dc.eye_bags    ?? 0.15),
    bgTint: (C.bg_tints && C.bg_tints[tierKey]) || "#2a2a2e",
    seed: Math.floor(Math.random() * 1e9),
  };
}

window.generateFace = generateFace;

// ---------- Renderer ----------
const W = 32, H = 36;

// Convert color object {r, g, b} to hex string
function toHexColor(colorObj) {
  if (typeof colorObj === 'string') return colorObj; // already hex
  const r = colorObj.r || 0;
  const g = colorObj.g || 0;
  const b = colorObj.b || 0;
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function shade(hex, amount) {
  const c = hex.replace("#", "");
  let r = parseInt(c.slice(0, 2), 16);
  let g = parseInt(c.slice(2, 4), 16);
  let b = parseInt(c.slice(4, 6), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amount * 255)));
  r = f(r); g = f(g); b = f(b);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function px(ctx, x, y, color) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ---------- Head shapes ----------
// Each shape returns a 2D array of rows. "X" = skin pixel.
// Origin offset (x, y) places the head silhouette on the canvas.
// Heads sit centered horizontally around column 16, top around y=4.
function getHeadShape(shape) {
  // Heads are 14 rows tall, ~16 cols wide max. Centered on column 16 (after baseX=6 offset).
  // Shape pools are split by gender so female faces use soft/round shapes and
  // male faces use angular ones.
  const shapes = {
    // ---- SOFT / FEMININE ----
    round: [
      // Wide, soft, full cheeks, rounded chin
      "      XXXXXXXX      ",
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXX   ",
      "    XXXXXXXXXXXX    ",
      "      XXXXXXXX      ",
    ],
    oval: [
      // Slightly elongated, narrower than round, smooth taper
      "      XXXXXXXX      ",
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "    XXXXXXXXXXXX    ",
      "     XXXXXXXXXX     ",
      "      XXXXXXXX      ",
    ],
    heart: [
      // Wide forehead/temples, narrow pointed chin
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXX   ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "     XXXXXXXXXX     ",
      "     XXXXXXXXXX     ",
      "      XXXXXXXX      ",
      "      XXXXXXXX      ",
      "       XXXXXX       ",
      "        XXXX        ",
    ],
    diamond: [
      // Narrow forehead and chin, widest at cheekbones
      "       XXXXXX       ",
      "      XXXXXXXX      ",
      "     XXXXXXXXXX     ",
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "     XXXXXXXXXX     ",
      "      XXXXXXXX      ",
      "       XXXXXX       ",
      "        XXXX        ",
    ],

    // ---- ANGULAR / MASCULINE ----
    square: [
      // Wide flat top, wide flat jaw, hard corners
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXX   ",
    ],
    rectangle: [
      // Tall and narrower than square — rectangular jaw
      "      XXXXXXXX      ",
      "     XXXXXXXXXX     ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "     XXXXXXXXXX     ",
    ],
    oblong: [
      // Even longer than rectangle, slightly tapered at top and bottom
      "      XXXXXXXX      ",
      "     XXXXXXXXXX     ",
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "      XXXXXXXX      ",
    ],
    "angular-round": [
      // Hexagonal — round-ish but with definite faceted edges
      "     XXXXXXXXXX     ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      "  XXXXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXX   ",
      "    XXXXXXXXXXXX    ",
      "     XXXXXXXXXX     ",
    ],
    triangle: [
      // Narrow temples, wide square jaw — "pyramid"
      "       XXXXXX       ",
      "      XXXXXXXX      ",
      "     XXXXXXXXXX     ",
      "    XXXXXXXXXXXX    ",
      "    XXXXXXXXXXXX    ",
      "   XXXXXXXXXXXXXX   ",
      "   XXXXXXXXXXXXXX   ",
      "  XXXXXXXXXXXXXXXX  ",
      "  XXXXXXXXXXXXXXXX  ",
      " XXXXXXXXXXXXXXXXXX ",
      " XXXXXXXXXXXXXXXXXX ",
      "XXXXXXXXXXXXXXXXXXXX",
      "XXXXXXXXXXXXXXXXXXXX",
      "XXXXXXXXXXXXXXXXXXXX",
    ],
    "inverted-triangle": [
      // Wide forehead, pointed chin
      "    XXXXXXXXXXXXXX  ",
      "   XXXXXXXXXXXXXXXX ",
      "  XXXXXXXXXXXXXXXXXX",
      "  XXXXXXXXXXXXXXXXXX",
      "   XXXXXXXXXXXXXXXX ",
      "   XXXXXXXXXXXXXXXX ",
      "    XXXXXXXXXXXXXX  ",
      "     XXXXXXXXXXXX   ",
      "      XXXXXXXXXX    ",
      "      XXXXXXXXXX    ",
      "       XXXXXXXX     ",
      "        XXXXXX      ",
      "         XXXX       ",
      "          XX        ",
    ],
  };
  return shapes[shape] || shapes.oval;
}

// Returns object with head metadata for use by other layers
function drawHead(ctx, headShape, skinTones) {
  const rows = getHeadShape(headShape);
  const baseX = 6, baseY = 5;
  // Use 4-tone system from texture sampling
  const skinMid = toHexColor(skinTones.midtone);
  const skinHi = toHexColor(skinTones.highlight);
  const skinShade1 = toHexColor(skinTones.shadow);
  const skinShade2 = toHexColor(skinTones.deepShadow);

  // First pass: fill all pixels with mid skin and record positions
  const mask = []; // [x, y, isLeftEdge, isRightEdge, isTopEdge, isBottomEdge]
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === "X") {
        const x = baseX + c, y = baseY + r;
        px(ctx, x, y, skinMid);
        const left = c === 0 || rows[r][c - 1] !== "X";
        const right = c === rows[r].length - 1 || rows[r][c + 1] !== "X";
        const top = r === 0 || rows[r - 1][c] !== "X";
        const bottom = r === rows.length - 1 || rows[r + 1][c] !== "X";
        mask.push([x, y, left, right, top, bottom]);
      }
    }
  }

  // Find face metrics
  let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
  for (const [x, y] of mask) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  const cx = (minX + maxX) / 2;

  // Shadow pass: deeper shadow on right side (1-2 cols in from right edge), and under jaw
  for (const [x, y, , right, , bottom] of mask) {
    if (right) px(ctx, x, y, skinShade1);
    if (bottom && y > minY + 4) px(ctx, x, y, skinShade2);
  }
  // Inner right shadow column
  for (const [x, y, , right] of mask) {
    if (!right) {
      // pixel just to the right is also skin — check for darken on inner-right
      const isInnerRight = mask.some(([nx, ny, , nright]) => nx === x + 1 && ny === y && nright);
      if (isInnerRight) px(ctx, x, y, skinShade1);
    }
  }
  // Highlight on upper-left of face
  for (const [x, y, left, , top] of mask) {
    if ((left && y < minY + 5) || (top && x < cx)) {
      px(ctx, x, y, skinHi);
    }
  }

  return { minX, maxX, minY, maxY, cx, skinMid, skinShade1, skinShade2, skinHi };
}

// ---------- Body / Shoulders ----------
function drawBody(ctx, bodyType, skinTones, garbTones) {
  const skinShade = toHexColor(skinTones.shadow);
  const garb = toHexColor(garbTones.midtone);
  const garbHi = toHexColor(garbTones.highlight);
  const garbShade = toHexColor(garbTones.shadow);
  const garbShade2 = toHexColor(garbTones.deepShadow);
  const skinMid = toHexColor(skinTones.midtone);

  // Neck — sits directly under the chin (head bottom is around y=18-19).
  // Just one short row of skin connects head to shoulders.
  let neckLeft = 14, neckRight = 17, neckTop = 20;
  if (bodyType === "slender" || bodyType === "petite") { neckLeft = 14; neckRight = 17; }
  else if (bodyType === "broad" || bodyType === "stout") { neckLeft = 13; neckRight = 18; }

  // Two rows of neck skin
  for (let x = neckLeft; x <= neckRight; x++) {
    px(ctx, x, neckTop, skinMid);
    px(ctx, x, neckTop + 1, skinMid);
  }
  // Subtle right-side neck shadow
  px(ctx, neckRight, neckTop, skinShade);
  px(ctx, neckRight, neckTop + 1, skinShade);
  // Soft shadow under jaw — just one row at neckTop
  px(ctx, neckLeft, neckTop, toHexColor(skinTones.shadow));

  // Shoulder shape per body type — width and slope
  let shapes;
  switch (bodyType) {
    case "slender":
      shapes = [
        "         XXXXXXXXXXXX         ",
        "       XXXXXXXXXXXXXXXX       ",
        "      XXXXXXXXXXXXXXXXXX      ",
        "     XXXXXXXXXXXXXXXXXXXX     ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
      ];
      break;
    case "petite":
      shapes = [
        "          XXXXXXXXXX          ",
        "        XXXXXXXXXXXXXX        ",
        "       XXXXXXXXXXXXXXXX       ",
        "      XXXXXXXXXXXXXXXXXX      ",
        "     XXXXXXXXXXXXXXXXXXXX     ",
        "     XXXXXXXXXXXXXXXXXXXX     ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
      ];
      break;
    case "curved":
      shapes = [
        "        XXXXXXXXXXXXXX        ",
        "      XXXXXXXXXXXXXXXXXX      ",
        "     XXXXXXXXXXXXXXXXXXXX     ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
      ];
      break;
    case "lean":
      shapes = [
        "        XXXXXXXXXXXXXX        ",
        "      XXXXXXXXXXXXXXXXXX      ",
        "     XXXXXXXXXXXXXXXXXXXX     ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
      ];
      break;
    case "stout":
      shapes = [
        "       XXXXXXXXXXXXXXXX       ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      ];
      break;
    case "broad":
      shapes = [
        "      XXXXXXXXXXXXXXXXXX      ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      ];
      break;
    case "average":
    default:
      shapes = [
        "       XXXXXXXXXXXXXXXX       ",
        "     XXXXXXXXXXXXXXXXXXXX     ",
        "    XXXXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
      ];
  }

  const baseX = 1, baseY = 22;
  // Fill body
  const bodyMask = [];
  for (let r = 0; r < shapes.length; r++) {
    for (let c = 0; c < shapes[r].length; c++) {
      if (shapes[r][c] === "X") {
        const x = baseX + c, y = baseY + r;
        if (y < H) {
          px(ctx, x, y, garb);
          bodyMask.push([x, y, c, r, shapes[r]]);
        }
      }
    }
  }
  // Highlights on left, shadows on right
  for (const [x, y, c, , row] of bodyMask) {
    const isLeft = c === 0 || row[c - 1] !== "X";
    const isRight = c === row.length - 1 || row[c + 1] !== "X";
    if (isLeft) px(ctx, x, y, garbHi);
    if (isRight) px(ctx, x, y, garbShade);
    // Inner right shadow
    if (!isRight && row[c + 1] === "X" && (c === row.length - 2 || row[c + 2] !== "X")) {
      px(ctx, x, y, garbShade);
    }
  }
  // Collar shadow under neck
  for (let x = neckLeft - 1; x <= neckRight + 1; x++) {
    px(ctx, x, baseY + 1, garbShade2);
  }
  // Collar V-suggestion based on garb (subtle)
  px(ctx, 15, baseY + 1, garbShade2);
  px(ctx, 16, baseY + 2, garbShade2);
  px(ctx, 15, baseY + 2, garbShade);

  return { neckLeft, neckRight, neckTop, baseY };
}

// ---------- Hair: BACK pass (renders before head) ----------
// For long hair flowing behind head silhouette down onto shoulders.
function drawHairBack(ctx, style, hairTones) {
  const hair = toHexColor(hairTones.midtone);
  const hairShadow = toHexColor(hairTones.shadow);
  const hairHi = toHexColor(hairTones.highlight);
  const drawShape = (rows, baseX, baseY) => {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c];
        if (ch === "X") px(ctx, baseX + c, baseY + r, hair);
        else if (ch === "x") px(ctx, baseX + c, baseY + r, hairShadow);
        else if (ch === "h") px(ctx, baseX + c, baseY + r, hairHi);
      }
    }
  };

  switch (style) {
    case "long-flow": {
      // Flowing hair behind head and onto shoulders, both sides
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        "XXXXXXXX        XXXXXXXX",
        "XXXXXXX          XXXXXXX",
        "XXXXXXX          XXXXXXX",
        "XXXXXX            XXXXXX",
        "XXXXXX            XXXXXX",
        "XXXXX              XXXXX",
        "XXXX                XXXX",
        "XXX                  XXX",
        "XX                    XX",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "long-shiny": {
      // Long jet-black/dark hair with a subtle vertical highlight stripe (shiny)
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXhXXXXXXXXX  ",
        "  XXXXXXXXXXhXXXXXXXXX  ",
        " XXXXXXXXXXXhXXXXXXXXXX ",
        " XXXXXXXXXXXhXXXXXXXXXX ",
        " XXXXXXXXXXXhXXXXXXXXXX ",
        " XXXXXXXXXXXhXXXXXXXXXX ",
        " XXXXXXXX       XXXXXXX ",
        "XXXXXXX          XXXXXXX",
        "XXXXXXX          XXXXXXX",
        "XXXXXX            XXXXXX",
        "XXXXX              XXXXX",
        "XXXX                XXXX",
        "XXXX                XXXX",
        "XXX                  XXX",
        "XX                    XX",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "long-side": {
      // Long hair, swept to one side — heavier on the right
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXX       XXXXXXXX ",
        "XXXXX           XXXXXXXX",
        "XXX              XXXXXXX",
        "                 XXXXXXX",
        "                 XXXXXX ",
        "                  XXXX  ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "ponytail": {
      // Hair pulled back — small fringe behind the head, then a tail down the back
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
      ];
      drawShape(back, 4, 5);
      // Tail down the back, slightly off-center
      const tail = [
        "XXXX",
        "XXXX",
        "XXXh",
        "XXXh",
        "XXXh",
        "XXXh",
        "XXX ",
        "XXX ",
        "XX  ",
        "XX  ",
      ];
      drawShape(tail, 14, 13);
      break;
    }
    case "low-bun": {
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
      ];
      drawShape(back, 4, 5);
      // Bun at back of neck
      const bun = [
        " XXXX ",
        "XXXXXX",
        "XXhhXX",
        "XXhhXX",
        "XXXXXX",
        " XXXX ",
      ];
      drawShape(bun, 13, 19);
      break;
    }
    case "braid": {
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
      ];
      drawShape(back, 4, 5);
      // Braid down the back — woven look
      const braid = [
        "XXXX",
        "XxxX",
        "XXXX",
        "XxxX",
        "XXXX",
        "XxxX",
        "XXXX",
        "XxxX",
        " XX ",
      ];
      drawShape(braid, 14, 13);
      break;
    }
    case "long-pull":
    case "slicked-back": {
      // Hair pulled back, only goes a bit past the head
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXX        XXXXXXX ",
        "XXXXX            XXXXXX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "tucked": {
      // Medium hair that goes behind the ears — appears at neck level on sides
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXX          XXXXXX ",
        " XXXX              XXXX ",
        " XXX                XXX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "messy-bun": {
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
      ];
      drawShape(back, 4, 5);
      // Loose strands escaping
      px(ctx, 5, 12, hair);
      px(ctx, 27, 12, hair);
      break;
    }
    case "short-shag": {
      // Hair extends slightly down past head edges
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXX            XXXX ",
        " XXXX                XX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    default:
      // Most short styles need no back pass
      break;
  }
}

// ---------- Hair: FRONT pass (renders after head) ----------
// Bangs, fringe, side-locks, tops of short hair.
function drawHairFront(ctx, style, hairTones) {
  const hair = toHexColor(hairTones.midtone);
  const hairShadow = toHexColor(hairTones.shadow);
  const hairHi = toHexColor(hairTones.highlight);
  const drawShape = (rows, baseX, baseY) => {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c];
        if (ch === "X") px(ctx, baseX + c, baseY + r, hair);
        else if (ch === "x") px(ctx, baseX + c, baseY + r, hairShadow);
        else if (ch === "h") px(ctx, baseX + c, baseY + r, hairHi);
      }
    }
  };

  switch (style) {
    case "long-flow": {
      // Top crown + side-front locks
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXX    XXXXXX  ",
      ];
      drawShape(top, 6, 5);
      // Side-front cascade
      px(ctx, 6, 10);
      const sideL = ["X","X","X","x"];
      const sideR = ["X","X","X","x"];
      sideL.forEach((c, i) => px(ctx, 6, 10 + i, hair));
      sideR.forEach((c, i) => px(ctx, 25, 10 + i, hair));
      break;
    }
    case "long-shiny": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXhhhXXXXXX   ",
        "  XXXXXXhhhXXXXXXX  ",
        "  XXXXX    XXXXXXX  ",
      ];
      drawShape(top, 6, 5);
      // Long side bangs framing the face
      for (let i = 0; i < 4; i++) {
        px(ctx, 6, 10 + i, hair);
        px(ctx, 25, 10 + i, hair);
      }
      px(ctx, 7, 10, hairShadow);
      px(ctx, 24, 10, hairShadow);
      break;
    }
    case "long-side": {
      // Heavy fringe sweeping right to left
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXX      ",
        "  XXXXXXXX          ",
      ];
      drawShape(top, 6, 5);
      // Side lock
      for (let i = 0; i < 5; i++) px(ctx, 6, 10 + i, hair);
      break;
    }
    case "bob": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
        " XXXXXX      XXXXXX ",
        " XXXX          XXXX ",
        " XXX            XXX ",
        " XXx            xXX ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "ponytail": {
      // Pulled-back top with slight fringe
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXX    XXXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "low-bun": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXX  XXXXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "messy-bun": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXX    XXXXX  ",
      ];
      drawShape(top, 6, 5);
      // Bun on top
      const bun = [
        "  XXXX  ",
        " XXXXXX ",
        "XXhhhhXX",
        "XXhhhhXX",
        " XXXXXX ",
        "  XXXX  ",
      ];
      drawShape(bun, 12, 1);
      // Loose front strand
      px(ctx, 13, 11, hair);
      break;
    }
    case "braid": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXX    XXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "pixie": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXX    XXXXXXX  ",
        "  XX        XXXXX   ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "short-shag": {
      const top = [
        "    X XXXXXXXX X    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXX XXXXXXXX XXX  ",
        "  XX            XX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "short-mop": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXX    XXXXXX  ",
        "  XXX        XXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "buzz": {
      const top = [
        "      xxxxxxxx      ",
        "    xxXXXXXXXXxx    ",
        "   xxXXXXXXXXXXxx   ",
        "  xxXXXXXXXXXXXXxx  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "bowl": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "side-part": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXx    ",
        "   XXXXXXXXXxxxxx   ",
        "  XXXXXXXxxxXXXXXX  ",
        "  XXXXXxxXXXXXXXXX  ",
        "  XXXxxXXXXXXXXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "messy":
    case "shaggy": {
      const top = [
        "    X XXXXXX X      ",
        "      XXXXXXXX X    ",
        "   XXXXXXXXXXXXX X  ",
        "  XXXXXXXXXXXXXXXX  ",
        "  X XX XX  XXX X X  ",
        " X X            X X ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "mullet": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXX        XXXXX  ",
      ];
      drawShape(top, 6, 5);
      // Mullet trail in back
      const back = [
        "XXX X",
        "XXXX ",
        "XX   ",
      ];
      drawShape(back, 5, 16);
      drawShape(back.map(r => r.split("").reverse().join("")), 22, 16);
      break;
    }
    case "long-pull":
    case "slicked-back": {
      // Slicked-back top with hair lines suggesting backward sweep
      const top = [
        "      hhhhhhhh      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "tucked": {
      // Medium hair tucked behind ears — visible top + fringe, sides taper at ear
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "undercut": {
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "                    ",
      ];
      drawShape(top, 6, 5);
      // Shaved sides indicated by skin-revealing rows below — already skin
      break;
    }
    case "side-swept": {
      // Asymmetric fringe sweeping over forehead from right to left
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXX   ",
        "    XXXXXXXXXX      ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "spike": {
      const top = [
        "  X    X  X    X    ",
        "   XXX XX XX XX     ",
        "    XXXXXXXXXXX     ",
        "   XXXXXXXXXXXXX    ",
        "  XXXXXXXXXXXXXXX   ",
      ];
      drawShape(top, 6, 4);
      break;
    }
    case "bald":
    default:
      break;
  }
}

// ---------- Eyes ----------
function drawEyes(ctx, type, eyeBags, skinTones) {
  const lx = 11, rx = 19, y = 12;
  const drawDot = (x, y, color, glow) => {
    if (glow) {
      ctx.save();
      ctx.shadowColor = glow;
      ctx.shadowBlur = 4;
      px(ctx, x, y, color);
      ctx.restore();
    } else {
      px(ctx, x, y, color);
    }
  };
  // Optional eye-bags (slight shadow under each eye)
  if (eyeBags) {
    const eyeBagColor = toHexColor(skinTones.shadow);
    px(ctx, lx, y + 1, eyeBagColor);
    px(ctx, rx, y + 1, eyeBagColor);
  }
  switch (type) {
    case "bead-black":
      drawDot(lx, y, "#0a0a0a"); drawDot(rx, y, "#0a0a0a"); break;
    case "bead-brown":
      drawDot(lx, y, "#3a2010"); drawDot(rx, y, "#3a2010"); break;
    case "bead-hazel":
      drawDot(lx, y, "#5a3a1a"); drawDot(rx, y, "#5a3a1a"); break;
    case "bead-amber":
      drawDot(lx, y, "#a86820"); drawDot(rx, y, "#a86820"); break;
    case "glow-blue":
      drawDot(lx, y, "#4ad8ff", "#4ad8ff"); drawDot(rx, y, "#4ad8ff", "#4ad8ff"); break;
    case "glow-green":
      drawDot(lx, y, "#5cff80", "#5cff80"); drawDot(rx, y, "#5cff80", "#5cff80"); break;
    case "glow-violet":
      drawDot(lx, y, "#c060ff", "#c060ff"); drawDot(rx, y, "#c060ff", "#c060ff"); break;
    case "glow-cyan":
      drawDot(lx, y, "#80ffe8", "#80ffe8"); drawDot(rx, y, "#80ffe8", "#80ffe8"); break;
    case "glow-grey":
      drawDot(lx, y, "#b8b8c8", "#b8b8c8"); drawDot(rx, y, "#b8b8c8", "#b8b8c8"); break;
    case "glow-emerald":
      drawDot(lx, y, "#4cff6a", "#4cff6a"); drawDot(rx, y, "#4cff6a", "#4cff6a"); break;
    case "scar-eye":
      px(ctx, lx, y, "#0a0a0a");
      px(ctx, rx - 1, y - 1, "#5a2020");
      px(ctx, rx, y, "#5a2020");
      px(ctx, rx + 1, y + 1, "#5a2020");
      break;
    case "burning-gold":
      ctx.save();
      ctx.shadowColor = "#ffd040"; ctx.shadowBlur = 6;
      px(ctx, lx, y, "#ffd040"); px(ctx, rx, y, "#ffd040");
      ctx.restore();
      break;
    case "burning-white":
      ctx.save();
      ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 6;
      px(ctx, lx, y, "#ffffff"); px(ctx, rx, y, "#ffffff");
      ctx.restore();
      break;
    case "burning-red":
      ctx.save();
      ctx.shadowColor = "#ff2828"; ctx.shadowBlur = 8;
      px(ctx, lx, y, "#ff4040"); px(ctx, rx, y, "#ff4040");
      ctx.restore();
      break;
    case "void-eye":
      ctx.save();
      ctx.shadowColor = "#000"; ctx.shadowBlur = 6;
      px(ctx, lx - 1, y, "#1a0a1a"); px(ctx, rx + 1, y, "#1a0a1a");
      px(ctx, lx, y, "#000"); px(ctx, rx, y, "#000");
      ctx.restore();
      break;
    default:
      drawDot(lx, y, "#0a0a0a"); drawDot(rx, y, "#0a0a0a");
  }
}

// ---------- Face details: nose, mouth, freckles, blush ----------
function drawFaceDetails(ctx, genome, skinTones) {
  const skinDeep = toHexColor(skinTones.deepShadow);
  const skinMid = toHexColor(skinTones.shadow);

  // Nose: 2-3 pixels of skin shadow, centered
  px(ctx, 15, 14, skinMid);
  px(ctx, 15, 15, skinDeep);
  px(ctx, 16, 15, skinMid);

  // Mouth
  const my = 17;
  switch (genome.mouth) {
    case "line":
      px(ctx, 14, my, skinDeep);
      px(ctx, 15, my, skinDeep);
      px(ctx, 16, my, skinDeep);
      break;
    case "frown":
      px(ctx, 14, my, skinDeep);
      px(ctx, 15, my, skinDeep);
      px(ctx, 16, my, skinDeep);
      px(ctx, 13, my - 1, skinMid);
      px(ctx, 17, my - 1, skinMid);
      break;
    case "smirk":
      px(ctx, 14, my, skinDeep);
      px(ctx, 15, my, skinDeep);
      px(ctx, 16, my - 1, skinDeep);
      break;
    case "tiny-smile":
      px(ctx, 14, my, skinDeep);
      px(ctx, 15, my - 1, skinDeep);
      px(ctx, 16, my, skinDeep);
      break;
    case "small-line":
      px(ctx, 14, my, skinDeep);
      px(ctx, 15, my, skinDeep);
      break;
    case "neutral":
    default:
      px(ctx, 14, my, skinMid);
      px(ctx, 16, my, skinMid);
  }

  // Freckles
  if (genome.freckles) {
    px(ctx, 12, 13, shade(skin, -0.13));
    px(ctx, 18, 13, shade(skin, -0.13));
    px(ctx, 13, 14, shade(skin, -0.10));
    px(ctx, 17, 14, shade(skin, -0.10));
  }

  // Cheek blush
  if (genome.cheekBlush) {
    px(ctx, 11, 14, shade(skin, -0.04));
    px(ctx, 19, 14, shade(skin, -0.04));
  }
}

// ---------- Tier accessories ----------
function drawTierAccessory(ctx, tier) {
  if (tier === "legendary") {
    // Gold crown above the head
    px(ctx, 10, 4, "#ffd040");
    px(ctx, 13, 4, "#ffe080");
    px(ctx, 16, 4, "#ffe080");
    px(ctx, 19, 4, "#ffe080");
    px(ctx, 21, 4, "#ffd040");
    for (let x = 10; x <= 21; x++) px(ctx, x, 5, "#ffd040");
    ctx.save();
    ctx.shadowColor = "#ffd040"; ctx.shadowBlur = 8;
    px(ctx, 15, 4, "#fff5cc");
    px(ctx, 16, 4, "#fff5cc");
    ctx.restore();
  }
  if (tier === "ultra") {
    ctx.save();
    ctx.shadowColor = "#ff2828"; ctx.shadowBlur = 10;
    for (let x = 9; x <= 22; x++) px(ctx, x, 3, "#ff4040");
    ctx.restore();
    // Blood mark on forehead
    px(ctx, 15, 11, "#8a0a0a");
    px(ctx, 16, 11, "#8a0a0a");
  }
  if (tier === "epic") {
    // Subtle silver earring on left side
    px(ctx, 7, 14, "#c8c8d0");
    px(ctx, 24, 14, "#c8c8d0");
  }
}

// Helper: ensure tone objects exist with required structure
function ensureTones(tones) {
  if (!tones || typeof tones !== 'object') {
    return { r: 128, g: 128, b: 128, midtone: { r: 128, g: 128, b: 128 }, highlight: { r: 180, g: 180, b: 180 }, shadow: { r: 80, g: 80, b: 80 }, deepShadow: { r: 40, g: 40, b: 40 } };
  }
  if (!tones.midtone) tones.midtone = tones;
  if (!tones.highlight) tones.highlight = { r: 180, g: 180, b: 180 };
  if (!tones.shadow) tones.shadow = { r: 80, g: 80, b: 80 };
  if (!tones.deepShadow) tones.deepShadow = { r: 40, g: 40, b: 40 };
  return tones;
}

// ---------- Main render ----------
function renderFace(canvas, genome) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);

  // Ensure all tone objects exist (for backward compatibility with old history)
  genome.skinTones = ensureTones(genome.skinTones);
  genome.hairTones = ensureTones(genome.hairTones);
  genome.eyeTones = ensureTones(genome.eyeTones);
  genome.garbTones = ensureTones(genome.garbTones);

  // Background tint
  rect(ctx, 0, 0, W, H, genome.bgTint);

  // Layer order:
  // 1. background
  // 2. body / shoulders / garb
  // 3. HAIR BACK PASS (long hair behind silhouette)
  // 4. head + skin shading
  // 5. face details (nose, mouth, etc.)
  // 6. eyes
  // 7. HAIR FRONT PASS (bangs, top, side-locks)
  // 8. tier accessories
  drawBody(ctx, genome.bodyType, genome.skinTones, genome.garbTones);
  drawHairBack(ctx, genome.hairStyle, genome.hairTones);
  drawHead(ctx, genome.headShape, genome.skinTones);
  drawFaceDetails(ctx, genome, genome.skinTones);
  drawEyes(ctx, genome.eye, genome.eyeBags, genome.skinTones);
  drawHairFront(ctx, genome.hairStyle, genome.hairTones);
  drawTierAccessory(ctx, genome.tier);
}

window.renderFace = renderFace;
window.FACE_DIMS = { W, H };
