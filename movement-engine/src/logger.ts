/** Logs to the browser console */
export class Logger {
    private static minLvl: "crit" | "warn" | "info" | "debug" | "trace" = "trace";

    public static setMinlevel(minLevel: "crit" | "warn" | "info" | "debug" | "trace") {
        Logger.minLvl = minLevel;
    }

    /**
     * Super important, must know information.
     * @param msg the message to be logged.
     */
    public static critical(msg: string) {
        console.error(`[${Date.now()}][CRIT]: ${msg}`);
    }

    /**
     * Not crash worthy, but could cause issues if the code can't hold it together.
     * @param msg the message to be logged.
     */
    public static warn(msg: string) {
        if (
            Logger.minLvl !== "crit"
        ) {
            console.warn(`[${Date.now()}][WARN]: ${msg}`);
        }
    }

    /**
     * General information, the "big picture" things that regularly happen during execution.
     * @param msg the message to be logged.
     */
    public static info(msg: string) {
        if (
            Logger.minLvl !== "crit" &&
            Logger.minLvl !== "warn"
        ) {
            console.log(`[${Date.now()}][INFO]: ${msg}`);
        }
    }

    /**
     * Things that muddy up the logs, but can make a real difference when trying to debug.
     * @param msg the message to be logged.
     */
    public static debug(msg: string) {
        if (
            Logger.minLvl === "debug" ||
            Logger.minLvl === "trace"
        ) {
            console.log(`[${Date.now()}][DBG]: ${msg}`);
        }
    }

    /**
     * Everything and anything that can be logged about the application.
     * @param msg the message to be logged.
     */
    public static trace(msg: string) {
        if (
            Logger.minLvl === "trace"
        ) {
            console.log(`[${Date.now()}][TRACE]: ${msg}`);
        }
    }
}