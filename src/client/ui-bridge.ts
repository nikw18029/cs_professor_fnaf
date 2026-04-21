import { Observable } from "./observable.js";
import { Room } from "./room.js"
import { Logger } from "./logger.js"

// bind the html elements to their object counterparts.

export function bindUI(rooms: Set<Room>, timerUpdator: Observable<number>, hideStateUpdator: Observable<{ canHide: boolean; forceUnhide: boolean }>, playerKilledUpdator: Observable<void>, winUpdator: Observable<void>) {
	// timer
	const timerEl = document.getElementById("timer");
	if (timerEl) {
		timerUpdator.subscribe((hour) => { updateTimer(hour, timerEl); });
	}

	// hide button game state logic (actions controlled by system)
	const hideBtn = document.getElementById('hide-btn');
	if (hideBtn) {

		hideStateUpdator.subscribe(({ canHide, forceUnhide }) => {
			if (forceUnhide) {
				hideBtn.classList.remove('active');
				hideBtn.textContent = "PRESS H TO HIDE";
			}

			if (canHide) {
				hideBtn.classList.remove('on-cooldown');
				hideBtn.removeAttribute('disabled');
			} else {
				hideBtn.classList.add('on-cooldown');
				hideBtn.setAttribute('disabled', 'true');
			}
		});
	}

	// rooms
	rooms.forEach(room => {
		const element = room.htmlElement;
		if (!element) return;

		// 1. Initial Render
		updateRoomDisplay(room);

		// 2. Subscribe to future changes
		room.onUpdate.subscribe((updatedRoom) => {
			updateRoomDisplay(updatedRoom);

			// Add a little "pulse" effect on change
			element.classList.add('flash');
			setTimeout(() => element.classList.remove('flash'), 200);
		});
	});

	// player killed
	playerKilledUpdator.subscribe(showDeathMessage);

	// win
	winUpdator.subscribe(showWinMessage);
}

function showDeathMessage() {
	const div = document.createElement('div') as HTMLDivElement;
	div.textContent = "YOU DIED";
	div.classList.add('game-result');
	div.style = "color: red; font-size: xx-large;";
	document.getElementById("game-container")?.appendChild(div);
}

function showWinMessage() {
	const div = document.createElement('div') as HTMLDivElement;
	div.textContent = "YOU WIN!";
	div.classList.add('game-result');
	div.style = "color: rgb(26, 255, 0); font-size: xx-large;";
	document.getElementById("game-container")?.appendChild(div);

	const winAudio: HTMLAudioElement = document.querySelector('#win-audio') as HTMLAudioElement;
	winAudio.play();
}

function updateTimer(hour: number, el: HTMLElement) {
	if (hour === 0) {
		hour = 12;
	}
	el.innerText = `${hour}:00`;
	Logger.trace("Update timer: " + hour);
}

function updateRoomDisplay(room: Room) {
	const count = room.visitorCount;

	// Update the inner HTML
	room.htmlElement.innerHTML = `
        <span class="room-name">${room.roomName}</span>
        <span class="visitor-count">[${count}]</span>
    `;

	// Toggle CSS classes based on state
	if (count > 0) {
		room.htmlElement.classList.add('has-visitor');
	} else {
		room.htmlElement.classList.remove('has-visitor');
	}
}