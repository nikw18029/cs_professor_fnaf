document.getElementById('yes')?.addEventListener('click', () => {
    console.log('Loading save...');
    window.location.href = 'index.html';
});

document.getElementById('no')?.addEventListener('click', () => {
    console.log('Starting new game...');
    window.location.href = 'new-game.html';
});