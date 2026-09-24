/**
 * StadiumRuntime - the Kickdom Arena as a self-contained Three.js scene.
 *
 * Loads the stadium GLB (structure, goals, seats, lights), instances the fan
 * library on top, and adds sky/skyline/haze, bloom, confetti, sweeping
 * spotlights, neon pulses, camera presets and the procedural soundscape.
 *
 *   const rt = await StadiumRuntime.create(canvas, { assetBase: '/kickdom' });
 *   rt.goal('red');        // confetti + roar + horn + neon strobe + spotlight sweep
 *   rt.wave();             // mexican wave
 *   rt.whistle('triple');  // full-time
 *   rt.setCamera('broadcast');
 *
 * The game can drop its own players / ball into `rt.scene` (metres, Y-up,
 * pitch centre at the origin, red goal at +X, blue goal at -X).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CrowdSystem, type FanPlacement, type Team } from './CrowdSystem';
import { Confetti } from './Confetti';
import { Environment } from './Environment';
import { StadiumAudio } from './StadiumAudio';

export type { Team };
export type Quality = 'high' | 'medium' | 'low';
export type CameraPreset = 'broadcast' | 'topdown' | 'pitch' | 'goal_red' | 'goal_blue' | 'cinematic';

export interface RuntimeOptions {
  /** URL prefix where KickdomArena_NoFans.glb, KickdomFans_Library.glb and fans_placement.json live */
  assetBase?: string;
  quality?: Quality;
  onProgress?: (fraction: number, label: string) => void;
  /** show a bouncing demo ball at the centre spot */
  demoBall?: boolean;
}

export const TEAM_COLORS: Record<Team, string> = { red: '#ff3038', blue: '#2f73ff' };
export const GOAL_POSITIONS: Record<Team, THREE.Vector3> = {
  red: new THREE.Vector3(24, 1.6, 0),
  blue: new THREE.Vector3(-24, 1.6, 0),
};

const PRESETS: Record<CameraPreset, { pos: THREE.Vector3; target: THREE.Vector3; fov?: number }> = {
  broadcast: { pos: new THREE.Vector3(0, 46, 96), target: new THREE.Vector3(0, 2, 0), fov: 40 },
  topdown: { pos: new THREE.Vector3(0, 128, 48), target: new THREE.Vector3(0, 0, -2), fov: 38 },
  pitch: { pos: new THREE.Vector3(-16, 2.4, 5), target: new THREE.Vector3(26, 3.5, 0), fov: 58 },
  goal_red: { pos: new THREE.Vector3(6, 5.5, -19), target: new THREE.Vector3(24, 2.5, 0), fov: 45 },
  goal_blue: { pos: new THREE.Vector3(-6, 5.5, 19), target: new THREE.Vector3(-24, 2.5, 0), fov: 45 },
  cinematic: { pos: new THREE.Vector3(-74, 40, 70), target: new THREE.Vector3(0, 6, 0), fov: 42 },
};

interface NeonMat { mat: THREE.MeshStandardMaterial; base: number; team: Team | 'white' | 'lamp' }

export class StadiumRuntime {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly controls: OrbitControls;
  readonly audio = new StadiumAudio();
  readonly timer = new THREE.Timer();
  crowd!: CrowdSystem;
  confetti!: Confetti;
  env!: Environment;
  stadium!: THREE.Group;
  private composer!: EffectComposer;
  private bloom!: UnrealBloomPass;
  private neon: NeonMat[] = [];
  private strobe: { team: Team; t: number } | null = null;
  private shake = 0;
  private camTween: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number; dur: number } | null = null;
  private ball: THREE.Mesh | null = null;
  private roofMeshes: THREE.Mesh[] = [];
  private raf = 0;
  private quality: Quality;
  private disposed = false;
  private fpsAcc = 0; private fpsN = 0;
  stats = { fps: 0, triangles: 0, fans: 0, drawCalls: 0 };
  /** hook for the game: fired after every simulated frame */
  onFrame: ((dt: number, time: number) => void) | null = null;

  private constructor(readonly canvas: HTMLCanvasElement, private opts: RuntimeOptions) {
    this.quality = opts.quality ?? 'high';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.info.autoReset = false;
    this.renderer.shadowMap.enabled = this.quality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.3, 2600);
    this.camera.position.copy(PRESETS.cinematic.pos);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 260;
    this.controls.target.copy(PRESETS.cinematic.target);
  }

  static async create(canvas: HTMLCanvasElement, opts: RuntimeOptions = {}) {
    const rt = new StadiumRuntime(canvas, opts);
    await rt.load();
    rt.setupPost();
    rt.resize();
    rt.setCamera('cinematic', 0);
    rt.controls.autoRotate = true;
    rt.controls.autoRotateSpeed = 0.35;
    rt.loop();
    return rt;
  }

  // ------------------------------------------------------------------ loading
  private async load() {
    const base = (this.opts.assetBase ?? '/kickdom').replace(/\/$/, '');
    const progress = (f: number, l: string) => this.opts.onProgress?.(f, l);
    const q = this.quality;
    this.env = new Environment(this.scene, { shadows: q !== 'low', shadowSize: q === 'high' ? 2048 : 1024 });

    const loader = new GLTFLoader();
    progress(0.02, 'Loading arena');
    const [stadium, fansLib, placementsRes] = await Promise.all([
      loader.loadAsync(`${base}/KickdomArena_NoFans.glb`, (e) => { if (e.total) progress(0.05 + (e.loaded / e.total) * 0.5, 'Loading arena'); }),
      loader.loadAsync(`${base}/KickdomFans_Library.glb`),
      fetch(`${base}/fans_placement.json`).then((r) => r.json() as Promise<{ fans: FanPlacement[] }>),
    ]);
    progress(0.6, 'Preparing materials');
    this.stadium = this.mergeStatic(stadium.scene);
    this.stadium.name = 'KickdomArena';
    this.stadium.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      const isFloor = /Pitch_Floor|Concourse|Stand_Step|Stand_Riser|Concrete_Dark|Pitch_Groove|Pitch_Line/.test(mat.name);
      m.castShadow = !isFloor && q !== 'low' && !mat.transparent && !/LED|Neon|Seat_|Floodlight_Lamp/.test(mat.name);
      m.receiveShadow = q !== 'low';
      if (mat.transparent) { mat.depthWrite = false; mat.side = THREE.DoubleSide; }
      // Blender/Cycles emission strengths are far too hot for real-time ACES + bloom: re-balance here
      const EMISSIVE: Record<string, number> = { Neon_Red: 2.4, Neon_Blue: 2.4, LED_White: 1.9, Floodlight_Lamp: 4.0, Net_Red: 0.7, Net_Blue: 0.7, GoalFloor_Red: 0.9, GoalFloor_Blue: 0.9 };
      if (mat.name in EMISSIVE) mat.emissiveIntensity = EMISSIVE[mat.name];
      if (mat.name === 'Neon_Red') this.neon.push({ mat, base: mat.emissiveIntensity, team: 'red' });
      else if (mat.name === 'Neon_Blue') this.neon.push({ mat, base: mat.emissiveIntensity, team: 'blue' });
      else if (mat.name === 'LED_White') this.neon.push({ mat, base: mat.emissiveIntensity, team: 'white' });
      else if (mat.name === 'Floodlight_Lamp') this.neon.push({ mat, base: mat.emissiveIntensity, team: 'lamp' });
      if (mat.name === 'Pitch_Line') { mat.polygonOffset = true; mat.polygonOffsetFactor = -1; }
    });
    // glTF lights come in far too strong for our exposure - keep the sun in Environment instead
    this.stadium.traverse((o) => { if ((o as THREE.Light).isLight) o.visible = false; });
    this.scene.add(this.stadium);

    progress(0.7, 'Seating the crowd');
    this.crowd = new CrowdSystem(fansLib.scene, placementsRes.fans, { castShadow: q === 'high' });
    this.scene.add(this.crowd.group);
    this.stats.fans = this.crowd.count;

    this.confetti = new Confetti(q === 'low' ? 1200 : 3000);
    this.scene.add(this.confetti.mesh);

    if (this.opts.demoBall !== false) this.addDemoBall();
    progress(1, 'Ready');
  }

  /**
   * The GLB keeps every panel, pillar and seat as its own node (handy in Blender / engines
   * with their own batching). For WebGL we bake them into one mesh per material so the whole
   * static stadium renders in ~30 draw calls. Collision meshes (COL_*) are kept separately, hidden.
   */
  private mergeStatic(src: THREE.Group) {
    src.updateWorldMatrix(true, true);
    const buckets = new Map<string, { mat: THREE.Material; roof: boolean; geos: THREE.BufferGeometry[] }>();
    const out = new THREE.Group();
    src.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (o.name.startsWith('COL_')) {
        const col = new THREE.Mesh(m.geometry, m.material);
        col.name = o.name;
        col.visible = false;
        col.applyMatrix4(m.matrixWorld);
        col.userData = { ...o.userData };
        out.add(col);
        return;
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const groups = m.geometry.groups.length ? m.geometry.groups : [{ start: 0, count: Infinity, materialIndex: 0 }];
      for (const grp of groups) {
        const mat = mats[grp.materialIndex ?? 0];
        let g = m.geometry;
        if (m.geometry.groups.length > 1) {
          // split multi-material primitive into one geometry per group
          const idx = m.geometry.index!;
          const sub = new THREE.BufferGeometry();
          sub.setAttribute('position', m.geometry.getAttribute('position'));
          sub.setAttribute('normal', m.geometry.getAttribute('normal'));
          sub.setIndex(new THREE.BufferAttribute(idx.array.slice(grp.start, grp.start + grp.count), 1));
          g = sub;
        }
        const c = new THREE.BufferGeometry();
        c.setAttribute('position', g.getAttribute('position').clone());
        c.setAttribute('normal', g.getAttribute('normal').clone());
        c.setIndex(g.index!.clone());
        c.applyMatrix4(m.matrixWorld);
        const roof = /^(Roof_|Banner_)/.test(o.name);      // roof truss + hanging banners can be hidden for top-down game cameras
        const key = `${mat.uuid}|${roof}`;
        if (!buckets.has(key)) buckets.set(key, { mat, roof, geos: [] });
        buckets.get(key)!.geos.push(c);
      }
    });
    for (const { mat, roof, geos } of buckets.values()) {
      const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
      if (!merged) continue;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, mat);
      mesh.name = `${roof ? 'Roof' : 'Static'}_${mat.name}`;
      if (roof) this.roofMeshes.push(mesh);
      out.add(mesh);
    }
    return out;
  }

  private addDemoBall() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f4f4f6';
    g.fillRect(0, 0, size, size);
    g.fillStyle = '#1c1b22';
    const hex = (x: number, y: number, r: number) => {
      g.beginPath();
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.closePath(); g.fill();
    };
    for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) hex(i * (size / 6) + (j % 2 ? size / 12 : 0), j * (size / 4) + size / 8, 30);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }));
    this.ball.name = 'DemoBall';
    this.ball.castShadow = true;
    this.scene.add(this.ball);
  }

  private setupPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.32, 0.28, 1.0);
    this.bloom.enabled = this.quality !== 'low';
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    const smaa = new SMAAPass();
    smaa.enabled = this.quality === 'high';
    this.composer.addPass(smaa);
  }

  // ------------------------------------------------------------------ game API
  /** Full goal celebration for a team. */
  goal(team: Team) {
    const col = TEAM_COLORS[team];
    const colors = [col, '#ffffff', col, '#ffd23f'];
    const gp = GOAL_POSITIONS[team].clone();
    const inward = new THREE.Vector3(team === 'red' ? -0.55 : 0.55, 1, 0);
    this.confetti.burst(gp.clone().setY(3.4), 700, colors, inward, 0.55, 18);
    this.confetti.burst(gp.clone().add(new THREE.Vector3(0, 4.5, 6)), 300, colors, new THREE.Vector3(inward.x, 1, -0.3), 0.5, 16);
    this.confetti.burst(gp.clone().add(new THREE.Vector3(0, 4.5, -6)), 300, colors, new THREE.Vector3(inward.x, 1, 0.3), 0.5, 16);
    // confetti rain from the roof over the scoring team's stands
    const ring: THREE.Vector3[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI - Math.PI / 2 + (team === 'red' ? 0 : Math.PI);
      ring.push(new THREE.Vector3(Math.cos(a) * 46, 27, -Math.sin(a) * 40));
    }
    this.confetti.rain(ring, 45, colors);
    this.crowd.celebrate(team, 8);
    this.env.sweepSpots(col, 7.5);
    this.strobe = { team, t: 0 };
    this.shake = 0.7;
    this.audio.goalCelebration(team);
  }

  wave() { this.crowd.startWave(Math.random() < 0.5 ? 1 : -1); this.audio.clapChant(5); }

  whistle(pattern: 'short' | 'long' | 'triple' = 'long') { this.audio.whistle(pattern); if (pattern === 'triple') this.audio.roar(0.7, 3); }

  kickoff() { this.audio.whistle('short'); this.audio.roar(0.5, 2.5); this.crowd.startWave(1); }

  async enableSound() { await this.audio.start(); this.audio.setExcitement(0.25); }
  setMuted(m: boolean) { this.audio.setMuted(m); }

  setCamera(preset: CameraPreset, duration = 1.4) {
    const p = PRESETS[preset];
    this.controls.autoRotate = preset === 'cinematic';
    if (p.fov) { this.camera.fov = p.fov; this.camera.updateProjectionMatrix(); }
    if (duration <= 0) {
      this.camera.position.copy(p.pos);
      this.controls.target.copy(p.target);
      this.camTween = null;
      return;
    }
    this.camTween = { from: this.camera.position.clone(), to: p.pos.clone(), tFrom: this.controls.target.clone(), tTo: p.target.clone(), t: 0, dur: duration };
  }

  /** Hide the roof truss + banners (recommended when the game camera looks straight down). */
  setRoofVisible(v: boolean) { for (const m of this.roofMeshes) m.visible = v; }

  setQuality(q: Quality) {
    this.quality = q;
    this.renderer.shadowMap.enabled = q !== 'low';
    this.bloom.enabled = q !== 'low';
    (this.composer.passes[3] as SMAAPass).enabled = q === 'high';
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : this.quality === 'medium' ? 1.5 : 1);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ------------------------------------------------------------------ loop
  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    this.timer.update();
    const dt = Math.min(0.05, this.timer.getDelta());
    const time = this.timer.getElapsed();
    this.step(dt, time);
    this.renderer.info.reset();
    this.composer.render();
    const info = this.renderer.info.render;
    this.stats.triangles = info.triangles;
    this.stats.drawCalls = info.calls;
    this.fpsAcc += dt; this.fpsN++;
    if (this.fpsAcc >= 0.5) { this.stats.fps = Math.round(this.fpsN / this.fpsAcc); this.fpsAcc = 0; this.fpsN = 0; }
  };

  private step(dt: number, time: number) {
    this.crowd.update(dt, time);
    this.confetti.update(dt, time);
    this.env.update(dt, time);

    // neon: gentle breathing at idle, team strobe on goals, white LEDs chase
    let strobeK = 0, strobeTeam: Team | null = null;
    if (this.strobe) {
      this.strobe.t += dt;
      strobeTeam = this.strobe.team;
      strobeK = this.strobe.t < 1.6 ? (Math.sin(this.strobe.t * 28) > 0 ? 1 : 0.15) : Math.max(0, 1 - (this.strobe.t - 1.6) / 4) * (0.6 + 0.4 * Math.sin(time * 6));
      if (this.strobe.t > 5.6) this.strobe = null;
    }
    for (const n of this.neon) {
      let k = 1 + 0.08 * Math.sin(time * 1.7 + (n.team === 'red' ? 0 : 2));
      if (n.team === 'lamp') k = 1 + 0.03 * Math.sin(time * 9.3);
      if (strobeTeam) {
        if (n.team === strobeTeam) k = 1 + strobeK * 1.6;
        else if (n.team === 'white') k = 1 + 0.5 * Math.abs(Math.sin(time * 10));
      }
      n.mat.emissiveIntensity = n.base * k;
    }

    // demo ball
    if (this.ball) {
      const b = Math.abs(Math.sin(time * 2.2));
      this.ball.position.set(0, 0.56 + b * b * 1.4, 0);
      this.ball.rotation.y += dt * 1.2;
      this.ball.rotation.x += dt * 0.7;
    }

    // camera tween + shake + controls
    if (this.camTween) {
      const tw = this.camTween;
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      this.camera.position.lerpVectors(tw.from, tw.to, e);
      this.controls.target.lerpVectors(tw.tFrom, tw.tTo, e);
      if (k >= 1) this.camTween = null;
    }
    this.controls.update();
    if (this.shake > 0) {
      this.shake -= dt;
      const a = this.shake * 0.12;
      this.camera.position.x += (Math.random() - 0.5) * a;
      this.camera.position.y += (Math.random() - 0.5) * a;
    }
    this.onFrame?.(dt, time);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.controls.dispose();
    this.crowd?.dispose();
    this.confetti?.dispose();
    this.env?.dispose();
    this.audio.dispose();
    this.stadium?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()); }
    });
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
