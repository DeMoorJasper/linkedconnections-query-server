class Logger {
  constructor(options) {
    this.updateOptions(options);
  }

  updateOptions(options = {}) {
    this.logLevel = isNaN(options.logLevel) ? 3 : options.logLevel;
  }

  verbose(message) {
    if (process.send) {
      return process.send({
        type: 'logger',
        function: 'verbose',
        args: [message]
      });
    }
    if (this.logLevel >= 4) {
      console.log(message);
    }
  }

  log(message) {
    if (process.send) {
      return process.send({
        type: 'logger',
        function: 'log',
        args: [message]
      });
    }
    if (this.logLevel >= 3) {
      console.log(message);
    }
  }

  warn(message) {
    if (process.send) {
      return process.send({
        type: 'logger',
        function: 'warn',
        args: [message]
      });
    }
    if (this.logLevel >= 2) {
      console.warn(message);
    }
  }

  error(message) {
    if (process.send) {
      return process.send({
        type: 'logger',
        function: 'error',
        args: [message]
      });
    }
    if (this.logLevel >= 1) {
      console.error(message);
    }
  }
}

let logger;
function getLogger(options) {
  if (!logger) {
    logger = new Logger(options);
  } else if(options) {
    logger.updateOptions(options);
  }
  return logger;
}

module.exports = getLogger;