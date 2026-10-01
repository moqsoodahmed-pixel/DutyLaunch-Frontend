import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { isWebGLAvailable, SceneErrorBoundary } from './webgl.jsx';
import { IndiaMapMesh } from './IndiaMapMesh.jsx';

const RADIUS = 1.8;

/* Rotation (radians) that turns India + the Gulf toward the camera, and the
   arc lift factor. Verified numerically: at this rotation all four cities sit
   on the camera-facing hemisphere, and every arc stays above the sphere and
   peaks ~16% above it. */
const FACE_REGION_Y = -2.65;
const TILT_X = 0.22;
const ARC_LIFT = 1.35;

/* Origin is Bengaluru (DutyLaunch's office); destinations are the three cities
   in this section's opportunity cards, so the globe illustrates the copy. */
const ORIGIN = { name: 'Bengaluru', lat: 12.97, lon: 77.59 };
const DESTINATIONS = [
    { name: 'Dubai', lat: 25.2, lon: 55.27 },
    { name: 'Riyadh', lat: 24.71, lon: 46.68 },
    { name: 'Doha', lat: 25.29, lon: 51.53 },
];

function latLonToVector(lat, lon, r = RADIUS) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}

/** Evenly distributed points on a sphere (Fibonacci lattice) — the "data
 * globe" look. Self-coloured, so they read without environment reflections. */
function useFibonacciSphere(count) {
    return useMemo(() => {
        const positions = new Float32Array(count * 3);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i += 1) {
            const y = 1 - (i / (count - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const t = golden * i;
            positions[i * 3] = Math.cos(t) * r * RADIUS;
            positions[i * 3 + 1] = y * RADIUS;
            positions[i * 3 + 2] = Math.sin(t) * r * RADIUS;
        }
        return positions;
    }, [count]);
}

/** A glowing flight path plus a light pulse that travels origin → destination. */
function FlightArc({ from, to, color, delay, reduceMotion }) {
    const lineRef = useRef(null);
    const pulseRef = useRef(null);

    const curve = useMemo(() => {
        const start = latLonToVector(from.lat, from.lon);
        const end = latLonToVector(to.lat, to.lon);
        const control = start.clone().add(end).normalize().multiplyScalar(RADIUS * ARC_LIFT);
        return new THREE.QuadraticBezierCurve3(start, control, end);
    }, [from, to]);
    const points = useMemo(() => curve.getPoints(64), [curve]);

    useFrame(({ clock }, delta) => {
        if (reduceMotion) return;
        if (lineRef.current?.material) lineRef.current.material.dashOffset -= delta * 0.35;
        if (pulseRef.current) {
            const t = (clock.elapsedTime * 0.16 + delay) % 1;
            pulseRef.current.position.copy(curve.getPoint(t));
            // fade in/out at the ends so it reads as a departing/arriving light
            pulseRef.current.material.opacity = Math.sin(t * Math.PI);
        }
    });

    return (
        <group>
            <Line
                ref={lineRef}
                points={points}
                color={color}
                lineWidth={2.2}
                transparent
                opacity={0.95}
                dashed={!reduceMotion}
                dashSize={0.16}
                gapSize={0.12}
                dashOffset={delay}
            />
            {!reduceMotion && (
                <mesh ref={pulseRef}>
                    <sphereGeometry args={[0.05, 12, 12]} />
                    <meshBasicMaterial color="#FFFFFF" transparent toneMapped={false} />
                </mesh>
            )}
        </group>
    );
}

function CityMarker({ city, color, size = 0.05, reduceMotion }) {
    const haloRef = useRef(null);
    const position = useMemo(() => latLonToVector(city.lat, city.lon, RADIUS * 1.01), [city]);

    useFrame(({ clock }) => {
        if (reduceMotion || !haloRef.current) return;
        const wave = Math.sin(clock.elapsedTime * 2 + city.lon) * 0.5 + 0.5; // 0..1
        haloRef.current.scale.setScalar(1 + wave * 1.4);
        haloRef.current.material.opacity = 0.35 * (1 - wave);
    });

    return (
        <group position={position}>
            <mesh ref={haloRef}>
                <sphereGeometry args={[size * 1.6, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <mesh>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
        </group>
    );
}

function Globe() {
    const groupRef = useRef(null);
    const cloudsRef = useRef(null);
    const reduceMotion = usePrefersReducedMotion();

    // High-resolution true-color Earth day map (NASA Blue Marble)
    const earthTexture = useMemo(() => {
        const loader = new THREE.TextureLoader();
        const tex = loader.load('/images/globe/earth_day.jpg');
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    // Semi-transparent atmospheric cloud layer
    const cloudsTexture = useMemo(() => {
        const loader = new THREE.TextureLoader();
        const tex = loader.load('/images/globe/earth_clouds.png');
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    // Gentle sway around the facing angle (turns India + Gulf toward the camera)
    useFrame(({ clock }, delta) => {
        if (reduceMotion || !groupRef.current) return;
        const time = clock.elapsedTime;
        groupRef.current.rotation.y = FACE_REGION_Y + Math.sin(time * 0.22) * 0.16;

        // Slow realistic cloud drift
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.012;
        }
    });

    return (
        <group ref={groupRef} rotation={[TILT_X, FACE_REGION_Y, 0]}>
            {/* 1. True Colors Earth World Map Globe */}
            <mesh>
                <sphereGeometry args={[RADIUS, 64, 64]} />
                <meshStandardMaterial
                    map={earthTexture}
                    roughness={0.65}
                    metalness={0.06}
                />
            </mesh>

            {/* 2. Realistic Floating Cloud Layer */}
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

            {/* 3. Highlighted India Map & Regional Hubs */}
            <IndiaMapMesh radius={RADIUS} reduceMotion={reduceMotion} />

            {/* 4. Atmospheric Rayleigh Scattering Limb Glow */}
            <mesh scale={1.12}>
                <sphereGeometry args={[RADIUS, 48, 48]} />
                <meshBasicMaterial
                    color="#38BDF8"
                    transparent
                    opacity={0.22}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            <mesh scale={1.24}>
                <sphereGeometry args={[RADIUS, 48, 48]} />
                <meshBasicMaterial
                    color="#818CF8"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* 5. Global Mobility Flight Arcs from Bengaluru to Gulf hubs */}
            {DESTINATIONS.map((dest, i) => (
                <FlightArc
                    key={dest.name}
                    from={ORIGIN}
                    to={dest}
                    color={i === 1 ? '#F472B6' : '#38BDF8'}
                    delay={i * 0.4}
                    reduceMotion={reduceMotion}
                />
            ))}

            <CityMarker city={ORIGIN} color="#FBBF24" size={0.065} reduceMotion={reduceMotion} />
            {DESTINATIONS.map((dest) => (
                <CityMarker key={dest.name} city={dest} color="#FFFFFF" reduceMotion={reduceMotion} />
            ))}
        </group>
    );
}

/**
 * Global-mobility globe — lazy-loaded by GlobalSpotlight, wrapped in
 * <Suspense fallback={null}>, so three.js is never in the main bundle.
 * Returns nothing without WebGL; the section's cards and copy stand alone.
 */
export default function GlobeScene({ className }) {
    if (!isWebGLAvailable()) return null;

    return (
        <SceneErrorBoundary name="GlobeScene">
            <div className={className} aria-hidden>
                <Canvas
                    dpr={[1, 1.5]}
                    gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                    camera={{ position: [0, 0, 6.2], fov: 40 }}
                    style={{ pointerEvents: 'none' }}
                >
                    {/* Natural sun illumination & ambient fill for true earth colors */}
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[6, 4, 7]} intensity={2.2} color="#FFFFFF" />
                    <directionalLight position={[-6, -2, -4]} intensity={0.4} color="#3B82F6" />
                    <Globe />
                </Canvas>
            </div>
        </SceneErrorBoundary>
    );
}