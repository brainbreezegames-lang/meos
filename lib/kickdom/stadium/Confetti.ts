/**
 * Confetti - one InstancedMesh of fluttering paper rectangles with a tiny
 * CPU simulation (gravity, drag, flutter, tumble). Cheap enough for 3000 pieces.
 */
import * as THREE from 'three';

interface Piece {
  alive: boolean;
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  wx: number; wy: number; wz: number;
  life: number; maxLife: number;
  flutter: number;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export class Confetti {
  readonly mesh: THREE.InstancedMesh;
  private pieces: Piece[] = [];
  private cursor = 0;

  constructor(readonly capacity = 3000) {
    const geo = new THREE.PlaneGeometry(0.2, 0.12);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.05 });
    this.mesh = new THREE.InstancedMesh(geo, mat, capacity);
    this.mesh.name = 'Confetti';
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < capacity; i++) {
      this.pieces.push({ alive: false, px: 0, py: -100, pz: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, wx: 0, wy: 0, wz: 0, life: 0, maxLife: 1, flutter: 0 });
      _dummy.position.set(0, -100, 0);
      _dummy.scale.setScalar(0.0001);
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Emit `count` pieces from `origin`. `dir` is the mean launch direction, `spread` the cone (radians).
   */
  burst(origin: THREE.Vector3, count: number, colors: THREE.ColorRepresentation[], dir = new THREE.Vector3(0, 1, 0), spread = 0.6, speed = 14) {
    const d = dir.clone().normalize();
    const up = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const a = new THREE.Vector3().crossVectors(d, up).normalize();
    const b = new THREE.Vector3().crossVectors(d, a).normalize();
    for (let n = 0; n < count; n++) {
      const p = this.pieces[this.cursor];
      this.cursor = (this.cursor + 1) % this.capacity;
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * spread;
      const v = d.clone().multiplyScalar(Math.cos(r)).addScaledVector(a, Math.sin(r) * Math.cos(ang)).addScaledVector(b, Math.sin(r) * Math.sin(ang));
      const s = speed * (0.55 + Math.random() * 0.75);
      p.alive = true;
      p.px = origin.x + (Math.random() - 0.5) * 0.6; p.py = origin.y; p.pz = origin.z + (Math.random() - 0.5) * 0.6;
      p.vx = v.x * s; p.vy = v.y * s; p.vz = v.z * s;
      p.rx = Math.random() * Math.PI; p.ry = Math.random() * Math.PI; p.rz = Math.random() * Math.PI;
      p.wx = (Math.random() - 0.5) * 12; p.wy = (Math.random() - 0.5) * 12; p.wz = (Math.random() - 0.5) * 12;
      p.life = 0; p.maxLife = 4.5 + Math.random() * 3.5;
      p.flutter = Math.random() * Math.PI * 2;
      _color.set(colors[Math.floor(Math.random() * colors.length)]);
      this.mesh.setColorAt(this.pieceIndex(p), _color);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  /** Gentle rain from a ring (roof edge) - `ring` points in world space. */
  rain(ring: THREE.Vector3[], perPoint: number, colors: THREE.ColorRepresentation[]) {
    for (const pt of ring) this.burst(pt, perPoint, colors, new THREE.Vector3(0, -0.2, 0), 1.2, 2.5);
  }

  private pieceIndex(p: Piece) { return this.pieces.indexOf(p); }

  update(dt: number, time: number) {
    if (dt <= 0) return;
    const g = -9.81 * 0.28;         // paper falls slowly
    let any = false;
    for (let i = 0; i < this.capacity; i++) {
      const p = this.pieces[i];
      if (!p.alive) continue;
      any = true;
      p.life += dt;
      if (p.life > p.maxLife || p.py < -1) {
        p.alive = false;
        _dummy.position.set(0, -100, 0);
        _dummy.scale.setScalar(0.0001);
        _dummy.updateMatrix();
        this.mesh.setMatrixAt(i, _dummy.matrix);
        continue;
      }
      const drag = Math.pow(0.9, dt * 10);
      p.vx *= drag; p.vz *= drag;
      p.vy = p.vy * Math.pow(0.86, dt * 10) + g * dt;
      // flutter: side-slip that oscillates
      const fl = Math.sin(time * 4.2 + p.flutter);
      p.px += (p.vx + fl * 0.9) * dt;
      p.pz += (p.vz + Math.cos(time * 3.7 + p.flutter) * 0.9) * dt;
      p.py += p.vy * dt;
      p.rx += p.wx * dt; p.ry += p.wy * dt; p.rz += p.wz * dt;
      const fade = p.life > p.maxLife - 0.8 ? (p.maxLife - p.life) / 0.8 : 1;
      _dummy.position.set(p.px, p.py, p.pz);
      _dummy.rotation.set(p.rx, p.ry, p.rz);
      _dummy.scale.setScalar(Math.max(0.0001, fade));
      _dummy.updateMatrix();
      this.mesh.setMatrixAt(i, _dummy.matrix);
    }
    if (any) this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
