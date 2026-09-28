// The Landing hero's hands: two rigged 3D right hands (public/models/hand-right.glb,
// WebXR generic hand, W3C licence — see public/models/NOTICE.txt) posed joint by
// joint on a timeline, lit, rendered into a small off-screen texture, then redrawn
// as type: "◆" where light falls on the skin, "." where it is in shadow. At rest
// they echo the "Creation of Adam" pairing; play() runs the handshake.
//
// Poses, lighting and glyph grid were fitted against the hero artwork with the
// prototype's tuner (result-card-app/testing/handshake, not part of the build).
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const DEG = Math.PI / 180
const FINGERS = ['index', 'middle', 'ring', 'pinky']
const END = 6 // s: the timeline's last moment
export const SETTLED = 5.6 // s after play(): the shake has died away (onDone fires)

// ---------------------------------------------------------------- hand rig

const qAxis = (x, y, z, deg) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(x, y, z), deg * DEG)

// The model's joints are all siblings (tracked-hand format). Chain them into a
// real skeleton so bending a knuckle carries the rest of the finger with it.
function rigHand(scene) {
  scene.updateMatrixWorld(true)
  const bone = (n) => scene.getObjectByName(n)
  const wrist = bone('wrist')
  const chain = (names) => {
    wrist.attach(bone(names[0]))
    for (let i = 1; i < names.length; i++) bone(names[i - 1]).attach(bone(names[i]))
  }
  for (const f of FINGERS) {
    chain(['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'].map((p) => `${f}-finger-${p}`))
  }
  chain(['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'])

  const joints = {}
  scene.traverse((o) => {
    if (o.isBone) joints[o.name] = { bone: o, rest: o.quaternion.clone() }
    if (o.isSkinnedMesh) o.frustumCulled = false
  })

  // Re-express the hand in a tidy frame: wrist at the origin, fingers along +X,
  // back of the hand +Y (so palm -Y), thumb toward -Z. WebXR joints point along
  // -Z with +Y out of the back of the hand.
  wrist.updateMatrixWorld(true)
  const wp = new THREE.Vector3(), wq = new THREE.Quaternion()
  wrist.matrixWorld.decompose(wp, wq, new THREE.Vector3())
  const corr = new THREE.Group()
  corr.quaternion.copy(qAxis(0, 1, 0, -90)).multiply(wq.invert())
  const off = new THREE.Group()
  off.position.copy(wp).negate()
  corr.add(off)
  off.add(scene)
  return { frame: corr, joints }
}

// Flexion bends toward the palm (negative turn about the joint's X); spread
// swings sideways (about Y); twist rolls along the bone (about Z).
function bend(j, flex, spread = 0, twist = 0) {
  j.bone.quaternion.copy(j.rest).multiply(qAxis(0, 1, 0, spread)).multiply(qAxis(1, 0, 0, -flex)).multiply(qAxis(0, 0, 1, twist))
}

// Forearm, running back from the wrist along -X (hand frame: back of the hand +Y,
// thumb side -Z). The hand model is closed off 1–2 cm behind its wrist joint, and
// its cross-section there is a rounded rectangle, 5.3 cm across and 3.7 cm thick.
// The forearm starts just inside the hand with exactly that section, grows 5% so
// it closes over the hand's capped end, then swells and rounds out toward the
// elbow like a real forearm. Its first 6 cm are skinned to the wrist, so when the
// wrist bends the arm bends with it.
const ARM = { rings: 48, seg: 56, from: -0.004, to: 0.62 } // u = distance back from the wrist (m)
const WRIST = { ry: 0.0186, rz: 0.0265, cy: -0.0007, cz: 0.001, n: 3 } // the hand's section at its wrist joint
const armU = (k) => ARM.from + (ARM.to - ARM.from) * (k / (ARM.rings - 1)) ** 1.8 // denser near the wrist
const swellOf = (u) => Math.sin(Math.min(1, Math.max(0, u) / 0.2) * (Math.PI / 2))
const smooth = (a, b, x) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return u * u * (3 - 2 * u)
}

// thick / flat: forearm build (0 = default), fitted to the artwork
function shapeArm(geo, thick = 0, flat = 0) {
  const p = geo.attributes.position
  for (let k = 0; k < ARM.rings; k++) {
    const u = armU(k)
    const s = swellOf(u)
    // just inside the hand at the front ring, 5% proud of it over the hand's capped end, then relaxing
    const cover = 0.97 + 0.08 * smooth(-0.004, 0.005, u) - 0.05 * smooth(0.03, 0.08, u)
    const grow = (0.0095 + 0.008 * thick) * s
    const ry = (WRIST.ry + grow) * (1 - 0.25 * flat * s) * cover
    const rz = (WRIST.rz + grow) * cover
    const n = WRIST.n - 0.7 * s // squarish at the wrist, rounder up the arm
    const cy = WRIST.cy * (1 - s), cz = WRIST.cz * (1 - s)
    for (let j = 0; j <= ARM.seg; j++) {
      const a = (j / ARM.seg) * Math.PI * 2
      const sa = Math.sin(a), ca = Math.cos(a)
      p.setXYZ(k * (ARM.seg + 1) + j, -u, cy + ry * Math.sign(sa) * Math.abs(sa) ** (2 / n), cz + rz * Math.sign(ca) * Math.abs(ca) ** (2 / n))
    }
  }
  p.needsUpdate = true
  geo.computeVertexNormals()
  // the ring closes where its first and last vertex meet: share their normal so no line shows
  const nm = geo.attributes.normal
  for (let k = 0; k < ARM.rings; k++) {
    const a = k * (ARM.seg + 1), b = a + ARM.seg
    const x = nm.getX(a) + nm.getX(b), y = nm.getY(a) + nm.getY(b), z = nm.getZ(a) + nm.getZ(b)
    const l = Math.hypot(x, y, z) || 1
    nm.setXYZ(a, x / l, y / l, z / l)
    nm.setXYZ(b, x / l, y / l, z / l)
  }
}

function makeArm(material) {
  const n = ARM.rings * (ARM.seg + 1)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3))
  const idx = [], skinIndex = [], skinWeight = []
  for (let k = 0; k < ARM.rings; k++) {
    const w = 1 - Math.min(1, Math.max(0, armU(k) / 0.06)) // wrist influence
    const ws = w * w * (3 - 2 * w)
    for (let j = 0; j <= ARM.seg; j++) {
      skinIndex.push(0, 1, 0, 0)
      skinWeight.push(1 - ws, ws, 0, 0)
      if (k < ARM.rings - 1 && j < ARM.seg) {
        const a = k * (ARM.seg + 1) + j, b = a + ARM.seg + 1
        idx.push(a, a + 1, b, a + 1, b + 1, b) // outward-facing
      }
    }
  }
  geo.setIndex(idx)
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4))
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4))
  shapeArm(geo)
  const mesh = new THREE.SkinnedMesh(geo, material)
  const root = new THREE.Bone()
  const wristBone = new THREE.Bone()
  root.add(wristBone)
  mesh.add(root)
  mesh.bind(new THREE.Skeleton([root, wristBone]))
  mesh.frustumCulled = false
  mesh.userData = { wristBone, shape: '' }
  return mesh
}

// ---------------------------------------------------------------- poses
// One pose drives the left-hand person (A). The other person (B) is the same
// pose turned 180° about the vertical axis — a handshake is symmetric that way —
// except at rest, where each hand has its own pose.
//
// pos: wrist position (m) · yaw/pitch/roll: forearm direction and roll (deg)
// wflex/wdev: wrist bend toward palm / toward thumb · f: [knuckle, middle, tip, spread]
// thumb: [base swing toward palm, base lift from index, base twist, middle joint, tip joint]

const P = {
  // At rest the two hands echo the hero artwork (the "Creation of Adam" pairing):
  // A's forearm rises from the lower left, wrist dropped, fingers drooping; B's
  // forearm slopes down from the upper right, index finger pointing across, the
  // other three hanging straight down side by side.
  restA: {
    pos: [-0.176, -0.015, -0.017], yaw: -32.35, pitch: 22, roll: 61.61, wflex: 39.98, wdev: -9.03, armThick: 1.03, armFlat: -0.94,
    f: { index: [16.14, 13.45, 23.43, -12], middle: [3.37, 22.9, 0, -12], ring: [17.58, 26.03, 9.12, -10.29], pinky: [-11.88, 44.62, 30.96, -12] },
    thumb: [4.67, -3.8, 44.24, 51.49, 33.56],
  },
  restB: {
    pos: [-0.156, -0.03, -0.051], yaw: 34, pitch: -2.31, roll: -18.52, wflex: -3.24, wdev: -3.5, armThick: 0.6, armFlat: -1.71,
    f: { index: [-1.34, 14.7, 24.5, -14.62], middle: [95, 6, 17.1, -4.5], ring: [87.45, 0, 12, -7.5], pinky: [96, 14.7, 20.73, 2] },
    thumb: [36.83, 20.47, 36.72, 13.4, -1.69],
  },
  // hands up, thumbs up, fingers open — just before contact
  reach: {
    pos: [-0.11, 0.01, 0.02], yaw: -4, pitch: 9, roll: 90, wflex: -8, wdev: -26, armThick: 0, armFlat: 0,
    f: { index: [2, 4, 3, -4], middle: [1, 3, 3, 0], ring: [2, 4, 3, 3], pinky: [3, 5, 4, 7] },
    thumb: [-12, 26, 0, 4, 6],
  },
  // palms meet, webs locked
  contact: {
    pos: [-0.062, 0.008, 0.0178], yaw: -4, pitch: 10, roll: 90, wflex: -4, wdev: -40, armThick: 0, armFlat: 0,
    f: { index: [22, 22, 10, -3], middle: [24, 24, 12, 0], ring: [26, 26, 12, 2], pinky: [28, 28, 14, 5] },
    thumb: [-6, 18, 0, 10, 10],
  },
  // fingers wrapped around the other hand
  grip: {
    pos: [-0.059, 0.008, 0.0175], yaw: -4, pitch: 10, roll: 90, wflex: -4, wdev: -41, armThick: 0, armFlat: 0,
    f: { index: [44, 58, 30, -3], middle: [48, 62, 32, 0], ring: [50, 64, 34, 2], pinky: [52, 66, 36, 5] },
    thumb: [4, 8, 0, 24, 16],
  },
}
// Lighting, fitted to the artwork's brightness. key: main light strength,
// keyEl/keyAz: its height and side angle (deg); thr: how bright the skin must be
// to get a ◆ instead of a dot; edge: how much surfaces darken as they turn away.
const LOOK = { key: 4.1, keyEl: 65, keyAz: -56.25, hemi: 0.14, fill: 0.28, rim: 0, thr: 0.12, edge: 1 }

const easeInOutSine = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u)
// [time (s), pose for A, pose for B]. The text leaves first, then one continuous
// move: the hands lift and travel, slow as they meet, and close.
const KEYS = [
  [0, 'restA', 'restB'],
  [0.45, 'restA', 'restB'],
  [2.55, 'reach', 'reach'],
  [3.3, 'contact', 'contact'],
  [3.9, 'grip', 'grip'],
]
// camera push-in, and the shake once the grip has closed
const T = { push: [0.9, 3.9], shake: 3.9 }
// how far the camera closes in on the grip (fraction of its distance), and how
// much brighter skin must be to stay lit once clasped, so the thumbs and wrapped
// fingers stand apart instead of merging into one lit mass
const PUSH = { in: 0.42, thr: 0.12 }
const FINGER_DELAY = { index: 0, middle: 0.04, ring: 0.08, pinky: 0.12 }
// How far apart the hands rest is set on screen, not in the pose: the gap between
// the nearest fingertips is REST_GAP of the page width, whatever the screen's
// proportions (see fitSpread). The extra distance fades out as the hands reach.
const REST_GAP = 0.127

// Every pose value follows a smooth curve through the keys (monotone cubic:
// no stop at each key, no overshoot past it), easing out of rest and into the grip.
function curve(t, times, ys) {
  const n = ys.length
  if (t <= times[0]) return ys[0]
  if (t >= times[n - 1]) return ys[n - 1]
  const d = [], m = []
  for (let k = 0; k < n - 1; k++) d.push((ys[k + 1] - ys[k]) / (times[k + 1] - times[k]))
  for (let k = 0; k < n; k++) {
    if (k === 0 || k === n - 1) m.push(0)
    else if (d[k - 1] * d[k] <= 0) m.push(0)
    else m.push(Math.sign(d[k]) * Math.min((Math.abs(d[k - 1]) + Math.abs(d[k])) / 2, 3 * Math.abs(d[k - 1]), 3 * Math.abs(d[k])))
  }
  let k = 0
  while (t > times[k + 1]) k++
  const h = times[k + 1] - times[k], s = (t - times[k]) / h
  const s2 = s * s, s3 = s2 * s
  return (2 * s3 - 3 * s2 + 1) * ys[k] + (s3 - 2 * s2 + s) * h * m[k] + (-2 * s3 + 3 * s2) * ys[k + 1] + (s3 - s2) * h * m[k + 1]
}

// pose <-> flat list of numbers, so every value can run through curve()
const flat = (v) => (typeof v === 'number' ? [v] : Array.isArray(v) ? v.flatMap(flat) : Object.keys(v).flatMap((k) => flat(v[k])))
function unflat(shape, vals, at = { i: 0 }) {
  if (typeof shape === 'number') return vals[at.i++]
  if (Array.isArray(shape)) return shape.map((s) => unflat(s, vals, at))
  return Object.fromEntries(Object.keys(shape).map((k) => [k, unflat(shape[k], vals, at)]))
}

// ---------------------------------------------------------------- part labels
// A second, unlit pass paints every visible pixel with which hand and which part
// (palm, a finger, the thumb, the forearm) it belongs to. The glyph pass puts a
// dot in a lit run wherever one finger meets another or the other hand, so
// fingers stay separate even where they lie flat against each other.
const PART = { palm: 0, index: 1, middle: 2, ring: 3, pinky: 4, thumb: 5, arm: 6 }
const partOf = (name) =>
  name.startsWith('thumb') ? PART.thumb : name.includes('metacarpal') || name === 'wrist' ? PART.palm : PART[name.split('-')[0]] ?? PART.palm

const LABEL_FRAG = 'uniform float hand; varying float vPart; void main(){ gl_FragColor = vec4(floor(vPart + 0.5) / 8.0, hand, 1.0, 1.0); }'

const skinLabelMaterial = (hand, parts) =>
  new THREE.ShaderMaterial({
    uniforms: { hand: { value: hand }, parts: { value: parts } },
    vertexShader: /* glsl */ `
      #include <common>
      #include <skinning_pars_vertex>
      uniform float parts[32];
      varying float vPart;
      void main(){
        #include <skinbase_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        #include <project_vertex>
        // label by the bone with the most influence on this vertex
        float bi = skinIndex.x, bw = skinWeight.x;
        if (skinWeight.y > bw) { bw = skinWeight.y; bi = skinIndex.y; }
        if (skinWeight.z > bw) { bw = skinWeight.z; bi = skinIndex.z; }
        if (skinWeight.w > bw) { bw = skinWeight.w; bi = skinIndex.w; }
        vPart = parts[int(bi)];
      }`,
    fragmentShader: LABEL_FRAG,
  })

const armLabelMaterial = (hand) =>
  new THREE.ShaderMaterial({
    uniforms: { hand: { value: hand } },
    vertexShader: /* glsl */ `
      #include <common>
      #include <skinning_pars_vertex>
      varying float vPart;
      void main(){
        #include <skinbase_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>
        #include <project_vertex>
        vPart = 6.0;
      }`,
    fragmentShader: LABEL_FRAG,
  })

// ---------------------------------------------------------------- glyph pass
// The hero artwork is type: rows of "◆" where light falls on the skin and "."
// where the skin is in shadow, nothing outside the hands. Measured off it: at
// 1920 px wide a glyph every 9.13 px and a line every 18.61 px, the first glyph
// centred 3 px in and the first line 6 px down. The grid scales with the page
// width and stays put while the hands move, so glyphs switch on and off in
// place rather than sliding.
const GRID = { perWidth: 9.13 / 1920, aspect: 18.61 / 9.13, min: 4.5, x0: 3 / 9.13, y0: 6.05 / 18.61 }

const GLYPH_FRAG = /* glsl */ `
  uniform sampler2D tScene; uniform sampler2D tLabel; uniform vec2 res; uniform vec2 cell; uniform vec2 phase; uniform float thr;
  uniform float focus; uniform vec2 dia; uniform float dotR; uniform float dotY;
  // cells are counted from the top-left corner, like the artwork's grid
  vec2 uvOf(vec2 c){ vec2 px = phase + (c + 0.5) * cell; return vec2(px.x / res.x, 1.0 - px.y / res.y); }
  vec3 lab(vec2 c){ return texture2D(tLabel, uvOf(c)).rgb; }
  // 1 when the cell belongs to the other hand, or to a different finger (or the
  // thumb). Palm, wrist and forearm are one surface, so they never break a run.
  float digit(float r){ float k = floor(r * 8.0 + 0.5); return k > 0.5 && k < 5.5 ? k : 0.0; }
  float differs(vec3 n, vec2 c){
    vec3 m = lab(c);
    if (m.b < 0.5) return 0.0;
    if (abs(n.g - m.g) > 0.02) return 1.0;
    float a = digit(n.r), b = digit(m.r);
    return a > 0.0 && b > 0.0 && a != b ? 1.0 : 0.0;
  }
  // 0 = empty, 1 = "." skin in shadow, 2 = "◆" lit skin
  float classOf(vec2 c){
    vec3 n = lab(c);
    if (n.b < 0.5) return 0.0;
    float lum = dot(texture2D(tScene, uvOf(c)).rgb, vec3(0.299, 0.587, 0.114));
    // where one part meets another the lit run breaks for a dot, so fingers read apart
    float seam = max(differs(n, c + vec2(1.0, 0.0)), differs(n, c + vec2(0.0, 1.0)));
    return lum > thr && seam < 0.5 ? 2.0 : 1.0;
  }
  void main(){
    vec2 fp = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y) - phase;
    vec2 c = floor(fp / cell);
    vec2 p = fp - (c + 0.5) * cell;
    // A "◆" is a little wider than its cell, so neighbours touch at their tips
    // and a lit run reads as one chain; check the cells either side too.
    vec2 h = dia * cell;
    float a = 0.0;
    for (int k = -1; k <= 1; k++) {
      float cls = classOf(c + vec2(float(k), 0.0));
      vec2 q = abs(p - vec2(float(k) * cell.x, 0.0));
      if (cls > 1.5) {
        float d = (q.x / h.x + q.y / h.y - 1.0) / length(1.0 / h);
        a = max(a, 1.0 - smoothstep(-0.7, 0.7, d));
      } else if (cls > 0.5 && k == 0) {
        // "." sits low in the line, like the full stop it is
        vec2 e = abs(p - vec2(0.0, dotY * cell.y)) - vec2(dotR * cell.x);
        float d = length(max(e, 0.0)) + min(max(e.x, e.y), 0.0);
        a = max(a, 1.0 - smoothstep(-0.6, 0.6, d));
      }
    }
    // as the hands meet, the forearms fade toward the screen edges, keeping the eye on the grip
    float edge = abs(gl_FragCoord.x / res.x - 0.5) * 2.0;
    a *= 1.0 - focus * 0.85 * smoothstep(0.35, 0.97, edge);
    gl_FragColor = vec4(mix(vec3(10.0 / 255.0), vec3(0.97, 0.965, 0.95), a), 1.0);
  }`

// Skin shading on top of the standard material: surfaces darken as they turn
// away from the camera (edgeAmt), which gives the silhouettes dotted rims.
function addEdgeShading(material, edge) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.edgeAmt = edge
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float edgeAmt;')
      .replace(
        '#include <opaque_fragment>',
        `float facing = abs(dot(normal, normalize(vViewPosition)));
        outgoingLight *= mix(1.0, smoothstep(0.05, 0.62, facing), edgeAmt);
        #include <opaque_fragment>`
      )
  }
}

// ---------------------------------------------------------------- the scene

// Draws the resting hands into `canvas` once the model has loaded (onReady), and
// runs the handshake on play(), calling onDone once it has settled. Throws if
// WebGL is unavailable; onError reports a model that could not load.
export function createHandshake(canvas, { modelUrl, onReady, onDone, onError }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 1)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(26, 1, 0.01, 10)

  // Lit from above and a little in front, with little fill: the glyph pass turns
  // brightness into ◆ or dot, so shadowed sides and the gaps between fingers
  // need to fall away for the hands to read.
  const edge = { value: LOOK.edge }
  const skin = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, roughness: 0.5, metalness: 0 })
  const sleeve = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, roughness: 0.5, metalness: 0 }) // forearm, same tone as the hand
  addEdgeShading(skin, edge)
  addEdgeShading(sleeve, edge)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, LOOK.hemi)
  const key = new THREE.DirectionalLight(0xffffff, LOOK.key)
  const el = LOOK.keyEl * DEG, az = LOOK.keyAz * DEG
  key.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
  const fill = new THREE.DirectionalLight(0xffffff, LOOK.fill)
  fill.position.set(0.4, -0.2, 1)
  const rim = new THREE.DirectionalLight(0xffffff, LOOK.rim)
  rim.position.set(0.3, 0.5, -1)
  scene.add(hemi, key, fill, rim)
  // Depth fade: the far hand sits a step darker than the near one, so the two
  // read apart once they overlap. Range follows the camera (see placeCamera).
  scene.fog = new THREE.Fog(0x000000, 1, 2)

  // Both hands sit in one group so the shake moves them as a single clasp.
  const clasp = new THREE.Group()
  scene.add(clasp)

  const labelled = [] // [mesh, lit material, label material]
  const disposables = [skin, sleeve]

  function buildPerson(gltf, hand) {
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return
      o.material = skin
      const parts = new Array(32).fill(0)
      o.skeleton.bones.forEach((b, i) => (parts[i] = partOf(b.name)))
      const label = skinLabelMaterial(hand, parts)
      labelled.push([o, skin, label])
      disposables.push(o.geometry, label)
    })
    const { frame, joints } = rigHand(gltf.scene)
    const turn = new THREE.Group() // B is turned 180° around the vertical axis
    const arm = new THREE.Group() // forearm direction, placed at the wrist
    const wrist = new THREE.Group() // wrist bend
    const forearm = makeArm(sleeve)
    const label = armLabelMaterial(hand)
    labelled.push([forearm, sleeve, label])
    disposables.push(forearm.geometry, label)
    arm.add(forearm, wrist)
    wrist.add(frame)
    turn.add(arm)
    clasp.add(turn)
    return { turn, arm, wrist, joints, forearm }
  }

  function apply(person, p, side) {
    person.turn.rotation.y = side === 'B' ? Math.PI : 0
    person.arm.position.set(...p.pos)
    person.arm.quaternion.copy(qAxis(0, 1, 0, p.yaw)).multiply(qAxis(0, 0, 1, p.pitch)).multiply(qAxis(1, 0, 0, p.roll))
    person.wrist.quaternion.copy(qAxis(0, 1, 0, p.wdev)).multiply(qAxis(0, 0, 1, -p.wflex))
    // the forearm's wrist end follows the wrist bend; its build changes between poses
    person.forearm.userData.wristBone.quaternion.copy(person.wrist.quaternion)
    const shape = `${p.armThick.toFixed(3)} ${p.armFlat.toFixed(3)}`
    if (shape !== person.forearm.userData.shape) {
      person.forearm.userData.shape = shape
      shapeArm(person.forearm.geometry, p.armThick, p.armFlat)
    }
    const J = person.joints
    for (const n of FINGERS) {
      const [k, m, tip, spread] = p.f[n]
      bend(J[`${n}-finger-phalanx-proximal`], k, spread)
      bend(J[`${n}-finger-phalanx-intermediate`], m)
      // A fingertip joint can't curl much further than the joint below it (the two
      // are tied by the same tendon), so keep poses anatomically possible.
      bend(J[`${n}-finger-phalanx-distal`], Math.max(-8, Math.min(tip, m * 0.85 + 12)))
    }
    const [swing, lift, twist, mid, tipJ] = p.thumb
    bend(J['thumb-metacarpal'], swing, lift, twist)
    bend(J['thumb-phalanx-proximal'], mid)
    bend(J['thumb-phalanx-distal'], tipJ)
  }

  // ---- timeline

  let spread = 0 // m, each hand moved outward at rest (see fitSpread)
  const keyPose = (name) => {
    const p = P[name]
    if (!spread || !name.startsWith('rest')) return p
    return { ...p, pos: [p.pos[0] - spread, p.pos[1], p.pos[2]] } // B is turned 180°, so -x moves it right
  }
  function sample(t, side) {
    const col = side === 'A' ? 1 : 2
    const poses = KEYS.map((k) => keyPose(k[col]))
    const times = KEYS.map((k) => k[0])
    const lists = poses.map(flat)
    return unflat(poses[0], lists[0].map((_, i) => curve(t, times, lists.map((l) => l[i]))))
  }
  function poseAt(t, side) {
    const p = sample(t, side)
    // fingers close one after another, index first
    const f = {}
    for (const n of FINGERS) f[n] = sample(t - FINGER_DELAY[n], side).f[n]
    return { ...p, f }
  }

  // ---- glyph pass and layout

  let rt = null, nrt = null // lit scene and part labels, two texels per glyph cell
  const glyphMat = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: null }, tLabel: { value: null }, res: { value: new THREE.Vector2() }, cell: { value: new THREE.Vector2() },
      phase: { value: new THREE.Vector2() }, thr: { value: LOOK.thr }, focus: { value: 0 },
      dia: { value: new THREE.Vector2(0.63, 0.28) }, dotR: { value: 0.165 }, dotY: { value: 0.25 },
    },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: GLYPH_FRAG,
    depthTest: false,
    depthWrite: false,
  })
  const quadScene = new THREE.Scene()
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const quadGeo = new THREE.PlaneGeometry(2, 2)
  quadScene.add(new THREE.Mesh(quadGeo, glyphMat))
  disposables.push(glyphMat, quadGeo)

  let camDist = 1
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Wide screens show both forearms coming in from the edges. On portrait phones,
    // frame tighter and let the forearms run off the sides so the hands stay large.
    const vHalf = Math.tan((camera.fov / 2) * DEG)
    const halfWidth = camera.aspect < 1 ? 0.16 : 0.27
    camDist = Math.max(halfWidth / (vHalf * camera.aspect), 0.16 / vHalf)
    camera.updateProjectionMatrix()
    const cx = Math.max(GRID.min, w * GRID.perWidth) * dpr
    const u = glyphMat.uniforms
    u.cell.value.set(cx, cx * GRID.aspect)
    u.phase.value.set((GRID.x0 - 0.5) * cx, (GRID.y0 - 0.5) * cx * GRID.aspect)
    u.res.value.set(w * dpr, h * dpr)
    const cols = Math.ceil((w * dpr) / cx), rows = Math.ceil((h * dpr) / (cx * GRID.aspect))
    rt?.dispose()
    rt = new THREE.WebGLRenderTarget(cols * 2, rows * 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, samples: 4 })
    nrt?.dispose()
    nrt = new THREE.WebGLRenderTarget(cols * 2, rows * 2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
    u.tScene.value = rt.texture
    u.tLabel.value = nrt.texture
    fitSpread()
  }

  function placeCamera(t) {
    // a slow push-in while the hands travel, settling as they close
    const u = easeInOutSine(Math.min(1, Math.max(0, (t - T.push[0]) / (T.push[1] - T.push[0]))))
    const dist = camDist * (1 - PUSH.in * u)
    scene.fog.near = dist - 0.02
    scene.fog.far = dist + 0.16
    glyphMat.uniforms.focus.value = u
    // outlines come back in full as the hands meet: they keep the grip readable
    edge.value = LOOK.edge + (1 - LOOK.edge) * u
    glyphMat.uniforms.thr.value = LOOK.thr + PUSH.thr * u
    camera.position.set(0, 0, dist)
    camera.lookAt(0, 0, 0)
  }

  // Gap between the two hands at rest, as a fraction of the page width (negative
  // when they overlap): the nearest points of the two hand meshes, projected.
  const probe = new THREE.Vector3()
  function restGap() {
    apply(A, poseAt(0, 'A'), 'A')
    apply(B, poseAt(0, 'B'), 'B')
    clasp.position.set(0, 0, 0)
    clasp.rotation.set(0, 0, 0)
    placeCamera(0)
    scene.updateMatrixWorld(true)
    camera.updateMatrixWorld()
    const reach = (person, pick) => {
      let x = pick === Math.max ? -Infinity : Infinity
      person.wrist.traverse((o) => {
        if (!o.isSkinnedMesh) return
        for (let i = 0; i < o.geometry.attributes.position.count; i++) {
          x = pick(x, o.getVertexPosition(i, probe).applyMatrix4(o.matrixWorld).project(camera).x)
        }
      })
      return x
    }
    return (reach(B, Math.min) - reach(A, Math.max)) / 2
  }
  // Move each hand outward until the resting gap is REST_GAP of the page width.
  function fitSpread() {
    if (!A) return
    spread = 0
    const halfWidth = Math.tan((camera.fov / 2) * DEG) * camDist * camera.aspect // visible half-width at the hands (m)
    for (let k = 0; k < 4; k++) spread += (REST_GAP - restGap()) * halfWidth
  }

  // ---- drawing

  let A = null, B = null
  let startedAt = null // performance.now() when play() was called
  let raf = 0
  let finished = false
  let disposed = false

  function draw(t) {
    if (!A || !rt) return
    apply(A, poseAt(t, 'A'), 'A')
    apply(B, poseAt(t, 'B'), 'B')
    // The shake: two slow, shallow pumps that ease in and die away — a settled,
    // friendly handshake rather than a vigorous one.
    const s = t - T.shake
    const env = s > 0 ? easeInOutSine(Math.min(1, s / 0.5)) * Math.exp(-s * 1.2) : 0
    const pump = Math.sin(s * Math.PI * 2 * 0.95) * 0.0075 * env
    clasp.position.y = pump
    clasp.rotation.z = pump * 0.6
    placeCamera(t)
    renderer.setRenderTarget(rt)
    renderer.render(scene, camera)
    for (const [mesh, , label] of labelled) mesh.material = label
    renderer.setRenderTarget(nrt)
    renderer.render(scene, camera)
    for (const [mesh, lit] of labelled) mesh.material = lit
    renderer.setRenderTarget(null)
    renderer.render(quadScene, quadCam)
  }

  const now = () => (startedAt === null ? 0 : Math.min(END, (performance.now() - startedAt) / 1000))

  function tick() {
    const t = now()
    draw(t)
    if (t >= SETTLED && !finished) {
      finished = true
      onDone?.()
    }
    raf = t < END && !disposed ? requestAnimationFrame(tick) : 0
  }

  // The page only redraws while the hands move; at rest it draws on load and resize.
  const observer = new ResizeObserver(() => {
    resize()
    if (!raf) draw(now())
  })
  observer.observe(canvas)

  const loader = new GLTFLoader()
  Promise.all([loader.loadAsync(modelUrl), loader.loadAsync(modelUrl)])
    .then(([a, b]) => {
      if (disposed) return
      A = buildPerson(a, 0.25)
      B = buildPerson(b, 0.75)
      resize()
      draw(now())
      onReady?.()
    })
    .catch((err) => {
      if (!disposed) onError?.(err)
    })

  return {
    play() {
      if (startedAt !== null || !A) return
      startedAt = performance.now()
      raf = requestAnimationFrame(tick)
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      rt?.dispose()
      nrt?.dispose()
      for (const d of disposables) d.dispose()
      renderer.dispose()
      renderer.forceContextLoss() // frees the GL context now; the canvas goes with the page
    },
  }
}
