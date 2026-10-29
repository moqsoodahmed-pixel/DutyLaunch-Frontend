import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Authentic commercial twin-engine passenger airliner (Boeing 787 / Airbus A350 style).
 * Features:
 *  - Smooth cylindrical fuselage with aerodynamic rounded dome nose (NOT a sharp fighter cone)
 *  - Wrap-around cockpit windshield band
 *  - Passenger cabin window cheatline along both sides
 *  - Wide swept airliner wings (swept backward from root to tip) with canted winglets
 *  - Twin turbofan jet engines mounted under the wings on pylons, with chrome intake lips & spinner cones
 *  - Tall swept vertical stabilizer fin with bright blue airline livery
 *  - Swept horizontal tailplanes
 *
 * Local orientation:
 *  - Forward (nose): +Z
 *  - Aft (tail): -Z
 *  - Up (roof/fin): +Y
 *  - Starboard (right wing): +X
 *  - Port (left wing): -X
 */
export function AirplaneMesh({ opacity = 1, scale = 1, liveryColor = '#0284C7' }) {
  const groupRef = useRef(null);

  const materials = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        roughness: 0.2,
        metalness: 0.06,
        transparent: true,
        opacity: 1,
      }),
      livery: new THREE.MeshStandardMaterial({
        color: liveryColor,
        roughness: 0.25,
        metalness: 0.15,
        transparent: true,
        opacity: 1,
      }),
      cockpit: new THREE.MeshStandardMaterial({
        color: '#071526',
        roughness: 0.08,
        metalness: 0.85,
        transparent: true,
        opacity: 1,
      }),
      windows: new THREE.MeshBasicMaterial({
        color: '#0A2540',
        transparent: true,
        opacity: 1,
      }),
      engineMetal: new THREE.MeshStandardMaterial({
        color: '#334155',
        metalness: 0.75,
        roughness: 0.35,
        transparent: true,
        opacity: 1,
      }),
      chromeLip: new THREE.MeshStandardMaterial({
        color: '#E2E8F0',
        metalness: 0.95,
        roughness: 0.12,
        transparent: true,
        opacity: 1,
      }),
      beacon: new THREE.MeshBasicMaterial({
        color: '#38BDF8',
        transparent: true,
        opacity: 0.9,
      }),
    };
  }, [liveryColor]);

  // Update opacities smoothly
  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, opacity));
    materials.body.opacity = clamped;
    materials.livery.opacity = clamped;
    materials.cockpit.opacity = clamped * 0.95;
    materials.windows.opacity = clamped;
    materials.engineMetal.opacity = clamped;
    materials.chromeLip.opacity = clamped;
    materials.beacon.opacity = clamped * 0.9;
  }, [opacity, materials]);

  // Dispose materials on unmount
  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials]);

  const geometries = useMemo(() => {
    // 1. Fuselage Cabin Tube (cylinder along Z)
    const cabinGeo = new THREE.CylinderGeometry(0.016, 0.015, 0.12, 24);
    cabinGeo.rotateX(Math.PI / 2);

    // 2. Rounded Passenger Nose Dome (smooth hemispherical dome)
    const noseGeo = new THREE.SphereGeometry(0.016, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.scale(1, 1, 1.4);
    noseGeo.translate(0, 0, 0.06);

    // 3. Tapered Tail Section
    const tailGeo = new THREE.CylinderGeometry(0.015, 0.004, 0.07, 24);
    tailGeo.rotateX(Math.PI / 2);
    tailGeo.translate(0, 0.003, -0.095);

    // 4. Curved Cockpit Windshield Band (wrap-around front visor)
    const cockpitGeo = new THREE.CylinderGeometry(0.0163, 0.0163, 0.012, 16, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    cockpitGeo.rotateZ(Math.PI / 2);
    cockpitGeo.translate(0, 0.007, 0.058);

    // 5. Passenger Cabin Window Cheatlines (along sides)
    const windowStripGeoR = new THREE.PlaneGeometry(0.095, 0.0035);
    windowStripGeoR.rotateY(Math.PI / 2);
    windowStripGeoR.translate(0.0162, 0.0025, -0.01);

    const windowStripGeoL = new THREE.PlaneGeometry(0.095, 0.0035);
    windowStripGeoL.rotateY(-Math.PI / 2);
    windowStripGeoL.translate(-0.0162, 0.0025, -0.01);

    // 6. Swept Airliner Main Wings (swept backward from +Z at root to -Z at tips)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.035);     // Root leading edge (+Z)
    wingShape.lineTo(0.14, -0.035); // Tip leading edge (-Z)
    wingShape.lineTo(0.135, -0.052);// Tip trailing edge (-Z)
    wingShape.lineTo(0, -0.018);    // Root trailing edge (-Z)
    wingShape.closePath();

    const rightWingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.0025, bevelEnabled: false });
    rightWingGeo.rotateX(Math.PI / 2); // Shape Y maps directly to world +Z

    const leftWingGeo = rightWingGeo.clone();
    leftWingGeo.scale(-1, 1, 1);

    // 7. Canted Winglets (upward angled wingtips with livery accent)
    const rightWingletGeo = new THREE.BoxGeometry(0.002, 0.016, 0.014);
    rightWingletGeo.translate(0.138, 0.008, -0.044);

    const leftWingletGeo = rightWingletGeo.clone();
    leftWingletGeo.scale(-1, 1, 1);

    // 8. Twin Turbofan Jet Engines (mounted under the wings on pylons)
    const pylonGeo = new THREE.BoxGeometry(0.002, 0.007, 0.022);
    const nacelleGeo = new THREE.CylinderGeometry(0.0088, 0.008, 0.034, 16);
    nacelleGeo.rotateX(Math.PI / 2);

    const intakeLipGeo = new THREE.TorusGeometry(0.0085, 0.0014, 8, 16);
    intakeLipGeo.translate(0, 0, 0.017);

    const spinnerGeo = new THREE.ConeGeometry(0.0035, 0.008, 12);
    spinnerGeo.rotateX(Math.PI / 2);
    spinnerGeo.translate(0, 0, 0.013);

    const exhaustGeo = new THREE.ConeGeometry(0.006, 0.01, 12);
    exhaustGeo.rotateX(-Math.PI / 2);
    exhaustGeo.translate(0, 0, -0.018);

    // 9. Tall Swept Vertical Stabilizer Fin (with airline livery)
    const finShape = new THREE.Shape();
    finShape.moveTo(-0.065, 0.012);  // root front (Z=-0.065, Y=0.012)
    finShape.lineTo(-0.110, 0.012);  // root rear (Z=-0.110, Y=0.012)
    finShape.lineTo(-0.115, 0.060);  // tip rear (Z=-0.115, Y=0.060)
    finShape.lineTo(-0.095, 0.060);  // tip front (Z=-0.095, Y=0.060)
    finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.0028, bevelEnabled: false });
    finGeo.rotateY(-Math.PI / 2);
    finGeo.translate(-0.0014, 0, 0);

    // 10. Swept Horizontal Tailplanes
    const hShape = new THREE.Shape();
    hShape.moveTo(0, -0.085);
    hShape.lineTo(0.055, -0.112);
    hShape.lineTo(0.052, -0.122);
    hShape.lineTo(0, -0.105);
    hShape.closePath();
    const rightHTailGeo = new THREE.ExtrudeGeometry(hShape, { depth: 0.002, bevelEnabled: false });
    rightHTailGeo.rotateX(Math.PI / 2);

    const leftHTailGeo = rightHTailGeo.clone();
    leftHTailGeo.scale(-1, 1, 1);

    return {
      cabin: cabinGeo,
      nose: noseGeo,
      tail: tailGeo,
      cockpit: cockpitGeo,
      windowStripR: windowStripGeoR,
      windowStripL: windowStripGeoL,
      rightWing: rightWingGeo,
      leftWing: leftWingGeo,
      rightWinglet: rightWingletGeo,
      leftWinglet: leftWingletGeo,
      pylon: pylonGeo,
      nacelle: nacelleGeo,
      intakeLip: intakeLipGeo,
      spinner: spinnerGeo,
      exhaust: exhaustGeo,
      fin: finGeo,
      rightHTail: rightHTailGeo,
      leftHTail: leftHTailGeo,
    };
  }, []);

  // Dispose geometries on unmount
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
    };
  }, [geometries]);

  return (
    <group ref={groupRef} scale={scale} visible={opacity > 0.01}>
      {/* 1. Fuselage Body, Rounded Passenger Nose Dome & Tail */}
      <mesh geometry={geometries.cabin} material={materials.body} castShadow />
      <mesh geometry={geometries.nose} material={materials.body} castShadow />
      <mesh geometry={geometries.tail} material={materials.body} castShadow />

      {/* 2. Cockpit Windshield Visor */}
      <mesh geometry={geometries.cockpit} material={materials.cockpit} />

      {/* 3. Passenger Windows Cheatline */}
      <mesh geometry={geometries.windowStripR} material={materials.windows} />
      <mesh geometry={geometries.windowStripL} material={materials.windows} />

      {/* 4. Swept Passenger Main Wings */}
      <mesh geometry={geometries.rightWing} material={materials.body} castShadow />
      <mesh geometry={geometries.leftWing} material={materials.body} castShadow />

      {/* 5. Canted Winglets */}
      <mesh geometry={geometries.rightWinglet} material={materials.livery} />
      <mesh geometry={geometries.leftWinglet} material={materials.livery} />

      {/* 6. Port Turbofan Engine (under left wing) */}
      <group position={[-0.052, -0.007, 0.005]}>
        <mesh position={[0, -0.003, 0]} geometry={geometries.pylon} material={materials.body} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.nacelle} material={materials.body} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.intakeLip} material={materials.chromeLip} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.spinner} material={materials.engineMetal} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.exhaust} material={materials.engineMetal} />
      </group>

      {/* 7. Starboard Turbofan Engine (under right wing) */}
      <group position={[0.052, -0.007, 0.005]}>
        <mesh position={[0, -0.003, 0]} geometry={geometries.pylon} material={materials.body} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.nacelle} material={materials.body} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.intakeLip} material={materials.chromeLip} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.spinner} material={materials.engineMetal} />
        <mesh position={[0, -0.007, 0]} geometry={geometries.exhaust} material={materials.engineMetal} />
      </group>

      {/* 8. Tall Swept Vertical Stabilizer Tailfin */}
      <mesh geometry={geometries.fin} material={materials.livery} castShadow />

      {/* 9. Swept Horizontal Tailplanes */}
      <mesh geometry={geometries.rightHTail} material={materials.livery} />
      <mesh geometry={geometries.leftHTail} material={materials.livery} />

      {/* 10. Tail Strobe Beacon */}
      <mesh position={[0, 0.062, -0.11]}>
        <sphereGeometry args={[0.0035, 8, 8]} />
        <primitive object={materials.beacon} attach="material" />
      </mesh>
    </group>
  );
}
