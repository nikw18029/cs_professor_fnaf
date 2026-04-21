const MIN = 0;
const MAX = 20;

// Swap `img` for real asset paths when you have them.
// Leave img as null to get an auto-generated placeholder.
const characters = [
  { name: "Bilitski",   img: "img/bilitski.png" },
  { name: "Deepak",   img: "img/deepak.png" },
  { name: "Ohl", img: "img/ohl.png" },
  { name: "Sandro",  img: "img/sandro.png" },
];

// state lives in one place — easy to serialize/save later
const state = characters.map(() => 0);

// generate an SVG data URI placeholder from a name initial
function placeholder(name, i) {
  const hue = (i * 57) % 360;
  const letter = name.trim()[0] || '?';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <defs><linearGradient id='g${i}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='hsl(${hue},40%,25%)'/>
      <stop offset='1' stop-color='hsl(${hue},50%,10%)'/>
    </linearGradient></defs>
    <rect width='100' height='100' fill='url(%23g${i})'/>
    <text x='50' y='62' text-anchor='middle' font-family='Cinzel,serif'
      font-size='44' fill='hsl(${hue},30%,70%)' font-weight='700'>${letter}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/\n\s*/g, '')}`;
}

const roster = document.getElementById('roster');

characters.forEach((c, i) => {
  const card = document.createElement('div');
  card.className = 'card';
  const src = c.img || placeholder(c.name, i);
  card.innerHTML = `
    <div class="portrait" style="background-image: url(&quot;${src}&quot;)"></div>
    <p class="name">${c.name}</p>
    <div class="selector">
      <button class="btn" data-action="dec" data-idx="${i}" aria-label="Decrease ${c.name}">−</button>
      <span class="value" data-idx="${i}">0</span>
      <button class="btn" data-action="inc" data-idx="${i}" aria-label="Increase ${c.name}">+</button>
    </div>
  `;
  roster.appendChild(card);
});

function render(i) {
  const span = roster.querySelector(`.value[data-idx="${i}"]`);
  span.textContent = state[i];
  span.classList.toggle('max', state[i] === MAX);
  const dec = roster.querySelector(`.btn[data-action="dec"][data-idx="${i}"]`);
  const inc = roster.querySelector(`.btn[data-action="inc"][data-idx="${i}"]`);
  dec.disabled = state[i] <= MIN;
  inc.disabled = state[i] >= MAX;
}

// event delegation — one listener for all buttons
roster.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const i = Number(btn.dataset.idx);
  if (btn.dataset.action === 'inc') state[i] = Math.min(MAX, state[i] + 1);
  else                               state[i] = Math.max(MIN, state[i] - 1);
  render(i);
});

// initial render to set disabled states
characters.forEach((_, i) => render(i));

// expose getter for whatever starts the game:
//   const difficulties = getDifficulties();
window.getDifficulties = () =>
  characters.map((c, i) => ({ name: c.name, level: state[i] }));

// Start button — replace this handler with whatever kicks off the game
document.getElementById('start').addEventListener('click', () => {
  const difficulties = window.getDifficulties();
  console.log('Starting with:', difficulties);
  // e.g. sessionStorage.setItem('difficulties', JSON.stringify(difficulties));
  //      window.location.href = 'game.html';
});