/**
 * Sales pulse: three bicycle wheels on a service rail. The wheel under the
 * pointer rises into a readable front view while its neighbours ease away.
 * The read-out names the selected signal; the drawing carries no text.
 */
const { Cam, clamp, fit, open, poly, proj, circ, tdone, tset, tval, tween, disposer, mk, pointer, register } = HL;

const N = 3;
const CENTERS = [-62, 0, 62];
const R = 28;
const REST = [-7, 5, -4];
const LIFT = 15;

function wheelPose(P, x, lean, lift) {
  const center = P(x, 0, 43 + lift);
  const outer = [];
  const inner = [];
  for (let i = 0; i < 24; i++) {
    const a = Math.PI * 2 * i / 24;
    const y = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    const yy = y * Math.cos(lean) - z * Math.sin(lean);
    const zz = y * Math.sin(lean) + z * Math.cos(lean);
    outer.push(P(x, yy, 43 + lift + zz));
    inner.push(P(x, yy * 0.78, 43 + lift + zz * 0.78));
  }
  const spokes = [];
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * 2 * i / 8;
    const y = Math.cos(a) * R * 0.78;
    const z = Math.sin(a) * R * 0.78;
    const yy = y * Math.cos(lean) - z * Math.sin(lean);
    const zz = y * Math.sin(lean) + z * Math.cos(lean);
    spokes.push([center, P(x, yy, 43 + lift + zz)]);
  }
  return { outer: poly(outer), inner: open(inner), spokes: spokes.map(([a, b]) => `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`).join(""), hub: center };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stagger = value;
  const C = Cam(45, 0.5, 1.72);
  fit(C, [[-95, -38, 0], [95, 38, 90]], 200, 166);
  const P = proj(C);
  const groups = CENTERS.map((x, i) => {
    const group = mk("g", {}, svg);
    const wheel = mk("path", { class: "sil" }, group);
    const crease = mk("path", { class: "lo" }, group);
    const spokes = mk("path", { class: "nf lo" }, group);
    const hub = mk("circle", { r: 4, class: "dot off" }, group);
    const angle = tween(REST[i]);
    const lift = tween(0);
    return { x, i, wheel, crease, spokes, hub, angle, lift };
  });

  // The rail is a simple back-to-front isometric solid line.
  const rail = P(-88, -6, 9), railEnd = P(88, -6, 9);
  mk("path", { d: `M${rail[0]} ${rail[1]}L${railEnd[0]} ${railEnd[1]}`, class: "sil" }, svg);
  mk("path", { d: `M${P(-88, 6, 0)[0]} ${P(-88, 6, 0)[1]}L${P(88, 6, 0)[0]} ${P(88, 6, 0)[1]}`, class: "lo" }, svg);

  const clock = register(stage, (_dt, now) => {
    let moving = false;
    groups.forEach((item) => {
      const q = wheelPose(P, item.x, tval(item.angle, now) * Math.PI / 180, tval(item.lift, now));
      item.wheel.setAttribute("d", q.outer);
      item.crease.setAttribute("d", q.inner);
      item.spokes.setAttribute("d", q.spokes);
      item.hub.setAttribute("cx", String(q.hub[0]));
      item.hub.setAttribute("cy", String(q.hub[1]));
      if (!tdone(item.angle, now) || !tdone(item.lift, now)) moving = true;
    });
    return moving;
  });
  bag.add(clock.unregister);

  const screenCenters = CENTERS.map((x) => P(x, 0, 43));
  function hit(point) {
    let best = -1, distance = Infinity;
    screenCenters.forEach((center, i) => {
      const d = Math.abs(point[0] - center[0]);
      if (d < distance && d < 54) { best = i; distance = d; }
    });
    return best;
  }

  let active = -1;
  function setActive(next) {
    if (next === active) return;
    const now = performance.now();
    const from = active < 0 ? next : active;
    active = next;
    groups.forEach((item) => {
      const delay = Math.abs(item.i - from) * stagger;
      const angle = next < 0 ? REST[item.i] : item.i === next ? 0 : item.i < next ? -18 : 16;
      tset(item.angle, angle, now, delay);
      tset(item.lift, item.i === next ? LIFT : 0, now, delay);
      item.wheel.classList.toggle("hi", item.i === next);
      item.hub.classList.toggle("dot", item.i === next);
      item.hub.classList.toggle("off", item.i !== next);
    });
    read.textContent = next < 0 ? "rest" : `signal ${next + 1}`;
    clock.wake();
  }

  bag.add(pointer(stage, { move: setActive, leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set: (v) => { stagger = v; }, destroy: bag.dispose };
}

hairline({
  name: "sales-pulse",
  means: "Three bicycle wheels hold a sales pulse: the wheel under the pointer rises for a closer read.",
  rules: [1, 2, 4, 8, 10],
  range: [0, 35, 80],
  tour: [[138, 166], [200, 140], [262, 166], null],
  mount,
});
