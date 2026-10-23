// High-resolution procedural artwork generator for Aarav Nair's profile
// Matches the cinematic warm amber stage lighting, vintage microphone, and concert shots

export interface ProfileArtworks {
  heroBanner: string;
  avatar: string;
  featuredMonsoon: string;
  featuredCityLights: string;
  perfMonsoon: string;
  perfCityLights: string;
  perfFallingAgain: string;
  perfUnplugged: string;
  perfTheEdge: string;
  showNextStage: string;
  showSofarSounds: string;
}

function drawBokeh(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  colorInner: string,
  colorOuter = 'rgba(255, 160, 40, 0)'
) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, colorInner);
  grad.addColorStop(0.55, colorInner.replace(/[\d.]+\)$/, '0.35)'));
  grad.addColorStop(1, colorOuter);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// 1. Aarav Hero Banner (Warm amber stage, singing into dynamic microphone)
export function renderAaravHero(width = 860, height = 540): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep dark warm stage background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#150A05');
  bgGrad.addColorStop(0.4, '#2A1408');
  bgGrad.addColorStop(0.75, '#120804');
  bgGrad.addColorStop(1, '#050201');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Large warm golden amber stage spotlights
  drawBokeh(ctx, width * 0.58, height * 0.28, width * 0.45, 'rgba(255, 205, 95, 0.85)');
  drawBokeh(ctx, width * 0.82, height * 0.35, width * 0.35, 'rgba(255, 180, 50, 0.7)');
  drawBokeh(ctx, width * 0.92, height * 0.65, width * 0.28, 'rgba(235, 140, 30, 0.55)');

  // Stage bokeh orbs on the right
  const orbs = [
    [0.72, 0.18, 22, 0.7], [0.78, 0.28, 36, 0.75], [0.86, 0.22, 28, 0.8],
    [0.92, 0.38, 42, 0.85], [0.88, 0.52, 34, 0.7], [0.80, 0.68, 26, 0.6]
  ];
  for (const [bx, by, br, ba] of orbs) {
    drawBokeh(ctx, width * bx, height * by, br, `rgba(255, 215, 110, ${ba})`);
  }

  // Shoulders & Black Shirt
  ctx.save();
  const shirtGrad = ctx.createLinearGradient(width * 0.42, height * 0.55, width * 0.82, height);
  shirtGrad.addColorStop(0, '#1E2026');
  shirtGrad.addColorStop(0.5, '#111216');
  shirtGrad.addColorStop(1, '#08090C');
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height);
  ctx.quadraticCurveTo(width * 0.44, height * 0.68, width * 0.55, height * 0.56);
  ctx.lineTo(width * 0.72, height * 0.58);
  ctx.quadraticCurveTo(width * 0.84, height * 0.72, width * 0.92, height);
  ctx.closePath();
  ctx.fill();

  // Patterned guitar strap over shoulder
  const strapGrad = ctx.createLinearGradient(width * 0.68, height * 0.58, width * 0.76, height);
  strapGrad.addColorStop(0, '#C87834');
  strapGrad.addColorStop(1, '#6E3812');
  ctx.fillStyle = strapGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.70, height * 0.58);
  ctx.lineTo(width * 0.76, height * 0.60);
  ctx.lineTo(width * 0.74, height);
  ctx.lineTo(width * 0.68, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Head, Neck & Expressive Singing Pose (Eyes looking up slightly, mouth singing)
  ctx.save();
  // Neck
  ctx.fillStyle = '#9C5832';
  ctx.beginPath();
  ctx.moveTo(width * 0.58, height * 0.46);
  ctx.lineTo(width * 0.67, height * 0.45);
  ctx.lineTo(width * 0.68, height * 0.60);
  ctx.lineTo(width * 0.56, height * 0.58);
  ctx.closePath();
  ctx.fill();

  // Dark curly hair volume
  ctx.fillStyle = '#16110E';
  const curls = [
    [0.62, 0.17, 52], [0.56, 0.19, 46], [0.68, 0.20, 48],
    [0.72, 0.28, 44], [0.73, 0.38, 38], [0.52, 0.24, 38]
  ];
  for (const [hx, hy, hr] of curls) {
    ctx.beginPath();
    ctx.arc(width * hx, height * hy, hr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden rim light on curls
  for (let i = 0; i < 30; i++) {
    const cx = width * (0.54 + (i % 8) * 0.025);
    const cy = height * (0.13 + Math.floor(i / 8) * 0.045);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 195, 95, 0.55)' : 'rgba(180, 100, 35, 0.4)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0.2, Math.PI * 1.3);
    ctx.stroke();
  }

  // Sculpted Face (Tilted upward singing with passion)
  const faceGrad = ctx.createLinearGradient(width * 0.52, height * 0.20, width * 0.68, height * 0.46);
  faceGrad.addColorStop(0, '#ECA771');
  faceGrad.addColorStop(0.5, '#C47A46');
  faceGrad.addColorStop(1, '#6F3A19');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.56, height * 0.21);
  ctx.quadraticCurveTo(width * 0.55, height * 0.28, width * 0.555, height * 0.33); // forehead
  ctx.lineTo(width * 0.535, height * 0.375); // nose tip
  ctx.lineTo(width * 0.555, height * 0.395);
  ctx.quadraticCurveTo(width * 0.545, height * 0.44, width * 0.57, height * 0.48); // singing mouth & chin
  ctx.quadraticCurveTo(width * 0.64, height * 0.485, width * 0.675, height * 0.41); // jawline
  ctx.quadraticCurveTo(width * 0.69, height * 0.32, width * 0.66, height * 0.22);
  ctx.closePath();
  ctx.fill();

  // Ear
  ctx.fillStyle = '#A35E34';
  ctx.beginPath();
  ctx.ellipse(width * 0.685, height * 0.38, 12, 22, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Singing mouth open
  ctx.fillStyle = '#3F1A12';
  ctx.beginPath();
  ctx.ellipse(width * 0.565, height * 0.425, 11, 7, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Closed/emotional singing eye
  ctx.strokeStyle = '#1D130E';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(width * 0.585, height * 0.33);
  ctx.quadraticCurveTo(width * 0.61, height * 0.345, width * 0.635, height * 0.332);
  ctx.stroke();

  // Dynamic Microphone on Stand angled toward mouth
  ctx.save();
  ctx.translate(width * 0.49, height * 0.43);
  ctx.rotate(-0.42);

  // Mic boom arm
  ctx.strokeStyle = '#22252C';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-65, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();

  // Mic barrel
  const micGrad = ctx.createLinearGradient(-35, -10, 20, 10);
  micGrad.addColorStop(0, '#2D3039');
  micGrad.addColorStop(0.5, '#4E5362');
  micGrad.addColorStop(1, '#1A1C22');
  ctx.fillStyle = micGrad;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-35, -10, 52, 20, 4);
  } else {
    ctx.rect(-35, -10, 52, 20);
  }
  ctx.fill();

  // Chrome mesh grille ball
  const grille = ctx.createRadialGradient(32, -4, 2, 32, 0, 16);
  grille.addColorStop(0, '#FFFFFF');
  grille.addColorStop(0.55, '#9CA3AF');
  grille.addColorStop(1, '#374151');
  ctx.fillStyle = grille;
  ctx.beginPath();
  ctx.arc(32, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // Bottom gradient fade into deep black
  const fadeGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
  fadeGrad.addColorStop(0, 'rgba(10, 11, 16, 0)');
  fadeGrad.addColorStop(0.7, 'rgba(10, 11, 16, 0.6)');
  fadeGrad.addColorStop(1, 'rgba(10, 11, 16, 0.98)');
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  return canvas;
}

// 2. Aarav Circular Profile Avatar
export function renderAaravAvatar(size = 320): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm studio bokeh background
  const bg = ctx.createRadialGradient(size * 0.65, size * 0.35, 10, size * 0.5, size * 0.5, size * 0.65);
  bg.addColorStop(0, '#633B1E');
  bg.addColorStop(0.6, '#381F10');
  bg.addColorStop(1, '#180C06');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Golden ambient light rim
  drawBokeh(ctx, size * 0.85, size * 0.3, size * 0.45, 'rgba(255, 195, 95, 0.7)');

  // Curly hair mass
  ctx.fillStyle = '#16110E';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.32, size * 0.28, 0, Math.PI * 2);
  ctx.arc(size * 0.4, size * 0.35, size * 0.24, 0, Math.PI * 2);
  ctx.arc(size * 0.6, size * 0.38, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Neck & Shoulders
  ctx.fillStyle = '#181A20';
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size);
  ctx.quadraticCurveTo(size * 0.45, size * 0.72, size * 0.85, size);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#A86237';
  ctx.beginPath();
  ctx.moveTo(size * 0.42, size * 0.58);
  ctx.lineTo(size * 0.60, size * 0.58);
  ctx.lineTo(size * 0.62, size * 0.78);
  ctx.lineTo(size * 0.40, size * 0.76);
  ctx.closePath();
  ctx.fill();

  // Face in profile/three-quarter looking right
  const faceGrad = ctx.createLinearGradient(size * 0.36, size * 0.3, size * 0.66, size * 0.65);
  faceGrad.addColorStop(0, '#EBA570');
  faceGrad.addColorStop(0.5, '#C87E48');
  faceGrad.addColorStop(1, '#7E421D');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.42, size * 0.32);
  ctx.quadraticCurveTo(size * 0.40, size * 0.42, size * 0.39, size * 0.48);
  ctx.lineTo(size * 0.36, size * 0.54); // nose tip
  ctx.lineTo(size * 0.39, size * 0.57);
  ctx.quadraticCurveTo(size * 0.38, size * 0.62, size * 0.42, size * 0.68); // chin
  ctx.quadraticCurveTo(size * 0.56, size * 0.68, size * 0.62, size * 0.58); // jawline
  ctx.quadraticCurveTo(size * 0.65, size * 0.45, size * 0.58, size * 0.32);
  ctx.closePath();
  ctx.fill();

  // Curls framing forehead
  ctx.fillStyle = '#18120F';
  for (let i = 0; i < 14; i++) {
    const cx = size * (0.38 + (i % 5) * 0.05);
    const cy = size * (0.28 + Math.floor(i / 5) * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
}

// 3. Featured Card: Monsoon Motion (Stage lights, mic, intense performance)
export function renderFeaturedMonsoon(width = 800, height = 450): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Golden dark theater atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#241208');
  bgGrad.addColorStop(0.5, '#381C0C');
  bgGrad.addColorStop(1, '#0C0603');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Huge warm amber backlights
  drawBokeh(ctx, width * 0.65, height * 0.35, width * 0.42, 'rgba(255, 210, 100, 0.85)');
  drawBokeh(ctx, width * 0.25, height * 0.55, width * 0.32, 'rgba(255, 175, 50, 0.55)');
  drawBokeh(ctx, width * 0.85, height * 0.55, width * 0.28, 'rgba(245, 150, 40, 0.65)');

  // Stage silhouette of Aarav in center
  ctx.save();
  ctx.fillStyle = '#12141A';
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height);
  ctx.quadraticCurveTo(width * 0.42, height * 0.62, width * 0.52, height * 0.52);
  ctx.lineTo(width * 0.64, height * 0.55);
  ctx.quadraticCurveTo(width * 0.72, height * 0.68, width * 0.78, height);
  ctx.closePath();
  ctx.fill();

  // Face & curly hair silhouette with glowing rim
  ctx.fillStyle = '#14110E';
  ctx.beginPath();
  ctx.arc(width * 0.56, height * 0.36, 48, 0, Math.PI * 2);
  ctx.arc(width * 0.52, height * 0.38, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D9894E';
  ctx.beginPath();
  ctx.ellipse(width * 0.53, height * 0.44, 26, 32, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Golden rim light edge
  ctx.strokeStyle = 'rgba(255, 205, 110, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width * 0.56, height * 0.36, 48, -0.8, 1.4);
  ctx.stroke();

  // Mic
  ctx.strokeStyle = '#282B34';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height * 0.56);
  ctx.lineTo(width * 0.48, height * 0.46);
  ctx.stroke();
  ctx.restore();

  // Bottom text legibility scrim
  const scrim = ctx.createLinearGradient(0, height * 0.4, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(0.7, 'rgba(0,0,0,0.65)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height * 0.4, width, height * 0.6);

  return canvas;
}

// 4. City Lights (Deep blue and purple neon concert lighting)
export function renderCityLights(width = 400, height = 480): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#100824');
  bgGrad.addColorStop(0.5, '#280E46');
  bgGrad.addColorStop(1, '#080410');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Purple and electric magenta spotlights
  drawBokeh(ctx, width * 0.3, height * 0.3, width * 0.5, 'rgba(168, 85, 247, 0.65)');
  drawBokeh(ctx, width * 0.75, height * 0.25, width * 0.4, 'rgba(236, 72, 153, 0.6)');

  // Musician with electric guitar
  ctx.save();
  ctx.fillStyle = '#0B0B14';
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height);
  ctx.quadraticCurveTo(width * 0.35, height * 0.6, width * 0.55, height * 0.5);
  ctx.lineTo(width * 0.7, height * 0.55);
  ctx.quadraticCurveTo(width * 0.85, height * 0.7, width * 0.9, height);
  ctx.closePath();
  ctx.fill();

  // Acoustic guitar shape
  ctx.fillStyle = '#311846';
  ctx.beginPath();
  ctx.ellipse(width * 0.58, height * 0.75, 48, 70, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Head with purple rim light
  ctx.fillStyle = '#14111D';
  ctx.beginPath();
  ctx.arc(width * 0.52, height * 0.38, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(216, 180, 254, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(width * 0.52, height * 0.38, 38, -1.2, 0.8);
  ctx.stroke();
  ctx.restore();

  // Scrim
  const scrim = ctx.createLinearGradient(0, height * 0.55, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  return canvas;
}

// 5. Falling Again (Magenta & Crimson live vocals)
export function renderFallingAgain(width = 400, height = 480): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#2D0A1C');
  bg.addColorStop(0.5, '#4E1132');
  bg.addColorStop(1, '#0C0207');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawBokeh(ctx, width * 0.7, height * 0.3, width * 0.45, 'rgba(244, 63, 142, 0.75)');

  ctx.fillStyle = '#130A12';
  ctx.beginPath();
  ctx.moveTo(width * 0.25, height);
  ctx.quadraticCurveTo(width * 0.45, height * 0.6, width * 0.6, height * 0.52);
  ctx.quadraticCurveTo(width * 0.8, height * 0.7, width * 0.85, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1A0C16';
  ctx.beginPath();
  ctx.arc(width * 0.55, height * 0.36, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D9779F';
  ctx.beginPath();
  ctx.ellipse(width * 0.52, height * 0.42, 22, 28, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Scrim
  const scrim = ctx.createLinearGradient(0, height * 0.55, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  return canvas;
}

// 6. Unplugged (Trio on stage with warm curtains)
export function renderUnplugged(width = 400, height = 480): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#2B160A');
  bg.addColorStop(0.6, '#3D2010');
  bg.addColorStop(1, '#0E0703');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Amber stage curtain lines
  ctx.strokeStyle = 'rgba(255, 180, 80, 0.15)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(width * (0.1 + i * 0.12), 0);
    ctx.lineTo(width * (0.1 + i * 0.12), height * 0.7);
    ctx.stroke();
  }

  // 3 seated acoustic musicians
  ctx.fillStyle = '#120B06';
  // Center
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(width * 0.4, height * 0.55, width * 0.2, height * 0.35);

  // Left
  ctx.beginPath();
  ctx.arc(width * 0.26, height * 0.54, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(width * 0.18, height * 0.6, width * 0.16, height * 0.3);

  // Right
  ctx.beginPath();
  ctx.arc(width * 0.74, height * 0.54, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(width * 0.66, height * 0.6, width * 0.16, height * 0.3);

  // Scrim
  const scrim = ctx.createLinearGradient(0, height * 0.55, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  return canvas;
}

// 7. The Edge (Electric cyan and cobalt stage laser beam)
export function renderTheEdge(width = 400, height = 480): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#061424');
  bg.addColorStop(0.5, '#0A2542');
  bg.addColorStop(1, '#030810');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Diagonal laser beam
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = '#38BDF8';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  ctx.lineTo(width, height * 0.58);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Rock guitarist silhouette
  ctx.fillStyle = '#060B12';
  ctx.beginPath();
  ctx.moveTo(width * 0.45, height);
  ctx.quadraticCurveTo(width * 0.6, height * 0.65, width * 0.75, height * 0.5);
  ctx.lineTo(width * 0.88, height * 0.58);
  ctx.quadraticCurveTo(width * 0.95, height * 0.75, width, height);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = '#09111C';
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.42, 34, 0, Math.PI * 2);
  ctx.fill();

  // Scrim
  const scrim = ctx.createLinearGradient(0, height * 0.55, 0, height);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.9)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  return canvas;
}

// 8. Upcoming Show: The Next Stage (Red theatrical lights)
export function renderNextStage(width = 300, height = 300): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#3A060C');
  bg.addColorStop(0.6, '#5E0E18');
  bg.addColorStop(1, '#1A0205');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawBokeh(ctx, width * 0.5, height * 0.4, width * 0.45, 'rgba(239, 68, 68, 0.7)');

  // Stage silhouette with musicians and stage floor
  ctx.fillStyle = '#100305';
  ctx.fillRect(0, height * 0.72, width, height * 0.28);
  ctx.beginPath();
  ctx.arc(width * 0.45, height * 0.65, 18, 0, Math.PI * 2);
  ctx.arc(width * 0.65, height * 0.66, 16, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// 9. Upcoming Show: Sofar Sounds (Intimate amber bar crowd)
export function renderSofarSounds(width = 300, height = 300): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#2C1808');
  bg.addColorStop(0.6, '#46260C');
  bg.addColorStop(1, '#120A03');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawBokeh(ctx, width * 0.4, height * 0.35, width * 0.4, 'rgba(245, 158, 11, 0.75)');

  // Intimate crowd silhouettes watching stage
  ctx.fillStyle = '#0F0803';
  ctx.beginPath();
  ctx.arc(width * 0.25, height * 0.8, 22, 0, Math.PI * 2);
  ctx.arc(width * 0.55, height * 0.82, 26, 0, Math.PI * 2);
  ctx.arc(width * 0.85, height * 0.8, 24, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

let cachedProfileArtworks: ProfileArtworks | null = null;
export function getProfileArtworks(): ProfileArtworks {
  if (cachedProfileArtworks) return cachedProfileArtworks;

  try {
    cachedProfileArtworks = {
      heroBanner: renderAaravHero(860, 540).toDataURL('image/png'),
      avatar: renderAaravAvatar(320),
      featuredMonsoon: renderFeaturedMonsoon(800, 450).toDataURL('image/png'),
      featuredCityLights: renderCityLights(400, 480).toDataURL('image/png'),
      perfMonsoon: renderFeaturedMonsoon(400, 480).toDataURL('image/png'),
      perfCityLights: renderCityLights(400, 480).toDataURL('image/png'),
      perfFallingAgain: renderFallingAgain(400, 480).toDataURL('image/png'),
      perfUnplugged: renderUnplugged(400, 480).toDataURL('image/png'),
      perfTheEdge: renderTheEdge(400, 480).toDataURL('image/png'),
      showNextStage: renderNextStage(300, 300).toDataURL('image/png'),
      showSofarSounds: renderSofarSounds(300, 300).toDataURL('image/png'),
    };
    return cachedProfileArtworks;
  } catch (e) {
    console.warn('Canvas rendering fallback engaged:', e);
    // Reliable SVG data URIs fallback
    const fallbackSvg = (color: string, text: string) =>
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="${encodeURIComponent(
        color
      )}"/><text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(
        text
      )}</text></svg>`;

    cachedProfileArtworks = {
      heroBanner: fallbackSvg('#2A1408', 'Aarav Nair • Live'),
      avatar: fallbackSvg('#C47A46', 'AN'),
      featuredMonsoon: fallbackSvg('#381C0C', 'Monsoon Motion'),
      featuredCityLights: fallbackSvg('#280E46', 'City Lights'),
      perfMonsoon: fallbackSvg('#381C0C', 'Monsoon Motion'),
      perfCityLights: fallbackSvg('#280E46', 'City Lights'),
      perfFallingAgain: fallbackSvg('#4E1132', 'Falling Again'),
      perfUnplugged: fallbackSvg('#3D2010', 'Unplugged'),
      perfTheEdge: fallbackSvg('#0A2542', 'The Edge'),
      showNextStage: fallbackSvg('#5E0E18', 'The Next Stage'),
      showSofarSounds: fallbackSvg('#46260C', 'Sofar Sounds'),
    };
    return cachedProfileArtworks;
  }
}
