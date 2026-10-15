// Procedural stage artwork & avatar renderer for 100% offline visual perfection

export interface GeneratedArtworks {
  kiaraPoster: string;
  kiaraAvatar: string;
  arjunPoster: string;
  arjunAvatar: string;
  userAvatar: string;
  aaravHero: string;
  aaravAvatar: string;
  monsoonMotionThumb: string;
  cityLightsThumb: string;
  fallingAgainThumb: string;
  unpluggedThumb: string;
  theEdgeThumb: string;
  showNextStageThumb: string;
  showSofarThumb: string;
  creatorJamThumb: string;
  stageHuntThumb: string;
  flipsAaravPoster: string;
}

export function renderFlipsAaravScene(width = 960, height = 1280): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Warm intimate café/studio ambient gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1E140C');
  bgGrad.addColorStop(0.35, '#2A1A0F');
  bgGrad.addColorStop(0.7, '#160E08');
  bgGrad.addColorStop(1, '#0A0604');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Warm ambient light bokeh in background
  drawBokeh(ctx, width * 0.65, height * 0.35, 140, 'rgba(255, 210, 110, 0.45)');
  drawBokeh(ctx, width * 0.85, height * 0.42, 100, 'rgba(255, 180, 80, 0.35)');
  drawBokeh(ctx, width * 0.45, height * 0.20, 80, 'rgba(255, 220, 130, 0.25)');

  // 2. Chalkboard on Left Wall ("Good Music Brighter People ♡")
  ctx.save();
  ctx.fillStyle = '#101214';
  ctx.fillRect(width * 0.04, height * 0.16, width * 0.22, height * 0.26);
  ctx.strokeStyle = '#382A1E';
  ctx.lineWidth = 6;
  ctx.strokeRect(width * 0.04, height * 0.16, width * 0.22, height * 0.26);

  ctx.fillStyle = 'rgba(255, 235, 205, 0.75)';
  ctx.font = 'italic bold 28px serif';
  ctx.textAlign = 'left';
  ctx.fillText('Good', width * 0.065, height * 0.22);
  ctx.fillText('Music', width * 0.065, height * 0.265);
  ctx.fillText('Brighter', width * 0.065, height * 0.31);
  ctx.fillText('People', width * 0.065, height * 0.355);
  ctx.font = '26px sans-serif';
  ctx.fillText('♡', width * 0.09, height * 0.395);
  ctx.restore();

  // 3. Indoor plant & lamp in background right
  ctx.fillStyle = '#161F12';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(width * 0.72 + (i % 3) * 35, height * 0.18 + (i % 4) * 25, 30, 60, (i * 0.3) - 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Performer Body (Black buttoned shirt, relaxed tan pants)
  ctx.save();
  // Pants
  const pantsGrad = ctx.createLinearGradient(width * 0.4, height * 0.7, width * 0.9, height);
  pantsGrad.addColorStop(0, '#B8A68E');
  pantsGrad.addColorStop(0.5, '#8D7B66');
  pantsGrad.addColorStop(1, '#4A3E32');
  ctx.fillStyle = pantsGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.72);
  ctx.quadraticCurveTo(width * 0.65, height * 0.68, width * 0.85, height * 0.75);
  ctx.lineTo(width, height);
  ctx.lineTo(width * 0.25, height);
  ctx.closePath();
  ctx.fill();

  // Dark Open Shirt
  const shirtGrad = ctx.createLinearGradient(width * 0.2, height * 0.35, width * 0.7, height * 0.7);
  shirtGrad.addColorStop(0, '#221E1C');
  shirtGrad.addColorStop(0.5, '#141212');
  shirtGrad.addColorStop(1, '#090808');
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.18, height * 0.65);
  ctx.quadraticCurveTo(width * 0.22, height * 0.45, width * 0.38, height * 0.38);
  ctx.lineTo(width * 0.62, height * 0.38);
  ctx.quadraticCurveTo(width * 0.75, height * 0.48, width * 0.78, height * 0.7);
  ctx.quadraticCurveTo(width * 0.5, height * 0.65, width * 0.18, height * 0.65);
  ctx.closePath();
  ctx.fill();

  // Inner black t-shirt
  ctx.fillStyle = '#0F0E10';
  ctx.beginPath();
  ctx.moveTo(width * 0.45, height * 0.38);
  ctx.lineTo(width * 0.55, height * 0.38);
  ctx.lineTo(width * 0.54, height * 0.52);
  ctx.lineTo(width * 0.46, height * 0.52);
  ctx.closePath();
  ctx.fill();

  // Silver chain necklace
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width * 0.505, height * 0.43, 20, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // 5. Head tilted upward, singing passionately, wavy hair curls
  // Curly hair mass
  ctx.fillStyle = '#14100E';
  ctx.beginPath();
  ctx.arc(width * 0.51, height * 0.27, 72, 0, Math.PI * 2);
  ctx.arc(width * 0.44, height * 0.30, 58, 0, Math.PI * 2);
  ctx.arc(width * 0.59, height * 0.32, 64, 0, Math.PI * 2);
  ctx.arc(width * 0.50, height * 0.20, 50, 0, Math.PI * 2);
  ctx.fill();

  // Face & Jawline
  const faceGrad = ctx.createLinearGradient(width * 0.44, height * 0.24, width * 0.60, height * 0.42);
  faceGrad.addColorStop(0, '#EBB585');
  faceGrad.addColorStop(0.45, '#C87F4C');
  faceGrad.addColorStop(1, '#663615');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.47, height * 0.24);
  ctx.quadraticCurveTo(width * 0.45, height * 0.32, width * 0.46, height * 0.36);
  ctx.lineTo(width * 0.44, height * 0.40);
  ctx.lineTo(width * 0.485, height * 0.415);
  ctx.quadraticCurveTo(width * 0.55, height * 0.43, width * 0.58, height * 0.37);
  ctx.quadraticCurveTo(width * 0.61, height * 0.30, width * 0.58, height * 0.24);
  ctx.closePath();
  ctx.fill();

  // Closed eye line & eyebrow (expressive singing)
  ctx.strokeStyle = '#4A2612';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(width * 0.49, height * 0.305, 7, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Lips parted singing
  ctx.fillStyle = '#8C462C';
  ctx.beginPath();
  ctx.ellipse(width * 0.495, height * 0.375, 7, 4, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // 6. Acoustic Dreadnought Guitar
  // Body (Warm spruce/mahogany)
  const guitarGrad = ctx.createLinearGradient(width * 0.05, height * 0.45, width * 0.60, height * 0.85);
  guitarGrad.addColorStop(0, '#C27C42');
  guitarGrad.addColorStop(0.5, '#9E5B28');
  guitarGrad.addColorStop(1, '#5C3110');
  ctx.fillStyle = guitarGrad;
  ctx.beginPath();
  // Lower bout
  ctx.arc(width * 0.25, height * 0.68, width * 0.24, 0, Math.PI * 2);
  ctx.fill();
  // Upper bout
  ctx.beginPath();
  ctx.arc(width * 0.38, height * 0.58, width * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // Dark wooden binding edge
  ctx.strokeStyle = '#2A1406';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Rosette & Soundhole
  ctx.fillStyle = '#080503';
  ctx.beginPath();
  ctx.arc(width * 0.35, height * 0.61, width * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#E2BA84';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Tortoise Pickguard
  ctx.fillStyle = '#421609';
  ctx.beginPath();
  ctx.arc(width * 0.38, height * 0.64, width * 0.06, 0.4, 2.5);
  ctx.fill();

  // Guitar Neck & Fretboard extending right
  const neckGrad = ctx.createLinearGradient(width * 0.40, height * 0.58, width * 0.95, height * 0.58);
  neckGrad.addColorStop(0, '#381C0C');
  neckGrad.addColorStop(1, '#1A0C05');
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.40, height * 0.58);
  ctx.lineTo(width * 0.88, height * 0.53);
  ctx.lineTo(width * 0.88, height * 0.57);
  ctx.lineTo(width * 0.40, height * 0.63);
  ctx.closePath();
  ctx.fill();

  // Metal Frets
  ctx.strokeStyle = 'rgba(230, 230, 230, 0.6)';
  ctx.lineWidth = 1.5;
  for (let x = width * 0.44; x < width * 0.88; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, height * 0.57);
    ctx.lineTo(x, height * 0.61);
    ctx.stroke();
  }

  // Guitar Strings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  for (let s = -6; s <= 6; s += 2.4) {
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height * 0.68 + s);
    ctx.lineTo(width * 0.88, height * 0.55 + s * 0.6);
    ctx.stroke();
  }

  // Hands: Strumming right hand on body, Fretting left hand on neck
  // Strumming hand
  ctx.fillStyle = '#C87F4C';
  ctx.beginPath();
  ctx.ellipse(width * 0.26, height * 0.57, 24, 16, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Fretting hand on neck
  ctx.beginPath();
  ctx.ellipse(width * 0.82, height * 0.55, 22, 14, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // 7. Large Studio Condenser Microphone in Shockmount (Right foreground)
  ctx.save();
  ctx.translate(width * 0.72, height * 0.42);
  // Shockmount outer ring
  ctx.strokeStyle = '#22252C';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();
  // Shockmount elastic bands (cross hatch)
  ctx.strokeStyle = '#525966';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-36, -36); ctx.lineTo(36, 36);
  ctx.moveTo(36, -36); ctx.lineTo(-36, 36);
  ctx.stroke();

  // Microphone Body
  ctx.fillStyle = '#181A20';
  ctx.fillRect(-18, -48, 36, 96);
  // Microphone Grille
  const micGrille = ctx.createLinearGradient(-18, -48, 18, -12);
  micGrille.addColorStop(0, '#E5E7EB');
  micGrille.addColorStop(0.5, '#9CA3AF');
  micGrille.addColorStop(1, '#374151');
  ctx.fillStyle = micGrille;
  ctx.fillRect(-16, -46, 32, 40);

  // Stand boom arm
  ctx.strokeStyle = '#181A20';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.lineTo(width * 0.22, height * 0.40);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
  return canvas;
}

export function renderAaravHero(width = 960, height = 640): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep warm atmospheric stage gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#150A04');
  bgGrad.addColorStop(0.35, '#261408');
  bgGrad.addColorStop(0.7, '#140803');
  bgGrad.addColorStop(1, '#080503');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Vibrant amber and golden stage bokeh orbs
  const bokehOrbs = [
    [0.72, 0.28, 90, 'rgba(255, 210, 110, 0.85)'],
    [0.82, 0.45, 130, 'rgba(245, 150, 45, 0.70)'],
    [0.94, 0.32, 100, 'rgba(255, 190, 80, 0.75)'],
    [0.65, 0.18, 55, 'rgba(255, 235, 160, 0.90)'],
    [0.88, 0.65, 75, 'rgba(225, 120, 25, 0.60)'],
    [0.55, 0.12, 45, 'rgba(255, 200, 90, 0.50)'],
    [0.32, 0.15, 60, 'rgba(255, 180, 70, 0.40)'],
    [0.15, 0.25, 80, 'rgba(235, 140, 40, 0.35)'],
    [0.78, 0.82, 95, 'rgba(205, 95, 20, 0.45)'],
    [0.96, 0.88, 80, 'rgba(185, 75, 15, 0.40)'],
  ] as const;

  for (const [bx, by, br, bColor] of bokehOrbs) {
    drawBokeh(ctx, width * bx, height * by, br * (width / 960), bColor);
  }

  // 3. Aarav's Black Shirt & Torso
  ctx.save();
  const shirtGrad = ctx.createLinearGradient(width * 0.3, height * 0.4, width * 0.9, height);
  shirtGrad.addColorStop(0, '#221F24');
  shirtGrad.addColorStop(0.5, '#121115');
  shirtGrad.addColorStop(1, '#070608');
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.28, height);
  ctx.quadraticCurveTo(width * 0.35, height * 0.55, width * 0.48, height * 0.42);
  ctx.lineTo(width * 0.62, height * 0.42);
  ctx.quadraticCurveTo(width * 0.78, height * 0.52, width * 0.88, height);
  ctx.closePath();
  ctx.fill();

  // Woven patterned guitar strap over his shoulder
  const strapGrad = ctx.createLinearGradient(width * 0.64, height * 0.48, width * 0.78, height * 0.95);
  strapGrad.addColorStop(0, '#B35D22');
  strapGrad.addColorStop(0.5, '#853C0E');
  strapGrad.addColorStop(1, '#4E2108');
  ctx.fillStyle = strapGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.68, height * 0.47);
  ctx.lineTo(width * 0.75, height * 0.51);
  ctx.lineTo(width * 0.70, height);
  ctx.lineTo(width * 0.63, height);
  ctx.closePath();
  ctx.fill();

  // Aztec/tribal stitched pattern on strap
  ctx.strokeStyle = 'rgba(255, 215, 140, 0.55)';
  ctx.lineWidth = 2.5;
  for (let y = height * 0.55; y < height; y += 26) {
    ctx.beginPath();
    ctx.moveTo(width * 0.655, y);
    ctx.lineTo(width * 0.69, y + 10);
    ctx.lineTo(width * 0.725, y);
    ctx.stroke();
  }

  // 4. Head tilted back, singing passionately with curls
  // Curly hair mass
  ctx.fillStyle = '#110D0B';
  ctx.beginPath();
  ctx.arc(width * 0.55, height * 0.21, 62, 0, Math.PI * 2);
  ctx.arc(width * 0.49, height * 0.25, 52, 0, Math.PI * 2);
  ctx.arc(width * 0.62, height * 0.27, 56, 0, Math.PI * 2);
  ctx.arc(width * 0.52, height * 0.14, 46, 0, Math.PI * 2);
  ctx.fill();

  // Hair curls definition & rim light
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const rx = width * 0.55 + Math.cos(angle) * (58 + (i % 6) * 7);
    const ry = height * 0.21 + Math.sin(angle) * (58 + (i % 5) * 6);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 195, 105, 0.65)' : 'rgba(165, 85, 25, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(rx, ry, 14 + (i % 4) * 3, angle, angle + Math.PI * 1.2);
    ctx.stroke();
  }

  // Face & Jawline (tilted up toward mic)
  const faceGrad = ctx.createLinearGradient(width * 0.46, height * 0.20, width * 0.65, height * 0.42);
  faceGrad.addColorStop(0, '#EBB585');
  faceGrad.addColorStop(0.4, '#C87F4C');
  faceGrad.addColorStop(1, '#663615');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.49, height * 0.20);
  ctx.quadraticCurveTo(width * 0.48, height * 0.28, width * 0.49, height * 0.32);
  ctx.lineTo(width * 0.465, height * 0.36); // chin/jaw angle
  ctx.lineTo(width * 0.51, height * 0.375);
  ctx.quadraticCurveTo(width * 0.56, height * 0.40, width * 0.60, height * 0.35);
  ctx.quadraticCurveTo(width * 0.64, height * 0.28, width * 0.61, height * 0.20);
  ctx.closePath();
  ctx.fill();

  // Neck & Adam's apple
  const neckGrad = ctx.createLinearGradient(width * 0.50, height * 0.35, width * 0.60, height * 0.45);
  neckGrad.addColorStop(0, '#C87F4C');
  neckGrad.addColorStop(1, '#5A2E12');
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.51, height * 0.375);
  ctx.lineTo(width * 0.50, height * 0.44);
  ctx.lineTo(width * 0.61, height * 0.44);
  ctx.lineTo(width * 0.60, height * 0.35);
  ctx.closePath();
  ctx.fill();

  // 5. Dynamic Vocal Microphone on Stand right in front of lips
  ctx.save();
  ctx.translate(width * 0.44, height * 0.32);
  ctx.rotate(-0.48);
  // Mic body
  ctx.fillStyle = '#22252C';
  ctx.fillRect(-62, -11, 88, 22);
  // Grille
  const grilleGrad = ctx.createRadialGradient(38, -6, 4, 38, 0, 26);
  grilleGrad.addColorStop(0, '#FFFFFF');
  grilleGrad.addColorStop(0.35, '#C5CCD6');
  grilleGrad.addColorStop(1, '#3B424E');
  ctx.fillStyle = grilleGrad;
  ctx.beginPath();
  ctx.arc(38, 0, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Atmospheric warm rim flare on shoulder & hair
  ctx.strokeStyle = 'rgba(255, 215, 140, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.60, height * 0.35);
  ctx.quadraticCurveTo(width * 0.68, height * 0.44, width * 0.78, height * 0.58);
  ctx.stroke();

  ctx.restore();

  return canvas;
}

export function renderStageThumbnail(
  width = 320,
  height = 420,
  palette: 'monsoon' | 'city' | 'falling' | 'unplugged' | 'edge' | 'redcurtain' | 'cozy' | 'creatorjam' | 'audition'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (palette === 'monsoon') {
    // Warm golden amber stage
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#3A1E0B');
    g.addColorStop(0.5, '#1A0C05');
    g.addColorStop(1, '#090402');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.5, height * 0.35, 120, 'rgba(255, 200, 90, 0.8)');
    drawBokeh(ctx, width * 0.8, height * 0.6, 90, 'rgba(245, 140, 30, 0.6)');
  } else if (palette === 'city') {
    // Deep blue / violet concert stage
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#100B2B');
    g.addColorStop(0.4, '#241042');
    g.addColorStop(1, '#060312');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.4, height * 0.3, 110, 'rgba(140, 90, 255, 0.7)');
    drawBokeh(ctx, width * 0.8, height * 0.5, 90, 'rgba(60, 160, 255, 0.6)');
  } else if (palette === 'falling') {
    // Magenta neon backlight
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#2D0A24');
    g.addColorStop(0.5, '#420D32');
    g.addColorStop(1, '#0C020A');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.6, height * 0.35, 110, 'rgba(255, 60, 160, 0.75)');
  } else if (palette === 'unplugged') {
    // Warm wood / theater curtains
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#28170D');
    g.addColorStop(0.5, '#3B2111');
    g.addColorStop(1, '#0E0704');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.3, height * 0.4, 90, 'rgba(255, 185, 100, 0.6)');
    drawBokeh(ctx, width * 0.7, height * 0.4, 90, 'rgba(255, 185, 100, 0.6)');
  } else if (palette === 'edge') {
    // Dark electric with blue laser beam
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#041624');
    g.addColorStop(0.5, '#07243B');
    g.addColorStop(1, '#02090F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(60, 220, 255, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.25);
    ctx.lineTo(width, height * 0.65);
    ctx.stroke();
    drawBokeh(ctx, width * 0.65, height * 0.45, 90, 'rgba(40, 180, 255, 0.65)');
  } else if (palette === 'redcurtain') {
    // Red theater curtain
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#42080E');
    g.addColorStop(0.5, '#680F18');
    g.addColorStop(1, '#1A0205');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.5, height * 0.5, 90, 'rgba(255, 80, 80, 0.7)');
  } else if (palette === 'creatorjam') {
    // Concert stage with blue & red concert lighting & silhouette of audience hands
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#100D30');
    g.addColorStop(0.5, '#351240');
    g.addColorStop(1, '#060310');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.3, height * 0.35, 110, 'rgba(60, 140, 255, 0.7)');
    drawBokeh(ctx, width * 0.7, height * 0.35, 110, 'rgba(229, 9, 20, 0.75)');
    // Crowd hands raised at bottom
    ctx.fillStyle = '#05030A';
    for (let x = 10; x < width; x += 28) {
      const h = 25 + (x % 4) * 12;
      ctx.fillRect(x, height - h, 14, h);
      ctx.beginPath();
      ctx.arc(x + 7, height - h, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas.toDataURL('image/png');
  } else if (palette === 'audition') {
    // Empty theater stage with wooden floor, spotlights, stool & microphone stand
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#180E08');
    g.addColorStop(0.6, '#28170D');
    g.addColorStop(1, '#080503');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // Overhead warm spotlights down
    drawBokeh(ctx, width * 0.35, height * 0.3, 100, 'rgba(255, 210, 120, 0.6)');
    drawBokeh(ctx, width * 0.65, height * 0.3, 100, 'rgba(255, 210, 120, 0.6)');
    // Wooden stage floor
    ctx.fillStyle = '#1D120B';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    // Stool & mic stand
    ctx.fillStyle = '#0A0705';
    ctx.fillRect(width * 0.5 - 2, height * 0.45, 4, height * 0.3);
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.45, 6, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL('image/png');
  } else {
    // Cozy Sofar amber room
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#2F180A');
    g.addColorStop(0.5, '#48240F');
    g.addColorStop(1, '#0F0602');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawBokeh(ctx, width * 0.5, height * 0.4, 90, 'rgba(255, 190, 80, 0.75)');
  }

  // Silhouette of singer with guitar
  ctx.fillStyle = '#08080C';
  ctx.beginPath();
  ctx.arc(width * 0.45, height * 0.35, 26, 0, Math.PI * 2);
  ctx.moveTo(width * 0.25, height);
  ctx.quadraticCurveTo(width * 0.35, height * 0.55, width * 0.45, height * 0.45);
  ctx.quadraticCurveTo(width * 0.55, height * 0.55, width * 0.75, height);
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL('image/png');
}

function drawBokeh(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  colorInner: string,
  colorOuter: string = 'rgba(255, 160, 40, 0)'
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

export function renderKiaraScene(width = 960, height = 560): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep warm stage background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1B1008');
  bgGrad.addColorStop(0.35, '#2A180A');
  bgGrad.addColorStop(0.7, '#160C05');
  bgGrad.addColorStop(1, '#090503');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Main golden stage spotlight behind dancer
  drawBokeh(ctx, width * 0.36, height * 0.38, width * 0.44, 'rgba(255, 226, 155, 0.92)');
  drawBokeh(ctx, width * 0.19, height * 0.43, width * 0.22, 'rgba(255, 242, 195, 0.95)');
  drawBokeh(ctx, width * 0.52, height * 0.34, width * 0.28, 'rgba(245, 166, 55, 0.65)');
  drawBokeh(ctx, width * 0.72, height * 0.65, width * 0.26, 'rgba(217, 119, 26, 0.45)');

  // 3. Out-of-focus stage candles & bokeh clusters
  const bokehSpots = [
    [0.05, 0.68, 26, 0.55], [0.09, 0.78, 32, 0.65], [0.14, 0.72, 22, 0.5],
    [0.18, 0.85, 28, 0.7], [0.23, 0.76, 20, 0.45], [0.28, 0.82, 26, 0.55],
    [0.33, 0.74, 35, 0.4], [0.64, 0.76, 30, 0.65], [0.69, 0.68, 22, 0.5],
    [0.75, 0.82, 34, 0.7], [0.82, 0.72, 26, 0.55], [0.88, 0.62, 32, 0.75],
    [0.93, 0.78, 28, 0.65], [0.96, 0.66, 24, 0.6]
  ];
  for (const [bx, by, br, ba] of bokehSpots) {
    drawBokeh(ctx, width * bx, height * by, br * (width / 960), `rgba(255, 205, 110, ${ba})`);
    drawBokeh(ctx, width * bx, height * by, br * 0.35 * (width / 960), `rgba(255, 248, 220, ${Math.min(1, ba + 0.25)})`);
  }

  // 4. Dancer's Skirt
  ctx.save();
  const skirtGrad = ctx.createLinearGradient(width * 0.34, height * 0.72, width * 0.65, height);
  skirtGrad.addColorStop(0, '#1C1A1E');
  skirtGrad.addColorStop(0.5, '#111014');
  skirtGrad.addColorStop(1, '#070608');
  ctx.fillStyle = skirtGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.41, height * 0.77);
  ctx.quadraticCurveTo(width * 0.36, height * 0.9, width * 0.31, height * 1.02);
  ctx.lineTo(width * 0.68, height * 1.02);
  ctx.quadraticCurveTo(width * 0.63, height * 0.88, width * 0.57, height * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 5. Exposed Midriff / Waist (Warm golden skin)
  ctx.save();
  const skinMidGrad = ctx.createLinearGradient(width * 0.42, height * 0.62, width * 0.56, height * 0.78);
  skinMidGrad.addColorStop(0, '#DF9B62');
  skinMidGrad.addColorStop(0.35, '#B66E3E');
  skinMidGrad.addColorStop(0.8, '#7D4422');
  ctx.fillStyle = skinMidGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.43, height * 0.62);
  ctx.quadraticCurveTo(width * 0.425, height * 0.7, width * 0.42, height * 0.77);
  ctx.lineTo(width * 0.555, height * 0.78);
  ctx.quadraticCurveTo(width * 0.545, height * 0.7, width * 0.55, height * 0.64);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 6. Crimson Red Waist Sash (Signature detail)
  ctx.save();
  const sashGrad = ctx.createLinearGradient(width * 0.4, height * 0.72, width * 0.61, height * 0.94);
  sashGrad.addColorStop(0, '#CE3A39');
  sashGrad.addColorStop(0.45, '#9A1F23');
  sashGrad.addColorStop(1, '#42090C');
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.415, height * 0.735);
  ctx.quadraticCurveTo(width * 0.49, height * 0.715, width * 0.565, height * 0.76);
  ctx.quadraticCurveTo(width * 0.61, height * 0.86, width * 0.635, height * 0.98);
  ctx.lineTo(width * 0.555, height * 0.98);
  ctx.quadraticCurveTo(width * 0.535, height * 0.85, width * 0.49, height * 0.79);
  ctx.quadraticCurveTo(width * 0.44, height * 0.8, width * 0.405, height * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 7. Dancer's Head, Backlit Curls & Poised Face
  ctx.save();
  // Curly hair halo
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const rx = width * 0.535 + Math.cos(angle) * (44 + (i % 5) * 8);
    const ry = height * 0.255 + Math.sin(angle) * (48 + (i % 4) * 7);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 195, 95, 0.55)' : 'rgba(185, 105, 35, 0.45)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(rx, ry, 12 + (i % 4) * 3, angle, angle + Math.PI * 1.15);
    ctx.stroke();
  }

  // Dark hair mass
  ctx.fillStyle = '#18110E';
  ctx.beginPath();
  ctx.arc(width * 0.525, height * 0.25, 42, 0, Math.PI * 2);
  ctx.arc(width * 0.545, height * 0.19, 30, 0, Math.PI * 2);
  ctx.arc(width * 0.495, height * 0.22, 28, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.save();
  ctx.translate(width * 0.55, height * 0.305);
  ctx.rotate(0.28);
  const faceGrad = ctx.createLinearGradient(-28, -30, 32, 30);
  faceGrad.addColorStop(0, '#784121');
  faceGrad.addColorStop(0.5, '#B87042');
  faceGrad.addColorStop(1, '#FFD1A1');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(-18, -34);
  ctx.quadraticCurveTo(22, -34, 28, -6);
  ctx.lineTo(33, 6);
  ctx.lineTo(25, 11);
  ctx.quadraticCurveTo(26, 22, 16, 34);
  ctx.quadraticCurveTo(-10, 32, -22, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();

  // 8. Raised Right Arm & Extended Left Arm
  ctx.save();
  const topGrad = ctx.createLinearGradient(width * 0.25, height * 0.2, width * 0.72, height * 0.72);
  topGrad.addColorStop(0, '#1D1A1E');
  topGrad.addColorStop(0.5, '#111013');
  topGrad.addColorStop(1, '#1A161A');
  ctx.fillStyle = topGrad;

  ctx.beginPath();
  ctx.moveTo(width * 0.30, height * 0.115);
  ctx.lineTo(width * 0.32, height * 0.15);
  ctx.lineTo(width * 0.265, height * 0.32);
  ctx.lineTo(width * 0.45, height * 0.39);
  ctx.quadraticCurveTo(width * 0.51, height * 0.44, width * 0.57, height * 0.43);
  ctx.lineTo(width * 0.62, height * 0.58);
  ctx.lineTo(width * 0.755, height * 0.715);
  ctx.lineTo(width * 0.73, height * 0.76);
  ctx.lineTo(width * 0.575, height * 0.64);
  ctx.lineTo(width * 0.56, height * 0.655);
  ctx.quadraticCurveTo(width * 0.49, height * 0.63, width * 0.425, height * 0.625);
  ctx.lineTo(width * 0.415, height * 0.47);
  ctx.lineTo(width * 0.22, height * 0.355);
  ctx.quadraticCurveTo(width * 0.21, height * 0.33, width * 0.225, height * 0.29);
  ctx.closePath();
  ctx.fill();

  // Golden rim light along silhouette
  ctx.strokeStyle = 'rgba(255, 204, 112, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.22, height * 0.35);
  ctx.lineTo(width * 0.415, height * 0.47);
  ctx.lineTo(width * 0.425, height * 0.625);
  ctx.stroke();
  ctx.restore();

  return canvas;
}

export function renderArjunScene(width = 960, height = 560): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep warm intimate acoustic room
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#3C2514');
  bgGrad.addColorStop(0.45, '#4A2E18');
  bgGrad.addColorStop(1, '#160C06');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Vintage Glowing Table Lamp on Left
  drawBokeh(ctx, width * 0.175, height * 0.40, width * 0.24, 'rgba(255, 200, 95, 0.75)');
  const shadeGrad = ctx.createLinearGradient(width * 0.125, height * 0.28, width * 0.225, height * 0.50);
  shadeGrad.addColorStop(0, '#FFF6D6');
  shadeGrad.addColorStop(0.5, '#FDBD53');
  shadeGrad.addColorStop(1, '#D97719');
  ctx.fillStyle = shadeGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.145, height * 0.29);
  ctx.lineTo(width * 0.205, height * 0.29);
  ctx.lineTo(width * 0.225, height * 0.49);
  ctx.quadraticCurveTo(width * 0.175, height * 0.51, width * 0.125, height * 0.49);
  ctx.closePath();
  ctx.fill();

  // 3. Arjun's Shirt & Shoulder
  ctx.save();
  const shirtGrad = ctx.createLinearGradient(width * 0.22, height * 0.52, width * 0.68, height);
  shirtGrad.addColorStop(0, '#1B1D22');
  shirtGrad.addColorStop(1, '#090A0C');
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.18, height * 1.02);
  ctx.quadraticCurveTo(width * 0.22, height * 0.72, width * 0.36, height * 0.59);
  ctx.lineTo(width * 0.45, height * 0.53);
  ctx.lineTo(width * 0.60, height * 0.55);
  ctx.quadraticCurveTo(width * 0.69, height * 0.68, width * 0.72, height * 1.02);
  ctx.closePath();
  ctx.fill();

  // 4. Woven Patterned Guitar Strap over shoulder
  const strapGrad = ctx.createLinearGradient(width * 0.56, height * 0.56, width * 0.64, height * 0.96);
  strapGrad.addColorStop(0, '#C87A3B');
  strapGrad.addColorStop(1, '#7D4116');
  ctx.fillStyle = strapGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.595, height * 0.55);
  ctx.lineTo(width * 0.645, height * 0.585);
  ctx.lineTo(width * 0.60, height * 0.98);
  ctx.lineTo(width * 0.55, height * 0.98);
  ctx.closePath();
  ctx.fill();

  // 5. Head, Singing Eyes Closed & Curly Hair
  ctx.fillStyle = '#14100E';
  ctx.beginPath();
  ctx.arc(width * 0.52, height * 0.19, 46, 0, Math.PI * 2);
  ctx.arc(width * 0.47, height * 0.22, 40, 0, Math.PI * 2);
  ctx.arc(width * 0.58, height * 0.24, 42, 0, Math.PI * 2);
  ctx.fill();

  // Face
  const arjunFaceGrad = ctx.createLinearGradient(width * 0.43, height * 0.22, width * 0.58, height * 0.48);
  arjunFaceGrad.addColorStop(0, '#E39D67');
  arjunFaceGrad.addColorStop(0.5, '#BA7242');
  arjunFaceGrad.addColorStop(1, '#5E3217');
  ctx.fillStyle = arjunFaceGrad;
  ctx.beginPath();
  ctx.moveTo(width * 0.46, height * 0.22);
  ctx.quadraticCurveTo(width * 0.45, height * 0.29, width * 0.455, height * 0.34);
  ctx.lineTo(width * 0.438, height * 0.385);
  ctx.lineTo(width * 0.458, height * 0.405);
  ctx.quadraticCurveTo(width * 0.445, height * 0.45, width * 0.465, height * 0.49);
  ctx.quadraticCurveTo(width * 0.53, height * 0.50, width * 0.565, height * 0.42);
  ctx.quadraticCurveTo(width * 0.585, height * 0.34, width * 0.56, height * 0.23);
  ctx.closePath();
  ctx.fill();

  // 6. Dynamic Vocal Microphone on Stand
  ctx.save();
  ctx.translate(width * 0.385, height * 0.49);
  ctx.rotate(-0.46);
  ctx.fillStyle = '#2B2E36';
  ctx.fillRect(-48, -9, 76, 18);
  const grilleGrad = ctx.createRadialGradient(42, -5, 3, 42, 0, 22);
  grilleGrad.addColorStop(0, '#E5E7EB');
  grilleGrad.addColorStop(1, '#374151');
  ctx.fillStyle = grilleGrad;
  ctx.beginPath();
  ctx.arc(42, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  return canvas;
}

export function renderUserAvatar(size = 240): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createRadialGradient(size * 0.5, size * 0.4, 10, size * 0.5, size * 0.5, size * 0.6);
  bg.addColorStop(0, '#58524E');
  bg.addColorStop(1, '#2C2826');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Face
  const faceGrad = ctx.createLinearGradient(size * 0.35, size * 0.22, size * 0.65, size * 0.62);
  faceGrad.addColorStop(0, '#E4A67A');
  faceGrad.addColorStop(0.5, '#CC885B');
  faceGrad.addColorStop(1, '#A6673E');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.42, size * 0.17, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark hair framing face
  ctx.fillStyle = '#161210';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.17);
  ctx.quadraticCurveTo(size * 0.28, size * 0.18, size * 0.26, size * 0.55);
  ctx.quadraticCurveTo(size * 0.34, size * 0.40, size * 0.36, size * 0.30);
  ctx.quadraticCurveTo(size * 0.5, size * 0.22, size * 0.5, size * 0.22);
  ctx.quadraticCurveTo(size * 0.64, size * 0.30, size * 0.74, size * 0.55);
  ctx.quadraticCurveTo(size * 0.72, size * 0.18, size * 0.5, size * 0.17);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

function cropAvatar(canvas: HTMLCanvasElement, sx: number, sy: number, sSize: number): string {
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 240;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(canvas, sx, sy, sSize, sSize, 0, 0, 240, 240);
  return c.toDataURL('image/png');
}

let cached: GeneratedArtworks | null = null;
export function getGeneratedArtworks(): GeneratedArtworks {
  if (cached) return cached;
  const kiara = renderKiaraScene(960, 560);
  const arjun = renderArjunScene(960, 560);
  const aarav = renderAaravHero(960, 640);

  cached = {
    kiaraPoster: kiara.toDataURL('image/png'),
    kiaraAvatar: cropAvatar(kiara, 395, 70, 240),
    arjunPoster: arjun.toDataURL('image/png'),
    arjunAvatar: cropAvatar(arjun, 355, 75, 250),
    userAvatar: renderUserAvatar(240),
    aaravHero: aarav.toDataURL('image/png'),
    aaravAvatar: cropAvatar(aarav, 430, 80, 240),
    monsoonMotionThumb: renderStageThumbnail(320, 420, 'monsoon'),
    cityLightsThumb: renderStageThumbnail(320, 420, 'city'),
    fallingAgainThumb: renderStageThumbnail(320, 420, 'falling'),
    unpluggedThumb: renderStageThumbnail(320, 420, 'unplugged'),
    theEdgeThumb: renderStageThumbnail(320, 420, 'edge'),
    showNextStageThumb: renderStageThumbnail(320, 240, 'redcurtain'),
    showSofarThumb: renderStageThumbnail(320, 240, 'cozy'),
    creatorJamThumb: renderStageThumbnail(320, 240, 'creatorjam'),
    stageHuntThumb: renderStageThumbnail(320, 240, 'audition'),
    flipsAaravPoster: renderFlipsAaravScene(960, 1280).toDataURL('image/png'),
  };
  return cached;
}
