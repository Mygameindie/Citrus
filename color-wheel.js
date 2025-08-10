// color-wheel.js — Single-file color logic (append-only style)
// This file adds named color-wheel recoloring without touching existing files.
// Drop it next to your current files and include it after your main scripts.
//
// Public API on window.ColorWheel:
// - ColorWheel.set(itemId, name)           // name in ColorWheel.NAMED_HUES (e.g., 'Red', 'Green', 'Original')
// - ColorWheel.setHue(itemId, degrees)     // direct hue angle (0..360)
// - ColorWheel.setHex(itemId, hex)         // derive hue from any hex (e.g., '#ff00aa')
// - ColorWheel.reset(itemId)               // restore original
// - ColorWheel.NAMED_HUES                  // mapping of names -> hue degrees (Original=null)
//
// Notes:
// • Preserves the original image colorspace, only swaps hue; keeps saturation & lightness.
// • Skips fully transparent pixels and extreme lights to avoid halos.
// • Caches recolored results per item+color for speed.
// • Falls back to CSS filter if canvas is CORS-tainted.
// • Non-breaking: attaches to window and does not assume any framework.

(function(){
  if (window.ColorWheel) return; // avoid double-inject

  const NAMED_HUES = {
    Original: null,
    Red: 0, Orange: 30, Yellow: 60, Green: 120,
    Cyan: 180, Blue: 240, Purple: 270, Pink: 320
  };

  const _cache = new Map(); // key => dataURL

  function _rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = 0; s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h*360, s, l];
  }

  function _hslToRgb(h,s,l){
    h/=360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = t => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const r = Math.round(hue2rgb(h + 1/3) * 255);
    const g = Math.round(hue2rgb(h) * 255);
    const b = Math.round(hue2rgb(h - 1/3) * 255);
    return [r,g,b];
  }

  function _ensureOriginalSrc(img){
    if (img && img.dataset && !img.dataset.originalSrc) {
      img.dataset.originalSrc = img.src || img.dataset.src || '';
    }
  }

  async function _setHueInternal(itemId, targetHue){
    const el = document.getElementById(itemId);
    if (!el) return;

    if (targetHue == null || targetHue === false) {
      _ensureOriginalSrc(el);
      const orig = el.dataset.originalSrc;
      if (orig) el.src = orig;
      el.style.filter = '';
      return;
    }

    // Make sure the bitmap is ready & CORS-safe for canvas
    if (!el.src && el.dataset && el.dataset.src) el.src = el.dataset.src;
    if (!el.crossOrigin) el.crossOrigin = 'anonymous';

    await new Promise(res => {
      if (el.complete && el.naturalWidth) res();
      else el.onload = () => res();
    });

    const cacheKey = `${itemId}|${targetHue}`;
    if (_cache.has(cacheKey)) {
      el.src = _cache.get(cacheKey);
      el.style.filter = '';
      return;
    }

    _ensureOriginalSrc(el);

    const w = el.naturalWidth, h = el.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    try {
      ctx.drawImage(el, 0, 0, w, h);
    } catch (e) {
      // CORS-tainted image: last resort fallback
      el.style.filter = `hue-rotate(${targetHue}deg) saturate(1.1)`;
      return;
    }

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const a = d[i+3];
      if (a === 0) continue; // keep transparent
      const r = d[i], g = d[i+1], b = d[i+2];

      // avoid tinting near-pure black/white to prevent halos
      const [ , sat, light ] = _rgbToHsl(r,g,b);
      if (light < 0.03 || light > 0.97) continue;

      const [nr, ng, nb] = _hslToRgb(targetHue, sat, light);
      d[i] = nr; d[i+1] = ng; d[i+2] = nb;
    }

    ctx.putImageData(imgData, 0, 0);
    const url = canvas.toDataURL('image/png');
    _cache.set(cacheKey, url);
    el.src = url;
    el.style.filter = '';
  }

  function _clampHue(h){
    h = Number(h);
    if (!isFinite(h)) return 0;
    h %= 360;
    return h < 0 ? h + 360 : h;
  }

  // Public API
  window.ColorWheel = {
    NAMED_HUES,
    async set(itemId, name){
      if (!name || !(name in NAMED_HUES)) return _setHueInternal(itemId, null);
      return _setHueInternal(itemId, NAMED_HUES[name]);
    },
    async setHue(itemId, degrees){
      return _setHueInternal(itemId, _clampHue(degrees));
    },
    async setHex(itemId, hex){
      // Accept formats: #rgb, #rrggbb
      const v = String(hex || '').trim();
      const m3 = /^#?([0-9a-f]{3})$/i.exec(v);
      const m6 = /^#?([0-9a-f]{6})$/i.exec(v);
      let r,g,b;
      if (m3){
        const s = m3[1];
        r = parseInt(s[0]+s[0],16);
        g = parseInt(s[1]+s[1],16);
        b = parseInt(s[2]+s[2],16);
      } else if (m6){
        const s = m6[1];
        r = parseInt(s.slice(0,2),16);
        g = parseInt(s.slice(2,4),16);
        b = parseInt(s.slice(4,6),16);
      } else {
        return _setHueInternal(itemId, null);
      }
      const [h] = _rgbToHsl(r,g,b);
      return _setHueInternal(itemId, _clampHue(h));
    },
    async reset(itemId){ return _setHueInternal(itemId, null); }
  };

  // Optional: bridge existing global hooks without edits elsewhere
  // If your old code calls window.applyColorToItem(value) with CSS filter strings,
  // map known names to ColorWheel:
  if (!window.applyColorToItem) {
    window.applyColorToItem = function(valueOrName){
      // If it's a named color from old palette use it directly
      if (valueOrName in NAMED_HUES) {
        const itemEl = window.currentlySelectedItem || window.selectedItem;
        if (itemEl && itemEl.id) ColorWheel.set(itemEl.id, valueOrName);
        return;
      }
      // Otherwise try to parse hue-rotate(...) as fallback
      const m = /hue-rotate\(([-\d.]+)deg\)/.exec(String(valueOrName||''));
      const deg = m ? parseFloat(m[1]) : 0;
      const itemEl = window.currentlySelectedItem || window.selectedItem;
      if (itemEl && itemEl.id) ColorWheel.setHue(itemEl.id, deg);
    };
  }
})();