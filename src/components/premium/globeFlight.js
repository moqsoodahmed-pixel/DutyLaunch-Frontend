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
 * search) so India and the three Gulf destinations all face the viewer, are
 * centred in the globe, and sit well above the cards that overlap its lower edge.
 * That keeps the whole route in view, so the plane can fly it continuously. */
export const TILT_X = 0.26;
export const GLOBE_ROTATION_Y = 3.6216;

/* One tour takes this many seconds, then repeats seamlessly (it ends at the point
 * where it starts). */
export const TOUR_SECONDS = 16;

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

/* One tour: India → destination 1 → 2 → 3 → back to India, repeated forever. The
 * tour ends where it begins, so the loop is seamless. */
export const ROUTE = ['BLR', 'DXB', 'RUH', 'DOH', 'BLR'];

const HOLD_SECONDS = 0.5; // brief pause at each destination while the plane turns
const FLIGHT_ALT = 0.026; // constant, small altitude (fraction of RADIUS above the surface)
/* Leg durations are weighted by (angle + this), so the short hops between the Gulf
 * cities still take long enough to be seen instead of flashing past. */
const LEG_WEIGHT_BASE = 0.12;

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

/**
 * Build the flight plan once. Each leg is a great-circle arc (the shortest
 * route over a sphere). The whole tour lasts TOUR_SECONDS.
 */
export function createFlightPlan(cycleSeconds) {
  const legs = [];
  for (let i = 0; i < ROUTE.length - 1; i += 1) {
    const from = CITIES[ROUTE[i]];
    const to = CITIES[ROUTE[i + 1]];
    const a = latLonToVector(from.lat, from.lon, 1);
    const b = latLonToVector(to.lat, to.lon, 1);
    const angle = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
    legs.push({
      from,
      to,
      a,
      b,
      angle,
      sinW: Math.sin(angle),
      dur: 0,
    });
  }
  const cycle = cycleSeconds ?? TOUR_SECONDS;
  const flying = cycle - HOLD_SECONDS * legs.length;
  const totalWeight = legs.reduce((sum, l) => sum + l.angle + LEG_WEIGHT_BASE, 0);
  legs.forEach((l) => {
    l.dur = (flying * (l.angle + LEG_WEIGHT_BASE)) / totalWeight;
  });
  return { legs, cycle, hold: HOLD_SECONDS };
}

/** Unit vector on the great circle a→b at parameter u (0‥1). */
function slerpDir(leg, u, out) {
  const { a, b, angle, sinW } = leg;
  const s0 = Math.sin((1 - u) * angle) / sinW;
  const s1 = Math.sin(u * angle) / sinW;
  return out.set(0, 0, 0).addScaledVector(a, s0).addScaledVector(b, s1).normalize();
}

/** Direction of travel (unit, tangent to the sphere) at parameter u. */
function tangentDir(leg, u, out) {
  const { a, b, angle, sinW } = leg;
  const da = -Math.cos((1 - u) * angle);
  const db = Math.cos(u * angle);
  return out.set(0, 0, 0).addScaledVector(a, da).addScaledVector(b, db).multiplyScalar(angle / sinW).normalize();
}

/**
 * Where is the aircraft at `time` seconds, and which way is it heading?
 *  - `pos` receives the 3D position (globe-local, including altitude),
 *  - `tan` receives the heading as a unit vector tangent to the globe.
 * While holding at a destination the heading looks ahead to the NEXT leg, so
 * the aircraft turns on the spot before it sets off again.
 * Returns { moving, leg } for callers that want to know.
 */
export function samplePath(plan, time, pos, tan) {
  const { legs, cycle, hold } = plan;
  let t = ((time % cycle) + cycle) % cycle;
  let idx = legs.length - 1;
  let u = 1;
  let moving = false;

  for (let i = 0; i < legs.length; i += 1) {
    const leg = legs[i];
    if (t < leg.dur) {
      idx = i;
      u = easeInOut(t / leg.dur);
      moving = true;
      break;
    }
    t -= leg.dur;
    if (t < hold) {
      idx = i;
      u = 1;
      break;
    }
    t -= hold;
  }

  const leg = legs[idx];
  slerpDir(leg, u, pos).multiplyScalar(RADIUS * (1 + FLIGHT_ALT));

  if (moving) {
    tangentDir(leg, u, tan);
  } else {
    const next = legs[(idx + 1) % legs.length];
    tangentDir(next, 0, tan);
  }
  return { moving, leg };
}