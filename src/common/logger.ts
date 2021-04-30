import winston from 'winston';

const alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: false,
  }),
  winston.format.timestamp({
    format: 'YY-MM-DD HH:MM:SS',
  }),
  winston.format.printf((info) => {
    const splat: any = Symbol.for('splat');

    return `[${info.level}]: ${info.message} (at: ${info.timestamp})${
      info[splat] || ''
    }`;
  }),
);

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        alignColorsAndTime,
      ),
    }),
    new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
  ],
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== 'production') {
  logger.info('Logging initialized at debug level');
}

export default logger;
