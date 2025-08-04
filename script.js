const circles = [
      document.getElementById('circle1'),
      document.getElementById('circle2'),
      document.getElementById('circle3')
    ];
    const palette = document.getElementById('palette');
    const resetBtn = document.getElementById('resetBtn');
    const historyContainer = document.getElementById('historyContainer');

    let colors = [null, null, null];
    let selectedIndex = null;
    let lastMixedColor = null;
    let isLocked = false;

    const crayonColors = [
      '#FF0000', '#FFA500', '#FFFF00', '#008000',
      '#00FFFF', '#0000FF', '#800080', '#A52A2A',
      '#FFC0CB', '#000000', '#808080', '#FFFFFF'
    ];

    crayonColors.forEach(color => {
      const btn = document.createElement('div');
      btn.className = 'color-btn';
      btn.style.backgroundColor = color;
      btn.addEventListener('click', () => {
        if (selectedIndex !== null && !isLocked) {
          circles[selectedIndex].style.backgroundColor = color;
          colors[selectedIndex] = color;
          palette.style.display = 'none';
          circles[selectedIndex].classList.remove('selected');
          selectedIndex = null;
          updateResult();
        }
      });
      palette.appendChild(btn);
    });

    circles[0].addEventListener('click', () => {
      if (!isLocked) showPalette(0);
    });
    circles[1].addEventListener('click', () => {
      if (!isLocked) showPalette(1);
    });

    function showPalette(index) {
      selectedIndex = index;
      palette.style.display = 'flex';
      circles.forEach((circle, i) => {
        circle.classList.toggle('selected', i === index);
      });
    }

    function updateResult() {
      if (colors[0] && colors[1]) {
        isLocked = true;

        const mixed = mixColors(colors[0], colors[1]);
        circles[2].style.backgroundColor = mixed;
        colors[2] = mixed;
        lastMixedColor = mixed;

        addToHistory(colors[0], colors[1], mixed);

        setTimeout(() => {
          colors = [lastMixedColor, null, null];
          circles[0].style.backgroundColor = lastMixedColor;
          circles[1].style.backgroundColor = '#eee';
          circles[2].style.backgroundColor = '#eee';
          circles.forEach(c => c.classList.remove('selected'));
          isLocked = false;
        }, 3000); // 3초 유지
      }
    }

    function addToHistory(c1, c2, result) {
      const item = document.createElement('div');
      item.className = 'history-item';

      const createCircle = (color) => {
        const div = document.createElement('div');
        div.className = 'circle';
        div.style.backgroundColor = color;
        return div;
      };

      item.appendChild(createCircle(c1));
      item.appendChild(createSymbol('+'));
      item.appendChild(createCircle(c2));
      item.appendChild(createSymbol('='));
      item.appendChild(createCircle(result));

      const existing = document.querySelectorAll('.history-item');
      if (existing.length >= 3) {
        existing[0].remove();
      }

      historyContainer.appendChild(item);
    }

    function createSymbol(text) {
      const span = document.createElement('div');
      span.className = 'symbol';
      span.textContent = text;
      return span;
    }

    function resetColors() {
      if (isLocked) return;

      colors = [null, null, null];
      lastMixedColor = null;
      circles.forEach(c => {
        c.style.backgroundColor = '#eee';
        c.classList.remove('selected');
      });
      palette.style.display = 'none';
      selectedIndex = null;
      document.querySelectorAll('.history-item').forEach(item => item.remove());
    }

    resetBtn.addEventListener('click', resetColors);

    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16)
      ];
    }

    function rgbToHex([r, g, b]) {
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function mixColors(c1, c2) {
      const rgb1 = hexToRgb(c1);
      const rgb2 = hexToRgb(c2);
      const hsl1 = rgbToHsl(rgb1[0], rgb1[1], rgb1[2]);
      const hsl2 = rgbToHsl(rgb2[0], rgb2[1], rgb2[2]);

      let h1 = hsl1[0], h2 = hsl2[0];
      let delta = h2 - h1;
      if (Math.abs(delta) > 180) {
        if (delta > 0) h1 += 360;
        else h2 += 360;
      }
      const h = ((h1 + h2) / 2) % 360;
      const s = (hsl1[1] + hsl2[1]) / 2;
      const l = (hsl1[2] + hsl2[2]) / 2;

      const [r, g, b] = hslToRgb(h, s, l);
      return rgbToHex([r, g, b]);
    }

    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
      }
      return [h, s, l];
    }

    function hslToRgb(h, s, l) {
      h /= 360;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }