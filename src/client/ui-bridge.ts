import { Observable } from "./observable.js";
import {Room} from "./room.js"

// bind the html elements to their object counterparts. subscribe them to room updates

export function bindUI(rooms: Set<Room>, timerUpdator: Observable<number>) {
    // timer
    const timerEl = document.getElementById("timer");
    if(timerEl) {
        timerUpdator.subscribe((hour) => {updateTimer(hour, timerEl);});
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
}

function updateTimer(hour: number, el: HTMLElement){
    if(hour === 0){
        hour = 12;
    }
    el.innerText = `${hour}:00`;
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