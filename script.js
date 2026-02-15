const prizes = [10, 20, 50, 100, 200, 0];
const colors = ['#22d3ee', '#a78bfa', '#f472b6', '#f59e0b', '#34d399', '#94a3b8'];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');

const size = canvas.width;
const center = size / 2;
const radius = size * 0.44;
const innerRadius = size * 0.12;
const arc = (Math.PI * 2) / prizes.length;

let rotation = 0;
let spinning = false;
let history = [];

function drawWheel(angle = rotation) {
  ctx.clearRect(0, 0, size, size);

  // 外圈光晕
  ctx.beginPath();
  ctx.arc(center, center, radius + 20, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34,211,238,0.10)';
  ctx.fill();

  for (let i = 0; i < prizes.length; i++) {
    const start = angle + i * arc - Math.PI / 2;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.stroke();

    const textAngle = start + arc / 2;
    const textRadius = radius * 0.7;
    const tx = center + Math.cos(textAngle) * textRadius;
    const ty = center + Math.sin(textAngle) * textRadius;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(textAngle + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0b1020';
    ctx.font = 'bold 34px Inter, Microsoft YaHei';
    ctx.fillText(String(prizes[i]), 0, 0);
    ctx.restore();
  }

  // 中心圆
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0b1225';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#fbbf24';
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px Inter, Microsoft YaHei';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('红包', center, center);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function getPrizeByRotation(finalRotation) {
  // 指针在正上方(-90°)，换算当前指向哪个分区
  const normalized = ((finalRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const pointerAngle = (Math.PI * 2 - normalized) % (Math.PI * 2);
  const idx = Math.floor((pointerAngle + arc / 2) / arc) % prizes.length;
  return prizes[idx];
}

function renderHistory() {
  if (history.length === 0) {
    historyEl.textContent = '历史记录：暂无';
    return;
  }
  const text = history
    .slice()
    .reverse()
    .map((v, i) => `${history.length - i}. ${v}`)
    .join('\n');
  historyEl.textContent = `历史记录：\n${text}`;
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = '转盘飞速旋转中…';

  const start = rotation;
  const extraTurns = 6 + Math.random() * 3; // 6~9圈
  const randomOffset = Math.random() * Math.PI * 2;
  const target = start + extraTurns * Math.PI * 2 + randomOffset;
  const duration = 4200;
  const t0 = performance.now();

  function frame(now) {
    const p = Math.min(1, (now - t0) / duration);
    const eased = easeOutCubic(p);
    rotation = start + (target - start) * eased;
    drawWheel(rotation);

    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      const prize = getPrizeByRotation(rotation);
      const text = prize === 0 ? '😭 手气差一点：0 元' : `🎉 恭喜你：${prize} 元`;
      resultEl.textContent = text;
      history.push(`${new Date().toLocaleTimeString()} → ${prize} 元`);
      renderHistory();
      spinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(frame);
}

spinBtn.addEventListener('click', spin);
drawWheel();
renderHistory();
