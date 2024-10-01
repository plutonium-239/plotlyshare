const logLevels = {
    debug: console.debug,
    info: console.info,
    warning: console.warn,
    error: console.error,
};
function logWithLevel(level) {
    return (message) => {
        const logger = logLevels[level];
        logger(message);
    };
}
class Logger {
    enabled;
    constructor(enabled) {
        this.enabled = enabled;
    }
    log(message, level) {
        if (!this.enabled) {
            return;
        }
        logWithLevel(level)(message);
    }
    ;
    setEnabled(value) {
        this.enabled = value;
    }
}
export const logger = new Logger(false);
