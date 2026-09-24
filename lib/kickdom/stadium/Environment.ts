/**
 * Environment - sky dome, distant city skyline, haze, sun/hemisphere lighting
 * and the four sweeping celebration spotlights.
 */
import * as THREE from 'three';

export class Environment {
  readonly group = new THREE.Group();
  readonly sun: THREE.DirectionalLight;
  readonly hemi: THREE.HemisphereLight;
  readonly spots: THREE.SpotLight[] = [];
  private spotTargets: THREE.Object3D[] = [];
  private sweep = 0;          // remaining seconds of spotlight sweep
  private sky: THREE.Mesh;

  constructor(scene: THREE.Scene, opts: { shadows: boolean; shadowSize: number }) {
    this.group.name = 'Environment';

    // ---- sky dome (gradient shader, unlit)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color('#2b4fd6') },
        mid: { value: new THREE.Color('#7f9dff') },
        horizon: { value: new THREE.Color('#c9d4ff') },
        ground: { value: new THREE.Color('#6f7590') },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top, mid, horizon, ground; varying vec3 vDir;
        void main(){
          float h = vDir.y;
          vec3 c = h < 0.0 ? mix(horizon, ground, clamp(-h*6.0,0.0,1.0))
                           : mix(horizon, mix(mid, top, smoothstep(0.15,0.85,h)), smoothstep(0.0,0.2,h));
          // soft sun glow
          float sun = pow(max(dot(vDir, normalize(vec3(0.45,0.55,0.3))), 0.0), 220.0);
          c += vec3(1.0,0.95,0.85) * sun * 0.9;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), skyMat);
    this.sky.name = 'SkyDome';
    this.group.add(this.sky);

    // ---- distant skyline: rings of towers with lit window strips, fades into haze
    const towers = new THREE.Group();
    towers.name = 'Skyline';
    const towerGeo = new THREE.BoxGeometry(1, 1, 1);
    const towerMats = ['#8e98c4', '#7f8ab8', '#9ca5cc', '#7480ae'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
    const rnd = mulberry32(7);
    for (let ring = 0; ring < 3; ring++) {
      const R = 260 + ring * 95;
      const n = 34 + ring * 12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd() * 0.12;
        const r = R + (rnd() - 0.5) * 50;
        const w = 12 + rnd() * 22, d = 12 + rnd() * 22, h = 30 + rnd() * rnd() * 150 + ring * 10;
        const m = new THREE.Mesh(towerGeo, towerMats[Math.floor(rnd() * towerMats.length)]);
        m.position.set(Math.cos(a) * r, h / 2 - 10, Math.sin(a) * r);
        m.scale.set(w, h, d);
        m.rotation.y = rnd() * Math.PI;
        towers.add(m);
        if (rnd() < 0.5) {   // antenna / crown detail
          const t = new THREE.Mesh(towerGeo, towerMats[0]);
          t.position.set(m.position.x, h - 10 + 6, m.position.z);
          t.scale.set(w * 0.35, 12, d * 0.35);
          towers.add(t);
        }
      }
    }
    this.group.add(towers);

    // ---- ground plane far out (so the plinth stands on something)
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1200, 48), new THREE.MeshStandardMaterial({ color: '#767b90', roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -12.7;
    ground.receiveShadow = true;
    ground.name = 'GroundPlane';
    this.group.add(ground);

    // ---- haze
    scene.fog = new THREE.FogExp2('#b9c6f2', 0.00095);

    // ---- lights
    this.hemi = new THREE.HemisphereLight('#c8d6ff', '#6a708a', 0.95);
    this.group.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff4e4', 2.4);
    this.sun.position.set(70, 120, 45);
    this.sun.castShadow = opts.shadows;
    this.sun.shadow.mapSize.set(opts.shadowSize, opts.shadowSize);
    const cam = this.sun.shadow.camera;
    cam.left = -80; cam.right = 80; cam.top = 80; cam.bottom = -80; cam.near = 20; cam.far = 320;
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 3;
    this.group.add(this.sun);
    this.group.add(this.sun.target);

    // ---- celebration spotlights (4, on the rim corners)
    for (let i = 0; i < 4; i++) {
      const s = new THREE.SpotLight('#ffffff', 0, 260, Math.PI / 18, 0.6, 1.1);
      s.castShadow = false;
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      s.position.set(Math.cos(a) * 62, 34, Math.sin(a) * 52);
      const tgt = new THREE.Object3D();
      tgt.position.set(0, 0, 0);
      s.target = tgt;
      this.group.add(s, tgt);
      this.spots.push(s);
      this.spotTargets.push(tgt);
    }
    scene.add(this.group);
  }

  /** Kick off a spotlight sweep in team colour for `seconds`. */
  sweepSpots(color: THREE.ColorRepresentation, seconds = 7) {
    this.sweep = seconds;
    for (const s of this.spots) s.color.set(color);
  }

  update(dt: number, time: number) {
    if (this.sweep > 0) {
      this.sweep -= dt;
      const k = Math.min(1, this.sweep / 1.2);              // fade out at the end
      this.spots.forEach((s, i) => {
        s.intensity = 900 * k;
        const t = time * 1.6 + i * 1.7;
        this.spotTargets[i].position.set(Math.cos(t) * 22, 0, Math.sin(t * 0.8) * 14);
      });
    } else {
      for (const s of this.spots) s.intensity = 0;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose()); }
    });
  }
}

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
