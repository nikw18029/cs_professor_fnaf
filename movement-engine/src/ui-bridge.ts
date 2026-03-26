import {Room} from "./room.js"

// bind the html elements to their object counterparts. subscribe them to room updates

export function bindUI(rooms: Set<Room>) {
    rooms.forEach(room => {
        const element = document.getElementById(room.htmlID);
        if (!element) return;

        // 1. Initial Render
        updateRoomDisplay(room, element);

        // 2. Subscribe to future changes
        room.onUpdate.subscribe((updatedRoom) => {
            updateRoomDisplay(updatedRoom, element);
            
            // Add a little "pulse" effect on change
            element.classList.add('flash');
            setTimeout(() => element.classList.remove('flash'), 200);
        });
    });
}

function updateRoomDisplay(room: Room, el: HTMLElement) {
    const count = room.visitorCount;
    
    // Update the inner HTML
    el.innerHTML = `
        <span class="room-name">${room.htmlID.toUpperCase()}</span>
        <span class="visitor-count">${count}</span>
    `;

    // Toggle CSS classes based on state
    if (count > 0) {
        el.classList.add('has-visitor');
    } else {
        el.classList.remove('has-visitor');
    }
}