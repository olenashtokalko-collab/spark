// Real glass in the browser (10 Nov): Three.js through React Three Fiber, drei's MeshTransmissionMaterial.
// The brand book's material (p. 34, 36): frosted glass body, the spectrum underneath, ink or white on top.
// Each object is its own small canvas with the Noor light behind it, so the glass has something to bend.
// Loaded lazily: the rest of the portal does not carry three.js.
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial, RoundedBox, Text } from '@react-three/drei';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';

export const NOOR = {
  cobalt: '#1E3BD6',
  violet: '#6B3DF2',
  magenta: '#D23FB4',
  rose: '#F0607A',
  ember: '#E8501F',
  sand: '#F8F6F2',
  haze: '#C8D8F0',
};

/** WebGL2 available? Without it the demo shows a CSS stand-in. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

// ---- The light behind the glass ---------------------------------------------

type Spot = { x: number; y: number; r: number; color: string; a?: number };

/** A soft, blurred cluster of colour spots drawn on a canvas: the Noor glow. */
function useBlobTexture(spots: Spot[]) {
  const key = JSON.stringify(spots);
  return useMemo(() => {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d')!;
    g.filter = 'blur(28px)';
    for (const p of spots) {
      const grd = g.createRadialGradient(p.x * s, p.y * s, 0, p.x * s, p.y * s, p.r * s);
      const col = new THREE.Color(p.color);
      const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
      grd.addColorStop(0, `rgba(${rgb},${p.a ?? 1})`);
      grd.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function Glow({ spots, size = [6, 6], z = -1.2, y = 0, opacity = 1 }: { spots: Spot[]; size?: [number, number]; z?: number; y?: number; opacity?: number }) {
  const tex = useBlobTexture(spots);
  return (
    <mesh position={[0, y, z]}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

// ---- Shared stage -----------------------------------------------------------

/** Studio light made of soft panels, no network: highlights on the glass edge. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 4, 3]} scale={[8, 2, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[-5, 1, 2]} rotation-y={Math.PI / 2.5} scale={[4, 6, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[5, -1, 2]} rotation-y={-Math.PI / 2.5} scale={[4, 6, 1]} />
      <Lightformer form="ring" intensity={0.8} color={NOOR.haze} position={[0, -3, 4]} scale={3} />
    </Environment>
  );
}

/** A tilt that follows the pointer over the canvas and a slow float. */
function Float({ children, amount = 0.22, speed = 1 }: { children: ReactNode; amount?: number; speed?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (!g.current) return;
    const t = st.clock.elapsedTime * speed;
    const tx = -st.pointer.y * amount + Math.sin(t * 0.7) * 0.03;
    const ty = st.pointer.x * amount + Math.cos(t * 0.5) * 0.04;
    g.current.rotation.x += (tx - g.current.rotation.x) * 0.08;
    g.current.rotation.y += (ty - g.current.rotation.y) * 0.08;
    g.current.position.y = Math.sin(t * 0.9) * 0.05;
  });
  return <group ref={g}>{children}</group>;
}

function Stage({ children, className, fov = 28, z = 7 }: { children: ReactNode; className?: string; fov?: number; z?: number }) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, z], fov }} gl={{ alpha: true, antialias: true }}>
        <Studio />
        {children}
      </Canvas>
    </div>
  );
}

/** Frosted glass: soft, a little chromatic at the edge, sand where nothing is behind. */
function Frost({ rough = 0.32, thickness = 0.9, chroma = 0.08 }: { rough?: number; thickness?: number; chroma?: number }) {
  const bg = useMemo(() => new THREE.Color(NOOR.sand), []);
  return (
    <MeshTransmissionMaterial
      background={bg}
      transmission={1}
      roughness={rough}
      thickness={thickness}
      ior={1.35}
      chromaticAberration={chroma}
      anisotropy={0.15}
      distortion={0.08}
      distortionScale={0.25}
      temporalDistortion={0}
      samples={8}
      resolution={512}
      backside
      backsideThickness={0.4}
      color="#ffffff"
    />
  );
}

// ---- 1 · The lens: a round glass puck with one big Doto number ----------------

function puckGeometry(r = 1.25, h = 0.34, edge = 0.3) {
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0, h));
  pts.push(new THREE.Vector2(r - edge, h));
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI / 2 - (i / 16) * Math.PI;
    pts.push(new THREE.Vector2(r - edge + Math.cos(a) * edge, Math.sin(a) * h));
  }
  pts.push(new THREE.Vector2(0, -h));
  const g = new THREE.LatheGeometry(pts, 96);
  g.rotateX(Math.PI / 2);
  return g;
}

const LENS_SPOTS: Record<'cool' | 'warm' | 'full', Spot[]> = {
  cool: [
    { x: 0.35, y: 0.6, r: 0.32, color: NOOR.cobalt },
    { x: 0.6, y: 0.45, r: 0.28, color: NOOR.violet },
    { x: 0.55, y: 0.7, r: 0.2, color: NOOR.magenta, a: 0.7 },
  ],
  warm: [
    { x: 0.62, y: 0.6, r: 0.32, color: NOOR.ember },
    { x: 0.4, y: 0.45, r: 0.26, color: NOOR.rose },
    { x: 0.35, y: 0.7, r: 0.2, color: NOOR.violet, a: 0.6 },
  ],
  full: [
    { x: 0.3, y: 0.62, r: 0.3, color: NOOR.cobalt },
    { x: 0.48, y: 0.42, r: 0.24, color: NOOR.violet },
    { x: 0.56, y: 0.66, r: 0.24, color: NOOR.magenta },
    { x: 0.72, y: 0.5, r: 0.28, color: NOOR.ember },
  ],
};

export function GlassLens({ value, unit, tone = 'full', className }: { value: string; unit?: string; tone?: keyof typeof LENS_SPOTS; className?: string }) {
  const geo = useMemo(() => puckGeometry(), []);
  return (
    <Stage className={className} z={6.4}>
      <Glow spots={LENS_SPOTS[tone]} size={[5.6, 5.6]} z={-1} />
      <Float>
        <mesh geometry={geo}>
          <Frost thickness={1.1} />
        </mesh>
        <Text
          font="/fonts/Doto_Rounded-Bold.ttf"
          fontSize={value.length > 2 ? 0.86 : 1.06}
          position={[unit ? -0.12 : 0, 0.02, 0.36]}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor={NOOR.cobalt}
          outlineOpacity={0.25}
          outlineBlur={0.08}
        >
          {value}
        </Text>
        {unit && (
          <Text font="/fonts/ABCDiatypeMono-Medium.otf" fontSize={0.15} position={[0.62, -0.34, 0.36]} color="#ffffff" anchorX="left" anchorY="middle">
            {unit}
          </Text>
        )}
      </Float>
    </Stage>
  );
}

// ---- 2 · The capsule: a glass pill holding a glowing level --------------------

function useGradientTexture(stops: string[]) {
  const key = stops.join(',');
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 4;
    const g = c.getContext('2d')!;
    const grd = g.createLinearGradient(0, 0, 256, 0);
    stops.forEach((s, i) => grd.addColorStop(i / (stops.length - 1), s));
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 4);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

function Level({ level }: { level: number }) {
  const tex = useGradientTexture([NOOR.cobalt, NOOR.violet, NOOR.magenta, NOOR.ember]);
  const m = useRef<THREE.Group>(null);
  const shown = useRef(0);
  const W = 2.9;
  useFrame(() => {
    shown.current += (level - shown.current) * 0.06;
    if (m.current) {
      m.current.scale.x = Math.max(0.12, shown.current);
      m.current.position.x = -W / 2 + (W * Math.max(0.12, shown.current)) / 2;
    }
  });
  return (
    <group ref={m}>
      <RoundedBox args={[W, 0.42, 0.3]} radius={0.15} smoothness={6}>
        <meshBasicMaterial map={tex} toneMapped={false} />
      </RoundedBox>
    </group>
  );
}

export function GlassCapsule({ level, className }: { level: number; className?: string }) {
  return (
    <Stage className={className} z={7.5} fov={26}>
      <Glow
        spots={[
          { x: 0.25, y: 0.55, r: 0.22, color: NOOR.cobalt, a: 0.9 },
          { x: 0.5, y: 0.6, r: 0.2, color: NOOR.magenta, a: 0.7 },
          { x: 0.75, y: 0.55, r: 0.22, color: NOOR.ember, a: 0.9 },
        ]}
        size={[7, 4.2]}
        z={-1.1}
        y={-0.25}
      />
      <Float amount={0.16}>
        <Level level={level} />
        <RoundedBox args={[3.4, 0.95, 0.75]} radius={0.37} smoothness={10}>
          <Frost rough={0.22} thickness={0.7} chroma={0.06} />
        </RoundedBox>
      </Float>
    </Stage>
  );
}

// ---- 3 · Sparky: the glass star from the logo, with eyes ---------------------

export type SparkyMood = 'idle' | 'thinking' | 'found';

/** The four-point spark, a touch uneven like the logo's (the lower ray is the longest). */
function starShape() {
  const s = new THREE.Shape();
  const k = 0.16; // how far in the waist sits
  s.moveTo(0, 1.02);
  s.quadraticCurveTo(k, k, 0.94, 0.02);
  s.quadraticCurveTo(k, -k * 1.1, 0.02, -1.12);
  s.quadraticCurveTo(-k, -k, -0.9, 0);
  s.quadraticCurveTo(-k, k, 0, 1.02);
  return s;
}

const MOOD_SPOTS: Record<SparkyMood, Spot[]> = {
  idle: [
    { x: 0.42, y: 0.58, r: 0.3, color: NOOR.cobalt },
    { x: 0.6, y: 0.5, r: 0.22, color: NOOR.violet, a: 0.8 },
  ],
  thinking: [
    { x: 0.32, y: 0.6, r: 0.24, color: NOOR.cobalt },
    { x: 0.5, y: 0.4, r: 0.22, color: NOOR.violet },
    { x: 0.62, y: 0.66, r: 0.22, color: NOOR.magenta },
    { x: 0.72, y: 0.46, r: 0.22, color: NOOR.ember },
  ],
  found: [
    { x: 0.55, y: 0.55, r: 0.32, color: NOOR.ember },
    { x: 0.38, y: 0.62, r: 0.2, color: NOOR.rose, a: 0.8 },
  ],
};

function MoodGlow({ mood }: { mood: SparkyMood }) {
  const g = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (!g.current) return;
    const t = st.clock.elapsedTime;
    if (mood === 'thinking') g.current.rotation.z = t * 1.4;
    else g.current.rotation.z *= 0.95;
    const pulse = mood === 'found' ? 1 + Math.sin(t * 4) * 0.08 : 1;
    g.current.scale.setScalar(pulse);
  });
  return (
    <group ref={g} position={[0, 0, -1]}>
      <Glow spots={MOOD_SPOTS[mood]} size={[5.4, 5.4]} z={0} />
    </group>
  );
}

type ElRef = React.RefObject<HTMLElement | null>;

/** Eyes look at the `target` element when given, otherwise at the pointer anywhere on the page. */
function Eyes({ host, target, mood }: { host: React.RefObject<HTMLDivElement>; target?: ElRef | null; mood: SparkyMood }) {
  const L = useRef<THREE.Group>(null);
  const R = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const blink = useRef(0);
  useEffect(() => {
    const on = (e: PointerEvent) => (pointer.current = { x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', on);
    return () => window.removeEventListener('pointermove', on);
  }, []);
  useFrame((st, dt) => {
    const box = host.current?.getBoundingClientRect();
    if (!box) return;
    const tb = target?.current?.getBoundingClientRect();
    const aim = tb ? { x: tb.left + tb.width / 2, y: tb.top + tb.height / 2 } : pointer.current;
    const dx = aim.x - (box.left + box.width / 2);
    const dy = aim.y - (box.top + box.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    const reach = Math.min(1, d / 220) * 0.07;
    let ox = (dx / d) * reach;
    let oy = (-dy / d) * reach;
    if (mood === 'thinking') {
      // Looking up and around while it works.
      const t = st.clock.elapsedTime * 2.2;
      ox = Math.cos(t) * 0.05;
      oy = 0.05 + Math.sin(t) * 0.02;
    }
    blink.current -= dt;
    const closing = blink.current < 0.12 && blink.current > 0;
    if (blink.current < 0) blink.current = 2.4 + Math.random() * 2.6;
    const sy = mood === 'found' ? 0.75 : closing ? 0.12 : 1; // happy squint when it found something
    for (const [e, base] of [
      [L.current, -0.17],
      [R.current, 0.17],
    ] as const) {
      if (!e) continue;
      e.position.x += (base + ox - e.position.x) * 0.18;
      e.position.y += (0.06 + oy - e.position.y) * 0.18;
      e.scale.y += (sy - e.scale.y) * 0.35;
    }
  });
  return (
    <>
      {[L, R].map((r, i) => (
        <group key={i} ref={r} position={[i ? 0.17 : -0.17, 0.06, 0.33]}>
          <mesh scale={[1, 1.55, 1]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshBasicMaterial color={NOOR.sand} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Star({ mood, children }: { mood: SparkyMood; children?: ReactNode }) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(starShape(), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 10, curveSegments: 48 });
    g.center();
    return g;
  }, []);
  const m = useRef<THREE.Group>(null);
  useFrame((st) => {
    if (!m.current) return;
    const t = st.clock.elapsedTime;
    // A little hop when it found something; a slow sway otherwise.
    m.current.position.y = mood === 'found' ? Math.abs(Math.sin(t * 4)) * 0.1 : 0;
    m.current.rotation.z = mood === 'thinking' ? Math.sin(t * 3) * 0.08 : Math.sin(t * 0.8) * 0.03;
  });
  return (
    <group ref={m}>
      <mesh geometry={geo}>
        <Frost rough={0.26} thickness={1.2} chroma={0.1} />
      </mesh>
      {children}
    </group>
  );
}

export function GlassSparky({ mood = 'idle', target, className }: { mood?: SparkyMood; target?: ElRef | null; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  return (
    <div ref={host} className={className}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6.2], fov: 28 }} gl={{ alpha: true, antialias: true }}>
        <Studio />
        <MoodGlow mood={mood} />
        <Float amount={0.18} speed={1.2}>
          <Star mood={mood}>
            <Eyes host={host} target={target} mood={mood} />
          </Star>
        </Float>
      </Canvas>
    </div>
  );
}
