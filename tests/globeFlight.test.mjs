import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  CITIES,
  DESTINATION_IDS,
  FLIGHT,
  ORIGIN_ID,
  RADIUS,
  createFlights,
  latLonToVector,
  routePoints,
  sampleFlight,
} from '../src/components/premium/globeFlight.js';

const flights = createFlights();
const pos = () => new THREE.Vector3();

test('there is exactly one flight to each of Dubai, Riyadh and Doha, all from India', () => {
  assert.deepEqual(flights.map((f) => f.id).sort(), [...DESTINATION_IDS].sort());
  assert.deepEqual(DESTINATION_IDS.slice().sort(), ['DOH', 'DXB', 'RUH']);
  flights.forEach((f) => assert.equal(f.from.id, ORIGIN_ID));
});

test('all three leave India at the same instant (no flight waits for another)', () => {
  const start = latLonToVector(CITIES[ORIGIN_ID].lat, CITIES[ORIGIN_ID].lon, 1);
  flights.forEach((f) => {
    const p = pos();
    sampleFlight(f, 0, p, pos());
    // at local time 0 every plane sits over India (radially above it)
    assert.ok(p.clone().normalize().angleTo(start) < 1e-6, `${f.id} not at India at t=0`);
  });
});

test('every flight lands exactly on its own destination', () => {
  flights.forEach((f) => {
    const p = pos();
    sampleFlight(f, f.dur, p, pos());
    const dest = latLonToVector(f.to.lat, f.to.lon, 1);
    assert.ok(p.clone().normalize().angleTo(dest) < 1e-6, `${f.id} missed its destination`);
  });
});

test('the three planes fan out: clearly separate through mid-flight', () => {
  // Same wall-clock moment for all three. The Gulf cities are only ~0.1 apart, so
  // separation can only be demanded away from take-off and landing.
  for (let t = 1.5; t <= 3.2; t += 0.1) {
    const pts = flights.map((f) => {
      const p = pos();
      sampleFlight(f, t, p, pos());
      return p;
    });
    for (let i = 0; i < pts.length; i += 1)
      for (let j = i + 1; j < pts.length; j += 1)
        assert.ok(pts[i].distanceTo(pts[j]) > 0.13, `${flights[i].id}/${flights[j].id} overlap at t=${t.toFixed(1)}`);
  }
});

test('the routes never cross each other (a clean fan, not a tangle)', () => {
  // Side of the Dubai route that Riyadh and Doha stay on, sampled along the path.
  const side = (f, g) => {
    const signs = new Set();
    const n = f.normal;
    for (let t = 1.2; t <= 3.4; t += 0.2) {
      const pf = pos(); const pg = pos();
      sampleFlight(f, t, pf, pos()); sampleFlight(g, t, pg, pos());
      signs.add(Math.sign(pg.clone().sub(pf).dot(n)));
    }
    return signs;
  };
  const by = Object.fromEntries(flights.map((f) => [f.id, f]));
  assert.equal(side(by.DXB, by.DOH).size, 1, 'Doha crosses the Dubai route');
  assert.equal(side(by.DXB, by.RUH).size, 1, 'Riyadh crosses the Dubai route');
  assert.equal(side(by.DOH, by.RUH).size, 1, 'Riyadh crosses the Doha route');
});

test('all three planes are in the air together, and visible, for a long stretch', () => {
  const shortest = Math.min(...flights.map((f) => f.dur));
  for (let t = FLIGHT.fadeIn; t < shortest; t += 0.25) {
    flights.forEach((f) => {
      const { alpha, moving } = sampleFlight(f, t, pos(), pos());
      assert.equal(moving, true, `${f.id} not flying at t=${t}`);
      assert.equal(alpha, 1, `${f.id} not fully visible at t=${t}`);
    });
  }
  assert.ok(shortest >= 3.5, 'the simultaneous window should be several seconds long');
});

test('arrivals are spread out so the planes do not stack over the Gulf', () => {
  const arrivals = flights.map((f) => f.dur).sort((a, b) => a - b);
  assert.ok(arrivals[1] - arrivals[0] >= 0.8, 'first two arrive too close together');
  assert.ok(arrivals[2] - arrivals[1] >= 0.8, 'last two arrive too close together');
});

test('everything finishes (hold + fade) before the cycle restarts', () => {
  flights.forEach((f) => {
    assert.ok(f.dur + FLIGHT.hold + FLIGHT.fadeOut < FLIGHT.cycle, `${f.id} overruns the cycle`);
    const end = sampleFlight(f, FLIGHT.cycle, pos(), pos());
    assert.equal(end.alpha, 0, `${f.id} still visible at the end of the cycle`);
    const begin = sampleFlight(f, 0, pos(), pos());
    assert.equal(begin.alpha, 0, `${f.id} not faded out at the start of the cycle`);
  });
});

test('planes stay above the surface and never drift off the globe', () => {
  flights.forEach((f) => {
    for (let t = 0; t <= FLIGHT.cycle; t += 0.1) {
      const p = pos();
      const tan = pos();
      sampleFlight(f, t, p, tan);
      assert.ok(p.length() > RADIUS, `${f.id} dipped into the globe at t=${t}`);
      assert.ok(p.length() < RADIUS * 1.12, `${f.id} flew too high at t=${t}`);
      assert.ok(Math.abs(tan.length() - 1) < 1e-6, 'heading is not a unit vector');
      assert.ok(Math.abs(tan.dot(p.clone().normalize())) < 1e-3, 'heading is not tangent to the globe');
    }
  });
});

test('the faint route guide matches the plane path and has no NaNs', () => {
  flights.forEach((f) => {
    const pts = routePoints(f, 32);
    assert.equal(pts.length, 33);
    pts.forEach((p) => assert.ok(Number.isFinite(p.x + p.y + p.z)));
    const endDir = pts[32].clone().normalize();
    assert.ok(endDir.angleTo(latLonToVector(f.to.lat, f.to.lon, 1)) < 1e-6);
  });
});
