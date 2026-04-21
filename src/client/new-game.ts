const MIN = 0;
const MAX = 20;

const characters = [
    { name: "Bilitski", img: "img/bilitski.png" },
    { name: "Deepak", img: "img/deepak.png" },
    { name: "Ohl", img: "img/ohl.png" },
    { name: "Sandro", img: "img/sandro.png" },
];

const state = characters.map(() => 0);

const roster = document.getElementById('roster');

characters.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    const src = c.img;
    card.innerHTML = `
    <div class="portrait" style="background-image: url(&quot;${src}&quot;)"></div>
    <p class="name">${c.name}</p>
    <div class="selector">
      <button class="btn" data-action="dec" data-idx="${i}" aria-label="Decrease ${c.name}">−</button>
      <span class="value" data-idx="${i}">0</span>
      <button class="btn" data-action="inc" data-idx="${i}" aria-label="Increase ${c.name}">+</button>
    </div>
  `;
    roster?.appendChild(card);
});

function render(i: number): void {
    const value = state[i];
    if (value === undefined) return;

    const span = roster?.querySelector<HTMLSpanElement>(`.value[data-idx="${i}"]`);
    const dec = roster?.querySelector<HTMLButtonElement>(`.btn[data-action="dec"][data-idx="${i}"]`);
    const inc = roster?.querySelector<HTMLButtonElement>(`.btn[data-action="inc"][data-idx="${i}"]`);
    if (!span || !dec || !inc) return;

    span.textContent = String(value);
    span.classList.toggle('max', value === MAX);
    dec.disabled = value <= MIN;
    inc.disabled = value >= MAX;
}

// event delegation — one listener for all buttons
roster?.addEventListener('click', (e: MouseEvent) => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest<HTMLButtonElement>('.btn');
    if (!btn) return;

    const { idx, action } = btn.dataset;
    if (idx === undefined || action === undefined) return;

    const i = Number(idx);
    const current = state[i];
    if (current === undefined) return;

    state[i] = action === 'inc'
        ? Math.min(MAX, current + 1)
        : Math.max(MIN, current - 1);
    render(i);
});

// initial render to set disabled states
characters.forEach((_, i) => render(i));

// Start button
document.getElementById('start')?.addEventListener('click', () => {
    let levels = characters.map((c, i) => ({ name: c.name, level: state[i] ?? 0 }));
    sessionStorage.setItem('AI_LVLs', JSON.stringify(levels));
    window.location.href = 'index.html';
});