export type TrafficKind = 'sedan' | 'suv' | 'truck' | 'barrier';

export interface TrafficEntity {
  id: number;
  kind: TrafficKind;
  lane: number;
  targetLane: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  color: string;
  accent: string;
  laneChangeTimer: number; // > 0 means telegraphing blinker before moving
  isChangingLane: boolean;
}

export interface PickupEntity {
  id: number;
  kind: 'core' | 'shield';
  x: number;
  y: number;
  r: number;
  phase: number;
}

export interface SceneryProp {
  x: number;
  y: number;
  side: 'left' | 'right';
  kind: 'tree' | 'lamp' | 'rock';
  scale: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawPlayerCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tiltRad: number,
  squashX: number,
  squashY: number,
  isBoosting: boolean,
  isNight: boolean,
  invulnTimer: number,
  hitFlash: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tiltRad);
  ctx.scale(squashX, squashY);

  // Blink gently during post-hit invulnerability
  if (invulnTimer > 0 && Math.floor(invulnTimer * 14) % 2 === 1) {
    ctx.globalAlpha = 0.55;
  }

  // Headlight cones in night mode or during boost
  if (isNight) {
    const gradL = ctx.createLinearGradient(-w * 0.25, -h * 0.45, -w * 0.6, -h * 2.7);
    gradL.addColorStop(0, 'rgba(254, 240, 138, 0.36)');
    gradL.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = gradL;
    ctx.beginPath();
    ctx.moveTo(-w * 0.34, -h * 0.44);
    ctx.lineTo(-w * 0.14, -h * 0.44);
    ctx.lineTo(-w * 0.05, -h * 2.7);
    ctx.lineTo(-w * 0.95, -h * 2.7);
    ctx.closePath();
    ctx.fill();

    const gradR = ctx.createLinearGradient(w * 0.25, -h * 0.45, w * 0.6, -h * 2.7);
    gradR.addColorStop(0, 'rgba(254, 240, 138, 0.36)');
    gradR.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = gradR;
    ctx.beginPath();
    ctx.moveTo(w * 0.14, -h * 0.44);
    ctx.lineTo(w * 0.34, -h * 0.44);
    ctx.lineTo(w * 0.95, -h * 2.7);
    ctx.lineTo(w * 0.05, -h * 2.7);
    ctx.closePath();
    ctx.fill();
  }

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
  drawRoundedRect(ctx, -w / 2 + 4, -h / 2 + 6, w, h, 12);
  ctx.fill();

  // Nitro flames
  if (isBoosting) {
    const flameLen = 18 + Math.random() * 14;
    [-w * 0.2, w * 0.2].forEach((fx) => {
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(fx - 5, h / 2 - 2);
      ctx.lineTo(fx + 5, h / 2 - 2);
      ctx.lineTo(fx, h / 2 + flameLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.moveTo(fx - 2.5, h / 2 - 2);
      ctx.lineTo(fx + 2.5, h / 2 - 2);
      ctx.lineTo(fx, h / 2 + flameLen * 0.58);
      ctx.closePath();
      ctx.fill();
    });
  }

  // Tires
  ctx.fillStyle = '#0F172A';
  const tireW = 7;
  const tireH = 16;
  drawRoundedRect(ctx, -w / 2 - 3, -h * 0.34, tireW, tireH, 2);
  ctx.fill();
  drawRoundedRect(ctx, w / 2 - 4, -h * 0.34, tireW, tireH, 2);
  ctx.fill();
  drawRoundedRect(ctx, -w / 2 - 3, h * 0.16, tireW, tireH, 2);
  ctx.fill();
  drawRoundedRect(ctx, w / 2 - 4, h * 0.16, tireW, tireH, 2);
  ctx.fill();

  // Chassis
  ctx.fillStyle = hitFlash > 0 ? '#FFFFFF' : '#E11D48';
  drawRoundedRect(ctx, -w / 2, -h / 2, w, h, 11);
  ctx.fill();

  // Racing twin stripe
  ctx.fillStyle = hitFlash > 0 ? '#FEF08A' : '#FFF1F2';
  ctx.fillRect(-5, -h / 2 + 2, 3.5, h - 4);
  ctx.fillRect(1.5, -h / 2 + 2, 3.5, h - 4);

  // Hood contour
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  drawRoundedRect(ctx, -w * 0.34, -h * 0.4, w * 0.68, h * 0.18, 4);
  ctx.fill();

  // Cabin / Windshield
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(ctx, -w * 0.36, -h * 0.18, w * 0.72, h * 0.44, 7);
  ctx.fill();

  // Roof highlight
  ctx.fillStyle = hitFlash > 0 ? '#FFFFFF' : '#FB7185';
  drawRoundedRect(ctx, -w * 0.28, -h * 0.04, w * 0.56, h * 0.22, 4);
  ctx.fill();

  // Front headlights
  ctx.fillStyle = '#FEF08A';
  drawRoundedRect(ctx, -w * 0.36, -h / 2 + 1.5, 9, 4.5, 2);
  ctx.fill();
  drawRoundedRect(ctx, w * 0.36 - 9, -h / 2 + 1.5, 9, 4.5, 2);
  ctx.fill();

  // Rear spoiler & brake lights
  ctx.fillStyle = '#881337';
  drawRoundedRect(ctx, -w * 0.44, h / 2 - 7, w * 0.88, 5, 2);
  ctx.fill();

  ctx.fillStyle = '#EF4444';
  drawRoundedRect(ctx, -w * 0.36, h / 2 - 4, 9, 3.5, 1.5);
  ctx.fill();
  drawRoundedRect(ctx, w * 0.36 - 9, h / 2 - 4, 9, 3.5, 1.5);
  ctx.fill();

  // Invulnerability shield aura
  if (invulnTimer > 0) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 15);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawTrafficEntity(
  ctx: CanvasRenderingContext2D,
  car: TrafficEntity,
  timeSec: number,
  isNight: boolean
) {
  ctx.save();
  ctx.translate(car.x, car.y);

  if (car.kind === 'barrier') {
    // High-contrast road work barrier
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    drawRoundedRect(ctx, -car.w / 2 + 3, -car.h / 2 + 4, car.w, car.h, 5);
    ctx.fill();

    ctx.fillStyle = '#F97316';
    drawRoundedRect(ctx, -car.w / 2, -car.h / 2, car.w, car.h, 5);
    ctx.fill();

    ctx.fillStyle = '#FFFBEB';
    const stripeW = car.w / 5;
    ctx.fillRect(-car.w / 2 + stripeW, -car.h / 2, stripeW, car.h);
    ctx.fillRect(car.w / 2 - stripeW * 2, -car.h / 2, stripeW, car.h);

    // Flashing amber hazard beacon
    if (Math.sin(timeSec * 10 + car.id) > 0) {
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(-car.w * 0.32, 0, 3.5, 0, Math.PI * 2);
      ctx.arc(car.w * 0.32, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  drawRoundedRect(ctx, -car.w / 2 + 3, -car.h / 2 + 5, car.w, car.h, 9);
  ctx.fill();

  // Tires
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(ctx, -car.w / 2 - 2.5, -car.h * 0.32, 6, 13, 2);
  ctx.fill();
  drawRoundedRect(ctx, car.w / 2 - 3.5, -car.h * 0.32, 6, 13, 2);
  ctx.fill();
  drawRoundedRect(ctx, -car.w / 2 - 2.5, car.h * 0.18, 6, 13, 2);
  ctx.fill();
  drawRoundedRect(ctx, car.w / 2 - 3.5, car.h * 0.18, 6, 13, 2);
  ctx.fill();

  // Body
  ctx.fillStyle = car.color;
  drawRoundedRect(ctx, -car.w / 2, -car.h / 2, car.w, car.h, car.kind === 'truck' ? 6 : 10);
  ctx.fill();

  if (car.kind === 'truck') {
    // Cargo trailer + cab
    ctx.fillStyle = '#F8FAFC';
    drawRoundedRect(ctx, -car.w * 0.44, -car.h * 0.14, car.w * 0.88, car.h * 0.58, 4);
    ctx.fill();

    ctx.fillStyle = car.accent;
    ctx.fillRect(-car.w * 0.44, car.h * 0.08, car.w * 0.88, 6);

    // Cab windshield
    ctx.fillStyle = '#0F172A';
    drawRoundedRect(ctx, -car.w * 0.36, -car.h * 0.42, car.w * 0.72, car.h * 0.16, 4);
    ctx.fill();
  } else {
    // Windshield & rear glass
    ctx.fillStyle = '#0F172A';
    drawRoundedRect(ctx, -car.w * 0.36, -car.h * 0.22, car.w * 0.72, car.h * 0.46, 6);
    ctx.fill();

    // Roof
    ctx.fillStyle = car.accent;
    drawRoundedRect(ctx, -car.w * 0.29, -car.h * 0.08, car.w * 0.58, car.h * 0.26, 4);
    ctx.fill();
  }

  // Headlights & Taillights
  ctx.fillStyle = isNight ? '#FEF08A' : '#E2E8F0';
  drawRoundedRect(ctx, -car.w * 0.36, -car.h / 2 + 1.5, 7, 3.5, 1.5);
  ctx.fill();
  drawRoundedRect(ctx, car.w * 0.36 - 7, -car.h / 2 + 1.5, 7, 3.5, 1.5);
  ctx.fill();

  ctx.fillStyle = '#EF4444';
  drawRoundedRect(ctx, -car.w * 0.36, car.h / 2 - 4, 8, 3, 1);
  ctx.fill();
  drawRoundedRect(ctx, car.w * 0.36 - 8, car.h / 2 - 4, 8, 3, 1);
  ctx.fill();

  // Lane-change windup telegraph blinker
  if (car.laneChangeTimer > 0 && Math.sin(timeSec * 22) > 0) {
    const dir = car.targetLane > car.lane ? 1 : -1;
    const bx = dir > 0 ? car.w / 2 - 3 : -car.w / 2 - 1;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(bx, -car.h * 0.36, 4, 0, Math.PI * 2);
    ctx.arc(bx, car.h * 0.36, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawPickupEntity(ctx: CanvasRenderingContext2D, p: PickupEntity, timeSec: number) {
  const pulse = 1 + Math.sin(timeSec * 5 + p.phase) * 0.08;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(pulse, pulse);

  if (p.kind === 'core') {
    // Golden IT Data Core hexagon
    ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#FEF3C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const px = Math.cos(a) * p.r;
      const py = Math.sin(a) * p.r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner chip square
    ctx.fillStyle = '#FFFBEB';
    ctx.fillRect(-4, -4, 8, 8);
  } else {
    // Emerald Shield Repair orb
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#D1FAE5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crisp plus cross
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2.5, -7, 5, 14);
    ctx.fillRect(-7, -2.5, 14, 5);
  }

  ctx.restore();
}

export function drawCheckpointGate(
  ctx: CanvasRenderingContext2D,
  roadLeft: number,
  roadWidth: number,
  gateY: number,
  nextLevel: number,
  timeSec: number
) {
  ctx.save();

  // Checkered tarmac strip across the road
  const cols = 12;
  const cellW = roadWidth / cols;
  const cellH = 11;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#F8FAFC' : '#0F172A';
      ctx.fillRect(roadLeft + col * cellW, gateY + row * cellH, cellW + 0.5, cellH);
    }
  }

  // Gate pillars on shoulders
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(roadLeft - 14, gateY - 38, 16, 62);
  ctx.fillRect(roadLeft + roadWidth - 2, gateY - 38, 16, 62);

  // Overhead gantry banner
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(ctx, roadLeft - 10, gateY - 46, roadWidth + 20, 34, 6);
  ctx.fill();

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, roadLeft - 10, gateY - 46, roadWidth + 20, 34, 6);
  ctx.stroke();

  // Flashing amber beacons
  const beaconColor = Math.sin(timeSec * 12) > 0 ? '#FBBF24' : '#F59E0B';
  ctx.fillStyle = beaconColor;
  ctx.beginPath();
  ctx.arc(roadLeft + 8, gateY - 29, 5, 0, Math.PI * 2);
  ctx.arc(roadLeft + roadWidth - 8, gateY - 29, 5, 0, Math.PI * 2);
  ctx.fill();

  // Gantry text
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 14px "Outfit", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`QUIZ CHECKPOINT · UNLOCK LEVEL ${nextLevel}`, roadLeft + roadWidth / 2, gateY - 29);

  ctx.restore();
}

export function drawSceneryProp(
  ctx: CanvasRenderingContext2D,
  prop: SceneryProp,
  primary: string,
  secondary: string,
  isNight: boolean
) {
  ctx.save();
  ctx.translate(prop.x, prop.y);
  ctx.scale(prop.scale, prop.scale);

  if (prop.kind === 'lamp') {
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-2.5, -18, 5, 22);
    const armDir = prop.side === 'left' ? 1 : -1;
    ctx.fillRect(0, -18, armDir * 16, 4);
    ctx.fillStyle = isNight ? '#FDE047' : '#CBD5E1';
    ctx.beginPath();
    ctx.arc(armDir * 14, -15, 4.5, 0, Math.PI * 2);
    ctx.fill();
    if (isNight) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.16)';
      ctx.beginPath();
      ctx.arc(armDir * 14, -15, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (prop.kind === 'rock') {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(3, 5, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78716C';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A8A29E';
    ctx.beginPath();
    ctx.ellipse(-4, -3, 8, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Stylized top-down tree
    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    ctx.beginPath();
    ctx.arc(5, 6, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = secondary;
    ctx.beginPath();
    ctx.arc(-4, -4, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
