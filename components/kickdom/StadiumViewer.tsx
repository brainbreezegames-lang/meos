'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Zap, Flag, Camera, Gauge, Loader2 } from 'lucide-react';
import type { StadiumRuntime, CameraPreset, Quality, Team } from '@/lib/kickdom';

const CAMERAS: { id: CameraPreset; label: string }[] = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'topdown', label: 'Top-down' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'goal_red', label: 'Red goal' },
  { id: 'goal_blue', label: 'Blue goal' },
];

export default function StadiumViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rtRef = useRef<StadiumRuntime | null>(null);
  const [progress, setProgress] = useState({ f: 0, label: 'Booting' });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState(false);
  const [cam, setCam] = useState<CameraPreset>('cinematic');
  const [quality, setQuality] = useState<Quality>('high');
  const [stats, setStats] = useState({ fps: 0, triangles: 0, fans: 0, drawCalls: 0 });
  const [score, setScore] = useState({ red: 0, blue: 0 });
  const [flash, setFlash] = useState<Team | null>(null);
  const [roof, setRoof] = useState(true);

  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current!;
    const q: Quality = (navigator.hardwareConcurrency ?? 8) < 4 || /Mobi|Android/i.test(navigator.userAgent) ? 'medium' : 'high';
    setQuality(q);
    import('@/lib/kickdom').then(async ({ StadiumRuntime }) => {
      try {
        const rt = await StadiumRuntime.create(canvas, {
          assetBase: '/kickdom',
          quality: q,
          onProgress: (f, label) => setProgress({ f, label }),
        });
        if (disposed) { rt.dispose(); return; }
        rtRef.current = rt;
        (window as unknown as { kickdom: StadiumRuntime }).kickdom = rt;   // handy for the game dev console
        setReady(true);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : String(e));
      }
    });
    const onResize = () => rtRef.current?.resize();
    window.addEventListener('resize', onResize);
    const statsTimer = window.setInterval(() => { if (rtRef.current) setStats({ ...rtRef.current.stats }); }, 500);
    return () => {
      disposed = true;
      window.removeEventListener('resize', onResize);
      window.clearInterval(statsTimer);
      rtRef.current?.dispose();
      rtRef.current = null;
    };
  }, []);

  const enableSound = useCallback(async () => {
    const rt = rtRef.current;
    if (!rt) return;
    if (!sound) { await rt.enableSound(); rt.setMuted(false); setSound(true); }
    else { rt.setMuted(true); setSound(false); }
  }, [sound]);

  const goal = useCallback(async (team: Team) => {
    const rt = rtRef.current;
    if (!rt) return;
    if (!sound) { await rt.enableSound(); setSound(true); }
    rt.goal(team);
    setScore((s) => ({ ...s, [team]: s[team] + 1 }));
    setFlash(team);
    window.setTimeout(() => setFlash(null), 900);
  }, [sound]);

  const changeCamera = useCallback((c: CameraPreset) => { setCam(c); rtRef.current?.setCamera(c); }, []);
  const changeQuality = useCallback((q: Quality) => { setQuality(q); rtRef.current?.setQuality(q); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key.toLowerCase()) {
        case '1': goal('red'); break;
        case '2': goal('blue'); break;
        case 'w': rtRef.current?.wave(); break;
        case 'k': rtRef.current?.kickoff(); break;
        case 'f': rtRef.current?.whistle('triple'); break;
        case 'm': enableSound(); break;
        case 'c': {
          const i = CAMERAS.findIndex((c) => c.id === cam);
          changeCamera(CAMERAS[(i + 1) % CAMERAS.length].id);
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goal, enableSound, changeCamera, cam]);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#0d1024] font-sans text-white select-none">
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Kickdom Arena 3D stadium preview" />

      {/* goal flash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ opacity: flash ? 0.55 : 0, background: flash === 'red' ? 'radial-gradient(circle at 50% 60%, rgba(255,48,56,0.55), transparent 60%)' : 'radial-gradient(circle at 50% 60%, rgba(47,115,255,0.55), transparent 60%)' }}
      />

      {/* header */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-4 md:p-6">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">Play Kickdom · Ball Characters</div>
          <h1 className="mt-0.5 text-xl font-black tracking-tight md:text-2xl">Kickdom Arena</h1>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md">
          <ScoreChip team="red" value={score.red} />
          <span className="text-sm font-bold text-white/40">:</span>
          <ScoreChip team="blue" value={score.blue} />
        </div>
      </header>

      {/* right rail: cameras + quality */}
      <aside className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
          <div className="mb-1 flex items-center gap-1.5 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50"><Camera size={12} /> Camera</div>
          {CAMERAS.map((c) => (
            <button
              key={c.id}
              onClick={() => changeCamera(c.id)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${cam === c.id ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10'}`}
            >{c.label}</button>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
          <div className="mb-1 flex items-center gap-1.5 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50"><Gauge size={12} /> Quality</div>
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as Quality[]).map((q) => (
              <button key={q} onClick={() => changeQuality(q)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs capitalize transition ${quality === q ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10'}`}>{q}</button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setRoof(!roof); rtRef.current?.setRoofVisible(!roof); }}
          className={`rounded-2xl border border-white/10 px-3 py-2 text-left text-sm backdrop-blur-md transition ${roof ? 'bg-black/40 text-white/80 hover:bg-white/10' : 'bg-white text-black'}`}
        >{roof ? 'Hide roof truss' : 'Show roof truss'}</button>
        <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white/60 backdrop-blur-md">
          <div>{stats.fps} fps · {stats.drawCalls} calls</div>
          <div>{(stats.triangles / 1000).toFixed(0)}k tris · {stats.fans} fans</div>
        </div>
      </aside>

      {/* bottom control bar */}
      <nav className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/45 p-2 backdrop-blur-md md:bottom-6">
        <ActionButton onClick={() => goal('red')} className="bg-[#ff3038] text-white hover:brightness-110" title="Goal for Red (1)"><Zap size={16} /> Goal Red</ActionButton>
        <ActionButton onClick={() => goal('blue')} className="bg-[#2f73ff] text-white hover:brightness-110" title="Goal for Blue (2)"><Zap size={16} /> Goal Blue</ActionButton>
        <ActionButton onClick={() => rtRef.current?.wave()} title="Mexican wave (W)"><Flag size={16} /> Wave</ActionButton>
        <ActionButton onClick={() => rtRef.current?.kickoff()} title="Kick-off (K)">Kick-off</ActionButton>
        <ActionButton onClick={() => rtRef.current?.whistle('triple')} title="Full-time whistle (F)">Full time</ActionButton>
        <ActionButton onClick={enableSound} title="Toggle stadium sound (M)" className={sound ? 'bg-white text-black' : ''}>
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />} {sound ? 'Sound on' : 'Sound off'}
        </ActionButton>
      </nav>

      {/* loading */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1024]/95">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">Play Kickdom</div>
          <div className="mt-1 text-3xl font-black tracking-tight">Kickdom Arena</div>
          {error ? (
            <div className="mt-6 max-w-md rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
          ) : (
            <>
              <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-[#ff3038] via-white to-[#2f73ff] transition-[width] duration-300" style={{ width: `${Math.round(progress.f * 100)}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/60"><Loader2 size={12} className="animate-spin" /> {progress.label}</div>
            </>
          )}
        </div>
      )}

      {ready && !sound && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/70 backdrop-blur md:bottom-28">
          Press <kbd className="rounded bg-white/15 px-1">M</kbd> or score a goal to enable stadium sound · drag to orbit
        </div>
      )}
    </div>
  );
}

function ScoreChip({ team, value }: { team: Team; value: number }) {
  return (
    <span className="flex items-center gap-2 text-lg font-black tabular-nums">
      <span className="h-3 w-3 rounded-full shadow-[0_0_12px_currentColor]" style={{ background: team === 'red' ? '#ff3038' : '#2f73ff', color: team === 'red' ? '#ff3038' : '#2f73ff' }} />
      {value}
    </span>
  );
}

function ActionButton({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80 active:scale-95 ${className || 'bg-white/10 text-white hover:bg-white/20'}`}
    >{children}</button>
  );
}
