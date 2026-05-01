// Procedural color sampling from perlin texture
// Replaces hardcoded color palettes with texture-based sampling
// Derives 4 tones (highlight, midtone, shadow, deepshadow) from each sample

window.ColorSampler = (() => {
  let textureCanvas = null;
  let textureCtx = null;
  const TEXTURE_SIZE = 512;

  // Initialize: load the perlin texture
  function init() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          textureCanvas = document.createElement('canvas');
          textureCanvas.width = TEXTURE_SIZE;
          textureCanvas.height = TEXTURE_SIZE;
          textureCtx = textureCanvas.getContext('2d');
          textureCtx.drawImage(img, 0, 0);
          console.log('✅ Perlin texture loaded successfully');
          resolve();
        } catch (err) {
          console.warn('Error processing perlin texture:', err);
          resolve();
        }
      };
      img.onerror = (err) => {
        console.warn('⚠️ Failed to load perlin-512.png, using mathematical fallback');
        resolve();
      };
      img.src = './perlin-512.png';
      // Timeout fallback
      setTimeout(() => resolve(), 3000);
    });
  }

  // Sample a random point from the texture and get its color
  function sampleTexture() {
    if (!textureCtx) return { r: 128, g: 128, b: 128 }; // fallback gray

    const x = Math.floor(Math.random() * TEXTURE_SIZE);
    const y = Math.floor(Math.random() * TEXTURE_SIZE);
    const imgData = textureCtx.getImageData(x, y, 1, 1).data;

    return { r: imgData[0], g: imgData[1], b: imgData[2], a: imgData[3] };
  }

  // Convert RGB to HSL
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h, s, l };
  }

  // Convert HSL back to RGB
  function hslToRgb(h, s, l) {
    let r, g, b;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // Derive 4 tones from a base color
  // Derives tones by adjusting lightness in HSL space
  function deriveTones(baseRgb) {
    const hsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

    // Midtone: the base color as-is
    const midtone = baseRgb;

    // Highlight: +25% lightness (brighter)
    const highlightHsl = {
      h: hsl.h,
      s: hsl.s,
      l: Math.min(1, hsl.l + 0.25)
    };
    const highlight = hslToRgb(highlightHsl.h, highlightHsl.s, highlightHsl.l);

    // Shadow: -25% lightness (darker)
    const shadowHsl = {
      h: hsl.h,
      s: hsl.s,
      l: Math.max(0, hsl.l - 0.25)
    };
    const shadow = hslToRgb(shadowHsl.h, shadowHsl.s, shadowHsl.l);

    // DeepShadow: -45% lightness (much darker)
    const deepShadowHsl = {
      h: hsl.h,
      s: hsl.s,
      l: Math.max(0, hsl.l - 0.45)
    };
    const deepShadow = hslToRgb(deepShadowHsl.h, deepShadowHsl.s, deepShadowHsl.l);

    return { midtone, highlight, shadow, deepShadow };
  }

  // Sample a color and get all 4 tones
  function sampleAndDerive() {
    const baseColor = sampleTexture();
    return deriveTones(baseColor);
  }

  // Convert color object to hex string
  function toHex(color) {
    return `#${[color.r, color.g, color.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  return {
    init,
    sampleAndDerive,
    sampleTexture,
    deriveTones,
    toHex
  };
})();
