/* ================= 3D СЦЕНА (Three.js) ================= */
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120f0e);
scene.fog = new THREE.Fog(0x120f0e, 12, 38);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 1.5, 11);

scene.add(new THREE.AmbientLight(0x6b5f55, 0.9));
const sun = new THREE.DirectionalLight(0xffd9a0, 1.2); sun.position.set(6, 10, 8); scene.add(sun);
const redLight = new THREE.PointLight(0xc22d2d, 2.2, 30); redLight.position.set(-6, 3, 4); scene.add(redLight);

const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .8 }, o));

// Модель 1: Крылья свободы (выдавленные 3D-крылья)
function wingShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -.6);
  s.bezierCurveTo(.5, .8, 1.5, 1.8, 3.2, 1.9);
  s.lineTo(2.5, 1.4); s.lineTo(3, 1.1); s.lineTo(2.3, .7);
  s.lineTo(2.7, .35); s.lineTo(1.9, 0); s.lineTo(2, -.45); s.lineTo(1, -.5);
  s.lineTo(0, -.6);
  return s;
}
const wingGeo = new THREE.ExtrudeGeometry(wingShape(), { depth: .25, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2 });
const emblem = new THREE.Group();
const wingBlue = new THREE.Mesh(wingGeo, mat(0x1d4f9c, { side: THREE.DoubleSide, metalness: .3 }));
const wingWhite = new THREE.Mesh(wingGeo, mat(0xf0ead8, { side: THREE.DoubleSide, metalness: .1 }));
wingWhite.scale.x = -1;
emblem.add(wingBlue, wingWhite);
emblem.position.set(0, 1.8, 0); emblem.scale.setScalar(1.15);
scene.add(emblem);

// Модель 2: скрещённые клинки УПМ
function blade() {
  const g = new THREE.Group();
  const steel = new THREE.Mesh(new THREE.BoxGeometry(.18, 4.2, .05), mat(0xc9d3dc, { metalness: .95, roughness: .2 }));
  steel.position.y = 2.3;
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, 1.1, 12), mat(0x2f4a3a));
  const guard = new THREE.Mesh(new THREE.BoxGeometry(.6, .12, .3), mat(0x3a3330, { metalness: .6 }));
  guard.position.y = .55;
  g.add(steel, hilt, guard);
  return g;
}
const blades = new THREE.Group();
const b1 = blade(), b2 = blade();
b1.rotation.z = .6; b2.rotation.z = -.6;
blades.add(b1, b2); blades.position.set(-6.5, -2.5, -1); blades.scale.setScalar(.9);
scene.add(blades);

// Модель 3: Стена и титан, заглядывающий через неё
const wall = new THREE.Group();
const wallBody = new THREE.Mesh(new THREE.BoxGeometry(40, 9, 3), mat(0x4a443e, { roughness: .95 }));
wallBody.position.y = 1.5; wall.add(wallBody);
for (let i = -9; i <= 9; i++) {
  const brick = new THREE.Mesh(new THREE.BoxGeometry(1.9, .5, .2), mat(0x3a352f));
  brick.position.set(i * 2, 5.9, 1.5); wall.add(brick);
}
const titan = new THREE.Group();
const skin = mat(0xc99278, { roughness: .6 });
const head = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 24), skin); head.scale.set(1, 1.15, 1);
const jaw = new THREE.Mesh(new THREE.BoxGeometry(2.6, .9, 1.8), skin); jaw.position.set(0, -1.9, .9);
const teeth = new THREE.Mesh(new THREE.BoxGeometry(2.2, .35, .2), mat(0xf4efe0)); teeth.position.set(0, -1.45, 1.8);
const eyeMat = mat(0x111111, { emissive: 0xc22d2d, emissiveIntensity: 1.4 });
const eyeL = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), eyeMat); eyeL.position.set(-.85, .35, 2);
const eyeR = eyeL.clone(); eyeR.position.x = .85;
const hair = new THREE.Mesh(new THREE.SphereGeometry(2.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), mat(0x2b1d14));
hair.scale.set(1, 1.15, 1); hair.position.y = .1;
titan.add(head, jaw, teeth, eyeL, eyeR, hair);
titan.position.set(7.5, 8.5, -3); titan.scale.setScalar(1.4);
wall.add(titan);
wall.position.set(0, -4, -14);
scene.add(wall);

// Земля
const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mat(0x1f2a20, { roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -4.5; scene.add(ground);

// Искры, летящие вверх
const N = 400, pos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 40; pos[i * 3 + 1] = Math.random() * 16 - 4; pos[i * 3 + 2] = (Math.random() - .5) * 30; }
const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const sparks = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffa24a, size: .09, transparent: true, opacity: .8 }));
scene.add(sparks);

let mx = 0, my = 0;
addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const clock = new THREE.Clock();
(function loop() {
  const t = clock.getElapsedTime();
  emblem.rotation.y = Math.sin(t * .5) * .6;
  emblem.position.y = 1.8 + Math.sin(t) * .15;
  blades.rotation.y = t * .6;
  titan.position.y = 8.5 + Math.sin(t * .7) * .25;
  redLight.intensity = 2 + Math.sin(t * 3) * .4;
  const p = pGeo.attributes.position;
  for (let i = 0; i < N; i++) { p.array[i * 3 + 1] += .015; if (p.array[i * 3 + 1] > 12) p.array[i * 3 + 1] = -4; }
  p.needsUpdate = true;
  camera.position.x += (mx * 3 - camera.position.x) * .04;
  camera.position.y += (1.5 - my * 2 - camera.position.y) * .04;
  camera.lookAt(0, 1, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
})();

// Меняем цвет подсветки и эмблемы под результат
function tint(hex) { redLight.color.setHex(hex); wingBlue.material.color.setHex(hex); }

/* ================= МУЗЫКА ================= */
// Если рядом лежит music.mp3, играет он. Если файла нет, играет мрачная мелодия, созданная в браузере.
let muted = false, audio = null, ctx = null, master = null, timer = null;
const muteBtn = document.getElementById('mute');

function startGenerated() {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = muted ? 0 : .5; master.connect(ctx.destination);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.connect(master);
  [55, 82.4].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = i * 6;
    const g = ctx.createGain(); g.gain.value = .12; o.connect(g); g.connect(lp); o.start();
  });
  const notes = [220, 261.6, 329.6, 392, 329.6, 261.6, 246.9, 293.7, 349.2, 440, 349.2, 293.7]; // Am / G
  let step = 0;
  const pluck = (f, dur, vol, type) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur);
  };
  timer = setInterval(() => {
    pluck(notes[step % notes.length], .9, .22, 'triangle');
    if (step % 4 === 0) pluck(45, .5, .6, 'sine'); // барабан
    step++;
  }, 480);
}

function startMusic() {
  audio = new Audio('music.mp3'); audio.loop = true; audio.volume = .5;
  const fallback = () => { if (!timer) startGenerated(); audio = null; };
  audio.addEventListener('error', fallback);
  audio.play().catch(fallback);
}

muteBtn.onclick = () => {
  muted = !muted;
  if (audio) audio.muted = muted;
  if (master) master.gain.value = muted ? 0 : .5;
  muteBtn.textContent = 'Музыка: ' + (muted ? 'выкл' : 'вкл');
};

/* ================= ТЕСТ ================= */
const $ = id => document.getElementById(id);
const show = id => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); $(id).classList.add('active'); };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

const RANKS = [
  { min: 17, name: 'Разведкорпус', color: 0x1d7a4a, text: 'Ты идёшь за стены. Знаешь мир «Атаки титанов» лучше большинства, и твоё сердце принадлежит свободе. Отдай его.' },
  { min: 12, name: 'Военная полиция', color: 0x1d4f9c, text: 'Ты знаешь историю хорошо, и жизнь у тебя в безопасной глубине Стен. Чуть больше смелости, и ты перейдёшь в Разведкорпус.' },
  { min: 7,  name: 'Гарнизон', color: 0xb8872b, text: 'Ты держишь оборону на стенах: основу знаешь, но до героя пока далеко. Пересмотри аниме, и всё получится.' },
  { min: 0,  name: 'Рядовой новобранец', color: 0xa32424, text: 'Ты только записался в кадеты. Титаны пока слишком страшны, но тренировка делает солдата. Смотри сериал и возвращайся!' }
];

let order, idx, score, locked;

function begin() {
  order = shuffle(QUESTIONS); idx = 0; score = 0; tint(0xc22d2d);
  show('quiz'); render();
}

function render() {
  locked = false;
  const item = order[idx];
  $('counter').textContent = `Вопрос ${idx + 1} из ${order.length}`;
  $('score').textContent = `Баллы: ${score}`;
  $('fill').style.width = (idx / order.length * 100) + '%';
  $('question').textContent = item.q;
  $('nextBtn').hidden = true;
  $('nextBtn').textContent = idx === order.length - 1 ? 'Узнать результат' : 'Дальше';
  const box = $('answers'); box.innerHTML = '';
  shuffle(item.a).forEach(text => {
    const b = document.createElement('button');
    b.className = 'ans'; b.textContent = text;
    b.onclick = () => answer(b, text === item.a[0]);
    box.appendChild(b);
  });
}

function answer(btn, ok) {
  if (locked) return; locked = true;
  const correct = order[idx].a[0];
  document.querySelectorAll('.ans').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('right');
  });
  if (ok) score++; else btn.classList.add('wrong');
  $('score').textContent = `Баллы: ${score}`;
  $('nextBtn').hidden = false;
  $('nextBtn').focus();
}

function next() {
  idx++;
  if (idx < order.length) return render();
  const rank = RANKS.find(r => score >= r.min);
  $('finalScore').textContent = `${score} / ${order.length}`;
  $('rankName').textContent = 'Ты — ' + rank.name;
  $('rankText').textContent = rank.text;
  tint(rank.color);
  show('result');
}

$('startBtn').onclick = () => { startMusic(); begin(); };
$('nextBtn').onclick = next;
$('restartBtn').onclick = begin;
