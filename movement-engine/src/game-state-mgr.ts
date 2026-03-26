import { Room } from "./room.js"
import { Character } from "./character.js"
import { Logger } from "./logger.js"
import { bindUI } from "./ui-bridge.js"
import { Observable } from "./observable.js"

import config from "./../appcfg.json" with {type: "json"}

/**
 * The orchestrator for the game
 */
export class GameStateMgr {
    rooms: Set<Room>;
    characters: Set<Character>;
    playerRoom: Room;
    onTimerUpdate: Observable<number>;
    timerID!: number;

    constructor() {
        // build map
        let start = new Room("start");
        let a1 = new Room("a1");
        let a2 = new Room("a2");
        let b1 = new Room("b1");
        let b2 = new Room("b2");
        this.playerRoom = new Room("end", true);

        a1.connectNeighbors([start, b1, a2, b2]);
        a2.connectNeighbors([a1, b1, b2, this.playerRoom]);
        b1.connectNeighbors([start, a1, a2, b2]);
        b2.connectNeighbors([b1, a1, a2, this.playerRoom]);

        this.rooms = new Set([start, a1, a2, b1, b2, this.playerRoom]);

        // bind to html
        this.onTimerUpdate = new Observable<number>();
        bindUI(this.rooms, this.onTimerUpdate);

        // characters and attack observers
        let zandro = new Character("Zandro", start, [a1, a2, this.playerRoom]);
        let mohl = new Character("Mohl", start, [b1, b2, this.playerRoom]);
        let nilitski = new Character("Nilitski", start, [a1, b2, this.playerRoom]);
        this.characters = new Set([zandro, mohl, nilitski]);

        for(const c of this.characters){
            c.onAttack.subscribe((attacker) => {
                this.handleAttack(attacker);
            });
        }
    }

    /**
     * Starts up each character, runs a timer.
     */
    public async runGame() {
        const gameDurationMins = (config.gameMins as number) * 60000;
        const hourInterval = gameDurationMins / 6;
        
        this.characters.forEach(c => c.activate());

        const runHour = (hour: number, interval: number) => {
            if (hour > 6) return;

            this.timerID = setTimeout(() => {
                console.log("current hour=" + hour);
                this.onTimerUpdate.notify(hour);

                if (hour === 6) {
                    this.stopGame();
                } else {
                    runHour(hour + 1, interval);
                }
            }, interval);
        };

        runHour(1, hourInterval);
    }

    /**
     * Requests to stop game loops.
     */
    public stopGame() {
        this.characters.forEach(c => c.stop());
        Logger.info("Game stopped");
    }

    private handleAttack(c: Character) {
        Logger.info(`${c.name} is attacking!`);
        // if player fails to defend:
        // this.stopGame();
        // temp: simulate attack with timeout
        setTimeout(() => c.returnToSpawn(), 10000);
    }
}