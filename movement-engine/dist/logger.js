/** Logs to the browser console */
export class Logger {
    static minLvl = "info";
    static setMinlevel(minLevel) {
        Logger.minLvl = minLevel;
    }
    /**
     * Super important, must know information.
     * @param msg the message to be logged.
     */
    static critical(msg) {
        console.error(`[${Date.now()}][CRIT]: ${msg}`);
    }
    /**
     * Not crash worthy, but could cause issues if the code can't hold it together.
     * @param msg the message to be logged.
     */
    static warn(msg) {
        if (Logger.minLvl !== "crit") {
            console.warn(`[${Date.now()}][WARN]: ${msg}`);
        }
    }
    /**
     * General information, the "big picture" things that regularly happen during execution.
     * @param msg the message to be logged.
     */
    static info(msg) {
        if (Logger.minLvl !== "crit" &&
            Logger.minLvl !== "warn") {
            console.log(`[${Date.now()}][INFO]: ${msg}`);
        }
    }
    /**
     * Things that muddy up the logs, but can make a real difference when trying to debug.
     * @param msg the message to be logged.
     */
    static debug(msg) {
        if (Logger.minLvl === "debug" ||
            Logger.minLvl === "trace") {
            console.log(`[${Date.now()}][DEBUG]: ${msg}`);
        }
    }
    /**
     * Everything and anything that can be logged about the application.
     * @param msg the message to be logged.
     */
    static trace(msg) {
        if (Logger.minLvl === "trace") {
            console.log(`[${Date.now()}][TRACE]: ${msg}`);
        }
    }
}
//# sourceMappingURL=logger.js.map