const winston = require('winston');
require('winston-daily-rotate-file');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        //all logs
        new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '90d',
            zippedArchive: true
        }),
        //error logs
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '90d',
            zippedArchive: true
        }),
        new winston.transports.Console()
    ]
});

module.exports = logger;
