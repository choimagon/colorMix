// --- 물감 혼합(RYB 기반) 색 섞기 프로젝트 전체 코드 ---

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

circles[0].addEventListener('click', () => { if (!isLocked) showPalette(0); });
circles[1].addEventListener('click', () => { if (!isLocked) showPalette(1); });

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
    }, 3000);
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
  if (existing.length >= 3) existing[0].remove();
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

// ---- 색 변환 유틸 ----

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ];
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function rgbToRyb(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const white = Math.min(r, g, b);
  r -= white; g -= white; b -= white;
  const maxG = Math.max(r, g, b);
  let y = Math.min(r, g);
  r -= y; g -= y;
  if (b && g) { b /= 2; g /= 2; }
  y += g; b += g;
  const maxY = Math.max(r, y, b);
  if (maxY) {
    const n = maxG / maxY;
    r *= n; y *= n; b *= n;
  }
  r += white; y += white; b += white;
  return [r * 255, y * 255, b * 255];
}

function rybToRgb(r, y, b) {
  r /= 255; y /= 255; b /= 255;
  const white = Math.min(r, y, b);
  r -= white; y -= white; b -= white;
  const maxY = Math.max(r, y, b);
  let g = Math.min(y, b);
  y -= g; b -= g;
  if (b && g) { b *= 2; g *= 2; }
  r += y; g += y;
  const maxG = Math.max(r, g, b);
  if (maxG) {
    const n = maxY / maxG;
    r *= n; g *= n; b *= n;
  }
  r += white; g += white; b += white;
  return [r * 255, g * 255, b * 255];
}

// ---- 실제 색 혼합 함수 (RYB 평균) ----

function mixColors(c1, c2) {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);

  // RYB 변환 및 평균
  const ryb1 = rgbToRyb(...rgb1);
  const ryb2 = rgbToRyb(...rgb2);
  const mixedRyb = [
    (ryb1[0] + ryb2[0]) / 2,
    (ryb1[1] + ryb2[1]) / 2,
    (ryb1[2] + ryb2[2]) / 2
  ];

  // RYB → RGB
  let [r, g, b] = rybToRgb(...mixedRyb);

  // ✅ 밝기 보정
  const brightness1 = (rgb1[0] + rgb1[1] + rgb1[2]) / 3;
  const brightness2 = (rgb2[0] + rgb2[1] + rgb2[2]) / 3;
  const targetBrightness = (brightness1 + brightness2) / 2;

  const currentBrightness = (r + g + b) / 3;
  const factor = currentBrightness === 0 ? 1 : targetBrightness / currentBrightness;

  r *= factor;
  g *= factor;
  b *= factor;

  return rgbToHex([r, g, b]);
}
