const colors = {
    info: "\x1b[36m",   
  warn: "\x1b[33m",   
  error: "\x1b[31m",  
  reset: "\x1b[0m",
};

function timestamp(){
    return new Date().toISOString();
}

const logger = {
    info: (...args) => {
        console.log(`${colors.info}[INFO]${colors.reset} ${timestamp()} -`, ...args);
    },
    warn: (...args) => {
        console.warn(`${colors.warn}[WARN]${colors.reset}${timestamp()} -`, ...args);
    },
    error: (...args) => {
        console.error(`${colors.error}[ERROR]${colors.reset} ${timestamp()} -`, ...args);
    },
};

module.exports = logger;