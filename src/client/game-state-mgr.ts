import { Room } from "./room.js"
import { Character } from "./character.js"
import { Logger } from "./logger.js"
import { bindUI } from "./ui-bridge.js"
import { initializeRoomRenderer } from "./room-renderer.js"
import { Observable } from "./observable.js"

import config from "./config.js"

/**
 * The orchestrator for the game
 */
export class GameStateMgr {
    rooms: Set<Room>;
    characters: Set<Character>;
    playerRoom: Room;
    onTimerUpdate: Observable<number>;
    onHideToggled: Observable<boolean>;
    timerID!: number;
    isPlayerHidden: boolean = false;
    isPlayerKilled: boolean = false;

    constructor() {
        // build map
        let start = new Room("start", "back_entrance")
            .setPosition(20, 20);
        let a1 = new Room("a1", "classroom1")
            .setPosition(30, 20);
        let a2 = new Room("a2", "offices")
            .setPosition(15, 50);
        let b1 = new Room("b1", "stage")
            .setPosition(15, 20);
        let b2 = new Room("b2", "staircase")
            .setPosition(85, 50);
        this.playerRoom = new Room("end", "window", true)
            .setPosition(80, 60);

        a1.connectNeighbors([start, b1, a2, b2]);
        a2.connectNeighbors([a1, b1, b2, this.playerRoom]);
        b1.connectNeighbors([start, a1, a2, b2]);
        b2.connectNeighbors([b1, a1, a2, this.playerRoom]);

        this.rooms = new Set([start, a1, a2, b1, b2, this.playerRoom]);

        // bind to html
        this.onTimerUpdate = new Observable<number>();
        this.onHideToggled = new Observable<boolean>();
        this.onHideToggled.subscribe((status) => {
            this.isPlayerHidden = status;
        });
        bindUI(this.rooms, this.onTimerUpdate, this.onHideToggled);

        // characters and attack observers
        let sandro = new Character("sandro", start, [a1, a2, this.playerRoom]);
        let ohl = new Character("ohl", start, [b1, b2, this.playerRoom]);
        let bilitski = new Character("bilitski", start, [a1, b2, this.playerRoom]);
        this.characters = new Set([sandro, ohl, bilitski]);

        for (const c of this.characters) {
            c.onAttack.subscribe((attacker) => {
                this.handleAttack(attacker);
            });
        }

        initializeRoomRenderer(start, this.characters);
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

            setTimeout(() => {
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
        clearTimeout(this.timerID);
        this.characters.forEach(c => c.stop());
        Logger.info("Game stopped");
    }

    private handleAttack(c: Character) {
        Logger.info(`${c.name} is attacking!`);

        let attackTimeout = config.attackSecsElapsed - config.attackTTK;
        setTimeout(() => {  // initial TTK timeout, (wait for TTK to elapse)
            // try to kill at beginning and end of actual attack
            this.tryKillPlayer();
            setTimeout(() => {
                this.tryKillPlayer();

                if (this.isPlayerKilled) {
                    Logger.info("Player was killed!");
                    this.stopGame();
                } else {
                    Logger.info("Player survived attack.");
                    c.returnToSpawn();
                }
            }, attackTimeout);
        }, config.attackTTK * 1000);
    }

    private tryKillPlayer() {
        if (!this.isPlayerHidden) {
            // todo: display in ui that player is fkn dead
            this.isPlayerKilled = true;
        }
    }
}