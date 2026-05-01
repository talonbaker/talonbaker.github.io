// =============================================================================
// FACE CONFIG — tweak these numbers to control what faces get generated.
// ENHANCED WITH ETHNIC & RACIAL DIVERSITY — covering Asian, African, European,
// Indian, Hispanic, Middle Eastern, and mixed representation.
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
      "braid":             2,   // woven down the back (more common for diverse rep)
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
      "braid":             1,
    },
  },

  // ---------- HAIR COLORS ----------
  // ETHNICALLY DIVERSE — represents hair colors across all global regions
  // Tier-aware: common rolls pull from "common", mythic from "mythic", etc.
  hair_colors: {
    common: {
      // ASIAN (East, Southeast, South) — dark, straight
      "#0a0804":           2,   // jet black (East Asian)
      "#1a1410":           3,   // jet black
      "#2c1f15":           3,   // dark brown (Southeast Asian)
      "#3d2a1c":           3,   // brown (South Asian / Indian)

      // AFRICAN — rich blacks, dark browns, blue-blacks
      "#1a0a08":           2,   // deep blue-black
      "#2a1810":           2,   // dark chocolate brown
      "#4a2810":           1,   // mahogany

      // EUROPEAN — browns and blonde range
      "#3d2a1c":           3,   // brown
      "#4a3220":           3,   // light brown
      "#6b4426":           3,   // warm brown
      "#8a5a32":           2,   // light brown
      "#a87340":           2,   // dirty blonde
      "#c88848":           1,   // blonde

      // MIDDLE EASTERN / MEDITERRANEAN — warm browns
      "#5a3820":           2,   // warm dark brown
      "#6b4426":           2,   // chestnut

      // MIXED / GLOBAL
      "#3d2a1c":           2,   // versatile brown for all
    },
    uncommon: {
      // Natural variations
      "#d96a3a":           3,   // ginger / auburn
      "#b8421f":           2,   // deep red
      "#dca860":           3,   // honey blonde
      "#8a4a2a":           2,   // copper (common in South Asian + African)
      "#5a4a3a":           1,   // dark auburn
    },
    rare: {
      "#5a6f8a":           2,   // ash blue
      "#3a5a7a":           2,   // slate
      "#7a6a5a":           1,   // smoky brown
      "#4a6a7a":           1,   // cool blue-brown
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
  // COMPREHENSIVE ETHNIC DIVERSITY — all major global regions represented
  // Weights ensure balanced representation across generations
  skin_tones: {
    common: {
      // ASIAN (East & Southeast) — olive, warm yellow undertones
      "#d0a878":           3,   // light East Asian
      "#c89860":           3,   // warm Southeast Asian
      "#b8825f":           2,   // tan Southeast Asian

      // ASIAN (South) — warm brown with red undertones (Indian subcontinent)
      "#c89072":           3,   // warm Indian tan
      "#b8825f":           2,   // medium Indian
      "#a37254":           2,   // deep Indian

      // AFRICAN — rich warm browns and deep blacks
      "#8a5d44":           2,   // warm brown African
      "#7d4e38":           2,   // deep brown African
      "#6a3a28":           2,   // very deep warm
      "#5a2a1a":           1,   // darkest warm tone

      // EUROPEAN — pale to light olive
      "#e0c2a8":           3,   // pale European
      "#caa384":           3,   // light tan European
      "#d8a878":           2,   // warmer light tone

      // MIDDLE EASTERN & MEDITERRANEAN — olive and warm tan
      "#c8956a":           2,   // olive Mediterranean
      "#b88558":           2,   // warm Mediterranean

      // MIXED & NEUTRAL
      "#d4a181":           2,   // universal warm tan
      "#c8926a":           2,   // neutral warm
    },
    rare: {
      "#e8cdb0":           1,   // very pale (Celtic/Scandinavian)
      "#5a3a2a":           1,   // very dark warm (deep African)
      "#9a6a4a":           1,   // mid-range warm
      "#d8b890":           1,   // golden tan
      "#a87a5a":           1,   // reddish-brown (Irish/Indigenous)
    },
    epic: {
      "#3d2818":           1,   // ashen/charcoal
      "#a89080":           1,   // cool grey-brown
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
  // DIVERSE eye colors representing world populations
  eye_types: {
    common:    { "bead-black": 4, "bead-brown": 4, "bead-amber": 1 },   // brown eyes most common globally
    uncommon:  { "bead-black": 3, "bead-brown": 3, "bead-hazel": 2, "bead-amber": 1 },
    rare:      { "glow-blue": 2, "glow-green": 2, "bead-amber": 2, "glow-grey": 1 },
    epic:      { "glow-violet": 2, "glow-cyan": 2, "scar-eye": 1, "glow-emerald": 1 },
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
  // CULTURALLY INSPIRED — colors and fabrics from global traditions
  garb_colors: {
    common:    {
      "#5a5a4a": 3, "#4a4438": 2, "#3d3a32": 2,
      "#5a4a3a": 2, "#6a5e4a": 2,
      "#4a5a4a": 1,  // more green undertone for tropical regions
    },
    uncommon:  {
      "#7a6a4a": 2, "#5a6a4a": 2, "#4a5a6a": 2,
      "#6a5a5a": 1,  // muted mauve
    },
    rare:      {
      "#3a4a6a": 2, "#5a3a3a": 1, "#3a5a5a": 1,
      "#5a5a7a": 1,  // slate blue
    },
    epic:      {
      "#5a3a6a": 2, "#3a3a5a": 1, "#6a3a3a": 1,
      "#7a5a8a": 1,  // richer purple
    },
    legendary: {
      "#8a6818": 2, "#a08038": 1, "#6a3818": 1,
      "#9a7828": 1,  // richer gold
    },
    mythic:    {
      "#5a1018": 2, "#3a0a18": 1, "#1a0a1a": 1,
      "#6a0a20": 1,  // deep crimson
    },
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
    freckles_common:    0.25,   // freckles on common rolls (more common on lighter skins)
    freckles_uncommon:  0.25,   // freckles on uncommon rolls (0 to disable)
    cheek_blush:        0.40,   // pink cheeks (visible on all skin tones)
    eye_bags:           0.15,   // tired/old look
  },
};
