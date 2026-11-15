import { useMemo, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { isWebGLAvailable, SceneErrorBoundary } from './webgl.jsx';
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

// Pre-allocated scratch objects to prevent per-frame garbage collection
const _vPos = new THREE.Vector3();
const _vTan = new THREE.Vector3();
const _vUp = new THREE.Vector3();
const _vRight = new THREE.Vector3();
const _vTemp = new THREE.Vector3();
const _rotMatrix = new THREE.Matrix4();

// Screen-space pixel offsets so location badges are clearly separated and never collide
const LABEL_OFFSETS = {
  BLR: { x: 16, y: -4 },        // to the right of India origin
  DXB: { x: 16, y: -20 },       // up & right of Dubai
  DOH: { x: -60, y: 14 },       // down & left of Doha
  RUH: { x: -110, y: -14 },     // to the left of Riyadh
};

/**
 * An individual flight path with an authentic commercial passenger jet airliner
 * oriented strictly along its trajectory forward, with a glowing progressive cyan contrail.
 * Flights depart India in a graceful, coordinated international fan across the Arabian Sea.
 */
function LiveFlight({ flight, activeFlight, reduceMotion, onTouchDown }) {
  const planeRef = useRef(null);
  const trailRef = useRef(null);
  const guideRef = useRef(null);

  const trailPointsCount = 36;
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
    // Uniform, synchronized flight timeline produces smooth, coordinated international fan
    const localTime = reduceMotion ? 2.4 : clock.elapsedTime % cycleTime;
    const { alpha, moving } = sampleFlight(flight, localTime, _vPos, _vTan);

    // 1. Position aircraft in globe space
    planeRef.current.position.copy(_vPos);

    // 2. Strict Orthonormal Matrix Orientation:
    // Forward direction (+Z nose): _vTan
    // Up direction (+Y roof & tailfin): normal vector pointing away from Earth
    _vUp.copy(_vPos).normalize();
    // Starboard wing (+X right wing): cross(up, forward)
    _vRight.crossVectors(_vUp, _vTan).normalize();
    // Re-orthogonalize up: cross(forward, right)
    _vUp.crossVectors(_vTan, _vRight).normalize();

    // 3. Aerodynamic banking into turn around longitudinal forward axis
    const u = easeInOut(clamp01(localTime / flight.dur));
    const bankAngle = -flight.bend * Math.sin(Math.PI * u) * 0.45;
    _vRight.applyAxisAngle(_vTan, bankAngle);
    _vUp.applyAxisAngle(_vTan, bankAngle);

    // 4. Construct rotation matrix directly:
    // makeBasis sets column 0 = right (+X), column 1 = up (+Y), column 2 = forward (+Z)
    _rotMatrix.makeBasis(_vRight, _vUp, _vTan);
    planeRef.current.quaternion.setFromRotationMatrix(_rotMatrix);

    // 5. Visibility & Scale: comfortably visible commercial airliner ("little bit big, not too big": 0.42 - 0.48)
    planeRef.current.visible = alpha > 0.01;
    const baseScale = isActive ? 0.48 : 0.42;
    planeRef.current.scale.setScalar(baseScale);

    // 6. Progressive glowing cyan trail behind aircraft
    if (trailRef.current?.geometry) {
      fillArcBuffer(flight, u, trailBuffer, trailPointsCount, _vTemp);
      trailRef.current.geometry.setPositions(trailBuffer);
      trailRef.current.computeLineDistances();

      if (trailRef.current.material) {
        trailRef.current.material.opacity = alpha * (isActive ? 1.0 : 0.88);
        if (!reduceMotion) {
          trailRef.current.material.dashOffset -= delta * 0.4;
        }
      }
    }

    if (!moving && localTime >= flight.dur && localTime <= flight.dur + 0.1) {
      onTouchDown?.(flight.id);
    }
  });

  return (
    <group name={`Flight-${flight.id}`}>
      {/* Faint dashed guide corridor */}
      <Line
        ref={guideRef}
        points={guidePoints}
        color={isActive ? '#38BDF8' : '#0284C7'}
        lineWidth={isActive ? 1.8 : 1.2}
        transparent
        opacity={isActive ? 0.35 : 0.16}
        dashed
        dashSize={0.12}
        gapSize={0.16}
        depthWrite={false}
      />

      {/* Dynamic progressive glowing cyan trail */}
      <Line
        ref={trailRef}
        points={initialTrailPoints}
        color={isActive ? '#00F0FF' : '#38BDF8'}
        lineWidth={isActive ? 3.0 : 2.4}
        transparent
        opacity={0.92}
        dashed={!reduceMotion}
        dashSize={0.18}
        gapSize={0.09}
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
 * High-contrast location badge with country flag and proper name.
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
        <ringGeometry args={[0.026, 0.052, 24]} />
        <meshBasicMaterial
          color={isOrigin ? '#38BDF8' : '#00F0FF'}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Surface pin / beacon dot */}
      <mesh>
        <sphereGeometry args={[0.024, 16, 16]} />
        <meshBasicMaterial
          color="#38BDF8"
          toneMapped={false}
        />
      </mesh>

      {/* Sleek, high-contrast location badge */}
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
            gap: '6px',
            padding: '4px 9px',
            borderRadius: '9999px',
            backgroundColor: isActive ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.88)',
            border: isActive ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.55)' : '0 2px 10px rgba(0, 0, 0, 0.35)',
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

          {/* Proper location name */}
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.01em' }}>
            {label}
          </span>
        </div>
      </Html>
    </group>
  );
}

/**
 * 3D Globe with photorealistic daytime Earth satellite textures and 3 simultaneous flights.
 */
function Globe({ activeFlight, onHoverDestination, reduceMotion }) {
  const groupRef = useRef(null);
  const cloudsRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotYRef = useRef(GLOBE_ROTATION_Y);
  const tiltXRef = useRef(TILT_X);

  const flights = useMemo(() => createFlights(), []);

  // Daytime Earth satellite texture (NASA Blue Marble)
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/globe/earth_day.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Nighttime Earth lights texture (NASA Black Marble)
  const lightsTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/globe/earth_lights.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Atmospheric cloud layer
  const cloudsTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/images/globe/earth_clouds.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
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
      {/* 1. Realistic Satellite Earth with NASA Blue Marble & City Night Lights */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          emissiveMap={lightsTexture}
          emissive="#FFF2C2"
          emissiveIntensity={0.22}
          roughness={0.52}
          metalness={0.08}
        />
      </mesh>

      {/* 2. Soft Atmospheric Weather Clouds Layer */}
      <mesh ref={cloudsRef} scale={1.014}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.34}
          roughness={0.9}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Atmospheric Rayleigh Scattering Glow (Corona) */}
      <mesh scale={1.026}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#0EA5E9"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Soft Inner Atmospheric Blue Haze Rim */}
      <mesh scale={1.011}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.10}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Three Uniformly Staggered Commercial Passenger Flights */}
      {flights.map((flight) => (
        <LiveFlight
          key={flight.id}
          flight={flight}
          activeFlight={activeFlight}
          reduceMotion={reduceMotion}
        />
      ))}

      {/* 5. India Departure Hub */}
      <CityHub
        city={CITIES[ORIGIN_ID]}
        label="India"
        isOrigin
        activeFlight={activeFlight}
        flag={<IndiaFlag className="h-2.5 w-4" />}
      />

      {/* 6. Destination Hubs (Proper Names & Flags) */}
      <CityHub
        city={CITIES.DXB}
        label="Dubai, UAE"
        activeFlight={activeFlight}
        onHover={onHoverDestination}
        flag={<UaeFlag className="h-2.5 w-4" />}
      />
      <CityHub
        city={CITIES.DOH}
        label="Doha, Qatar"
        activeFlight={activeFlight}
        onHover={onHoverDestination}
        flag={<QatarFlag className="h-2.5 w-4" />}
      />
      <CityHub
        city={CITIES.RUH}
        label="Riyadh, Saudi Arabia"
        activeFlight={activeFlight}
        onHover={onHoverDestination}
        flag={<SaudiFlag className="h-2.5 w-4" />}
      />
    </group>
  );
}

/**
 * Responsive Camera Controller ensuring the 3D globe is NEVER clipped or cropped into a box
 * on any screen size or aspect ratio (desktop, tablet, mobile).
 */
function CameraController() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    // Base distance 6.0 keeps globe (radius 2.05) comfortably centered with ~10% breathing room
    const baseDistance = 6.0;
    if (aspect < 1.0) {
      // Narrow screen: pull back proportionately so horizontal frustum fits the full sphere
      camera.position.z = baseDistance / Math.max(aspect, 0.65);
    } else {
      camera.position.z = baseDistance;
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

/**
 * Production-quality 3D Globe with 3 uniform, staggered flights.
 * Large, photorealistic, unobstructed, with zero content overlapping.
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
      <div className={`${className} cursor-grab active:cursor-grabbing select-none overflow-visible`} aria-hidden>
        <Canvas
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 6.0], fov: 42 }}
        >
          <CameraController />

          {/* Natural Satellite Sunlight: bright, vibrant daytime illumination across India & Gulf */}
          <ambientLight intensity={1.15} color="#E0F2FE" />
          <directionalLight position={[4, 2.5, 4.5]} intensity={2.2} color="#FFFDF5" />
          <directionalLight position={[-4, -1, 3]} intensity={0.65} color="#38BDF8" />
          <directionalLight position={[0, -4, 2]} intensity={0.4} color="#BAE6FD" />

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
