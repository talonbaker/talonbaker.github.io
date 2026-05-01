// =============================================================================
// FACE CONFIG — tweak these numbers to control what faces get generated.
// =============================================================================
// HOW IT WORKS:
//   Every trait has a "weight" (a number). Higher number = more common.
//   Weight of 0 = never picked. Weight of 1 = baseline. Weight of 10 = 10× as
//   likely as a weight-1 trait. The numbers don't have to add to anything —
//   they're relative within each pool.
//
// TIERS (common, uncommon, rare, epic, legendary, ultra/mythic) override
// the regular pools — when a Mythic name rolls, it pulls from
// `tier_overrides.mythic` for skin/hair color/eyes/garb.
//
// To DISABLE a trait: set its weight to 0.
// To ADD a NEW trait: just add it to the pool with a weight. (Note: head
// shapes, hair styles, body types, and eye types also need a corresponding
// entry in face.js — search for the trait name there to see what to add.)
// =============================================================================

window.FACE_CONFIG = {

  // ---------- HEAD SHAPES ----------
  // Pulled by gender. Feminine = softer/rounder, masculine = angular.
  head_shapes: {
    female: {
      "round":             3,   // common — wide, full cheeks
      "oval":              4,   // most common feminine shape
      "heart":             2,   // wide forehead, pointy chin
      "diamond":           1,   // narrow forehead/chin, wide cheeks (rarer)
    },
    male: {
      "square":            3,   // wide flat jaw
      "oblong":            2,   // long narrow
      "rectangle":         2,   // tall narrow
      "angular-round":     2,   // hexagonal
      "triangle":          1,   // pyramid jaw (rarer, very strong)
    },
    neutral: {
      "oval":              2,
      "round":             2,
      "angular-round":     1,
      "diamond":           1,
      "oblong":            1,
      "square":            1,
      "inverted-triangle": 1,   // exotic — only neutral
    },
  },

  // ---------- BODY TYPES ----------
  body_types: {
    female: {
      "slender":           4,   // narrow shoulders — most common
      "petite":            2,   // smaller frame
      "average":           2,
      "curved":            2,   // hourglass with wider hips/shoulders
    },
    male: {
      "broad":             4,   // wide shoulders — most common
      "average":           2,
      "lean":              2,
      "stout":             2,   // short + thick
    },
    neutral: {
      "lean":              2,
      "average":           2,
      "slender":           1,
      "broad":             1,
    },
  },

  // ---------- HAIR STYLES ----------
  // Each has both a back-pass (behind head) and front-pass (bangs/top).
  hair_styles: {
    female: {
      "long-flow":         4,   // flowing long hair behind head + onto shoulders
      "long-shiny":        2,   // long with vertical highlight stripe
      "long-side":         2,   // swept to one side
      "bob":               3,   // chin-length classic
      "ponytail":          2,   // pulled back with tail
      "low-bun":           1,
      "messy-bun":         2,
      "braid":             1,   // woven down the back
      "pixie":             2,
      "short-shag":        2,
      "tucked":            1,   // medium hair behind ears
    },
    male: {
      "short-mop":         3,   // standard short hair
      "buzz":              2,   // very short
      "side-part":         3,   // classic part
      "messy":             2,
      "slicked-back":      2,   // gelled back with highlight
      "bowl":              1,   // bowl cut
      "tucked":            1,
      "side-swept":        1,
      "long-pull":         1,   // medium-long pulled back
      "mullet":            1,   // for chaos
      "bald":              1,   // rare-ish
    },
    neutral: {
      "shaggy":            2,
      "messy":             2,
      "undercut":          1,
      "long-flow":         1,
      "spike":             1,
      "side-swept":        1,
      "tucked":            1,
      "ponytail":          1,
    },
  },

  // ---------- HAIR COLORS ----------
  // Tier-aware: common rolls pull from "common", mythic from "mythic", etc.
  // The tier field below is consulted when a name's tier matches.
  hair_colors: {
    common: {
      "#1a1410":           3,   // jet black
      "#2c1f15":           3,   // dark brown
      "#3d2a1c":           4,   // brown
      "#4a3220":           3,
      "#6b4426":           3,   // warm brown
      "#8a5a32":           2,   // light brown
      "#a87340":           2,   // dirty blonde
      "#c88848":           1,   // blonde
    },
    uncommon: {
      "#d96a3a":           3,   // ginger
      "#b8421f":           2,   // deep red
      "#dca860":           3,   // honey blonde
    },
    rare: {
      "#5a6f8a":           2,   // ash blue
      "#3a5a7a":           2,   // slate
      "#7a6a5a":           1,   // smoky brown
    },
    epic: {
      "#c8c8d0":           3,   // silver
      "#9a98a8":           2,   // platinum
      "#5a3a8a":           1,   // violet
    },
    legendary: {
      "#d4a020":           3,   // gold
      "#e8c040":           2,   // bright gold
      "#8a2828":           1,   // crimson
    },
    mythic: {
      "#1a0a1a":           2,   // void black
      "#3a0a3a":           1,   // void purple
    },
  },

  // ---------- SKIN TONES ----------
  skin_tones: {
    common: {
      "#d4a181":           4,   // warm tan
      "#c89072":           3,
      "#b8825f":           3,
      "#a37254":           2,
      "#8a5d44":           2,
      "#7d4e38":           2,   // deep brown
      "#e0c2a8":           3,   // pale
      "#caa384":           3,
    },
    rare: {
      "#e8cdb0":           1,   // very pale (rare flair)
      "#5a3a2a":           1,   // very dark warm
      "#9a6a4a":           1,
    },
    epic: {
      "#3d2818":           1,   // ashen/charcoal
      "#a89080":           1,
    },
    legendary: {
      "#2e2e2e":           1,   // obsidian
    },
    mythic: {
      "#3a1010":           1,   // blood-marked
      "#1a0606":           1,   // void black
    },
  },

  // Probability (0..1) that a roll's SKIN comes from the tier-special pool
  // instead of the common pool. Lower = rarer special skin.
  skin_special_chance: {
    common:    0,
    uncommon:  0,
    rare:      0.20,
    epic:      0.30,
    legendary: 0.50,
    mythic:    0.70,
  },

  // ---------- EYE TYPES ----------
  eye_types: {
    common:    { "bead-black": 3, "bead-brown": 3 },
    uncommon:  { "bead-black": 2, "bead-brown": 2, "bead-hazel": 2 },
    rare:      { "glow-blue": 2, "glow-green": 2, "bead-amber": 1 },
    epic:      { "glow-violet": 2, "glow-cyan": 2, "scar-eye": 1 },
    legendary: { "burning-gold": 3, "burning-white": 1 },
    mythic:    { "burning-red": 3, "void-eye": 2 },
  },

  // ---------- MOUTHS ----------
  mouths: {
    "line":         3,   // simple horizontal line — most common
    "neutral":      3,   // two-pixel rest
    "small-line":   2,
    "frown":        2,
    "smirk":        1,
    "tiny-smile":   1,
  },

  // ---------- GARB (clothing) COLORS ----------
  garb_colors: {
    common:    { "#5a5a4a": 3, "#4a4438": 2, "#3d3a32": 2, "#5a4a3a": 2, "#6a5e4a": 2 },
    uncommon:  { "#7a6a4a": 2, "#5a6a4a": 2, "#4a5a6a": 2 },
    rare:      { "#3a4a6a": 2, "#5a3a3a": 1, "#3a5a5a": 1 },
    epic:      { "#5a3a6a": 2, "#3a3a5a": 1, "#6a3a3a": 1 },
    legendary: { "#8a6818": 2, "#a08038": 1, "#6a3818": 1 },
    mythic:    { "#5a1018": 2, "#3a0a18": 1, "#1a0a1a": 1 },
  },

  // ---------- BACKGROUND TINTS PER TIER ----------
  // The little colored aura behind each portrait.
  bg_tints: {
    common:    "#2a2a2e",
    uncommon:  "#1f2e1f",
    rare:      "#1f2838",
    epic:      "#2a1f3a",
    legendary: "#3a2a18",
    mythic:    "#2a1010",
  },

  // ---------- PROBABILITIES (0..1) FOR OPTIONAL DETAILS ----------
  // These don't follow the weight system — just a flat chance to appear.
  detail_chances: {
    freckles_common:    0.25,   // freckles on common rolls
    freckles_uncommon:  0.25,   // freckles on uncommon rolls (0 to disable)
    cheek_blush:        0.40,   // pink cheeks
    eye_bags:           0.15,   // tired/old look
  },
};
