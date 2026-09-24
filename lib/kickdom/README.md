# Kickdom Arena — web runtime

Self-contained Three.js runtime for the stadium asset in `3d models/Stadium/`.
Live demo route: **`/kickdom`** (drag to orbit, buttons or keys `1` `2` `W` `K` `F` `M` `C`).

```ts
import { StadiumRuntime } from '@/lib/kickdom';

const rt = await StadiumRuntime.create(canvas, { assetBase: '/kickdom', quality: 'high' });

rt.goal('red');           // confetti cannons + roof confetti rain, crowd jumps, neon strobe,
                          // spotlight sweep, camera shake, roar + air horn + clap chant
rt.wave();                // mexican wave + rhythmic clapping
rt.kickoff();             // short whistle + roar + wave
rt.whistle('triple');     // full time
rt.setCamera('broadcast');// 'broadcast' | 'topdown' | 'pitch' | 'goal_red' | 'goal_blue' | 'cinematic'
rt.setRoofVisible(false); // for top-down game cameras
rt.setQuality('medium');  // 'low' | 'medium' | 'high'
await rt.enableSound();   // call from a user gesture
rt.onFrame = (dt, t) => { /* your game update */ };
rt.scene.add(myPlayers);  // metres, Y-up, origin at centre spot, red goal +X, blue goal -X
```

## What's inside

| Module | Responsibility |
| --- | --- |
| `stadium/StadiumRuntime.ts` | Renderer, ACES + bloom + SMAA composer, asset loading, static-mesh merging (≈300 draw calls incl. shadows), neon pulses/strobes, camera presets & tweens, game API. |
| `stadium/CrowdSystem.ts` | Loads the fan library GLB + `fans_placement.json`, one `InstancedMesh` per variant, per-fan idle bob / jumps / Mexican wave / team celebrations. |
| `stadium/Confetti.ts` | 3 000-piece instanced confetti with gravity, drag, flutter and tumble. |
| `stadium/Environment.ts` | Gradient sky dome, distant skyline, haze, sun + hemisphere light, four sweeping celebration spotlights. |
| `stadium/StadiumAudio.ts` | Procedural WebAudio soundscape: crowd murmur bed with swells, roar, air horn, referee whistle, clap chants. No sample files needed; swap any layer for recordings later. |

Assets served from `public/kickdom/` (`KickdomArena_NoFans.glb` 1.3 MB, `KickdomFans_Library.glb`
0.6 MB, `fans_placement.json` 0.3 MB). Everything is disposed in `rt.dispose()`.
