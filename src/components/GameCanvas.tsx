import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../audio/soundEngine';
import {
  getBiomeForLevel,
  getLevelTargetDistance,
  getLevelTrafficSpeedMultiplier,
} from '../game/biomes';
import {
  drawCheckpointGate,
  drawPickupEntity,
  drawPlayerCar,
  drawSceneryProp,
  drawTrafficEntity,
  PickupEntity,
  SceneryProp,
  TrafficEntity,
  TrafficKind,
} from '../game/carRenderer';
import { GameState, HudSnapshot } from '../types/game';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface GameCanvasProps {
  gameState: GameState;
  level: number;
  runId: number;
  levelAdvanceId: number;
  syncedShields: number;
  externalBoostRef: React.MutableRefObject<boolean>;
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onReachGate: (finalScore: number, currentShields: number) => void;
  onGameOver: (finalScore: number) => void;
  onShieldChange: (shields: number) => void;
}

const LANE_COUNT = 4;
const MAX_PARTICLES = 80;
const MAX_SHIELDS = 3;

const TRAFFIC_PALETTE = [
  { color: '#3B82F6', accent: '#93C5FD' },
  { color: '#10B981', accent: '#6EE7B7' },
  { color: '#8B5CF6', accent: '#C4B5FD' },
  { color: '#F59E0B', accent: '#FDE68A' },
  { color: '#64748B', accent: '#CBD5E1' },
];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  level,
  runId,
  levelAdvanceId,
  syncedShields,
  externalBoostRef,
  onHudUpdate,
  onReachGate,
  onGameOver,
  onShieldChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Refs synced from React props so the 60fps loop never resets or re-renders
  const stateRef = useRef<GameState>(gameState);
  const levelRef = useRef<number>(level);
  const callbacksRef = useRef({
    onHudUpdate,
    onReachGate,
    onGameOver,
    onShieldChange,
  });

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    simRef.current.shields = syncedShields;
  }, [syncedShields]);

  useEffect(() => {
    callbacksRef.current = {
      onHudUpdate,
      onReachGate,
      onGameOver,
      onShieldChange,
    };
  }, [onHudUpdate, onReachGate, onGameOver, onShieldChange]);

  // Mutable simulation state inside ref
  const simRef = useRef({
    playerX: 0,
    playerVx: 0,
    playerY: 0,
    playerW: 44,
    playerH: 78,
    squashX: 1,
    squashY: 1,
    tilt: 0,
    score: 0,
    shields: MAX_SHIELDS,
    distance: 0,
    targetDistance: getLevelTargetDistance(1),
    nitro: 60,
    isBoosting: false,
    speed: 360, // px/sec road scroll speed
    roadOffset: 0,
    invulnTimer: 0,
    hitstopTimer: 0,
    hitFlashTimer: 0,
    shakeIntensity: 0,
    gateActive: false,
    gateY: -120,
    gateTriggered: false,
    spawnTimer: 0.6,
    pickupTimer: 1.2,
    nextEntityId: 1,
    traffic: [] as TrafficEntity[],
    pickups: [] as PickupEntity[],
    scenery: [] as SceneryProp[],
    particles: Array.from({ length: MAX_PARTICLES }, (): Particle => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 4,
      color: '#F59E0B',
    })),
    hudSyncTimer: 0,
    pointerTargetX: null as number | null,
    pointerBoost: false,
    lastRunId: -1,
    lastAdvanceId: -1,
    timeSec: 0,
  });

  // Reset full run when runId changes
  useEffect(() => {
    const sim = simRef.current;
    if (sim.lastRunId === runId) return;
    sim.lastRunId = runId;

    const canvas = canvasRef.current;
    const width = canvas ? canvas.clientWidth : window.innerWidth;
    const height = canvas ? canvas.clientHeight : window.innerHeight;

    sim.playerX = width / 2;
    sim.playerVx = 0;
    sim.playerY = height * 0.78;
    sim.squashX = 1;
    sim.squashY = 1;
    sim.tilt = 0;
    sim.score = 0;
    sim.shields = MAX_SHIELDS;
    sim.distance = 0;
    sim.targetDistance = getLevelTargetDistance(1);
    sim.nitro = 65;
    sim.isBoosting = false;
    sim.speed = 360;
    sim.invulnTimer = 1.2;
    sim.hitstopTimer = 0;
    sim.hitFlashTimer = 0;
    sim.shakeIntensity = 0;
    sim.gateActive = false;
    sim.gateY = -120;
    sim.gateTriggered = false;
    sim.traffic = [];
    sim.pickups = [];
    sim.spawnTimer = 0.5;
    sim.pickupTimer = 1.0;
    sim.pointerTargetX = null;

    const biome = getBiomeForLevel(1);
    callbacksRef.current.onShieldChange(sim.shields);
    callbacksRef.current.onHudUpdate({
      level: 1,
      score: 0,
      shields: sim.shields,
      maxShields: MAX_SHIELDS,
      distance: 0,
      targetDistance: sim.targetDistance,
      nitro: sim.nitro,
      speedKmh: 110,
      biomeName: biome.name,
    });
  }, [runId]);

  // Advance level when quiz solved
  useEffect(() => {
    const sim = simRef.current;
    if (levelAdvanceId === 0 || sim.lastAdvanceId === levelAdvanceId) return;
    sim.lastAdvanceId = levelAdvanceId;

    // Bonus points for passing quiz gate + fresh stretch
    sim.score += 250;
    sim.distance = 0;
    sim.targetDistance = getLevelTargetDistance(level);
    sim.nitro = Math.min(100, sim.nitro + 35);
    sim.invulnTimer = 1.8;
    sim.gateActive = false;
    sim.gateY = -120;
    sim.gateTriggered = false;
    sim.traffic = [];
    sim.pickups = [];
    sim.spawnTimer = 0.7;
    sim.pickupTimer = 0.9;

    const biome = getBiomeForLevel(level);
    callbacksRef.current.onHudUpdate({
      level,
      score: Math.floor(sim.score),
      shields: sim.shields,
      maxShields: MAX_SHIELDS,
      distance: 0,
      targetDistance: sim.targetDistance,
      nitro: Math.round(sim.nitro),
      speedKmh: Math.round(sim.speed * 0.34),
      biomeName: biome.name,
    });
  }, [levelAdvanceId, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heldKeys = new Set<string>();
    let spaceJustPressed = false;

    const spawnParticles = (
      x: number,
      y: number,
      count: number,
      color: string,
      speedSpread: number
    ) => {
      const pool = simRef.current.particles;
      let spawned = 0;
      for (let i = 0; i < pool.length && spawned < count; i++) {
        if (!pool[i].active) {
          const angle = Math.random() * Math.PI * 2;
          const mag = 40 + Math.random() * speedSpread;
          pool[i].active = true;
          pool[i].x = x;
          pool[i].y = y;
          pool[i].vx = Math.cos(angle) * mag;
          pool[i].vy = Math.sin(angle) * mag;
          pool[i].life = 0.35 + Math.random() * 0.25;
          pool[i].maxLife = pool[i].life;
          pool[i].size = 3 + Math.random() * 4;
          pool[i].color = color;
          spawned++;
        }
      }
    };

    const getRoadGeometry = (viewW: number) => {
      const roadWidth = Math.min(460, Math.max(280, viewW * 0.56));
      const roadLeft = (viewW - roadWidth) / 2;
      const laneWidth = roadWidth / LANE_COUNT;
      return { roadWidth, roadLeft, laneWidth };
    };

    const seedScenery = (viewW: number, viewH: number) => {
      const sim = simRef.current;
      if (sim.scenery.length > 0) return;
      const { roadLeft, roadWidth } = getRoadGeometry(viewW);
      for (let i = 0; i < 18; i++) {
        const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
        const margin = 42;
        const x =
          side === 'left'
            ? Math.max(24, roadLeft - margin - Math.random() * Math.max(40, roadLeft - 70))
            : Math.min(
                viewW - 24,
                roadLeft + roadWidth + margin + Math.random() * Math.max(40, viewW - (roadLeft + roadWidth) - 70)
              );
        const roll = Math.random();
        const kind = roll < 0.22 ? 'lamp' : roll < 0.35 ? 'rock' : 'tree';
        sim.scenery.push({
          x:
            kind === 'lamp'
              ? side === 'left'
                ? roadLeft - 24
                : roadLeft + roadWidth + 24
              : x,
          y: (i / 18) * (viewH + 160) - 80,
          side,
          kind,
          scale: 0.8 + Math.random() * 0.45,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sim = simRef.current;
      if (sim.playerX === 0) sim.playerX = w / 2;
      const { roadLeft, roadWidth } = getRoadGeometry(w);
      sim.playerX = Math.max(roadLeft + 28, Math.min(roadLeft + roadWidth - 28, sim.playerX));
      sim.playerY = h * 0.78;
      sim.scenery = [];
      seedScenery(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (
        code === 'ArrowLeft' ||
        code === 'ArrowRight' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'Space'
      ) {
        if (stateRef.current === 'PLAYING') {
          e.preventDefault();
        }
      }
      if (!heldKeys.has(code) && code === 'Space') {
        spaceJustPressed = true;
      }
      heldKeys.add(code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    const clearKeys = () => {
      heldKeys.clear();
      simRef.current.pointerTargetX = null;
      simRef.current.pointerBoost = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (stateRef.current !== 'PLAYING') return;
      simRef.current.pointerTargetX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (stateRef.current !== 'PLAYING') return;
      if (e.buttons > 0 || e.pointerType === 'touch') {
        simRef.current.pointerTargetX = e.clientX;
      }
    };

    const onPointerUp = () => {
      simRef.current.pointerTargetX = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let rafId = 0;
    let lastTime = performance.now();

    const spawnTrafficRow = (viewW: number) => {
      const sim = simRef.current;
      const curLevel = levelRef.current;
      const { roadLeft, laneWidth } = getRoadGeometry(viewW);

      const lane = Math.floor(Math.random() * LANE_COUNT);
      const x = roadLeft + lane * laneWidth + laneWidth / 2;

      // Avoid overlapping an existing car near the top spawn zone
      const tooClose = sim.traffic.some((t) => t.lane === lane && t.y < 140);
      if (tooClose) return;

      const roll = Math.random();
      let kind: TrafficKind = 'sedan';
      let w = 42;
      let h = 72;
      let speedOffset = 150 + Math.random() * 75;

      if (roll < 0.16 && curLevel >= 2) {
        kind = 'barrier';
        w = Math.min(54, laneWidth * 0.68);
        h = 24;
        speedOffset = 0;
      } else if (roll < 0.34) {
        kind = 'truck';
        w = 48;
        h = 104;
        speedOffset = 115 + Math.random() * 40;
      } else if (roll < 0.62) {
        kind = 'suv';
        w = 44;
        h = 80;
        speedOffset = 140 + Math.random() * 60;
      }

      const palette = TRAFFIC_PALETTE[Math.floor(Math.random() * TRAFFIC_PALETTE.length)];
      const mult = getLevelTrafficSpeedMultiplier(curLevel);

      // Higher levels occasionally telegraph a lane change
      const willChangeLane = curLevel >= 2 && kind !== 'barrier' && Math.random() < 0.25;
      let targetLane = lane;
      if (willChangeLane) {
        if (lane === 0) targetLane = 1;
        else if (lane === LANE_COUNT - 1) targetLane = LANE_COUNT - 2;
        else targetLane = Math.random() < 0.5 ? lane - 1 : lane + 1;
      }

      sim.traffic.push({
        id: sim.nextEntityId++,
        kind,
        lane,
        targetLane,
        x,
        y: -h - 30,
        w,
        h,
        speed: speedOffset * mult,
        color: palette.color,
        accent: palette.accent,
        laneChangeTimer: willChangeLane ? 0.85 : 0,
        isChangingLane: false,
      });
    };

    const spawnPickup = (viewW: number) => {
      const sim = simRef.current;
      const { roadLeft, laneWidth } = getRoadGeometry(viewW);
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const x = roadLeft + lane * laneWidth + laneWidth / 2;

      const needsShield = sim.shields < MAX_SHIELDS && Math.random() < 0.22;
      sim.pickups.push({
        id: sim.nextEntityId++,
        kind: needsShield ? 'shield' : 'core',
        x,
        y: -30,
        r: 14,
        phase: Math.random() * Math.PI * 2,
      });
    };

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const viewW = canvas.clientWidth || window.innerWidth;
      const viewH = canvas.clientHeight || window.innerHeight;
      const { roadWidth, roadLeft, laneWidth } = getRoadGeometry(viewW);
      const state = stateRef.current;
      const curLevel = levelRef.current;
      const biome = getBiomeForLevel(curLevel);
      const sim = simRef.current;

      sim.timeSec += dt;

      // Simulation update
      const isLiveMenu = state === 'TITLE_MENU';
      const isPlaying = state === 'PLAYING';

      if (isLiveMenu || isPlaying) {
        if (sim.hitstopTimer > 0) {
          sim.hitstopTimer = Math.max(0, sim.hitstopTimer - dt);
        } else {
          // Recover squash & shake
          sim.squashX += (1 - sim.squashX) * Math.min(1, dt * 14);
          sim.squashY += (1 - sim.squashY) * Math.min(1, dt * 14);
          sim.shakeIntensity = Math.max(0, sim.shakeIntensity - dt * 28);
          sim.invulnTimer = Math.max(0, sim.invulnTimer - dt);
          sim.hitFlashTimer = Math.max(0, sim.hitFlashTimer - dt);

          // Speed & boost logic
          const baseSpeed = 370 + (curLevel - 1) * 34;
          let targetSpeed = baseSpeed;
          let boosting = false;

          if (isPlaying) {
            if (heldKeys.has('ArrowUp') || heldKeys.has('KeyW')) {
              targetSpeed += 120;
            }
            if (heldKeys.has('ArrowDown') || heldKeys.has('KeyS')) {
              targetSpeed -= 130;
            }
            const wantsBoost =
              (heldKeys.has('Space') || externalBoostRef.current) && sim.nitro > 4;
            if (wantsBoost) {
              if (spaceJustPressed) {
                soundEngine.playBoost();
                sim.squashX = 0.88;
                sim.squashY = 1.14;
              }
              boosting = true;
              targetSpeed += 230;
              sim.nitro = Math.max(0, sim.nitro - dt * 36);
            } else {
              sim.nitro = Math.min(100, sim.nitro + dt * 7);
            }
          } else {
            // Live title screen gentle cruise
            targetSpeed = 290;
          }

          spaceJustPressed = false;
          sim.isBoosting = boosting;
          sim.speed += (targetSpeed - sim.speed) * Math.min(1, dt * 6);
          sim.roadOffset = (sim.roadOffset + sim.speed * dt) % 120;

          // Player horizontal steering
          if (isPlaying) {
            let steerInput = 0;
            if (heldKeys.has('ArrowLeft') || heldKeys.has('KeyA')) steerInput -= 1;
            if (heldKeys.has('ArrowRight') || heldKeys.has('KeyD')) steerInput += 1;

            if (steerInput !== 0) {
              sim.pointerTargetX = null;
              const steerAccel = 2600;
              sim.playerVx += steerInput * steerAccel * dt;
              sim.playerVx = Math.max(-460, Math.min(460, sim.playerVx));
            } else if (sim.pointerTargetX !== null) {
              const diff = sim.pointerTargetX - sim.playerX;
              sim.playerVx = Math.max(-520, Math.min(520, diff * 9));
            } else {
              sim.playerVx *= Math.pow(0.001, dt);
              if (Math.abs(sim.playerVx) < 4) sim.playerVx = 0;
            }

            sim.playerX += sim.playerVx * dt;
            const minX = roadLeft + sim.playerW / 2 + 10;
            const maxX = roadLeft + roadWidth - sim.playerW / 2 - 10;
            if (sim.playerX < minX) {
              sim.playerX = minX;
              sim.playerVx = 0;
            } else if (sim.playerX > maxX) {
              sim.playerX = maxX;
              sim.playerVx = 0;
            }
            sim.tilt = (sim.playerVx / 460) * 0.14;
          } else {
            // Gentle autonomous weave on Title Screen
            const centerX = roadLeft + roadWidth / 2;
            const targetX = centerX + Math.sin(sim.timeSec * 0.85) * (roadWidth * 0.28);
            const prevX = sim.playerX;
            sim.playerX += (targetX - sim.playerX) * Math.min(1, dt * 3);
            sim.tilt = Math.max(-0.12, Math.min(0.12, ((sim.playerX - prevX) / Math.max(dt, 0.01)) * 0.0005));
          }

          // Scenery scroll
          for (const prop of sim.scenery) {
            prop.y += sim.speed * dt;
            if (prop.y > viewH + 60) {
              prop.y = -60;
            }
          }

          // Distance & Checkpoint Gate progression
          if (isPlaying) {
            const metersDelta = (sim.speed / 18) * dt;
            sim.distance += metersDelta;
            sim.score += metersDelta * 1.6;

            if (!sim.gateActive && sim.distance >= sim.targetDistance - 65) {
              sim.gateActive = true;
              sim.gateY = -90;
            }

            if (sim.gateActive) {
              sim.gateY += sim.speed * dt;
              if (!sim.gateTriggered && sim.gateY >= sim.playerY - 12) {
                sim.gateTriggered = true;
                soundEngine.playGateReached();
                callbacksRef.current.onReachGate(Math.floor(sim.score), sim.shields);
              }
            }
          }

          // Traffic spawning (pause spawns once gate is approaching)
          sim.spawnTimer -= dt;
          if (sim.spawnTimer <= 0 && !sim.gateActive) {
            spawnTrafficRow(viewW);
            const interval = Math.max(0.42, 1.05 - (curLevel - 1) * 0.1);
            sim.spawnTimer = interval + Math.random() * 0.35;
          }

          // Pickup spawning
          if (isPlaying && !sim.gateActive) {
            sim.pickupTimer -= dt;
            if (sim.pickupTimer <= 0) {
              spawnPickup(viewW);
              sim.pickupTimer = 1.6 + Math.random() * 1.1;
            }
          }

          // Update Traffic
          for (let i = sim.traffic.length - 1; i >= 0; i--) {
            const car = sim.traffic[i];
            const relSpeed = car.kind === 'barrier' ? sim.speed : sim.speed - car.speed;
            car.y += relSpeed * dt;

            // Telegraph & perform lane change
            if (car.laneChangeTimer > 0) {
              car.laneChangeTimer -= dt;
              if (car.laneChangeTimer <= 0) {
                car.isChangingLane = true;
              }
            }
            if (car.isChangingLane) {
              const targetX = roadLeft + car.targetLane * laneWidth + laneWidth / 2;
              const diff = targetX - car.x;
              if (Math.abs(diff) < 2) {
                car.x = targetX;
                car.lane = car.targetLane;
                car.isChangingLane = false;
              } else {
                car.x += Math.sign(diff) * Math.min(Math.abs(diff), 130 * dt);
              }
            }

            // Collision check with player (only during PLAYING)
            if (isPlaying && sim.invulnTimer <= 0) {
              const hitW = (sim.playerW + car.w) * 0.42;
              const hitH = (sim.playerH + car.h) * 0.42;
              if (
                Math.abs(sim.playerX - car.x) < hitW &&
                Math.abs(sim.playerY - car.y) < hitH
              ) {
                soundEngine.playCrash();
                sim.shields = Math.max(0, sim.shields - 1);
                sim.invulnTimer = 1.4;
                sim.hitstopTimer = 0.048;
                sim.hitFlashTimer = 0.12;
                sim.shakeIntensity = 12;
                sim.squashX = 1.18;
                sim.squashY = 0.84;
                sim.speed = Math.max(220, sim.speed * 0.65);

                spawnParticles(
                  (sim.playerX + car.x) / 2,
                  (sim.playerY + car.y) / 2,
                  18,
                  '#F97316',
                  220
                );

                // Push obstacle away cleanly so player never gets stuck
                sim.traffic.splice(i, 1);

                callbacksRef.current.onShieldChange(sim.shields);
                if (sim.shields <= 0) {
                  callbacksRef.current.onGameOver(Math.floor(sim.score));
                }
                continue;
              }
            }

            if (car.y > viewH + 140 || car.y < -260) {
              sim.traffic.splice(i, 1);
            }
          }

          // Update Pickups
          for (let i = sim.pickups.length - 1; i >= 0; i--) {
            const p = sim.pickups[i];
            p.y += sim.speed * dt;

            if (isPlaying) {
              const dx = sim.playerX - p.x;
              const dy = sim.playerY - p.y;
              if (dx * dx + dy * dy < (sim.playerW * 0.55 + p.r) ** 2) {
                if (p.kind === 'core') {
                  soundEngine.playPickup();
                  sim.score += 50;
                  sim.nitro = Math.min(100, sim.nitro + 22);
                  spawnParticles(p.x, p.y, 12, '#FBBF24', 150);
                } else {
                  soundEngine.playRepair();
                  sim.shields = Math.min(MAX_SHIELDS, sim.shields + 1);
                  sim.score += 35;
                  callbacksRef.current.onShieldChange(sim.shields);
                  spawnParticles(p.x, p.y, 14, '#10B981', 160);
                }
                sim.pickups.splice(i, 1);
                continue;
              }
            }

            if (p.y > viewH + 60) {
              sim.pickups.splice(i, 1);
            }
          }

          // Update Particles
          for (const pt of sim.particles) {
            if (!pt.active) continue;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt + sim.speed * 0.35 * dt;
            pt.life -= dt;
            if (pt.life <= 0) pt.active = false;
          }

          // Throttled HUD sync (~12Hz)
          if (isPlaying) {
            sim.hudSyncTimer -= dt;
            if (sim.hudSyncTimer <= 0) {
              sim.hudSyncTimer = 0.08;
              callbacksRef.current.onHudUpdate({
                level: curLevel,
                score: Math.floor(sim.score),
                shields: sim.shields,
                maxShields: MAX_SHIELDS,
                distance: Math.min(sim.targetDistance, Math.floor(sim.distance)),
                targetDistance: sim.targetDistance,
                nitro: Math.round(sim.nitro),
                speedKmh: Math.round(sim.speed * 0.34),
                biomeName: biome.name,
              });
            }
          }
        }
      }

      // ================= RENDER =================
      ctx.save();
      if (sim.shakeIntensity > 0.2) {
        const sx = (Math.random() - 0.5) * sim.shakeIntensity;
        const sy = (Math.random() - 0.5) * sim.shakeIntensity;
        ctx.translate(sx, sy);
      }

      // Terrain grass / desert / slate
      ctx.fillStyle = biome.grassBase;
      ctx.fillRect(-16, -16, viewW + 32, viewH + 32);

      // Subtle scrolling terrain stripes for speed sensation
      ctx.fillStyle = biome.grassStripe;
      const stripeStep = 120;
      const stripeOffset = sim.roadOffset % stripeStep;
      for (let y = -stripeStep + stripeOffset; y < viewH + stripeStep; y += stripeStep) {
        ctx.fillRect(0, y, roadLeft, 48);
        ctx.fillRect(roadLeft + roadWidth, y, viewW - (roadLeft + roadWidth), 48);
      }

      // Road shoulders
      ctx.fillStyle = biome.shoulderColor;
      ctx.fillRect(roadLeft - 14, 0, roadWidth + 28, viewH);

      // Curbs (alternating rumble strips)
      const curbH = 30;
      const curbOffset = sim.roadOffset % (curbH * 2);
      for (let y = -curbH * 2 + curbOffset; y < viewH + curbH; y += curbH) {
        const isA = Math.floor((y - curbOffset) / curbH) % 2 === 0;
        ctx.fillStyle = isA ? biome.curbA : biome.curbB;
        ctx.fillRect(roadLeft - 8, y, 8, curbH + 1);
        ctx.fillRect(roadLeft + roadWidth, y, 8, curbH + 1);
      }

      // Asphalt surface
      ctx.fillStyle = biome.roadBase;
      ctx.fillRect(roadLeft, 0, roadWidth, viewH);

      // Dashed lane dividers
      ctx.fillStyle = biome.roadStripe;
      const dashGap = 60;
      const dashLen = 30;
      const dashOffset = sim.roadOffset % dashGap;
      for (let lane = 1; lane < LANE_COUNT; lane++) {
        const lx = roadLeft + lane * laneWidth - 2;
        for (let y = -dashGap + dashOffset; y < viewH + dashGap; y += dashGap) {
          ctx.globalAlpha = 0.72;
          ctx.fillRect(lx, y, 4, dashLen);
        }
      }
      ctx.globalAlpha = 1;

      // Scenery props outside road
      for (const prop of sim.scenery) {
        drawSceneryProp(ctx, prop, biome.treePrimary, biome.treeSecondary, biome.isNight);
      }

      // Checkpoint Gate on tarmac
      if (sim.gateActive) {
        drawCheckpointGate(
          ctx,
          roadLeft,
          roadWidth,
          sim.gateY,
          curLevel + 1,
          sim.timeSec
        );
      }

      // Pickups
      for (const p of sim.pickups) {
        drawPickupEntity(ctx, p, sim.timeSec);
      }

      // Traffic
      for (const car of sim.traffic) {
        drawTrafficEntity(ctx, car, sim.timeSec, biome.isNight);
      }

      // Player car
      drawPlayerCar(
        ctx,
        sim.playerX,
        sim.playerY,
        sim.playerW,
        sim.playerH,
        sim.tilt,
        sim.squashX,
        sim.squashY,
        sim.isBoosting,
        biome.isNight,
        sim.invulnTimer,
        sim.hitFlashTimer
      );

      // Particles
      for (const pt of sim.particles) {
        if (!pt.active) continue;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Boost speed lines along edges
      if (sim.isBoosting) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const lx = i < 4 ? 20 + i * 24 : viewW - 20 - (i - 4) * 24;
          const ly = ((sim.timeSec * 1400 + i * 190) % (viewH + 120)) - 60;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly + 48);
          ctx.stroke();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full cursor-pointer touch-none"
      aria-label="Highway racing playfield"
    />
  );
};
