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

export const RADIUS = 1.8;

/* The globe does NOT rotate: it rests at a fixed orientation chosen (by a numeric
 * search) so India and the three Gulf destinations all face the viewer and are
 * centred in the globe. That keeps all three routes in view for the whole flight. */
export const TILT_X = 0.26;
export const GLOBE_ROTATION_Y = 3.6216;

/* India is the starting point (DutyLaunch's office is in Bengaluru). The three
 * destinations are the cities named, in this order, in the "Take your career
 * global" cards: Dubai (UAE), Riyadh (Saudi Arabia) and Doha (Qatar). */
export const CITIES = {
  BLR: { id: 'BLR', name: 'Bengaluru, India', lat: 12.97, lon: 77.59, phase: 0 },
  DXB: { id: 'DXB', name: 'Dubai, UAE', lat: 25.2, lon: 55.27, phase: 0.25 },
  RUH: { id: 'RUH', name: 'Riyadh, Saudi Arabia', lat: 24.71, lon: 46.68, phase: 0.5 },
  DOH: { id: 'DOH', name: 'Doha, Qatar', lat: 25.29, lon: 51.53, phase: 0.75 },
};
export const ORIGIN_ID = 'BLR';
export const DESTINATION_IDS = ['DXB', 'RUH', 'DOH'];

/* Three independent flights, all leaving India at the same moment and each
 * following its own great-circle arc. They never wait for one another: every
 * flight is a pure function of the shared clock. Flight time grows with
 * distance, so the planes arrive one after another (Dubai, Doha, Riyadh)
 * rather than all piling onto the Gulf at once — the three cities are only
 * ~0.1–0.25 world units apart on screen, closer than one plane is wide. */
export const FLIGHT = {
  cycle: 8.4, // seconds for one full cycle; every flight restarts together
  minDur: 4.0, // shortest flight (Dubai)
  maxDur: 6.2, // longest flight (Riyadh)
  hold: 0.6, // linger at the destination after landing
  fadeIn: 0.45, // plane and trail fade in as they leave India
  fadeOut: 0.5, // …and fade out after the hold, so planes never stack up
};

const FLIGHT_ALT = 0.012; // base altitude (fraction of RADIUS above the surface)
/* Extra arc height per flight (fraction of RADIUS, peaks mid-flight). */
const ARC_HEIGHT = { DXB: 0.012, RUH: 0.045, DOH: 0.028 };

/* Sideways bend per flight, as a distance on the unit sphere (peaks mid-flight,
 * zero at both ends). The three Gulf cities lie in almost the same direction
 * from India, so their true great circles nearly coincide: planes would fly as
 * one clump with one merged trail. Bending each route to a different side —
 * like the arcs on an airline route map — fans them out so each plane visibly
 * has its own path. Negative bends towards the right of travel (north-east),
 * positive towards the left (south-west); the order Dubai → Doha → Riyadh
 * matches where the cities actually sit, so the routes never cross. */
const ROUTE_BEND = { DXB: -0.16, DOH: -0.01, RUH: 0.16 };

/** Geographic coordinates → point on a sphere (matches the Earth texture's UV layout). */
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
 * Build the three flights once. Each is one great-circle leg from India to its
 * destination (the shortest route over a sphere).
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
      arc: ARC_HEIGHT[id] ?? 0.02,
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

/** Position of a flight at path parameter u (0‥1): the great circle, bent sideways
 *  and lifted into a gentle arc, in globe-local coordinates. */
export function pointAt(flight, u, out) {
  slerpDir(flight, u, out);
  out.addScaledVector(flight.normal, flight.bend * Math.sin(Math.PI * u)).normalize();
  return out.multiplyScalar(RADIUS * (1 + FLIGHT_ALT + flight.arc * Math.sin(Math.PI * u)));
}

export { easeInOut, clamp01 };

/**
 * Fill a pre-allocated Float32Array buffer with 3D points along the arc from 0 to uMax.
 * Used for zero-allocation progressive flight trails.
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
 * Where is this flight at `local` seconds into the cycle (0 ≤ local ≤ cycle)?
 *  - `pos` receives the 3D position (globe-local, including altitude),
 *  - `tan` receives the heading as a unit vector tangent to the globe.
 * Returns { alpha, moving }: `alpha` (0‥1) is how visible the plane and its
 * trail should be — fading in at departure, fading out after the hold at the
 * destination. Callers sampling the TRAIL pass a time already clamped to ≥ 0,
 * so the trail simply gathers at India as a flight begins.
 */
export function sampleFlight(flight, local, pos, tan) {
  const { dur } = flight;
  const t = THREE.MathUtils.clamp(local, 0, FLIGHT.cycle);
  const u = easeInOut(clamp01(t / dur));

  pointAt(flight, u, pos);

  // Heading: the direction the bent route is actually going (a short step along
  // it), flattened onto the surface.
  const e = 0.004;
  pointAt(flight, Math.max(u - e, 0), _p0);
  pointAt(flight, Math.min(u + e, 1), _p1);
  tan.copy(_p1).sub(_p0);
  tan.addScaledVector(pos, -tan.dot(pos) / pos.lengthSq()).normalize();

  const landedFor = t - dur;
  let alpha = 1;
  if (t < FLIGHT.fadeIn) alpha = t / FLIGHT.fadeIn;
  else if (landedFor > FLIGHT.hold) alpha = 1 - (landedFor - FLIGHT.hold) / FLIGHT.fadeOut;
  return { alpha: clamp01(alpha), moving: t < dur };
}

/** `count` + 1 points along a flight's arc (globe-local), for the faint route guide line. */
export function routePoints(flight, count = 64) {
  const out = [];
  for (let i = 0; i <= count; i += 1) out.push(pointAt(flight, i / count, new THREE.Vector3()));
  return out;
}