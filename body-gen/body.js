// Procedural pixel-art FULL BODY generator
// Canvas: 64 wide × 104 tall (WB × HB)
// Head drawing is adapted from face.js with +16x / -1y offsets to re-center
// on the wider canvas. Body (torso → feet) is drawn procedurally below the neck.

(function () {
  'use strict';

  const WB = 64, HB = 104;

  // ─── Utilities ────────────────────────────────────────────────────────────

  function shade(hex, amount) {
    const c = hex.replace('#', '');
    const f = v => Math.max(0, Math.min(255, Math.round(v + amount * 255)));
    const r = f(parseInt(c.slice(0, 2), 16));
    const g = f(parseInt(c.slice(2, 4), 16));
    const b = f(parseInt(c.slice(4, 6), 16));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  function px(ctx, x, y, color) {
    if (x < 0 || y < 0 || x >= WB || y >= HB) return;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // ─── Head shapes (identical data to face.js) ──────────────────────────────

  function getHeadShape(shape) {
    const shapes = {
      round: [
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
      square: [
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

  // ─── Head drawing (face.js baseX=6,baseY=5 → here baseX=22,baseY=4) ──────

  function drawHead(ctx, headShape, skin) {
    const rows = getHeadShape(headShape);
    const baseX = 22, baseY = 4;
    const skinShade1 = shade(skin, -0.10);
    const skinShade2 = shade(skin, -0.20);
    const skinHi    = shade(skin,  0.08);

    const mask = [];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === 'X') {
          const x = baseX + c, y = baseY + r;
          px(ctx, x, y, skin);
          const left   = c === 0 || rows[r][c-1] !== 'X';
          const right  = c === rows[r].length-1 || rows[r][c+1] !== 'X';
          const top    = r === 0 || rows[r-1][c] !== 'X';
          const bottom = r === rows.length-1 || rows[r+1][c] !== 'X';
          mask.push([x, y, left, right, top, bottom]);
        }
      }
    }

    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    for (const [x, y] of mask) {
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
    }
    const cx = (minX + maxX) / 2;

    for (const [x, y, , right, , bottom] of mask) {
      if (right)  px(ctx, x, y, skinShade1);
      if (bottom && y > minY + 4) px(ctx, x, y, skinShade2);
    }
    for (const [x, y, , right] of mask) {
      if (!right) {
        const isInnerRight = mask.some(([nx, ny, , nr]) => nx === x+1 && ny === y && nr);
        if (isInnerRight) px(ctx, x, y, skinShade1);
      }
    }
    for (const [x, y, left, , top] of mask) {
      if ((left && y < minY + 5) || (top && x < cx)) px(ctx, x, y, skinHi);
    }

    return { minX, maxX, minY, maxY, cx };
  }

  // ─── Hair back pass (long hair behind head) ───────────────────────────────

  function drawHairBack(ctx, style, hair, hairShadow, hairHi) {
    const ds = (rows, bx, by) => {
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          const ch = rows[r][c];
          if (ch === 'X') px(ctx, bx+c, by+r, hair);
          else if (ch === 'x') px(ctx, bx+c, by+r, hairShadow);
          else if (ch === 'h') px(ctx, bx+c, by+r, hairHi);
        }
      }
    };
    // Offset: original baseX 4 → 20 (+16), original baseY 5 → 4 (-1)
    const bx = 20, by = 4;
    switch (style) {
      case 'long-flow': {
        ds([
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
        ], bx, by); break;
      }
      case 'long-shiny': {
        ds([
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
        ], bx, by); break;
      }
      case 'long-side': {
        ds([
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
        ], bx, by); break;
      }
      case 'ponytail': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
        ], bx, by);
        ds(["XXXX","XXXX","XXXh","XXXh","XXXh","XXXh","XXX ","XXX ","XX  ","XX  "], bx+10, by+9); break;
      }
      case 'low-bun': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
        ], bx, by);
        ds([" XXXX ","XXXXXX","XXhhXX","XXhhXX","XXXXXX"," XXXX "], bx-1, by+15); break;
      }
      case 'braid': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
        ], bx, by);
        ds(["XXXX","XxxX","XXXX","XxxX","XXXX","XxxX","XXXX","XxxX"," XX "], bx+10, by+9); break;
      }
      case 'long-pull':
      case 'slicked-back': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
          " XXXXXXX        XXXXXXX ",
          "XXXXX            XXXXXX ",
        ], bx, by); break;
      }
      case 'tucked': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
          " XXXXXX          XXXXXX ",
          " XXXX              XXXX ",
          " XXX                XXX ",
        ], bx, by); break;
      }
      case 'messy-bun': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXXXXXXXXXXXXXXXXXX ",
        ], bx, by);
        px(ctx, 21, 11, hair); px(ctx, 43, 11, hair); break;
      }
      case 'short-shag': {
        ds([
          "    XXXXXXXXXXXXXXXX    ",
          "   XXXXXXXXXXXXXXXXXX   ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          "  XXXXXXXXXXXXXXXXXXXX  ",
          " XXXXXX            XXXX ",
          " XXXX                XX ",
        ], bx, by); break;
      }
      default: break;
    }
  }

  // ─── Hair front pass ──────────────────────────────────────────────────────

  function drawHairFront(ctx, style, hair, hairShadow, hairHi) {
    const ds = (rows, bx, by) => {
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          const ch = rows[r][c];
          if (ch === 'X') px(ctx, bx+c, by+r, hair);
          else if (ch === 'x') px(ctx, bx+c, by+r, hairShadow);
          else if (ch === 'h') px(ctx, bx+c, by+r, hairHi);
        }
      }
    };
    // Offset: original baseX 6 → 22 (+16), original baseY 5 → 4 (-1)
    const bx = 22, by = 4;
    switch (style) {
      case 'long-flow': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXX    XXXXXX  "], bx, by);
        for (let i = 0; i < 4; i++) { px(ctx, 22, 9+i, hair); px(ctx, 41, 9+i, hair); } break;
      }
      case 'long-shiny': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXhhhXXXXXX   ","  XXXXXXhhhXXXXXXX  ","  XXXXX    XXXXXXX  "], bx, by);
        for (let i = 0; i < 4; i++) { px(ctx, 22, 9+i, hair); px(ctx, 41, 9+i, hair); }
        px(ctx, 23, 9, hairShadow); px(ctx, 40, 9, hairShadow); break;
      }
      case 'long-side': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXX   ","  XXXXXXXXXXXX      ","  XXXXXXXX          "], bx, by);
        for (let i = 0; i < 5; i++) px(ctx, 22, 9+i, hair); break;
      }
      case 'bob': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  "," XXXXXX      XXXXXX "," XXXX          XXXX "," XXX            XXX "," XXx            xXX "], bx, by); break;
      }
      case 'ponytail':
      case 'low-bun':
      case 'braid': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXX    XXXXXX  "], bx, by); break;
      }
      case 'messy-bun': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXX    XXXXX  "], bx, by);
        ds(["  XXXX  "," XXXXXX ","XXhhhhXX","XXhhhhXX"," XXXXXX ","  XXXX  "], 28, 0);
        px(ctx, 29, 10, hair); break;
      }
      case 'pixie': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXX    XXXXXXX  ","  XX        XXXXX   "], bx, by); break;
      }
      case 'short-shag': {
        ds(["    X XXXXXXXX X    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXX XXXXXXXX XXX  ","  XX            XX  "], bx, by); break;
      }
      case 'short-mop': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXX    XXXXXX  ","  XXX        XXXXX  "], bx, by); break;
      }
      case 'buzz': {
        ds(["      xxxxxxxx      ","    xxXXXXXXXXxx    ","   xxXXXXXXXXXXxx   ","  xxXXXXXXXXXXXXxx  "], bx, by); break;
      }
      case 'bowl': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  "], bx, by); break;
      }
      case 'side-part': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXx    ","   XXXXXXXXXxxxxx   ","  XXXXXXXxxxXXXXXX  ","  XXXXXxxXXXXXXXXX  ","  XXXxxXXXXXXXXXXX  "], bx, by); break;
      }
      case 'messy':
      case 'shaggy': {
        ds(["    X XXXXXX X      ","      XXXXXXXX X    ","   XXXXXXXXXXXXX X  ","  XXXXXXXXXXXXXXXX  ","  X XX XX  XXX X X  "," X X            X X "], bx, by); break;
      }
      case 'mullet': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXX        XXXXX  "], bx, by);
        ds(["XXX X","XXXX ","XX   "], 21, 15);
        ds(["X XXX"," XXXX","   XX"], 38, 15); break;
      }
      case 'long-pull':
      case 'slicked-back': {
        ds(["      hhhhhhhh      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  "], bx, by); break;
      }
      case 'tucked': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXXX  "], bx, by); break;
      }
      case 'undercut': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","                    "], bx, by); break;
      }
      case 'side-swept': {
        ds(["      XXXXXXXX      ","    XXXXXXXXXXXX    ","   XXXXXXXXXXXXXX   ","  XXXXXXXXXXXXXXXX  ","  XXXXXXXXXXXXXXX   ","    XXXXXXXXXX      "], bx, by); break;
      }
      case 'spike': {
        ds(["  X    X  X    X    ","   XXX XX XX XX     ","    XXXXXXXXXXX     ","   XXXXXXXXXXXXX    ","  XXXXXXXXXXXXXXX   "], bx, by-1); break;
      }
      case 'bald':
      default: break;
    }
  }

  // ─── Eyes (face.js lx=11,rx=19,y=12 → lx=27,rx=35,y=11) ────────────────

  function drawEyes(ctx, type, eyeBags, skin) {
    const lx = 27, rx = 35, y = 11;
    const dot = (x, y, color, glow) => {
      if (glow) {
        ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 4;
        px(ctx, x, y, color);
        ctx.restore();
      } else px(ctx, x, y, color);
    };
    if (eyeBags) { px(ctx, lx, y+1, shade(skin, -0.18)); px(ctx, rx, y+1, shade(skin, -0.18)); }
    switch (type) {
      case 'bead-black':   dot(lx,y,'#0a0a0a'); dot(rx,y,'#0a0a0a'); break;
      case 'bead-brown':   dot(lx,y,'#3a2010'); dot(rx,y,'#3a2010'); break;
      case 'bead-hazel':   dot(lx,y,'#5a3a1a'); dot(rx,y,'#5a3a1a'); break;
      case 'bead-amber':   dot(lx,y,'#a86820'); dot(rx,y,'#a86820'); break;
      case 'glow-blue':    dot(lx,y,'#4ad8ff','#4ad8ff'); dot(rx,y,'#4ad8ff','#4ad8ff'); break;
      case 'glow-green':   dot(lx,y,'#5cff80','#5cff80'); dot(rx,y,'#5cff80','#5cff80'); break;
      case 'glow-violet':  dot(lx,y,'#c060ff','#c060ff'); dot(rx,y,'#c060ff','#c060ff'); break;
      case 'glow-cyan':    dot(lx,y,'#80ffe8','#80ffe8'); dot(rx,y,'#80ffe8','#80ffe8'); break;
      case 'scar-eye':
        px(ctx,lx,y,'#0a0a0a');
        px(ctx,rx-1,y-1,'#5a2020'); px(ctx,rx,y,'#5a2020'); px(ctx,rx+1,y+1,'#5a2020'); break;
      case 'burning-gold':
        ctx.save(); ctx.shadowColor='#ffd040'; ctx.shadowBlur=6;
        px(ctx,lx,y,'#ffd040'); px(ctx,rx,y,'#ffd040'); ctx.restore(); break;
      case 'burning-white':
        ctx.save(); ctx.shadowColor='#ffffff'; ctx.shadowBlur=6;
        px(ctx,lx,y,'#ffffff'); px(ctx,rx,y,'#ffffff'); ctx.restore(); break;
      case 'burning-red':
        ctx.save(); ctx.shadowColor='#ff2828'; ctx.shadowBlur=8;
        px(ctx,lx,y,'#ff4040'); px(ctx,rx,y,'#ff4040'); ctx.restore(); break;
      case 'void-eye':
        ctx.save(); ctx.shadowColor='#000'; ctx.shadowBlur=6;
        px(ctx,lx-1,y,'#1a0a1a'); px(ctx,rx+1,y,'#1a0a1a');
        px(ctx,lx,y,'#000'); px(ctx,rx,y,'#000'); ctx.restore(); break;
      default: dot(lx,y,'#0a0a0a'); dot(rx,y,'#0a0a0a');
    }
  }

  // ─── Face details (all face.js coords +16x, -1y) ─────────────────────────

  function drawFaceDetails(ctx, genome, skin) {
    const deep = shade(skin, -0.25);
    const mid  = shade(skin, -0.15);
    // Nose (was 15,14 / 15,15 / 16,15 → 31,13 / 31,14 / 32,14)
    px(ctx, 31, 13, mid); px(ctx, 31, 14, deep); px(ctx, 32, 14, mid);
    // Mouth (was my=17 → 16)
    const my = 16;
    switch (genome.mouth) {
      case 'line':     px(ctx,30,my,deep); px(ctx,31,my,deep); px(ctx,32,my,deep); break;
      case 'frown':
        px(ctx,30,my,deep); px(ctx,31,my,deep); px(ctx,32,my,deep);
        px(ctx,29,my-1,mid); px(ctx,33,my-1,mid); break;
      case 'smirk':    px(ctx,30,my,deep); px(ctx,31,my,deep); px(ctx,32,my-1,deep); break;
      case 'tiny-smile': px(ctx,30,my,deep); px(ctx,31,my-1,deep); px(ctx,32,my,deep); break;
      case 'small-line': px(ctx,30,my,deep); px(ctx,31,my,deep); break;
      default:         px(ctx,30,my,mid); px(ctx,32,my,mid);
    }
    // Freckles (was 12,13/18,13/13,14/17,14 → 28,12/34,12/29,13/33,13)
    if (genome.freckles) {
      px(ctx,28,12,shade(skin,-0.13)); px(ctx,34,12,shade(skin,-0.13));
      px(ctx,29,13,shade(skin,-0.10)); px(ctx,33,13,shade(skin,-0.10));
    }
    // Cheek blush (was 11,14/19,14 → 27,13/35,13)
    if (genome.cheekBlush) {
      px(ctx,27,13,shade(skin,-0.04)); px(ctx,35,13,shade(skin,-0.04));
    }
  }

  // ─── Tier accessories (all face.js coords +16x, -1y) ────────────────────

  function drawTierAccessory(ctx, tier) {
    if (tier === 'legendary') {
      // Crown (was x=[10,21],y=4 → x=[26,37],y=3)
      px(ctx,26,3,'#ffd040'); px(ctx,29,3,'#ffe080'); px(ctx,32,3,'#ffe080');
      px(ctx,35,3,'#ffe080'); px(ctx,37,3,'#ffd040');
      for (let x = 26; x <= 37; x++) px(ctx, x, 4, '#ffd040');
      ctx.save(); ctx.shadowColor='#ffd040'; ctx.shadowBlur=8;
      px(ctx,31,3,'#fff5cc'); px(ctx,32,3,'#fff5cc'); ctx.restore();
    }
    if (tier === 'ultra') {
      ctx.save(); ctx.shadowColor='#ff2828'; ctx.shadowBlur=10;
      for (let x = 25; x <= 38; x++) px(ctx, x, 2, '#ff4040');
      ctx.restore();
      px(ctx,31,10,'#8a0a0a'); px(ctx,32,10,'#8a0a0a');
    }
    if (tier === 'epic') {
      px(ctx,23,13,'#c8c8d0'); px(ctx,40,13,'#c8c8d0');
    }
  }

  // ─── Body dimension calculator ────────────────────────────────────────────

  function getBodyDims(genome) {
    const g  = genome.gender;
    const bt = genome.bodyType;
    const tl = Math.max(0.75, Math.min(1.25, genome.torsoLen || 1.0));
    const ll = Math.max(0.70, Math.min(1.30, genome.legLen   || 1.0));
    const al = Math.max(0.75, Math.min(1.25, genome.armLen   || 1.0));
    const fs = Math.max(0.75, Math.min(1.25, genome.footSize || 1.0));

    // [shoulderW, waistW, hipW, thighW, shinW, armUpperW, armLowerW, neckW]
    const P = {
      broad:   [30, 22, 24, 9, 7, 4, 3, 6],
      average: [24, 20, 22, 8, 6, 3, 3, 5],
      lean:    [20, 16, 18, 7, 5, 3, 2, 4],
      stout:   [26, 28, 26, 9, 7, 4, 3, 6],
      slender: [18, 14, 20, 7, 5, 3, 2, 4],
      petite:  [16, 12, 18, 6, 5, 3, 2, 4],
      curved:  [20, 14, 28, 8, 6, 3, 3, 4],
    };
    const [shoulderW, waistW, hipW, thighW, shinW, armUW, armLW, neckW] = (P[bt] || P.average);

    // Bust width for females (breast bulge peak)
    const breastSize = genome.breastSize || 'none';
    const bustExtra  = breastSize === 'large' ? 6 : breastSize === 'medium' ? 4 : breastSize === 'small' ? 2 : 0;
    const bustW = (g === 'female') ? Math.min(shoulderW + bustExtra, shoulderW + 8) : shoulderW;

    // Section heights (base × factor)
    const chestH   = Math.round(15 * tl);
    const stomachH = Math.round(9  * tl);
    const hipH     = Math.round(7  * tl);
    const thighH   = Math.round(16 * ll);
    const shinH    = Math.round(13 * ll);
    const footH    = Math.round(3  * fs);
    const armUH    = Math.round((chestH)        * al);
    const armLH    = Math.round((stomachH + 3)  * al);
    const handH    = 3;

    // Y positions — head sits at baseY=4 (14 rows → chin at y=17)
    const neckTop   = 18;
    const torsoTop  = neckTop + 2;
    const stomachTop = torsoTop + chestH;
    const hipTop    = stomachTop + stomachH;
    const legTop    = hipTop + hipH;
    const shinTop   = legTop + thighH;
    const footTop   = shinTop + shinH;

    // Arm Y
    const armTop    = torsoTop;
    const armMidY   = armTop + armUH;
    const armBotY   = armMidY + armLH;
    const handBotY  = armBotY + handH;

    const cx = WB >> 1; // 32

    // Neck x bounds
    const neckHalf = Math.ceil(neckW / 2);
    const neckL = cx - neckHalf;
    const neckR = cx + neckHalf - 1;

    // Shoulder/torso x bounds at top of chest
    const shoulderHalf = Math.ceil(shoulderW / 2);
    const shoulderL = cx - shoulderHalf;
    const shoulderR = cx + shoulderHalf - 1;

    // Arm x bounds (outside shoulders)
    const armGap = 1; // pixels between torso edge and arm
    const armUHalf = Math.ceil(armUW / 2);
    const armLHalf = Math.ceil(armLW / 2);
    const armL_cx  = shoulderL - armGap - armUHalf;
    const armR_cx  = shoulderR + armGap + armUHalf;

    // Leg x bounds (inside hips)
    const legGap = 2;
    const legHalf = Math.ceil(thighW / 2);
    const legL_cx = cx - legGap - legHalf;
    const legR_cx = cx + legGap + legHalf;

    return {
      g, bt, cx,
      neckL, neckR, neckTop,
      torsoTop, stomachTop, hipTop, legTop, shinTop, footTop,
      shoulderW, shoulderL, shoulderR, waistW, hipW, bustW,
      chestH, stomachH, hipH, thighH, shinH, footH,
      thighW, shinW, armUW, armLW,
      armTop, armMidY, armBotY, handBotY,
      armL_cx, armR_cx, armUHalf, armLHalf,
      legL_cx, legR_cx, legHalf,
      breastSize,
    };
  }

  // ─── Width of torso at a given row fraction ───────────────────────────────

  function chestWidthAt(t, bt, g, breastSize, shoulderW, waistW, bustW) {
    if (g === 'female') {
      // Collar → bust peak → waist (hourglass curve)
      const bustPeak = 0.40;
      if (t <= bustPeak) {
        const st = t / bustPeak;
        const ease = st * (2 - st); // ease-out
        return Math.round(shoulderW + (bustW - shoulderW) * ease);
      } else {
        const st = (t - bustPeak) / (1 - bustPeak);
        return Math.round(bustW + (waistW - bustW) * (st * st));
      }
    } else if (bt === 'stout') {
      // Gut: stomach wider than chest
      return Math.round(shoulderW + (waistW - shoulderW) * t);
    } else {
      // Male standard: gentle taper
      return Math.round(shoulderW + (waistW - shoulderW) * t);
    }
  }

  function stomachWidthAt(t, bt, g, waistW, hipW) {
    if (bt === 'stout') {
      // Gut bulge at ~40% of stomach, then taper to hips
      const peak = 0.4;
      const gutW = waistW + 4;
      if (t <= peak) return Math.round(waistW + (gutW - waistW) * (t / peak));
      return Math.round(gutW + (hipW - gutW) * ((t - peak) / (1 - peak)));
    }
    return Math.round(waistW + (hipW - waistW) * t);
  }

  function hipWidthAt(t, hipTopW, hipBotW) {
    return Math.round(hipTopW + (hipBotW - hipTopW) * t);
  }

  // ─── Neck ─────────────────────────────────────────────────────────────────

  function drawNeck(ctx, skin, dims) {
    const { neckL, neckR, neckTop } = dims;
    const neckShade = shade(skin, -0.14);
    for (let x = neckL; x <= neckR; x++) {
      px(ctx, x, neckTop,   skin);
      px(ctx, x, neckTop+1, skin);
    }
    px(ctx, neckR, neckTop,   neckShade);
    px(ctx, neckR, neckTop+1, neckShade);
    px(ctx, neckL, neckTop,   shade(skin, -0.08));
  }

  // ─── Torso ────────────────────────────────────────────────────────────────

  function drawTorso(ctx, garb, skin, dims) {
    const { g, bt, cx, torsoTop, stomachTop, shoulderW, waistW, hipW, bustW,
            chestH, stomachH, breastSize } = dims;
    const gHi    = shade(garb,  0.09);
    const gShade = shade(garb, -0.18);
    const gDeep  = shade(garb, -0.30);

    // ── Chest section ──
    for (let row = 0; row < chestH; row++) {
      const t = row / Math.max(1, chestH - 1);
      const w = chestWidthAt(t, bt, g, breastSize, shoulderW, waistW, bustW);
      const x0 = cx - Math.floor(w / 2);
      const x1 = x0 + w - 1;
      const y  = torsoTop + row;
      for (let x = x0; x <= x1; x++) px(ctx, x, y, garb);
      px(ctx, x0, y, gHi);
      px(ctx, x1, y, gShade);
      if (w >= 3) px(ctx, x1-1, y, shade(garb, -0.09));
    }

    // Female: cleavage shadow line
    if (g === 'female' && (breastSize === 'medium' || breastSize === 'large')) {
      const bustStart = torsoTop + Math.floor(chestH * 0.30);
      const bustEnd   = torsoTop + Math.floor(chestH * 0.65);
      for (let y = bustStart; y <= bustEnd; y++) px(ctx, cx, y, shade(garb, -0.22));
    }

    // ── Stomach section ──
    for (let row = 0; row < stomachH; row++) {
      const t  = row / Math.max(1, stomachH - 1);
      const w  = stomachWidthAt(t, bt, g, waistW, Math.round(hipW * 0.85));
      const x0 = cx - Math.floor(w / 2);
      const x1 = x0 + w - 1;
      const y  = stomachTop + row;
      for (let x = x0; x <= x1; x++) px(ctx, x, y, garb);
      px(ctx, x0, y, gHi);
      px(ctx, x1, y, gShade);
    }

    // Collar detail at top of torso
    for (let x = cx-2; x <= cx+2; x++) px(ctx, x, torsoTop, gDeep);
    px(ctx, cx, torsoTop+1, gDeep);
  }

  // ─── Hips ─────────────────────────────────────────────────────────────────

  function drawHips(ctx, garb, dims) {
    const { g, bt, cx, hipTop, hipH, hipW, waistW } = dims;
    const gHi    = shade(garb,  0.06);
    const gShade = shade(garb, -0.20);
    const pantColor = shade(garb, -0.18);
    const pantShade = shade(garb, -0.32);

    const hipTopW = Math.round(waistW * 0.90 + hipW * 0.10);
    const hipBotW = hipW;

    for (let row = 0; row < hipH; row++) {
      const t = row / Math.max(1, hipH - 1);
      const w = hipWidthAt(t, hipTopW, hipBotW);
      const x0 = cx - Math.floor(w / 2);
      const x1 = x0 + w - 1;
      const y  = hipTop + row;
      for (let x = x0; x <= x1; x++) px(ctx, x, y, pantColor);
      px(ctx, x0, y, gHi);
      px(ctx, x1, y, pantShade);
    }
  }

  // ─── Arms ─────────────────────────────────────────────────────────────────

  function drawArms(ctx, garb, skin, dims) {
    const { armTop, armMidY, armBotY, handBotY,
            armL_cx, armR_cx, armUHalf, armLHalf } = dims;
    const sleeveColor = shade(garb, 0.04);
    const sleeveHi    = shade(garb, 0.14);
    const sleeveShade = shade(garb, -0.22);
    const skinShade   = shade(skin, -0.12);

    const drawArm = (acx, side) => {
      // Upper arm (sleeve)
      for (let y = armTop; y < armMidY; y++) {
        const t = (y - armTop) / Math.max(1, armMidY - armTop - 1);
        const hw = Math.max(1, Math.round(armUHalf * (1 - t * 0.15)));
        for (let dx = -hw; dx <= hw; dx++) {
          const c = dx === -hw ? (side === 'L' ? sleeveHi : sleeveShade)
                  : dx ===  hw ? (side === 'L' ? sleeveShade : sleeveHi)
                  : sleeveColor;
          px(ctx, acx + dx, y, c);
        }
      }
      // Lower arm (skin — rolled-up sleeves look)
      for (let y = armMidY; y < armBotY; y++) {
        const hw = Math.max(1, armLHalf);
        for (let dx = -hw; dx <= hw; dx++) {
          const c = dx === -hw ? (side === 'L' ? shade(skin, 0.05) : skinShade)
                  : dx ===  hw ? (side === 'L' ? skinShade : shade(skin, 0.05))
                  : skin;
          px(ctx, acx + dx, y, c);
        }
      }
      // Hand (slightly wider, rounder)
      for (let y = armBotY; y < handBotY; y++) {
        const hw = Math.max(1, armLHalf + 1);
        for (let dx = -hw; dx <= hw; dx++) px(ctx, acx+dx, y, skin);
        // Finger hint at bottom of hand
        if (y === handBotY - 1) {
          px(ctx, acx-armLHalf-1, y, skin);
          px(ctx, acx+armLHalf+1, y, skin);
        }
      }
    };

    drawArm(armL_cx, 'L');
    drawArm(armR_cx, 'R');
  }

  // ─── Legs ─────────────────────────────────────────────────────────────────

  function drawLegs(ctx, garb, skin, dims) {
    const { legTop, shinTop, footTop, footH,
            legL_cx, legR_cx, legHalf, shinW } = dims;
    const pantColor = shade(garb, -0.16);
    const pantHi    = shade(garb, -0.06);
    const pantShade = shade(garb, -0.30);
    const shinColor = shade(garb, -0.20);
    const shinShade = shade(garb, -0.35);

    const drawLeg = (lcx, side) => {
      // Thigh
      for (let y = legTop; y < shinTop; y++) {
        const t = (y - legTop) / Math.max(1, shinTop - legTop - 1);
        const hw = Math.max(1, Math.round(legHalf * (1 - t * 0.15)));
        for (let dx = -hw; dx <= hw; dx++) {
          const c = dx === -hw ? (side === 'L' ? pantHi : pantShade)
                  : dx ===  hw ? (side === 'L' ? pantShade : pantHi)
                  : pantColor;
          px(ctx, lcx+dx, y, c);
        }
      }
      // Shin / calf
      const shinHalf = Math.max(1, Math.ceil(shinW / 2));
      for (let y = shinTop; y < footTop; y++) {
        const t = (y - shinTop) / Math.max(1, footTop - shinTop - 1);
        const hw = Math.max(1, Math.round(shinHalf * (1 - t * 0.18)));
        for (let dx = -hw; dx <= hw; dx++) {
          const c = dx === -hw ? (side === 'L' ? pantHi : shinShade)
                  : dx ===  hw ? (side === 'L' ? shinShade : pantHi)
                  : shinColor;
          px(ctx, lcx+dx, y, c);
        }
      }
      // Foot / shoe
      const fHalf = Math.max(2, shinHalf + 1);
      const shoeColor = shade(pantColor, -0.20);
      const shoeHi    = shade(shoeColor, 0.12);
      for (let y = footTop; y < footTop + footH; y++) {
        // Foot extends forward (inward for both legs)
        const ext = side === 'L' ? -2 : 2;
        for (let dx = -fHalf; dx <= fHalf; dx++) px(ctx, lcx + dx + ext, y, shoeColor);
        px(ctx, lcx - fHalf + ext, y, shoeHi);
      }
      // Toe cap highlight
      const toeX = side === 'L' ? lcx - fHalf - 1 : lcx + fHalf + 2;
      px(ctx, toeX, footTop,   shoeHi);
      px(ctx, toeX, footTop+1, shoeHi);
    };

    drawLeg(legL_cx, 'L');
    drawLeg(legR_cx, 'R');
  }

  // ─── Body genome ─────────────────────────────────────────────────────────

  function generateBody(tier, gender) {
    // Reuse face genome for head/face/hair/skin/garb data
    const face = window.generateFace(tier, gender);

    const g = face.gender;
    const rnd = () => Math.random();

    // Female breast size weighted distribution
    let breastSize = 'none';
    if (g === 'female') {
      const r = rnd();
      breastSize = r < 0.10 ? 'none' : r < 0.35 ? 'small' : r < 0.70 ? 'medium' : 'large';
    }

    // Proportions — intentionally kept within a believable human range
    return {
      ...face,
      torsoLen:  0.85 + rnd() * 0.30,  // 0.85–1.15
      legLen:    0.80 + rnd() * 0.40,  // 0.80–1.20
      armLen:    0.85 + rnd() * 0.30,  // 0.85–1.15
      footSize:  0.85 + rnd() * 0.30,  // 0.85–1.15
      breastSize,
    };
  }

  // ─── Main render ─────────────────────────────────────────────────────────

  function renderBody(canvas, genome) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, WB, HB);

    rect(ctx, 0, 0, WB, HB, genome.bgTint);

    const dims = getBodyDims(genome);
    const hairShadow = shade(genome.hairColor, -0.30);
    const hairHi     = shade(genome.hairColor,  0.18);

    // Layer order — back to front
    drawLegs(ctx, genome.garb, genome.skin, dims);
    drawHips(ctx, genome.garb, dims);
    drawArms(ctx, genome.garb, genome.skin, dims);
    drawTorso(ctx, genome.garb, genome.skin, dims);
    drawHairBack(ctx, genome.hairStyle, genome.hairColor, hairShadow, hairHi);
    drawNeck(ctx, genome.skin, dims);
    drawHead(ctx, genome.headShape, genome.skin);
    drawFaceDetails(ctx, genome, genome.skin);
    drawEyes(ctx, genome.eye, genome.eyeBags, genome.skin);
    drawHairFront(ctx, genome.hairStyle, genome.hairColor, hairShadow, hairHi);
    drawTierAccessory(ctx, genome.tier);
  }

  // ─── Share / download utility ─────────────────────────────────────────────
  // scale: upscale factor for crisp pixel art export

  function shareOrDownload(canvas, name, scale) {
    scale = scale || 8;
    const off = document.createElement('canvas');
    off.width  = canvas.width  * scale;
    off.height = canvas.height * scale;
    const offCtx = off.getContext('2d');
    offCtx.imageSmoothingEnabled = false;
    offCtx.drawImage(canvas, 0, 0, off.width, off.height);
    off.toBlob(function(blob) {
      const filename = (name || 'character').replace(/[^a-z0-9_\-]/gi, '_') + '.png';
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: name || 'Character' }).catch(function() {
          _download(blob, filename);
        });
      } else {
        _download(blob, filename);
      }
    });
  }

  function _download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  }

  // ─── Exports ──────────────────────────────────────────────────────────────

  window.generateBody     = generateBody;
  window.renderBody       = renderBody;
  window.BODY_DIMS        = { W: WB, H: HB };
  window.shareOrDownload  = shareOrDownload;

})();
