import { createLogger, format, transports } from 'winston';
import { utilities as nestWinstonUtilities, WinstonModule } from 'nest-winston';

const { combine, timestamp, colorize, errors } = format;

const jsonFormat = combine(timestamp(), errors({ stack: true }), format.json());

const prettyFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  nestWinstonUtilities.format.nestLike('App', { prettyPrint: true }),
);

const isProd = process.env.NODE_ENV === 'production';

export const winstonLogger = WinstonModule.createLogger({
  instance: createLogger({
    level: isProd ? 'warn' : 'debug',
    format: isProd ? jsonFormat : prettyFormat,
    transports: [
      new transports.Console(),
      ...(isProd
        ? [
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/combined.log' }),
          ]
        : []),
    ],
  }),
});
