import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import {
  INDIA_BOUNDARY,
  INDIA_LANDMASS_POINTS,
  INDIA_CITIES,
  ARABIA_BOUNDARY,
  SRI_LANKA_BOUNDARY,
} from './indiaMapData.js';

function latLonToVector(lat, lon, r) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * 3D India Map component rendered on the globe surface.
 * Includes authentic geographic boundary line, interior landmass glow points,
 * pulsing radar sweep from Bengaluru, major Indian tech hubs, and surrounding
 * regional coastline context (Arabian peninsula & Sri Lanka).
 */
export function IndiaMapMesh({ radius = 1.8, reduceMotion = false }) {
  const landmassRef = useRef(null);
  const radarRingRef = useRef(null);
  const boundaryGlowRef = useRef(null);

  // 1. India Border Points (clamped slightly above globe surface to avoid z-fighting)
  const indiaBorderPoints = useMemo(() => {
    return INDIA_BOUNDARY.map(([lat, lon]) => latLonToVector(lat, lon, radius * 1.004));
  }, [radius]);

  // 2. Regional Context: Arabia Coastline & Sri Lanka
  const arabiaPoints = useMemo(() => {
    return ARABIA_BOUNDARY.map(([lat, lon]) => latLonToVector(lat, lon, radius * 1.002));
  }, [radius]);

  const sriLankaPoints = useMemo(() => {
    return SRI_LANKA_BOUNDARY.map(([lat, lon]) => latLonToVector(lat, lon, radius * 1.003));
  }, [radius]);

  // 3. India Landmass Interior Dot Matrix
  const landmassBuffer = useMemo(() => {
    const coords = new Float32Array(INDIA_LANDMASS_POINTS.length * 3);
    INDIA_LANDMASS_POINTS.forEach(([lat, lon], idx) => {
      const v = latLonToVector(lat, lon, radius * 1.0035);
      coords[idx * 3] = v.x;
      coords[idx * 3 + 1] = v.y;
      coords[idx * 3 + 2] = v.z;
    });
    return coords;
  }, [radius]);

  // 4. Hub markers across India
  const hubPositions = useMemo(() => {
    return INDIA_CITIES.filter((c) => !c.hq).map((c) => ({
      name: c.name,
      pos: latLonToVector(c.lat, c.lon, radius * 1.005),
    }));
  }, [radius]);

  // Bengaluru HQ position
  const bengaluruPos = useMemo(() => {
    return latLonToVector(12.97, 77.59, radius * 1.006);
  }, [radius]);

  // Central India position for India country badge
  const centralIndiaPos = useMemo(() => {
    return latLonToVector(22.0, 78.5, radius * 1.008);
  }, [radius]);

  // Animation frame for radar waves, beacon pulse, and boundary breathing
  useFrame(({ clock }) => {
    if (reduceMotion) return;
    const time = clock.elapsedTime;

    // Pulse the radar ring at Bengaluru
    if (radarRingRef.current) {
      const cycle = (time * 1.5) % 1;
      radarRingRef.current.scale.setScalar(1 + cycle * 2.2);
      radarRingRef.current.material.opacity = 0.8 * (1 - cycle);
    }

    // Gentle breathing luminescence on the India boundary
    if (boundaryGlowRef.current?.material) {
      boundaryGlowRef.current.material.opacity = 0.55 + Math.sin(time * 2.0) * 0.25;
    }

    // Landmass points pulse
    if (landmassRef.current?.material) {
      landmassRef.current.material.size = 0.032 + Math.sin(time * 3.0) * 0.006;
    }
  });

  return (
    <group name="IndiaMap3D">
      {/* --- Surrounding Regional Coastlines Context --- */}
      <Line
        points={arabiaPoints}
        color="#38BDF8"
        lineWidth={1.2}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
      <Line
        points={sriLankaPoints}
        color="#38BDF8"
        lineWidth={1.6}
        transparent
        opacity={0.5}
        depthWrite={false}
      />

      {/* --- India Boundary: Primary Luminous Outline --- */}
      <Line
        points={indiaBorderPoints}
        color="#38BDF8"
        lineWidth={3.2}
        transparent
        opacity={0.98}
        toneMapped={false}
      />

      {/* --- India Boundary: Outer Soft Glow Halo --- */}
      <Line
        ref={boundaryGlowRef}
        points={indiaBorderPoints}
        color="#0284C7"
        lineWidth={6.0}
        transparent
        opacity={0.4}
        depthWrite={false}
      />

      {/* --- India Interior Landmass Dot Matrix --- */}
      <points ref={landmassRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={landmassBuffer.length / 3}
            array={landmassBuffer}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#93C5FD"
          size={0.034}
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* --- Indian Tech Hubs (Mumbai, Delhi, Hyderabad, Chennai, Kolkata, etc.) --- */}
      {hubPositions.map((hub) => (
        <group key={hub.name} position={hub.pos}>
          <mesh>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshBasicMaterial color="#7DD3EF" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* --- Bengaluru DutyLaunch Origin Hub with Pulsing Radar Beacon --- */}
      <group position={bengaluruPos}>
        {/* Core origin dot */}
        <mesh>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#F59E0B" toneMapped={false} />
        </mesh>
        {/* Inner radiant halo */}
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial
            color="#FDE68A"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        {/* Expanding radar wave ring */}
        {!reduceMotion && (
          <mesh ref={radarRingRef}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial
              color="#F59E0B"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* --- Country Center Highlight Marker --- */}
      <group position={centralIndiaPos}>
        <mesh>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshBasicMaterial color="#38BDF8" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
