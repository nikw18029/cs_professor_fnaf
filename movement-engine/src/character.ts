import { Room }  from "./room.js"

import config from "./../appcfg.json" with {type:"json"}

export class Character {
    public readonly name;
    public readonly AI_LVL: number;
    private preferredRooms;
    private spawnRoom;
    private currentRoom;

    constructor(name: string, spawnRoom: Room, preferredRooms: Room[]) {
        this.name = name;
        this.preferredRooms = preferredRooms;
        this.AI_LVL = config[this.name as keyof typeof config] as number;    // ****
        this.spawnRoom = spawnRoom;
        this.currentRoom = spawnRoom;
    }

    /**
     * Activates the character in the game. Like pressing a big "GO" button. Starts the wait -> roll -> move loop.
     * @param cancellationToken flag which terminates the character's loop on completion. Resolve to stop the movement loop.
     */
    public async activate(cancellationToken: Promise<void>) {
        let waitSecs = config.moveDelay * 1000;

        let result: {src: string};
        do {
            let rollDelay = new Promise<void>((resolve) => {
                setTimeout(() => {
                                                        //(max - min + 1) + min
                    let roll = Math.floor(Math.random() * (20 - 1 + 1) + 1);    // roll to move
                    let nextRoom = this.pickNextRoom();
                    
                    if(roll <= this.AI_LVL) {
                        this.currentRoom.visitorExit(this);
                        nextRoom.visitorEnter(this);
                        this.currentRoom = nextRoom;

                        // todo: if the new room is the one the player is in somehow should attack,
                        //          then must be sent back to spawn if player survives
                    }
                }, waitSecs);
                resolve();
            });

            result = await Promise.race([
                cancellationToken.then(()=>({src: "cancelled"})),
                rollDelay.then(()=>({src: "roll"}))
            ]);
        } while(result.src != "cancelled")
    }

    private pickNextRoom() {
        let nextRoom: Room;
        let set = new Set(this.currentRoom.neighbors) 
        let nextPossibleRooms = this.preferredRooms.filter(x => set.has(x));
        if(nextPossibleRooms.length >= 1) {
            let roomRoll = Math.floor(Math.random() * (nextPossibleRooms.length - 1 + 1) + 1)
            nextRoom = nextPossibleRooms[roomRoll-1] as Room;
        } else if(this.currentRoom.neighbors.length >= 1) {
            // as a fallback option, choose a different neighbor off the deignated path
            let roomRoll = Math.floor(Math.random() * (this.currentRoom.neighbors.length - 1 + 1) + 1)
            nextRoom = this.currentRoom.neighbors[roomRoll-1] as Room;
        } else {
            throw new Error(`Character ${this.name} failed to pick a room.`)
        }

        return nextRoom;
    }
}