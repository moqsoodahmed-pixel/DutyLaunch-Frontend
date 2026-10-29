import { useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { isWebGLAvailable, SceneErrorBoundary } from './webgl.jsx';
import { IndiaMapMesh } from './IndiaMapMesh.jsx';
import { AirplaneMesh } from './AirplaneMesh.jsx';
import { GlobeFallback } from './GlobeFallback.jsx';
import { IndiaFlag, UaeFlag, SaudiFlag, QatarFlag } from './CountryFlags.jsx';
import {
  CITIES,
  ORIGIN_ID,
  FLIGHT,
  RADIUS,
  TILT_X,
  GLOBE_ROTATION_Y,
  createFlights,
  sampleFlight,
  routePoints,
  fillArcBuffer,
  latLonToVector,
  easeInOut,
  clamp01,
} from './globeFlight.js';

// Pre-allocated scratch objects to prevent per-frame GC spikes
const _vPos = new THREE.Vector3();
const _vTan = new THREE.Vector3();
const _vUp = new THREE.Vector3();
const _vTarget = new THREE.Vector3();
const _vTemp = new THREE.Vector3();

// Offsets in screen space so badges stay compact, sharp, and never collide
const LABEL_OFFSETS = {
  RUH: { x: -58, y: -16 },
  DOH: { x: -54, y: 14 },
  DXB: { x: 14, y: -16 },
  BLR: { x: 16, y: 2 },
};

/**
 * An individual flight path with an authentic commercial passenger jet airliner
 * and a streaming progressive cyan trail.
 */
function LiveFlight({ flight, activeFlight, reduceMotion, onTouchDown }) {
  const planeRef = useRef(null);
  const trailRef = useRef(null);
  const guideRef = useRef(null);

  const trailPointsCount = 32;
  const trailBuffer = useMemo(() => new Float32Array((trailPointsCount + 1) * 3), [trailPointsCount]);
  const guidePoints = useMemo(() => routePoints(flight, 36), [flight]);

  const initialTrailPoints = useMemo(() => {
    const originVec = latLonToVector(flight.from.lat, flight.from.lon, RADIUS);
    return Array.from({ length: trailPointsCount + 1 }, () => originVec.clone());
  }, [flight, trailPointsCount]);

  const isActive = activeFlight === flight.id;

  useFrame(({ clock }, delta) => {
    if (!planeRef.current || !trailRef.current) return;

    const cycleTime = FLIGHT.cycle;
    const localTime = reduceMotion ? 2.4 : clock.elapsedTime % cycleTime;
    const { alpha, moving } = sampleFlight(flight, localTime, _vPos, _vTan);

    // 1. Position aircraft
    planeRef.current.position.copy(_vPos);

    // 2. Orient aircraft: forward along flight tangent, up along surface normal
    _vUp.copy(_vPos).normalize();
    planeRef.current.up.copy(_vUp);
    _vTarget.copy(_vPos).add(_vTan);
    planeRef.current.lookAt(_vTarget);

    // 3. Aerodynamic banking into turn
    const u = easeInOut(clamp01(localTime / flight.dur));
    const bankAngle = -flight.bend * Math.sin(Math.PI * u) * 0.85;
    planeRef.current.rotateZ(bankAngle);

    // 4. Visibility & Scale (prominent commercial airliner scale)
    planeRef.current.visible = alpha > 0.01;
    const baseScale = isActive ? 1.48 : 1.35;
    planeRef.current.scale.setScalar(baseScale);

    // 5. Update progressive glowing cyan trail
    if (trailRef.current?.geometry) {
      fillArcBuffer(flight, u, trailBuffer, trailPointsCount, _vTemp);
      trailRef.current.geometry.setPositions(trailBuffer);
      trailRef.current.computeLineDistances();

      if (trailRef.current.material) {
        trailRef.current.material.opacity = alpha * (isActive ? 1.0 : 0.9);
        if (!reduceMotion) {
          trailRef.current.material.dashOffset -= delta * 0.35;
        }
      }
    }

    if (!moving && localTime >= flight.dur && localTime <= flight.dur + 0.1) {
      onTouchDown?.(flight.id);
    }
  });

  return (
    <group name={`Flight-${flight.id}`}>
      {/* Faint dashed guide line */}
      <Line
        ref={guideRef}
        points={guidePoints}
        color={isActive ? '#38BDF8' : '#0284C7'}
        lineWidth={isActive ? 1.8 : 1.2}
        transparent
        opacity={isActive ? 0.35 : 0.18}
        dashed
        dashSize={0.12}
        gapSize={0.16}
        depthWrite={false}
      />

      {/* Dynamic progressive cyan trail */}
      <Line
        ref={trailRef}
        points={initialTrailPoints}
        color={isActive ? '#00F0FF' : '#38BDF8'}
        lineWidth={isActive ? 3.4 : 2.6}
        transparent
        opacity={0.92}
        dashed={!reduceMotion}
        dashSize={0.18}
        gapSize={0.1}
        depthWrite={false}
      />

      {/* Realistic 3D Commercial Passenger Jet */}
      <group ref={planeRef}>
        <AirplaneMesh
          opacity={1}
          scale={1}
          liveryColor={isActive ? '#0284C7' : '#0369A1'}
        />
      </group>
    </group>
  );
}

/**
 * Compact destination and departure pill badge.
 * Displays only the flag and city/origin name (no country names).
 */
function CityHub({ city, label, isOrigin = false, activeFlight, onHover, flag }) {
  const pulseRef = useRef(null);
  const position = useMemo(() => latLonToVector(city.lat, city.lon, RADIUS * 1.008), [city]);
  const offset = LABEL_OFFSETS[city.id] || { x: 15, y: -15 };
  const isActive = activeFlight === city.id;

  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    const wave = (clock.elapsedTime * 1.8 + (city.phase || 0) * 2) % 1;
    pulseRef.current.scale.setScalar(1 + wave * 1.8);
    pulseRef.current.material.opacity = (1 - wave) * 0.65;
  });

  return (
    <group position={position}>
      {/* Outer expanding ripple */}
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.025, 0.05, 24]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Surface target landing dot */}
      <mesh>
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshBasicMaterial
          color="#38BDF8"
          toneMapped={false}
        />
      </mesh>

      {/* Sleek, compact single-line badge */}
      <Html
        center={false}
        style={{
          pointerEvents: 'auto',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <div
          onMouseEnter={() => !isOrigin && onHover?.(city.id)}
          onMouseLeave={() => !isOrigin && onHover?.(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '9999px',
            backgroundColor: isActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.88)',
            border: isActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.35)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            lineHeight: '1',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            userSelect: 'none',
            cursor: isOrigin ? 'default' : 'pointer',
            transform: isActive ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Flag SVG */}
          <div style={{ width: '15px', height: '10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {flag}
          </div>

          {/* Single-line city / origin name */}
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.01em' }}>
            {label}
          </span>
        </div>
      </Html>
    </group>
  );
}

/**
 * 3D Globe with sunlit Earth textures, India highlighted, and 3 simultaneous flights.
 */
function Globe({ activeFlight, onHoverDestination, reduceMotion }) {
  const groupRef = useRef(null);
  const cloudsRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotYRef = useRef(GLOBE_ROTATION_Y);
  const tiltXRef = useRef(TILT_X);

  const flights = useMemo(() => createFlights(), []);

  // Daytime Earth texture (NASA Blue Marble)
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/globe/earth_day.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Atmospheric cloud layer
  const cloudsTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/globe/earth_clouds.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;

    if (!isDraggingRef.current) {
      const autoSway = reduceMotion ? 0 : Math.sin(time * 0.2) * 0.11;
      const targetRotY = GLOBE_ROTATION_Y + autoSway;
      rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, targetRotY, 0.05);
      tiltXRef.current = THREE.MathUtils.lerp(tiltXRef.current, TILT_X, 0.05);
    }

    groupRef.current.rotation.y = rotYRef.current;
    groupRef.current.rotation.x = tiltXRef.current;

    if (cloudsRef.current && !reduceMotion) {
      cloudsRef.current.rotation.y += delta * 0.012;
    }
  });

  const onPointerDown = useCallback((e) => {
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointerRef.current.x;
    const dy = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    rotYRef.current = THREE.MathUtils.clamp(
      rotYRef.current + dx * 0.005,
      GLOBE_ROTATION_Y - 0.35,
      GLOBE_ROTATION_Y + 0.35
    );
    tiltXRef.current = THREE.MathUtils.clamp(
      tiltXRef.current + dy * 0.005,
      0.12,
      0.38
    );
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  return (
    <group
      ref={groupRef}
      rotation={[TILT_X, GLOBE_ROTATION_Y, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* 1. Vibrant Sunlit 3D Earth Sphere */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.48}
          metalness={0.04}
        />
      </mesh>

      {/* 2. Soft Cloud Layer */}
      <mesh ref={cloudsRef} scale={1.012}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.28}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Accurately highlighted India boundary & internal illumination */}
      <IndiaMapMesh radius={RADIUS} reduceMotion={reduceMotion} />

      {/* 4. Subtle cyan atmospheric Fresnel rim */}
      <mesh scale={1.016}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.065}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. THREE Simultaneous 3D Commercial Passenger Flights */}
      {flights.map((flight) => (
        <LiveFlight
          key={flight.id}
          flight={flight}
          activeFlight={activeFlight}
          reduceMotion={reduceMotion}
        />
      ))}

      {/* 6. India Departure Hub (Single clean label: "India") */}
      <CityHub
        city={CITIES[ORIGIN_ID]}
        label="India"
        isOrigin
        activeFlight={activeFlight}
        flag={<IndiaFlag className="h-2.5 w-4" />}
      />

      {/* 7. Destination Hubs (Single clean labels: "Riyadh", "Doha", "Dubai") */}
      <CityHub
        city={CITIES.RUH}
        label="Riyadh"
        activeFlight={activeFlight}
        onHover={onHoverDestination}
        flag={<SaudiFlag className="h-2.5 w-4" />}
      />
      <CityHub
        city={CITIES.DOH}
        label="Doha"
        activeFlight={activeFlight}
        onHover={onHoverDestination}
        flag={<QatarFlag className="h-2.5 w-4" />}
      />
      <CityHub
        city={CITIES.DXB}
        label="Dubai"
        activeFlight={activeFlight}
        onHover={onHoverDestination}
        flag={<UaeFlag className="h-2.5 w-4" />}
      />
    </group>
  );
}

/**
 * Production-quality 3D Globe with 3 simultaneous flights.
 * Fully responsive, interactive, with WebGL fallback and error boundaries.
 */
export default function GlobeScene({
  className,
  activeFlight = null,
  onHoverDestination = null,
}) {
  const reduceMotion = usePrefersReducedMotion();

  if (!isWebGLAvailable()) {
    return <GlobeFallback className={className} />;
  }

  return (
    <SceneErrorBoundary name="GlobeScene" fallback={<GlobeFallback className={className} />}>
      <div className={`${className} cursor-grab active:cursor-grabbing select-none`} aria-hidden>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 6.2], fov: 38 }}
        >
          {/* Natural Sun Illumination for Vibrant Daytime Earth */}
          <ambientLight intensity={1.35} color="#FFFFFF" />
          <directionalLight position={[4, 3, 5]} intensity={2.6} color="#FFFFFF" />
          <directionalLight position={[-4, 2, -3]} intensity={0.55} color="#38BDF8" />

          <Globe
            activeFlight={activeFlight}
            onHoverDestination={onHoverDestination}
            reduceMotion={reduceMotion}
          />
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
}
