document.getElementById('yes')?.addEventListener('click', async () => {
    const fullSave = await getGameSave();
    if (!fullSave) {
        console.error('No save returned from API');
        return;
    }
    const { AI_LVLs, ...gameSave } = fullSave;
    sessionStorage.setItem('gameSave', JSON.stringify(gameSave));
    sessionStorage.setItem('AI_LVLs', JSON.stringify(AI_LVLs));
    window.location.href = 'index.html';
});

document.getElementById('no')?.addEventListener('click', () => {
    console.log('Starting new game...');    // we could delete the old save here but we'll keep it in case player changes their mind
    window.location.href = 'new-game.html';
});

async function getGameSave() {
    const res = await fetch('/api/save');
    if (res.ok) return await res.json();
    else return null
}