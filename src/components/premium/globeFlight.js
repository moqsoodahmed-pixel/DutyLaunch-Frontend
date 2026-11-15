import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * Geography + flight schedule for the homepage globe.
 *
 * Everything here is pure maths (no React, no WebGL), so it can be
 * tested in Node. All positions are in the GLOBE'S OWN coordinate
 * system: the globe group rotates, and the plane, trail and markers are
 * its children, so they can never drift out of alignment with the
 * continents underneath them.
 * ------------------------------------------------------------------ */

export const RADIUS = 2.05;

/* Viewing angle oriented so India and the Gulf destinations face the viewer */
export const TILT_X = 0.22;
export const GLOBE_ROTATION_Y = 3.65;

/* Locations: India gateway origin and the three primary Gulf corridors */
export const CITIES = {
  BLR: { id: 'BLR', name: 'India', fullLabel: 'India', lat: 12.97, lon: 77.59, phase: 0 },
  DXB: { id: 'DXB', name: 'Dubai', fullLabel: 'Dubai, UAE', lat: 25.2, lon: 55.27, phase: 0.25 },
  RUH: { id: 'RUH', name: 'Riyadh', fullLabel: 'Riyadh, Saudi Arabia', lat: 24.71, lon: 46.68, phase: 0.5 },
  DOH: { id: 'DOH', name: 'Doha', fullLabel: 'Doha, Qatar', lat: 25.29, lon: 51.53, phase: 0.75 },
};
export const ORIGIN_ID = 'BLR';
export const DESTINATION_IDS = ['DXB', 'RUH', 'DOH'];

/* Flight parameters: Three simultaneous, smooth international passenger flights */
export const FLIGHT = {
  cycle: 8.4, // seconds for one full cycle
  minDur: 4.0, // shortest flight (Dubai)
  maxDur: 6.2, // longest flight (Riyadh)
  hold: 0.6, // linger at destination
  fadeIn: 0.45, // plane and trail fade in smoothly upon departure
  fadeOut: 0.5, // smooth fadeout after landing hold
};

const FLIGHT_ALT = 0.016; // base altitude fraction above globe surface
const ARC_HEIGHT = { DXB: 0.035, DOH: 0.042, RUH: 0.052 }; // peak cruising altitudes
const ROUTE_BEND = { DXB: -0.14, DOH: 0.0, RUH: 0.13 }; // natural lateral fan spread

/** Geographic coordinates → point on a sphere */
export function latLonToVector(lat, lon, r = RADIUS, target = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return target.set(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);

/**
 * Build the three flights. Each leg connects India to a Gulf destination
 * along a great-circle arc with gentle lateral fan and altitude curve.
 */
export function createFlights() {
  const origin = CITIES[ORIGIN_ID];
  const a = latLonToVector(origin.lat, origin.lon, 1);
  const legs = DESTINATION_IDS.map((id) => {
    const to = CITIES[id];
    const b = latLonToVector(to.lat, to.lon, 1);
    const angle = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
    return {
      id,
      from: origin,
      to,
      a,
      b,
      angle,
      sinW: Math.sin(angle),
      normal: new THREE.Vector3().crossVectors(a, b).normalize(),
      bend: ROUTE_BEND[id] ?? 0,
      arc: ARC_HEIGHT[id] ?? 0.04,
    };
  });
  const lo = Math.min(...legs.map((l) => l.angle));
  const hi = Math.max(...legs.map((l) => l.angle));
  legs.forEach((l) => {
    l.dur = FLIGHT.minDur + (FLIGHT.maxDur - FLIGHT.minDur) * (hi > lo ? (l.angle - lo) / (hi - lo) : 0);
  });
  return legs;
}

/** Unit vector on the great circle a→b at parameter u (0‥1). */
function slerpDir(leg, u, out) {
  const { a, b, angle, sinW } = leg;
  const s0 = Math.sin((1 - u) * angle) / sinW;
  const s1 = Math.sin(u * angle) / sinW;
  return out.set(0, 0, 0).addScaledVector(a, s0).addScaledVector(b, s1).normalize();
}

/** Position of a flight at path parameter u (0‥1) */
export function pointAt(flight, u, out) {
  slerpDir(flight, u, out);
  if (flight.bend) {
    out.addScaledVector(flight.normal, flight.bend * Math.sin(Math.PI * u)).normalize();
  }
  const alt = 1 + FLIGHT_ALT + flight.arc * Math.sin(Math.PI * u);
  return out.multiplyScalar(RADIUS * alt);
}

export { easeInOut, clamp01 };

/**
 * Fill a pre-allocated Float32Array buffer with 3D points along the arc from 0 to uMax.
 */
export function fillArcBuffer(flight, uMax, buf, count = 32, temp = new THREE.Vector3()) {
  const uClamped = THREE.MathUtils.clamp(uMax, 0, 1);
  for (let i = 0; i <= count; i += 1) {
    const u = (i / count) * uClamped;
    pointAt(flight, u, temp);
    buf[i * 3] = temp.x;
    buf[i * 3 + 1] = temp.y;
    buf[i * 3 + 2] = temp.z;
  }
}

const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();

/**
 * Sample flight state at time `local` (seconds into cycle).
 * Returns { alpha, moving } and populates `pos` (position) and `tan` (forward unit tangent).
 */
export function sampleFlight(flight, local, pos, tan) {
  const { dur } = flight;
  const t = THREE.MathUtils.clamp(local, 0, FLIGHT.cycle);
  const u = easeInOut(clamp01(t / dur));

  pointAt(flight, u, pos);

  // Exact forward tangent vector
  const e = 0.005;
  const u0 = Math.max(u - e, 0);
  const u1 = Math.min(u + e, 1);
  pointAt(flight, u0, _p0);
  pointAt(flight, u1, _p1);
  tan.copy(_p1).sub(_p0);
  // Ensure tangent is strictly orthogonal to normal at pos
  tan.addScaledVector(pos, -tan.dot(pos) / pos.lengthSq()).normalize();

  const landedFor = t - dur;
  let alpha = 1;
  if (t < FLIGHT.fadeIn) {
    alpha = t / FLIGHT.fadeIn;
  } else if (landedFor > FLIGHT.hold) {
    alpha = 1 - (landedFor - FLIGHT.hold) / FLIGHT.fadeOut;
  }
  return { alpha: clamp01(alpha), moving: t < dur };
}

/** Points along flight path for the faint corridor guide line */
export function routePoints(flight, count = 48) {
  const out = [];
  for (let i = 0; i <= count; i += 1) {
    out.push(pointAt(flight, i / count, new THREE.Vector3()));
  }
  return out;
}
