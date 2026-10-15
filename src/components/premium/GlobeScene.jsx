import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { isWebGLAvailable, SceneErrorBoundary } from './webgl.jsx';
import { GlobeFallback } from './GlobeFallback.jsx';
import { cn } from '../../utils/cn.js';
import { INDIA_BOUNDARY } from './indiaMapData.js';
import {
  CITIES,
  FLIGHT,
  GLOBE_ROTATION_Y,
  ORIGIN_ID,
  RADIUS,
  TILT_X,
  createFlights,
  latLonToVector,
  routePoints,
  sampleFlight,
} from './globeFlight.js';

/* ------------------------------------------------------------------ *
 * Homepage globe — "Take your career global".
 *
 *   • A textured, lit Earth held at a fixed orientation (it does not rotate), with
 *     India and the three Gulf destinations facing the viewer.
 *   • THREE planes (the same Lucide Plane used across the site) leave India at the
 *     same moment and fly at the same time, each on its own arc, to Dubai, Riyadh
 *     and Doha — the three cities named in this section's cards. None waits for
 *     another. Each plane has its own glowing trail and a faint guide line along
 *     its route. Planes, trails, routes and markers are CHILDREN of the globe, so
 *     they stay locked to the geography.
 *   • India (the starting point) is highlighted from its real boundary and marked
 *     with a larger cyan marker; the three destinations carry smaller blue-white
 *     markers.
 *   • The animation always runs while the globe is on screen; there is no
 *     play/pause control. Motion preferences: with "reduce motion" on, the planes
 *     still fly, just at 45 % speed with no pulsing rings. (Freezing the scene
 *     entirely made it look broken.)
 *
 * The route maths lives in ./globeFlight.js (pure; tested in Node by
 * tests/globeFlight.test.mjs). Loaded lazily by GlobalSpotlight so three.js stays
 * out of the main bundle.
 * ------------------------------------------------------------------ */

const CYAN = '#4FC1E6';
const PLANE_SIZE = 0.18; // world units; ≈ 20 px at the globe's on-screen size. Smaller than
//   a single plane would need to be, because three share the Gulf and its cities are close together
const PLANE_SIZE_SMALL = 0.22; // phones render the globe much smaller, so the plane gets a little more
const REDUCED_MOTION_SPEED = 0.45; // animation-clock speed when the OS asks for less motion
const TRAIL_POINTS = 80;
const TRAIL_SECONDS = 3.0; // how far back in time each trail reaches
const TRAIL_WIDTH = 0.024; // world units at the head (tapers to ~35 %)
const LUCIDE_PLANE =
  'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z';

/* ------------------------------ textures ---------------------------- */

/** Ocean = shiny (low roughness), land / ice = matte, derived from the day map. */
function makeRoughnessMap(image) {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const ocean = b >= r + 6 && b >= g * 0.92 && lum < 140;
    const v = ocean ? 128 : 225; // ocean roughness ≈ 0.5: a broad, soft sheen, not a pinpoint
    px[i] = v;
    px[i + 1] = v; // three.js reads roughness from the green channel
    px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

/** Loads the Earth day map (required) and cloud map (optional). Disposes on unmount. */
function useEarthTextures(gl, onFail) {
  const [textures, setTextures] = useState(null);
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    let cancelled = false;
    const created = [];
    const loader = new THREE.TextureLoader();
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const load = (url) =>
      new Promise((resolve, reject) => {
        const tex = loader.load(url, () => resolve(tex), undefined, reject);
        created.push(tex);
      });

    (async () => {
      try {
        const day = await load('/images/globe/earth_day.jpg');
        day.colorSpace = THREE.SRGBColorSpace;
        day.anisotropy = aniso;
        const rough = makeRoughnessMap(day.image);
        created.push(rough);
        let clouds = null;
        try {
          clouds = await load('/images/globe/earth_clouds.png');
          clouds.colorSpace = THREE.SRGBColorSpace;
        } catch {
          clouds = null; // clouds are decoration; the globe works without them
        }
        if (!cancelled) setTextures({ day, rough, clouds });
      } catch {
        if (!cancelled) failRef.current?.();
      }
    })();

    return () => {
      cancelled = true;
      created.forEach((t) => t.dispose());
    };
  }, [gl]);

  return textures;
}

/** The site's Lucide plane, drawn once to a canvas, nose pointing straight up. */
function makePlaneTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.translate(size / 2, size / 2);
  ctx.rotate(-Math.PI / 4); // the glyph's nose points up-right; turn it to "up"
  ctx.scale(size / 28, size / 28);
  ctx.translate(-12, -12);
  const path = new Path2D(LUCIDE_PLANE);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.1; // white outline keeps it legible over both sea and desert
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke(path);
  ctx.fillStyle = '#1D5DB8';
  ctx.fill(path);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ------------------------------ trail ribbon ------------------------- */

const TRAIL_VERT = /* glsl */ `
  attribute float aAlpha;
  attribute float aSide;
  varying float vAlpha;
  varying float vSide;
  void main() {
    vAlpha = aAlpha;
    vSide = aSide;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const TRAIL_FRAG = /* glsl */ `
  uniform vec3 uHead;
  uniform vec3 uTail;
  uniform float uFade;
  varying float vAlpha;
  varying float vSide;
  void main() {
    float core = 1.0 - smoothstep(0.0, 1.0, abs(vSide));
    float a = vAlpha * (0.25 + 0.75 * core) * uFade;
    gl_FragColor = vec4(mix(uTail, uHead, vAlpha), a);
  }
`;

/** A thin camera-independent ribbon lying along the flight path, fading with age. */
function createTrail() {
  const count = (TRAIL_POINTS + 1) * 2;
  const positions = new Float32Array(count * 3);
  const alpha = new Float32Array(count);
  const side = new Float32Array(count);
  const widths = new Float32Array(TRAIL_POINTS + 1);
  for (let k = 0; k <= TRAIL_POINTS; k += 1) {
    const life = 1 - k / TRAIL_POINTS; // 1 at the plane → 0 at the tail
    alpha[k * 2] = alpha[k * 2 + 1] = 0.95 * life ** 1.5;
    side[k * 2] = -1;
    side[k * 2 + 1] = 1;
    widths[k] = TRAIL_WIDTH * (0.35 + 0.65 * life);
  }
  const index = [];
  for (let k = 0; k < TRAIL_POINTS; k += 1) {
    const a = k * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
  geometry.setIndex(index);
  const material = new THREE.ShaderMaterial({
    vertexShader: TRAIL_VERT,
    fragmentShader: TRAIL_FRAG,
    uniforms: {
      uHead: { value: new THREE.Color(CYAN) },
      uTail: { value: new THREE.Color('#2B72D4') },
      uFade: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; // vertices move every frame
  mesh.renderOrder = 3;
  return { mesh, geometry, material, positions, widths };
}

/* ------------------------------ atmosphere --------------------------- */

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
/* Outer glow: rendered on the back faces of a slightly larger sphere, and faded
   to exactly zero at its outer edge — so it is a soft haze, never a visible ring. */
const ATMO_OUTER_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float a = clamp(-vNormal.z / 0.42, 0.0, 1.0);
    a = pow(a, 2.2) * 0.5;
    gl_FragColor = vec4(uColor, a);
  }
`;
/* Inner limb glow: a faint blue rim hugging the edge of the Earth itself. */
const ATMO_RIM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float f = 1.0 - clamp(vNormal.z, 0.0, 1.0);
    gl_FragColor = vec4(uColor, pow(f, 3.2) * 0.5);
  }
`;

function Atmosphere({ segments }) {
  const outer = useMemo(() => ({ uColor: { value: new THREE.Color('#4FA8E8') } }), []);
  const rim = useMemo(() => ({ uColor: { value: new THREE.Color('#6FD0F0') } }), []);
  return (
    <>
      <mesh scale={1.12}>
        <sphereGeometry args={[RADIUS, segments, segments]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_OUTER_FRAG}
          uniforms={outer}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.012}>
        <sphereGeometry args={[RADIUS, segments, segments]} />
        <shaderMaterial
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_RIM_FRAG}
          uniforms={rim}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ------------------------------ India highlight ---------------------- */

function pointInPolygon(lat, lon, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Soft cyan-blue wash + thin outline following India's real border (from indiaMapData.js).
 *  Built from 0.5° cells (~2 px on screen) that hug the curve of the globe, so it stays
 *  glued to the surface; the fill is faint so the Earth texture shows through. */
function createIndiaHighlight() {
  const STEP = 0.5;
  const R = RADIUS * 1.0022;
  const positions = [];
  const v = new THREE.Vector3();
  const push = (lat, lon) => {
    latLonToVector(lat, lon, R, v);
    positions.push(v.x, v.y, v.z);
  };
  for (let la = 6; la < 38; la += STEP) {
    for (let lo = 67; lo < 98; lo += STEP) {
      if (!pointInPolygon(la + STEP / 2, lo + STEP / 2, INDIA_BOUNDARY)) continue;
      push(la, lo); push(la, lo + STEP); push(la + STEP, lo);
      push(la + STEP, lo); push(la, lo + STEP); push(la + STEP, lo + STEP);
    }
  }
  const fillGeometry = new THREE.BufferGeometry();
  fillGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const fillMaterial = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.17,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
  const fill = new THREE.Mesh(fillGeometry, fillMaterial);
  fill.renderOrder = 1;

  const border = INDIA_BOUNDARY.slice(0, -1).map(([lat, lon]) => latLonToVector(lat, lon, RADIUS * 1.0035));
  const outlineGeometry = new THREE.BufferGeometry().setFromPoints(border);
  const outlineMaterial = new THREE.LineBasicMaterial({ color: '#7FD6F5', transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false });
  const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial);
  outline.renderOrder = 1;

  return { fill, outline, dispose: () => [fillGeometry, fillMaterial, outlineGeometry, outlineMaterial].forEach((o) => o.dispose()) };
}

/* ------------------------------ markers ------------------------------ */

/** Soft round glow texture (white → transparent), tinted per marker by the material colour. */
function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* India (origin): larger, cyan, white-centred, strong halo, pulsing ring.
   Destinations: small blue-white dots with a thin cyan ring and a faint halo. */
const MARKER_STYLE = {
  origin: { core: 0.032, dot: 0.013, halo: 0.5, haloOpacity: 0.7, haloColor: CYAN, coreColor: CYAN, ring: [0.05, 0.062], pulse: 0.55 },
  destination: { core: 0.02, dot: 0, halo: 0.22, haloOpacity: 0.5, haloColor: '#7FD3F2', coreColor: '#EAF7FF', ring: [0.03, 0.036], pulse: 0.3 },
};

/** A location marker lying flat on the surface (local +Z = straight up from the globe),
 *  so it is glued to the geography and follows the globe's orientation and perspective. */
function LocationMarker({ city, variant, halo, simRef, reduceMotion }) {
  const st = MARKER_STYLE[variant];
  const pulseRef = useRef(null);
  const { position, quaternion } = useMemo(() => {
    const p = latLonToVector(city.lat, city.lon, RADIUS * 1.0045);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
    return { position: p, quaternion: q };
  }, [city]);

  useFrame(() => {
    const ring = pulseRef.current;
    if (!ring || reduceMotion) return;
    const phase = (simRef.current.t * 0.4 + city.phase) % 1;
    ring.scale.setScalar(1 + phase * 2.4);
    ring.material.opacity = st.pulse * (1 - phase) * (1 - phase);
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0, 0.0006]} renderOrder={2}>
        <planeGeometry args={[st.halo, st.halo]} />
        <meshBasicMaterial map={halo} color={st.haloColor} transparent opacity={st.haloOpacity} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Thin static ring: the destination "badge"; for India it is the pulse's resting state */}
      <mesh position={[0, 0, 0.0012]} renderOrder={2}>
        <ringGeometry args={[st.core * 1.55, st.core * 1.9, 40]} />
        <meshBasicMaterial color={CYAN} transparent opacity={variant === 'origin' ? 0.9 : 0.8} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={pulseRef} position={[0, 0, 0.0014]} renderOrder={2}>
        <ringGeometry args={[st.ring[0], st.ring[1], 40]} />
        <meshBasicMaterial color={CYAN} transparent opacity={reduceMotion ? st.pulse * 0.6 : 0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.0018]} renderOrder={2}>
        <circleGeometry args={[st.core, 28]} />
        <meshBasicMaterial color={st.coreColor} toneMapped={false} />
      </mesh>
      {st.dot > 0 && (
        <mesh position={[0, 0, 0.0024]} renderOrder={2}>
          <circleGeometry args={[st.dot, 20]} />
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------ flights ------------------------------ */

/** A faint line along a flight's whole route, so each plane's path is readable
 *  even before and after the plane passes. */
function createRouteLine(flight) {
  const geometry = new THREE.BufferGeometry().setFromPoints(routePoints(flight, 64));
  const material = new THREE.LineBasicMaterial({ color: '#7FD6F5', transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 2;
  return { line, dispose: () => { geometry.dispose(); material.dispose(); } };
}

/** One plane with its own trail and route line. Each Flight reads the shared
 *  clock and nothing else, so the three never wait for or depend on each other. */
function Flight({ flight, planeTexture, simRef, size }) {
  const planeRef = useRef(null);
  const planeMatRef = useRef(null);
  const trail = useMemo(() => createTrail(), []);
  const route = useMemo(() => createRouteLine(flight), [flight]);
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      lastTan: new THREE.Vector3(),
      radial: new THREE.Vector3(),
      side: new THREE.Vector3(),
      x: new THREE.Vector3(),
      y: new THREE.Vector3(),
      z: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      points: Array.from({ length: TRAIL_POINTS + 1 }, () => new THREE.Vector3()),
      placed: false,
      lastLocal: 0,
    }),
    []
  );

  useEffect(
    () => () => {
      trail.geometry.dispose();
      trail.material.dispose();
      route.dispose();
    },
    [trail, route]
  );

  useFrame((_, delta) => {
    const plane = planeRef.current;
    if (!plane) return;
    const dt = Math.min(delta, 0.05);
    const { pos, tan, x, y, z, m, q, lastTan, radial, side, points } = scratch;

    // Where we are in the shared cycle. When the cycle restarts the plane is
    // invisible, so snap its heading instead of easing across the whole globe.
    const local = simRef.current.t % FLIGHT.cycle;
    if (local < scratch.lastLocal - 1) scratch.placed = false;
    scratch.lastLocal = local;

    // 1) The plane: position on its own arc (globe-local coordinates)…
    const { alpha } = sampleFlight(flight, local, pos, tan);
    plane.position.copy(pos);

    // …oriented so its nose follows the direction of travel, lying flat on the
    // surface (local +Y = heading, local +Z = straight up from the globe).
    z.copy(pos).normalize();
    y.copy(tan).addScaledVector(z, -tan.dot(z)).normalize();
    x.crossVectors(y, z).normalize();
    m.makeBasis(x, y, z);
    q.setFromRotationMatrix(m);
    if (!scratch.placed) {
      plane.quaternion.copy(q);
      scratch.placed = true;
    } else {
      // Ease towards the heading: curves are smooth, never a snap.
      plane.quaternion.slerp(q, 1 - Math.exp(-dt * 9));
    }

    // Fade in as it leaves India, out after landing; hide when fully faded.
    planeMatRef.current.opacity = alpha;
    plane.visible = alpha > 0.002;
    trail.mesh.visible = alpha > 0.002;
    trail.material.uniforms.uFade.value = alpha;
    if (alpha <= 0.002) return;

    // 2) The trail: where this plane was over the last few seconds. Times before
    // take-off clamp to 0, so the trail gathers at India as the flight begins.
    const step = TRAIL_SECONDS / TRAIL_POINTS;
    for (let k = 0; k <= TRAIL_POINTS; k += 1) sampleFlight(flight, Math.max(local - k * step, 0), points[k], scratch.tan);
    sampleFlight(flight, local, pos, tan); // restore heading scratch
    lastTan.copy(tan);
    const out = trail.positions;
    for (let k = 0; k <= TRAIL_POINTS; k += 1) {
      const p = points[k];
      const newer = points[Math.max(k - 1, 0)];
      const older = points[Math.min(k + 1, TRAIL_POINTS)];
      scratch.tan.copy(newer).sub(older);
      if (scratch.tan.lengthSq() < 1e-10) scratch.tan.copy(lastTan);
      else scratch.tan.normalize();
      lastTan.copy(scratch.tan);
      radial.copy(p).normalize();
      side.crossVectors(scratch.tan, radial).normalize().multiplyScalar(trail.widths[k] * 0.5);
      const i = k * 6;
      out[i] = p.x - side.x;
      out[i + 1] = p.y - side.y;
      out[i + 2] = p.z - side.z;
      out[i + 3] = p.x + side.x;
      out[i + 4] = p.y + side.y;
      out[i + 5] = p.z + side.z;
    }
    trail.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <primitive object={route.line} />
      <primitive object={trail.mesh} />
      <group ref={planeRef} renderOrder={4}>
        <mesh renderOrder={4}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial ref={planeMatRef} map={planeTexture} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

/* ------------------------------ the Earth ---------------------------- */

function Earth({ simRef, reduceMotion, small, onReady, onFail }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const textures = useEarthTextures(gl, onFail);

  const flights = useMemo(() => createFlights(), []);
  const planeTexture = useMemo(() => makePlaneTexture(), []);
  const india = useMemo(() => createIndiaHighlight(), []);
  const halo = useMemo(() => makeHaloTexture(), []);

  const groupRef = useRef(null);

  // Free everything we created by hand (r3f disposes the JSX-declared objects itself).
  useEffect(
    () => () => {
      planeTexture.dispose();
      india.dispose();
      halo.dispose();
    },
    [planeTexture, india, halo]
  );

  // First render with textures → reveal the canvas and draw once.
  useEffect(() => {
    if (!textures) return;
    onReady();
    invalidate();
  }, [textures, onReady, invalidate]);

  // ONE shared animation clock drives every plane, trail and marker, so they can
  // never drift apart. It is clamped, so a tab switch or a slow frame can never
  // make anything jump when rendering resumes. "Reduce motion" slows it down. It
  // only starts once the globe has its textures, so the flights begin from India
  // the moment the Earth appears.
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    simRef.current.t += Math.min(delta, 0.05) * (reduceMotion ? REDUCED_MOTION_SPEED : 1);
  });

  const segW = small ? 64 : 112;
  const segH = small ? 44 : 76;

  return (
    <>
      {textures && (
        <group ref={groupRef} rotation={[TILT_X, GLOBE_ROTATION_Y, 0]}>
          {/* Earth: oceans glint in the sun, land stays matte */}
          <mesh>
            <sphereGeometry args={[RADIUS, segW, segH]} />
            <meshPhysicalMaterial
              map={textures.day}
              roughnessMap={textures.rough}
              roughness={1}
              metalness={0}
              specularIntensity={0.12} /* gentle ocean sheen: no blown-out glare */
            />
          </mesh>

          {/* Clouds */}
          {textures.clouds && (
            <mesh>
              <sphereGeometry args={[RADIUS * 1.009, segW, segH]} />
              <meshStandardMaterial map={textures.clouds} transparent opacity={0.55} depthWrite={false} roughness={1} metalness={0} />
            </mesh>
          )}

          {/* India: highlighted from its real border */}
          <primitive object={india.fill} />
          <primitive object={india.outline} />

          {/* India (start) and the three destinations */}
          {Object.values(CITIES).map((city) => (
            <LocationMarker
              key={city.id}
              city={city}
              variant={city.id === ORIGIN_ID ? 'origin' : 'destination'}
              halo={halo}
              simRef={simRef}
              reduceMotion={reduceMotion}
            />
          ))}

          {/* The three flights: India → Dubai, Riyadh and Doha, all at once */}
          {flights.map((flight) => (
            <Flight
              key={flight.id}
              flight={flight}
              planeTexture={planeTexture}
              simRef={simRef}
              size={small ? PLANE_SIZE_SMALL : PLANE_SIZE}
            />
          ))}
        </group>
      )}

      {/* Atmosphere: static and symmetric */}
      {textures && <Atmosphere segments={small ? 48 : 72} />}
    </>
  );
}

/* ------------------------------ stage -------------------------------- */

function GlobeStage({ className }) {
  const wrapRef = useRef(null);
  const simRef = useRef({ t: 0 });
  const contextCleanup = useRef(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const small = useMediaQuery('(max-width: 767px)');

  // Stop rendering while the globe is scrolled out of view (saves battery on laptops and phones).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '160px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => () => contextCleanup.current?.(), []);

  const onFail = useCallback(() => setFailed(true), []);
  const onReady = useCallback(() => setReady(true), []);

  if (failed) return <GlobeFallback className={className} />;

  // Render loop: runs while the globe is on screen, idles when it is not.
  const frameloop = inView ? 'always' : 'never';

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      {/* The picture is decorative. */}
      <div className="absolute inset-0" aria-hidden>
        {/* Static globe stays visible until the real one has loaded, then cross-fades away. */}
        <GlobeFallback
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1 }}
        />
        <Canvas
          dpr={[1, small ? 1.5 : 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          camera={{ position: [0, 0, 6.8], fov: 35, near: 0.1, far: 30 }}
          frameloop={frameloop}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            const canvas = gl.domElement;
            const onLost = (event) => {
              event.preventDefault();
              setFailed(true); // GPU reset: fall back to the static globe instead of a frozen frame
            };
            canvas.addEventListener('webglcontextlost', onLost);
            contextCleanup.current = () => canvas.removeEventListener('webglcontextlost', onLost);
          }}
        >
          {/* Sun from the upper left (oceans catch a soft sheen there). The blue limb glow
              comes from the atmosphere shader, not from an extra light, so no hot spots. */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[-6, 4, 7]} intensity={2.7} color="#FFFFFF" />
          <Earth
            simRef={simRef}
            reduceMotion={reduceMotion}
            small={small}
            onReady={onReady}
            onFail={onFail}
          />
        </Canvas>
      </div>
    </div>
  );
}

/**
 * Global-mobility globe. Lazy-loaded by GlobalSpotlight inside <Suspense>.
 * Without WebGL, or on any runtime failure, a static CSS globe is shown instead.
 */
export default function GlobeScene({ className }) {
  if (!isWebGLAvailable()) return <GlobeFallback className={className} />;

  return (
    <SceneErrorBoundary name="GlobeScene" fallback={<GlobeFallback className={className} />}>
      <GlobeStage className={className} />
    </SceneErrorBoundary>
  );
}