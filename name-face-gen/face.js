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
  tier = tier || "common";
  // Normalize: the rest of the app uses "ultra" but the config uses "mythic"
  const tierKey = tier === "ultra" ? "mythic" : tier;
  gender = gender || fpick(["male", "female", "neutral"]);

  // Skin: with some chance use the tier's special pool, otherwise common.
  const skinChance = (C.skin_special_chance && C.skin_special_chance[tierKey]) || 0;
  const useSpecialSkin = froll() < skinChance && C.skin_tones[tierKey];
  const skin = weightedPick(useSpecialSkin ? C.skin_tones[tierKey] : C.skin_tones.common);

  // Hair color — same idea but with tier-specific cascading defaults.
  // Mythic mixes mythic + legendary; epic falls back to rare; rare to uncommon; etc.
  let hairColor;
  if (tierKey === "mythic") {
    hairColor = weightedPick({ ...C.hair_colors.mythic, ...C.hair_colors.legendary });
  } else if (tierKey === "legendary") {
    hairColor = weightedPick(C.hair_colors.legendary);
  } else if (tierKey === "epic") {
    hairColor = weightedPick(froll() < 0.7 ? C.hair_colors.epic : C.hair_colors.rare);
  } else if (tierKey === "rare") {
    hairColor = weightedPick(froll() < 0.6 ? C.hair_colors.rare : C.hair_colors.uncommon);
  } else if (tierKey === "uncommon") {
    hairColor = weightedPick(froll() < 0.5 ? C.hair_colors.uncommon : C.hair_colors.common);
  } else {
    hairColor = weightedPick(C.hair_colors.common);
  }

  const eyePool = C.eye_types[tierKey] || C.eye_types.common;
  const garbPool = C.garb_colors[tierKey] || C.garb_colors.common;

  const dc = C.detail_chances || {};
  const frecklesBase =
    tier === "common"   ? (dc.freckles_common   ?? 0.25) :
    tier === "uncommon" ? (dc.freckles_uncommon ?? 0.25) : 0;

  return {
    tier,
    gender,
    skin,
    hairColor,
    hairStyle: weightedPick(C.hair_styles[gender] || C.hair_styles.neutral),
    headShape: weightedPick(C.head_shapes[gender] || C.head_shapes.neutral),
    bodyType:  weightedPick(C.body_types[gender]  || C.body_types.neutral),
    eye:    weightedPick(eyePool),
    mouth:  weightedPick(C.mouths),
    garb:   weightedPick(garbPool),
    freckles:   froll() < frecklesBase,
    cheekBlush: froll() < (dc.cheek_blush ?? 0.4),
    eyeBags:    froll() < (dc.eye_bags    ?? 0.15),
    bgTint: (C.bg_tints && C.bg_tints[tierKey]) || "#2a2a2e",
    seed: Math.floor(Math.random() * 1e9),
  };
}

window.generateFace = generateFace;

// ---------- Renderer ----------
const W = 32, H = 38;

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
  // Heads are 15 rows tall, ~16 cols wide max. Centered on column 16 (after baseX=6 offset).
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
      "       XXXXXX       ",  // chin
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
      "       XXXXXX       ",  // chin
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
      "         XX         ",  // chin point
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
      "         XX         ",  // chin point
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
      "    XXXXXXXXXXXX    ",  // squared chin
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
      "      XXXXXXXX      ",  // chin
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
      "       XXXXXX       ",  // chin
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
      "      XXXXXXXX      ",  // chin
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
      "XXXXXXXXXXXXXXXXXXXX",  // wide jaw chin
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
      "          XX        ",  // chin tip
    ],
  };
  return shapes[shape] || shapes.oval;
}

// Returns object with head metadata for use by other layers
function drawHead(ctx, headShape, skin) {
  const rows = getHeadShape(headShape);
  const baseX = 6, baseY = 5;
  const skinMid = skin;
  const skinShade1 = shade(skin, -0.10);  // mid-shadow
  const skinShade2 = shade(skin, -0.20);  // deep shadow
  const skinHi = shade(skin, 0.08);       // highlight

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
function drawBody(ctx, bodyType, skin, garb) {
  const skinShade = shade(skin, -0.18);
  const garbHi = shade(garb, 0.08);
  const garbShade = shade(garb, -0.20);
  const garbShade2 = shade(garb, -0.32);

  // Neck — sits directly under the chin (head bottom is around y=18-19).
  // Just one short row of skin connects head to shoulders.
  let neckLeft = 14, neckRight = 17, neckTop = 20;
  if (bodyType === "slender" || bodyType === "petite") { neckLeft = 14; neckRight = 17; }
  else if (bodyType === "broad" || bodyType === "stout") { neckLeft = 13; neckRight = 18; }

  // Two rows of neck skin
  for (let x = neckLeft; x <= neckRight; x++) {
    px(ctx, x, neckTop, skin);
    px(ctx, x, neckTop + 1, skin);
  }
  // Subtle right-side neck shadow
  px(ctx, neckRight, neckTop, skinShade);
  px(ctx, neckRight, neckTop + 1, skinShade);
  // Contact shadow at chin/neck junction — darker strip across top of neck
  for (let x = neckLeft; x <= neckRight; x++) {
    px(ctx, x, neckTop, shade(skin, -0.22));
  }
  // Spread shadow 1px wider for soft edge
  px(ctx, neckLeft - 1, neckTop, shade(skin, -0.14));
  px(ctx, neckRight + 1, neckTop, shade(skin, -0.14));

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
function drawHairBack(ctx, style, hair, hairShadow, hairHi) {
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
      // Wide back — 2px extra on each side, full-height side curtains
      const back = [
        "      XXXXXXXXXXXXXXXX      ",
        "    XXXXXXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "XXXXXXX               XXXXXXX",
        "XXXXXXX               XXXXXXX",
        "XXXXXX                 XXXXXX",
        "XXXXXX                 XXXXXX",
        "XXXXX                   XXXXX",
        "XXXXX                   XXXXX",
        "XXXX                     XXXX",
        "XXX                       XXX",
        "XXX                       XXX",
      ];
      drawShape(back, 2, 5);
      break;
    }
    case "long-shiny": {
      // Wide shiny back — centered highlight stripe, full-height side curtains
      const back = [
        "      XXXXXXXXXXXXXXXX      ",
        "    XXXXXXXXXXXXXXXXXXXX    ",
        "  XXXXXXXXXXXXhXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXhXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXhXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXhXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXhXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXhXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXXXXXX  ",
        "XXXXXXX               XXXXXXX",
        "XXXXXXX               XXXXXXX",
        "XXXXXX                 XXXXXX",
        "XXXXX                   XXXXX",
        "XXXXX                   XXXXX",
        "XXXX                     XXXX",
        "XXX                       XXX",
        "XXX                       XXX",
      ];
      drawShape(back, 2, 5);
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
      // Extended back cap with side visibility + wider tail
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXX          XXXXXXX ",
        " XXXX            XXXXXX ",
        " XXX              XXXXX ",
        " XX                XXXX ",
      ];
      drawShape(back, 4, 5);
      // Ponytail down the back
      const tail = [
        "XXXXX",
        "XXXXX",
        "XXXXh",
        "XXXXh",
        "XXXXh",
        "XXXXh",
        "XXXX ",
        "XXXX ",
        "XXX  ",
        "XXX  ",
      ];
      drawShape(tail, 13, 13);
      break;
    }
    case "low-bun": {
      // Extended back cap with side visibility + bun at nape
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXX          XXXXXXX ",
        " XXXX            XXXXXX ",
        " XXX              XXXXX ",
        " XX                XXXX ",
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
      // Extended back cap showing hair on sides, wider braid
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXX          XXXXXXX ",
        " XXXX            XXXXXX ",
        " XXX              XXXXX ",
        " XX                XXXX ",
      ];
      drawShape(back, 4, 5);
      // Braid down the back — woven look, wider column
      const braid = [
        "XXXXXX",
        "XxxxxX",
        "XXXXXX",
        "XxxxxX",
        "XXXXXX",
        "XxxxxX",
        "XXXXXX",
        "XxxxxX",
        " XXXX ",
      ];
      drawShape(braid, 13, 13);
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
      // Hair tucked behind ears — extended side curtains to neck level
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXX          XXXXXXX ",
        " XXXX            XXXXXX ",
        " XXXX            XXXXXX ",
        " XXX              XXXXX ",
        " XXX              XXXXX ",
        " XX                XXXX ",
        " XX                XXXX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "messy-bun": {
      // Extended back cap with escaping side strands
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXX          XXXXXXX ",
        " XXXX            XXXXXX ",
        " XX                XXXX ",
      ];
      drawShape(back, 4, 5);
      // Loose escaping strands
      px(ctx, 5, 11, hair); px(ctx, 4, 12, hair);
      px(ctx, 26, 11, hair); px(ctx, 27, 12, hair);
      break;
    }
    case "short-shag": {
      // Short textured hair — one extra row for better side coverage
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXX            XXXX ",
        " XXXX              XXXX ",
        " XXX                XXX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "pompadour": {
      // Hair base behind head for pompadour
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXX      XXXXXXX ",
        " XXXXXXX          XXXXX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "beehive": {
      // Hair behind and sides for beehive
      const back = [
        "    XXXXXXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXXXXXX  ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
        " XXXXXXXXXXXXXXXXXXXXXX ",
      ];
      drawShape(back, 4, 5);
      break;
    }
    case "power-bald":
    case "comb-over":
    case "messy-office":
      // Minimal or no back pass needed
      break;
    default:
      // Most short styles need no back pass
      break;
  }
}

// ---------- Hair: FRONT pass (renders after head) ----------
// Bangs, fringe, side-locks, tops of short hair.
function drawHairFront(ctx, style, hair, hairShadow, hairHi) {
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
      // Top crown
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXX    XXXXXX  ",
      ];
      drawShape(top, 6, 5);
      // Deep side curtains framing the face — 2px wide, 9 rows tall
      for (let i = 0; i < 9; i++) {
        px(ctx, 6, 10 + i, i >= 7 ? hairShadow : hair);
        px(ctx, 7, 10 + i, hairShadow);
        px(ctx, 25, 10 + i, i >= 7 ? hairShadow : hair);
        px(ctx, 24, 10 + i, hairShadow);
      }
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
      // Deep side curtains — 2px wide, 9 rows tall
      for (let i = 0; i < 9; i++) {
        px(ctx, 6, 10 + i, i >= 7 ? hairShadow : hair);
        px(ctx, 7, 10 + i, hairShadow);
        px(ctx, 25, 10 + i, i >= 7 ? hairShadow : hair);
        px(ctx, 24, 10 + i, hairShadow);
      }
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
      // Left side lock — heavier (hair sweeps this way), 2px wide
      for (let i = 0; i < 7; i++) px(ctx, 6, 10 + i, hair);
      for (let i = 0; i < 5; i++) px(ctx, 7, 10 + i, hairShadow);
      // Right side wisp — lighter
      for (let i = 0; i < 4; i++) px(ctx, 25, 11 + i, hairShadow);
      break;
    }
    case "bob": {
      // Chin-length bob — extended sides framing the full face
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXXXXXXXXXXX  ",
        " XXXXXX      XXXXXX ",
        " XXXXX        XXXXX ",
        " XXXX          XXXX ",
        " XXXX          XXXX ",
        " XXX            XXX ",
        " XXX            XXX ",
        " XXx            xXX ",
        " XXx            xXX ",
      ];
      drawShape(top, 6, 5);
      break;
    }
    case "ponytail": {
      // Top pulled back with side wisps at cheek
      const top = [
        "      XXXXXXXX      ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXX    XXXXXX  ",
      ];
      drawShape(top, 6, 5);
      for (let i = 0; i < 5; i++) {
        px(ctx, 6, 10 + i, hairShadow);
        px(ctx, 25, 10 + i, hairShadow);
      }
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
      for (let i = 0; i < 4; i++) {
        px(ctx, 6, 10 + i, hairShadow);
        px(ctx, 25, 10 + i, hairShadow);
      }
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
      for (let i = 0; i < 5; i++) {
        px(ctx, 6, 10 + i, hairShadow);
        px(ctx, 25, 10 + i, hairShadow);
      }
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
      // Sideburns
      px(ctx, 7, 14, hairShadow); px(ctx, 7, 15, hairShadow);
      px(ctx, 24, 14, hairShadow); px(ctx, 24, 15, hairShadow);
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
      // Stubble sideburns
      px(ctx, 7, 13, hairShadow); px(ctx, 7, 14, hairShadow);
      px(ctx, 24, 13, hairShadow); px(ctx, 24, 14, hairShadow);
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
      // Sideburns
      px(ctx, 7, 14, hairShadow); px(ctx, 7, 15, hairShadow);
      px(ctx, 24, 14, hairShadow);
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
      // Sideburn wisps
      px(ctx, 7, 14, hairShadow); px(ctx, 24, 14, hairShadow);
      px(ctx, 6, 15, hair);
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
    case "pompadour": {
      // Tall retro front volume sweeping back — starts above head at y=1
      const top = [
        "     XXXXXXXXXX     ",  // peak
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXX    ",  // starts sweeping back-right
        "  XXXXXXXXXXX       ",
        "  XXXXXXXXXX        ",
        " XXXXXXXXXX         ",
        " XXXXXXXXX          ",
      ];
      drawShape(top, 6, 1);
      // Sideburns
      px(ctx, 7, 14, hairShadow); px(ctx, 24, 14, hairShadow);
      break;
    }
    case "beehive": {
      // Very tall stacked bun rising above the head
      const bun = [
        "      XXXXXXXX      ",
        "     XXXXXXXXXX     ",
        "    XXXXXXXXXXXX    ",
        "    XXXXXXXXXXXX    ",
        "    XXXXXXXXXXXX    ",
        "   XXXXXXXXXXXXXX   ",
        "   XXXXXXXXXXXXXX   ",
        "  XXXXXXXXXXXXXXXX  ",
        "  XXXXXXX XXXXXXXX  ",
      ];
      drawShape(bun, 6, 0);
      // Stray wisp
      px(ctx, 14, 4, hairShadow);
      px(ctx, 17, 3, hair);
      break;
    }
    case "power-bald": {
      // Completely bald top — only dark stubble at sides
      for (let i = 0; i < 4; i++) {
        px(ctx, 7,  12 + i, hairShadow);
        px(ctx, 8,  13 + i, hairShadow);
        px(ctx, 24, 12 + i, hairShadow);
        px(ctx, 23, 13 + i, hairShadow);
      }
      break;
    }
    case "comb-over": {
      // Sparse strands swept from right side over bald top
      const top = [
        "                    ",
        "              XXXXX ",
        "          XXXXXXXXX ",
        "      XXXXXXXXXXXXX ",
        "   XXXXXXXXXXXXXXXX ",
        "   XXXXXXX          ",
      ];
      drawShape(top, 6, 5);
      // Stubble on exposed side
      px(ctx, 7, 13, hairShadow); px(ctx, 7, 14, hairShadow);
      break;
    }
    case "messy-office": {
      // Asymmetric unkempt office hair — longer on left, stray right
      const top = [
        "  X  XXXXXXXX       ",
        "   XXXXXXXXXXX      ",
        "  XXXXXXXXXXXX      ",
        "  XXXXXXXXXX  XX    ",
        "  XXXXXXXX          ",
        "  XXXX              ",
      ];
      drawShape(top, 6, 5);
      px(ctx, 7,  11, hair); px(ctx, 7, 12, hair);
      px(ctx, 25, 11, hairShadow);
      break;
    }
    case "bald":
    default:
      break;
  }
}

// ---------- Eyes ----------
function drawEyes(ctx, type, eyeBags, skin) {
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
    px(ctx, lx, y + 1, shade(skin, -0.18));
    px(ctx, rx, y + 1, shade(skin, -0.18));
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
function drawFaceDetails(ctx, genome, skin) {
  const skinDeep = shade(skin, -0.25);
  const skinMid = shade(skin, -0.15);

  // Nose: 4-pixel dot with directional shading (light from upper-left)
  const noseHi   = shade(skin,  0.10);
  const noseMid  = shade(skin, -0.12);
  const noseDeep = shade(skin, -0.26);
  px(ctx, 15, 14, noseHi);    // tip highlight
  px(ctx, 16, 14, noseDeep);  // right bridge shadow
  px(ctx, 15, 15, noseMid);   // nose body
  px(ctx, 16, 15, noseDeep);  // right nosewing shadow

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

// ---------- Main render ----------
function renderFace(canvas, genome) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);

  // Background tint
  rect(ctx, 0, 0, W, H, genome.bgTint);

  const skinShadow = shade(genome.skin, -0.18);
  const hairShadow = shade(genome.hairColor, -0.30);
  const hairHi = shade(genome.hairColor, 0.18);

  // Layer order:
  // 1. background
  // 2. body / shoulders / garb
  // 3. HAIR BACK PASS (long hair behind silhouette)
  // 4. head + skin shading
  // 5. face details (nose, mouth, etc.)
  // 6. eyes
  // 7. HAIR FRONT PASS (bangs, top, side-locks)
  // 8. tier accessories
  drawBody(ctx, genome.bodyType, genome.skin, genome.garb);
  drawHairBack(ctx, genome.hairStyle, genome.hairColor, hairShadow, hairHi);
  drawHead(ctx, genome.headShape, genome.skin);
  drawFaceDetails(ctx, genome, genome.skin);
  drawEyes(ctx, genome.eye, genome.eyeBags, genome.skin);
  drawHairFront(ctx, genome.hairStyle, genome.hairColor, hairShadow, hairHi);
  drawTierAccessory(ctx, genome.tier);
}

window.renderFace = renderFace;
window.FACE_DIMS = { W, H };
